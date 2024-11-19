interface ConversionRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  timestamp: number;
}

export async function getConversionHistory(limit = 10): Promise<ConversionRecord[]> {
  // Return empty array if Redis is not yet implemented
  return [];
} 