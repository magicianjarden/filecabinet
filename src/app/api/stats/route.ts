// import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  // Commented out all stats tracking for build
  return NextResponse.json({
    totalConversions: 0,
    todayConversions: 0,
    totalStorage: 0,
    successfulConversions: 0,
    failedConversions: 0,
    averageTime: 0,
    conversionRate: 0,
    conversionTimes: [],
    byFormat: {},
    bySize: {},
    hourlyActivity: {},
    successRate: 0,
    lastUpdated: new Date().toISOString(),
    popularConversions: []
  });
}

export async function POST(request: Request) {
  // Commented out all stats tracking for build
  return NextResponse.json({ success: true });
}

// Helper function to categorize file sizes
function getSizeCategory(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return '< 1MB';
  if (mb < 5) return '1-5MB';
  if (mb < 10) return '5-10MB';
  if (mb < 50) return '10-50MB';
  return '> 50MB';
} 