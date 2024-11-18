import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

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
    await redis.set(
      `progress:${this.jobId}`,
      JSON.stringify(data),
      { ex: 3600 } // Expire after 1 hour
    );
  }

  async getProgress(): Promise<ProgressData | null> {
    const data = await redis.get(`progress:${this.jobId}`);
    return data ? JSON.parse(data as string) : null;
  }
} 