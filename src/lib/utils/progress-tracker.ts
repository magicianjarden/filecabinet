// import { Redis } from "@upstash/redis";

// const redis = Redis.fromEnv();

interface ProgressData {
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export class ProgressTracker {
  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  async updateProgress(data: ProgressData): Promise<void> {
    // No-op for build
    return;
  }

  async getProgress(): Promise<ProgressData | null> {
    // Return dummy progress for build
    return {
      progress: 100,
      status: 'completed',
      message: 'Progress tracking disabled in this build.'
    };
  }
} 