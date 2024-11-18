import { NextRequest, NextResponse } from 'next/server';
import { ProgressTracker } from '@/lib/utils/progress-tracker';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const progress = new ProgressTracker(params.jobId);
    const data = await progress.getProgress();

    if (!data) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
} 