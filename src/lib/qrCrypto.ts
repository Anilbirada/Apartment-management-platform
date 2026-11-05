import crypto from 'crypto';

const SYSTEM_QR_SECRET = process.env.SYSTEM_QR_SECRET || 'apartment_master_qr_secret_2026';

export interface GateQrPayload {
  gateId: string;
  gateCode: string;
  communityId: string;
  timestamp: number;
  nonce: string;
}

export function generateGateQrToken(gateId: string, gateCode: string, communityId: string, gateSecret: string = ''): string {
  const timestamp = Math.floor(Date.now() / 1000); // Unix seconds
  const nonce = crypto.randomBytes(6).toString('hex');
  const payloadStr = `${gateId}:${gateCode}:${communityId}:${timestamp}:${nonce}`;

  const secret = `${SYSTEM_QR_SECRET}:${gateSecret}`;
  const hmac = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

  // Payload: payloadBase64.hmac
  const payloadBase64 = Buffer.from(payloadStr).toString('base64');
  return `GATE_QR.${payloadBase64}.${hmac}`;
}

export function verifyGateQrToken(
  token: string,
  gateSecret: string = '',
  maxAgeSeconds: number = 1800 // 30 minutes validity window
): { valid: boolean; error?: string; data?: GateQrPayload } {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'GATE_QR') {
      return { valid: false, error: 'Malformed or invalid QR format.' };
    }

    const payloadBase64 = parts[1];
    const signature = parts[2];
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const [gateId, gateCode, communityId, timestampStr, nonce] = payloadStr.split(':');

    if (!gateId || !gateCode || !communityId || !timestampStr) {
      return { valid: false, error: 'Invalid QR payload structure.' };
    }

    const secret = `${SYSTEM_QR_SECRET}:${gateSecret}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    if (signature !== expectedHmac) {
      return { valid: false, error: 'Cryptographic signature mismatch. Untrusted or tampered QR code.' };
    }

    const tokenTimestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now - tokenTimestamp > maxAgeSeconds) {
      return { valid: false, error: 'This QR code has expired. Please refresh the gate display.' };
    }

    return {
      valid: true,
      data: {
        gateId,
        gateCode,
        communityId,
        timestamp: tokenTimestamp,
        nonce
      }
    };
  } catch (e: any) {
    return { valid: false, error: e.message || 'QR verification failure' };
  }
}
