import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Parse multipart form data
  const form = new IncomingForm({ keepExtensions: true, multiples: false });
  const buffers: Buffer[] = [];
  const reqBody = req.body as any;

  // Await the result so the return type is Promise<Response>
  return await new Promise<NextResponse>((resolve, reject) => {
    form.parse(reqBody, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Failed to parse form data.' }, { status: 400 }));
        return;
      }
      const file = files.file;
      if (!file || Array.isArray(file)) {
        resolve(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
        return;
      }
      const filePath = (file as any).filepath || (file as any).path;
      if (!filePath) {
        resolve(NextResponse.json({ error: 'File path missing.' }, { status: 400 }));
        return;
      }
      // Run clamscan
      exec(`clamscan --no-summary ${filePath}`, async (error, stdout, stderr) => {
        // Clean up temp file
        try { await fs.unlink(filePath); } catch {}
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
  });
} 