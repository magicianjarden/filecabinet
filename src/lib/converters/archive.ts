import AdmZip from 'adm-zip';
import { RAR } from 'node-rar-js';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function convertArchive(
  buffer: Buffer,
  sourceFormat: string,
  targetFormat: string
): Promise<{ success: boolean; data?: Buffer; error?: string; mimeType?: string }> {
  try {
    // If source and target are the same, return original
    if (sourceFormat === targetFormat) {
      return {
        success: true,
        data: buffer,
        mimeType: getMimeTypeForArchive(targetFormat)
      };
    }

    switch(targetFormat) {
      case 'zip':
        return await convertToZip(buffer, sourceFormat);
      case 'rar':
        return await convertToRar(buffer, sourceFormat);
      default:
        return { 
          success: false, 
          error: 'Unsupported target format' 
        };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function convertToZip(buffer: Buffer, sourceFormat: string) {
  const zip = new AdmZip();
  
  if (sourceFormat === 'rar') {
    // Create temporary files for RAR processing
    const tempDir = tmpdir();
    const tempRarPath = join(tempDir, `${uuidv4()}.rar`);
    const tempExtractPath = join(tempDir, uuidv4());
    
    try {
      // Write RAR buffer to temp file
      await writeFile(tempRarPath, buffer);
      
      // Extract RAR contents
      const rar = new RAR(tempRarPath);
      await rar.extract(tempExtractPath);
      
      // Add extracted files to ZIP
      zip.addLocalFolder(tempExtractPath);
      
      return {
        success: true,
        data: zip.toBuffer(),
        mimeType: 'application/zip'
      };
    } finally {
      // Cleanup temp files
      try {
        await unlink(tempRarPath);
        // You might want to add recursive directory removal for tempExtractPath
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }
  
  // For other formats, just add the buffer as a single file
  zip.addFile('converted_file', buffer);
  
  return {
    success: true,
    data: zip.toBuffer(),
    mimeType: 'application/zip'
  };
}

async function convertToRar(buffer: Buffer, sourceFormat: string) {
  // Create temporary files for RAR creation
  const tempDir = tmpdir();
  const tempSourcePath = join(tempDir, `source_${uuidv4()}`);
  const tempRarPath = join(tempDir, `${uuidv4()}.rar`);
  
  try {
    // Write source buffer to temp file
    await writeFile(tempSourcePath, buffer);
    
    // Create RAR archive using node-rar-js
    const rar = new RAR();
    await rar.create(tempRarPath, [tempSourcePath], {
      compression: 5  // Medium compression
    });
    
    // Read the created RAR file
    const rarBuffer = await readFile(tempRarPath);
    
    return {
      success: true,
      data: rarBuffer,
      mimeType: 'application/x-rar-compressed'
    };
  } catch (error) {
    return {
      success: false,
      error: 'RAR conversion failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  } finally {
    // Cleanup temp files
    try {
      await unlink(tempSourcePath);
      await unlink(tempRarPath);
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
}

function getMimeTypeForArchive(format: string): string {
  const mimeTypes: Record<string, string> = {
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip'
  };
  return mimeTypes[format] || 'application/octet-stream';
}