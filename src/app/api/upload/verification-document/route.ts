import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function isValidMagicBytes(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (mime === 'image/jpeg' && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }
  // PNG: 89 50 4E 47
  if (mime === 'image/png' && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }
  // PDF: %PDF (25 50 44 46)
  if (mime === 'application/pdf' && buffer.toString('utf8', 0, 4) === '%PDF') {
    return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce authenticated session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 2. Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type', 
        message: 'Only JPEG, PNG, and PDF files are allowed' 
      }, { status: 400 });
    }

    // 3. Strict extension whitelist
    const rawExt = (file.name.split('.').pop() || '').toLowerCase();
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'application/pdf': 'pdf'
    };
    const safeExtension = extMap[file.type];
    if (!safeExtension || (rawExt !== safeExtension && !(rawExt === 'jpeg' && safeExtension === 'jpg'))) {
      return NextResponse.json({
        error: 'Invalid file extension',
        message: 'File extension does not match permitted document types'
      }, { status: 400 });
    }

    // 4. Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large', 
        message: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Enforce magic bytes signature inspection
    if (!isValidMagicBytes(buffer, file.type)) {
      return NextResponse.json({
        error: 'Corrupt or deceptive file payload',
        message: 'The file signature does not match its declared MIME format.'
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'verification-docs');
    await mkdir(uploadsDir, { recursive: true });

    // 6. Cryptographically secure random UUID filename
    const secureToken = crypto.randomUUID();
    const fileName = `doc_${Date.now()}_${secureToken}.${safeExtension}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // Return the safe URL
    const publicUrl = `/uploads/verification-docs/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading verification document:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

