import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    // Allow authenticated users to upload campaign assets
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to upload campaign assets.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid file format (${file.type}). Only JPG, JPEG, PNG, and WebP image formats are permitted.` },
        { status: 400 }
      );
    }

    // Validate File Size (Max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5.00 MB.` },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.type === 'image/jpeg' || file.type === 'image/jpg') ext = 'jpg';

    // Ensure persistent storage directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create unique collision-free filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeFileName = `campaign_${Date.now()}_${uniqueId}.${ext}`;
    const targetFilePath = path.join(uploadDir, safeFileName);

    // Write file buffer to persistent storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = `/uploads/campaigns/${safeFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      storedFileName: safeFileName,
      fileSize: file.size,
      mimeType: file.type
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
