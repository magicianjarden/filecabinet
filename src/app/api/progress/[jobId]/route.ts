import { NextRequest, NextResponse } from 'next/server';
import { ProgressTracker } from '@/lib/utils/progress-tracker';

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
  try {
    const tracker = new ProgressTracker(params.jobId);
    const progress = await tracker.getProgress();
    
    if (!progress) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Failed to get progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
} 