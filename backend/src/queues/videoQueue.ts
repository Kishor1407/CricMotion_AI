import { Queue, Job } from 'bullmq';
import { createRedisClient } from '../config/redis';

export interface VideoRenderJobPayload {
  projectId: string;
  userId: string;
  options?: {
    reRenderOnly?: boolean;
    resolution?: '1080x1920' | '720x1280';
    fps?: number;
  };
}

export const QUEUE_NAME = 'videoRenderQueue';

// WORKER-01: BullMQ Video Queue setup on Redis
export const videoRenderQueue = new Queue<VideoRenderJobPayload>(QUEUE_NAME, {
  connection: createRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // keep completed jobs for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 86400, // keep failed jobs for 24 hours
    },
  },
});

/**
 * Add a new video render job to the queue
 */
export async function addRenderJob(
  projectId: string,
  userId: string,
  options?: VideoRenderJobPayload['options']
): Promise<Job<VideoRenderJobPayload>> {
  const jobId = `render_${projectId}_${Date.now()}`;
  const job = await videoRenderQueue.add(
    'render-video',
    {
      projectId,
      userId,
      options,
    },
    {
      jobId,
    }
  );
  return job;
}

/**
 * Get the live status and progress of a render job
 */
export async function getJobStatus(jobId: string) {
  const job = await videoRenderQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress || 0;

  return {
    id: job.id,
    state,
    progress,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp,
  };
}

/**
 * Check if a project already has an active or waiting render job
 */
export async function getProjectActiveJob(projectId: string): Promise<Job<VideoRenderJobPayload> | null> {
  const activeJobs = await videoRenderQueue.getJobs(['active', 'waiting', 'delayed']);
  const matching = activeJobs.find((j) => j.data.projectId === projectId);
  return matching || null;
}
