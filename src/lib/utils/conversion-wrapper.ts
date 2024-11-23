import { updateStats } from './stats-service';

export async function handleConversionWithStats(
  file: File,
  targetFormat: string,
  conversionFn: (file: File) => Promise<any>
) {
  const startTime = Date.now();
  const fileSize = file.size;
  const fromFormat = file.name.split('.').pop() || '';

  try {
    // Run the actual conversion
    const result = await conversionFn(file);
    
    // Record successful conversion
    const endTime = Date.now();
    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      conversionTime: (endTime - startTime) / 1000,
      success: true
    });

    return result;
  } catch (error) {
    // Record failed conversion
    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      success: false
    });
    throw error;
  }
} 