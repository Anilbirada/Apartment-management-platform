import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyGateQrToken } from '@/lib/qrCrypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'PROVIDER' || !user.providerProfile) {
      return NextResponse.json(
        { error: 'Unauthorized. Only registered service providers can record gate visits.' },
        { status: 403 }
      );
    }

    if (!user.providerProfile.isApproved) {
      return NextResponse.json(
        { error: 'Provider account is pending verification. Gate entry requires an approved verified badge.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { qrPayload, serviceRequestId } = body;

    if (!qrPayload || !serviceRequestId) {
      return NextResponse.json(
        { error: 'QR Payload and Service Request ID are required.' },
        { status: 400 }
      );
    }

    // 1. Validate Service Request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        resident: {
          include: { community: true }
        },
        providerProfile: true
      }
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request appointment not found.' }, { status: 404 });
    }

    if (serviceRequest.providerProfileId !== user.providerProfile.id) {
      return NextResponse.json(
        { error: 'This appointment is assigned to a different service provider.' },
        { status: 403 }
      );
    }

    if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(serviceRequest.status)) {
      return NextResponse.json(
        { error: `Cannot scan QR: Appointment is in "${serviceRequest.status}" state.` },
        { status: 400 }
      );
    }

    // 2. Decode and Validate Gate QR Token
    const parts = qrPayload.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'GATE_QR') {
      return NextResponse.json(
        { error: 'Invalid QR code. Please scan the authorized apartment gate QR token.' },
        { status: 400 }
      );
    }

    let payloadStr = '';
    try {
      payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ error: 'Corrupt QR data payload.' }, { status: 400 });
    }

    const [gateId, gateCode, qrCommunityId] = payloadStr.split(':');

    // Fetch gate record to verify secret
    const gate = await prisma.apartmentGate.findUnique({
      where: { id: gateId },
      include: { community: true }
    });

    if (!gate || !gate.isActive) {
      return NextResponse.json({ error: 'Apartment gate is inactive or unrecognized.' }, { status: 404 });
    }

    const verification = verifyGateQrToken(qrPayload, gate.qrSecret);
    if (!verification.valid) {
      return NextResponse.json({ error: `QR Validation Failed: ${verification.error}` }, { status: 400 });
    }

    // Verify Apartment Match
    const targetCommunityId = serviceRequest.resident?.communityId || gate.communityId;
    if (gate.communityId !== targetCommunityId) {
      return NextResponse.json(
        {
          error: `Gate Location Mismatch: You are scanning ${gate.community.name}, but this service request is for a different society.`
        },
        { status: 400 }
      );
    }

    // 3. State Machine: Determine whether this is ENTRY or EXIT
    let visit = await prisma.providerVisit.findFirst({
      where: { serviceRequestId: serviceRequest.id },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    if (!visit || visit.visitStatus === 'SCHEDULED') {
      // ----------------------------------------------------
      // ENTRY SCAN
      // ----------------------------------------------------
      if (!visit) {
        visit = await prisma.providerVisit.create({
          data: {
            serviceRequestId: serviceRequest.id,
            providerProfileId: user.providerProfile.id,
            communityId: gate.communityId,
            gateId: gate.id,
            entryTimestamp: now,
            visitStatus: 'INSIDE_APARTMENT',
            entryQrToken: qrPayload
          }
        });
      } else {
        visit = await prisma.providerVisit.update({
          where: { id: visit.id },
          data: {
            gateId: gate.id,
            entryTimestamp: now,
            visitStatus: 'INSIDE_APARTMENT',
            entryQrToken: qrPayload
          }
        });
      }

      // Update Service Request status to IN_PROGRESS if earlier state
      if (['REQUESTED', 'ACCEPTED', 'VISIT_SCHEDULED'].includes(serviceRequest.status)) {
        await prisma.serviceRequest.update({
          where: { id: serviceRequest.id },
          data: { status: 'IN_PROGRESS' }
        });

        await prisma.requestStatusHistory.create({
          data: {
            serviceRequestId: serviceRequest.id,
            fromStatus: serviceRequest.status,
            toStatus: 'IN_PROGRESS',
            note: `Provider entered via ${gate.gateName} (QR scanned)`,
            changedById: user.id
          }
        });
      }

      // Audit Log
      await prisma.visitAuditLog.create({
        data: {
          visitId: visit.id,
          action: 'ENTRY_RECORDED',
          performedById: user.id,
          newStateJson: JSON.stringify({ status: 'INSIDE_APARTMENT', gate: gate.gateName, timestamp: now }),
          reason: 'Valid mobile QR scan at gate'
        }
      });

      // Notify Resident
      await prisma.notification.create({
        data: {
          userId: serviceRequest.residentId,
          type: 'REQUEST_STATUS_CHANGE',
          title: 'Service Provider Arrived 🚪',
          message: `${user.name} checked in at ${gate.gateName} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} for request ${serviceRequest.requestNumber}.`,
          link: '/requests'
        }
      });

      return NextResponse.json({
        success: true,
        action: 'ENTRY',
        status: 'INSIDE_APARTMENT',
        entryTimestamp: now,
        gateName: gate.gateName,
        communityName: gate.community.name,
        message: `Entry recorded at ${gate.gateName}. Welcome to ${gate.community.name}!`
      });
    } else if (visit.visitStatus === 'INSIDE_APARTMENT') {
      // ----------------------------------------------------
      // EXIT SCAN
      // ----------------------------------------------------
      const entryTime = visit.entryTimestamp ? new Date(visit.entryTimestamp).getTime() : now.getTime() - 1000 * 60 * 30;
      const durationMins = Math.max(1, Math.round((now.getTime() - entryTime) / 60000));

      const updatedVisit = await prisma.providerVisit.update({
        where: { id: visit.id },
        data: {
          exitTimestamp: now,
          durationMinutes: durationMins,
          visitStatus: 'EXITED',
          exitQrToken: qrPayload
        }
      });

      // Audit Log
      await prisma.visitAuditLog.create({
        data: {
          visitId: visit.id,
          action: 'EXIT_RECORDED',
          performedById: user.id,
          previousStateJson: JSON.stringify({ status: 'INSIDE_APARTMENT' }),
          newStateJson: JSON.stringify({ status: 'EXITED', durationMinutes: durationMins, timestamp: now }),
          reason: 'Valid exit scan recorded'
        }
      });

      // Notify Resident
      await prisma.notification.create({
        data: {
          userId: serviceRequest.residentId,
          type: 'REQUEST_STATUS_CHANGE',
          title: 'Provider Exited Campus ⏱️',
          message: `${user.name} checked out via ${gate.gateName}. Total visit duration: ${durationMins} minutes.`,
          link: '/requests'
        }
      });

      return NextResponse.json({
        success: true,
        action: 'EXIT',
        status: 'EXITED',
        exitTimestamp: now,
        durationMinutes: durationMins,
        gateName: gate.gateName,
        message: `Exit recorded at ${gate.gateName}. Visit completed in ${durationMins} minutes.`
      });
    } else {
      // Already exited or rejected
      return NextResponse.json(
        {
          error: `Duplicate scan prevented. This visit was already marked "${visit.visitStatus}" at ${visit.exitTimestamp ? new Date(visit.exitTimestamp).toLocaleTimeString() : 'earlier'}.`
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('QR scan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
