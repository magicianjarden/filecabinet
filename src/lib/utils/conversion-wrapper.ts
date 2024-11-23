import { updateStats } from './stats-service';

export async function handleConversionWithStats<T>(
  file: File,
  targetFormat: string,
  conversionFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const fileSize = file.size;
  const fromFormat = file.name.split('.').pop()?.toLowerCase() || '';

  try {
    const result = await conversionFn();
    
    // Update KV stats
    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      conversionTime: Date.now() - startTime,
      success: true
    });

    return result;
  } catch (error) {
    // Update KV stats even for failures
    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      conversionTime: Date.now() - startTime,
      success: false
    });
    throw error;
  }
} 