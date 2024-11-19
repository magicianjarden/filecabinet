import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Types for job progress
type JobProgress = {
  jobId: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

// In-memory store for job progress (replace with Redis/DB in production)
const jobStore = new Map<string, JobProgress>();

export async function getJobProgress(jobId: string): Promise<JobProgress> {
  const progress = jobStore.get(jobId);
  
  if (!progress) {
    return {
      jobId,
      progress: 0,
      status: 'pending'
    };
  }
  
  return progress;
}

export async function updateJobProgress(
  jobId: string, 
  data: Partial<JobProgress>
): Promise<void> {
  const currentProgress = jobStore.get(jobId) || {
    jobId,
    progress: 0,
    status: 'pending'
  };
  
  jobStore.set(jobId, {
    ...currentProgress,
    ...data
  });
} 