import { Worker, Job } from 'bullmq';
import { QUEUE_NAME, VideoRenderJobPayload } from '../queues/videoQueue';
import { createRedisClient } from '../config/redis';
import { renderProjectVideo } from '../services/videoRenderService';
import { Project } from '../models/Project';
import { connectDB } from '../config/db';

/**
 * WORKER-04: Decoupled Background Task Worker for Video Rendering
 * Processes jobs asynchronously so requests don't block server or browser.
 */
export const createVideoWorker = (): Worker<VideoRenderJobPayload> => {
  const worker = new Worker<VideoRenderJobPayload>(
    QUEUE_NAME,
    async (job: Job<VideoRenderJobPayload>) => {
      const { projectId, options } = job.data;
      console.log(`[Worker] 🚀 Received video render job ${job.id} for project ${projectId}`);

      // 1. Mark Project as RENDERING_VIDEO in DB
      await Project.updateOne(
        { _id: projectId },
        {
          status: 'RENDERING_VIDEO',
          renderProgress: 0,
          renderJobId: job.id,
        }
      );

      let lastReportedPct = 0;

      // 2. Execute Headless Remotion Render
      const result = await renderProjectVideo(
        projectId,
        options,
        async ({ progressPercent, renderedFrames, encodedFrames }) => {
          // Update BullMQ job progress
          await job.updateProgress(progressPercent);

          // Throttle DB updates to every 5%
          if (progressPercent - lastReportedPct >= 5 || progressPercent === 100) {
            lastReportedPct = progressPercent;
            await Project.updateOne(
              { _id: projectId },
              {
                renderProgress: progressPercent,
              }
            ).catch(() => {});
          }
        }
      );

      console.log(`[Worker] 🎉 Successfully finished render job ${job.id}. Output: ${result.videoUrl}`);

      return {
        success: true,
        projectId,
        videoUrl: result.videoUrl,
        durationInSeconds: result.durationInSeconds,
      };
    },
    {
      connection: createRedisClient(),
      concurrency: 1, // 1 render job at a time for dedicated CPU/Chromium performance
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] ✅ Job ${job.id} has completed.`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed with error:`, err.message);
    if (job?.data?.projectId) {
      await Project.updateOne(
        { _id: job.data.projectId },
        {
          status: 'FAILED',
          errorCode: `Render Error: ${err.message}`,
        }
      ).catch(() => {});
    }
  });

  worker.on('error', (err) => {
    console.warn(`[Worker] ⚠️ BullMQ Worker system warning:`, err.message);
  });

  return worker;
};

// If run directly via CLI (`npm run worker` or `tsx src/workers/videoWorker.ts`)
if (require.main === module) {
  (async () => {
    console.log('🏏 CricMotion AI - Standalone Video Render Worker Starting...');
    await connectDB();
    const worker = createVideoWorker();
    console.log(`⚡ Video Worker listening on BullMQ queue: "${QUEUE_NAME}"`);

    const shutdown = async () => {
      console.log('\nGracefully shutting down Video Worker...');
      await worker.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })().catch((err) => {
    console.error('Fatal worker startup error:', err);
    process.exit(1);
  });
}
