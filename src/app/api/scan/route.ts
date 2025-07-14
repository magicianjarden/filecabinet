import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` }, { status: 400 });
    }
    // Write file to temp path
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempPath = path.join('/tmp', `${Date.now()}-${file.name}`);
    await fs.writeFile(tempPath, buffer);
    // Run clamscan
    return await new Promise<NextResponse>((resolve) => {
      exec(`clamscan --no-summary ${tempPath}`, async (error, stdout, stderr) => {
        // Clean up temp file
        try { await fs.unlink(tempPath); } catch {}
        if (error && error.code !== 1) {
          resolve(NextResponse.json({ error: 'Error running clamscan.', details: stderr }, { status: 500 }));
          return;
        }
        // Parse result
        const infected = stdout.includes('FOUND');
        const result = {
          clean: !infected,
          infected,
          output: stdout.trim(),
        };
        resolve(NextResponse.json(result));
      });
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process scan.', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
} 