import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const blocks = await prisma.apartmentBlock.findMany({
      where: { communityId: id },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, count: blocks.length, blocks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && (user.role !== 'MANAGEMENT' || user.communityId !== id)) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot manage blocks for this apartment.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { type, name, code, totalFloors = 14, blockId, unitNumber, floorNumber = 1, residentType = 'OWNER' } = body;

    if (type === 'UNIT') {
      if (!blockId || !unitNumber) {
        return NextResponse.json({ error: 'Block ID and Unit Number are required.' }, { status: 400 });
      }

      const unit = await prisma.apartmentUnit.create({
        data: {
          blockId,
          unitNumber: unitNumber.trim(),
          floorNumber: parseInt(floorNumber, 10) || 1,
          residentType,
          status: 'OCCUPIED'
        }
      });

      return NextResponse.json({ success: true, message: `Unit ${unitNumber} created.`, unit });
    } else {
      // Create Block
      if (!name) {
        return NextResponse.json({ error: 'Block name is required.' }, { status: 400 });
      }

      const block = await prisma.apartmentBlock.create({
        data: {
          communityId: id,
          name: name.trim(),
          code: code ? code.trim() : null,
          totalFloors: parseInt(totalFloors, 10) || 14
        }
      });

      return NextResponse.json({ success: true, message: `Block ${name} created.`, block });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
