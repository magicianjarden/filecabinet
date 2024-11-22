import AdmZip from 'adm-zip';
import { create, extract } from 'tar';
import { Converter } from '@/types';
import { join } from 'path';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';

// Helper for temp directory management
const createTempDir = async () => {
  const tempDir = join(process.cwd(), 'temp', Date.now().toString());
  await mkdir(tempDir, { recursive: true });
  return tempDir;
};

const cleanupTempDir = async (dir: string) => {
  await rm(dir, { recursive: true, force: true });
};

export const archiveConverter: Converter = {
  name: 'Archive Converter',
  description: 'Convert between archive formats',
  inputFormats: ['zip', 'tar'],
  outputFormats: ['zip', 'tar'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    const tempDir = await createTempDir();
    
    try {
      switch(`${inputFormat}-${outputFormat}`) {
        case 'zip-zip':
          const zip = new AdmZip(input);
          return zip.toBuffer();
          
        case 'zip-tar':
          const zipToTar = new AdmZip(input);
          const zipExtractPath = join(tempDir, 'extracted');
          const tarOutputPath = join(tempDir, 'output.tar');
          
          zipToTar.extractAllTo(zipExtractPath);
          await create({ file: tarOutputPath, cwd: zipExtractPath }, ['./']);
          
          return await readFile(tarOutputPath);
          
        case 'tar-zip':
          const tarInputPath = join(tempDir, 'input.tar');
          const tarExtractPath = join(tempDir, 'extracted');
          
          await writeFile(tarInputPath, input);
          await extract({ file: tarInputPath, cwd: tarExtractPath });
          
          const newZip = new AdmZip();
          newZip.addLocalFolder(tarExtractPath);
          return newZip.toBuffer();
          
        default:
          throw new Error(`Unsupported conversion: ${inputFormat} to ${outputFormat}`);
      }
    } catch (error) {
      console.error('Archive conversion error:', error);
      throw new Error('Failed to convert archive file');
    } finally {
      await cleanupTempDir(tempDir);
    }
  }
};