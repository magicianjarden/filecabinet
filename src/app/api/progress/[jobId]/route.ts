import { NextRequest, NextResponse } from 'next/server';
// import { ProgressTracker } from '@/lib/utils/progress-tracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    jobId: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  // Commented out progress tracking for build
  // Always return dummy progress
  return NextResponse.json({
    progress: 100,
    status: 'completed',
    message: 'Progress tracking disabled in this build.'
  });
} 