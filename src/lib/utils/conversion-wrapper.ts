import { updateStats } from './stats-service';

export async function handleConversionWithStats(
  file: File,
  targetFormat: string,
  conversionFn: (file: File) => Promise<any>
) {
  const startTime = Date.now();
  const fileSize = file.size;
  const fromFormat = file.name.split('.').pop()?.toLowerCase() || '';

  console.log('Starting conversion with stats tracking:', {
    fileSize,
    fromFormat,
    targetFormat
  });

  try {
    // Run the actual conversion
    const result = await conversionFn(file);
    
    // Record successful conversion
    const endTime = Date.now();
    const conversionTime = (endTime - startTime) / 1000;

    console.log('Conversion successful, updating stats...', {
      conversionTime,
      success: true
    });

    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      conversionTime,
      success: true
    });

    console.log('Stats updated successfully');
    return result;
  } catch (error) {
    console.error('Conversion failed, recording failure...', error);

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