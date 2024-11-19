import { NextRequest, NextResponse } from 'next/server';
import { getJobProgress } from '@/lib/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: {
    jobId: string;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const progress = await getJobProgress(params.jobId);
    return NextResponse.json(progress);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
} 