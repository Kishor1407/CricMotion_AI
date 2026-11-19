import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import { Project } from '../models/Project';
import { compileTimelineFrames } from './remotionService';

export interface RenderOptions {
  resolution?: '1080x1920' | '720x1280';
  fps?: number;
  reRenderOnly?: boolean;
}

export interface RenderProgressUpdate {
  renderedFrames: number;
  encodedFrames: number;
  progressPercent: number;
}

let cachedBundleLocation: string | null = null;
let isBundling = false;
let bundlePromise: Promise<string> | null = null;

/**
 * WORKER-02: Get or create the Remotion bundle for headless rendering.
 * Caches the bundle location in memory to avoid recompiling on every render job.
 */
export async function getRemotionBundle(): Promise<string> {
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }

  if (isBundling && bundlePromise) {
    return bundlePromise;
  }

  isBundling = true;
  bundlePromise = (async () => {
    const entryPoint = path.resolve(__dirname, '../../../frontend/src/remotion/index.ts');
    if (!fs.existsSync(entryPoint)) {
      throw new Error(`Remotion entry point not found at ${entryPoint}`);
    }

    console.log(`⏳ Bundling Remotion composition from ${entryPoint}...`);
    const bundleLocation = await bundle({
      entryPoint,
      onProgress: (p) => {
        if (p % 25 === 0 || p === 100) {
          console.log(`   ↳ Remotion bundle progress: ${p}%`);
        }
      },
    });

    cachedBundleLocation = bundleLocation;
    isBundling = false;
    console.log(`✅ Remotion bundled successfully: ${bundleLocation}`);
    return bundleLocation;
  })();

  return bundlePromise;
}

/**
 * WORKER-02 & WORKER-03: Render a Project's video to MP4 using headless Chromium & FFmpeg.
 */
export async function renderProjectVideo(
  projectId: string,
  options?: RenderOptions,
  onProgress?: (update: RenderProgressUpdate) => void
): Promise<{ videoUrl: string; durationInSeconds: number; filePath: string }> {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Ensure output directory exists
  const videosDir = path.resolve(__dirname, '../../public/uploads/videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const outputFileName = `${projectId}_${Date.now()}.mp4`;
  const outputFilePath = path.join(videosDir, outputFileName);
  const relativeVideoUrl = `/uploads/videos/${outputFileName}`;

  // WORKER-03: Smart Partial Re-Render Optimizer
  // Re-uses existing voiceover and presenter avatar video if available
  const rawScenes = (project.storyboard || []).map((sc) => ({
    sceneNumber: sc.sceneNumber,
    title: sc.title,
    narration: sc.narration,
    startSeconds: sc.startSeconds,
    endSeconds: sc.endSeconds,
    contextCategory: sc.contextCategory,
    visualPrompt: sc.visualPrompt,
    tickerHeadline: sc.tickerHeadline,
    audioUrl: sc.audioUrl,
    wordTimestamps: sc.wordTimestamps,
  }));

  const fps = options?.fps || 30;
  const { scenes: compiledScenes, totalDurationInFrames } = compileTimelineFrames(rawScenes, fps);
  const durationInFrames = Math.max(30, totalDurationInFrames);

  const inputProps = {
    scenes: compiledScenes,
    avatarVideoUrl: project.artifacts?.avatarVideoUrl,
    totalDurationInFrames: durationInFrames,
  };

  // Get or reuse Remotion bundle
  const serveUrl = await getRemotionBundle();

  // Select composition
  const composition = await selectComposition({
    serveUrl,
    id: 'NewsroomComposition',
    inputProps,
  });

  const width = options?.resolution === '720x1280' ? 720 : 1080;
  const height = options?.resolution === '720x1280' ? 1280 : 1920;

  console.log(`🎬 Rendering Project "${project.title}" (${durationInFrames} frames @ ${fps} FPS, ${width}x${height})...`);

  // Execute frame-by-frame headless Chromium render & FFmpeg encoding
  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      width,
      height,
      fps,
    },
    serveUrl,
    codec: 'h264',
    outputLocation: outputFilePath,
    inputProps,
    onProgress: ({ renderedFrames, encodedFrames, progress }) => {
      const progressPercent = Math.min(100, Math.round(progress * 100));
      if (onProgress) {
        onProgress({
          renderedFrames,
          encodedFrames,
          progressPercent,
        });
      }
    },
  });

  console.log(`✅ MP4 Render Complete: ${outputFilePath}`);

  // Update Project in MongoDB with final video URL and status
  project.artifacts = {
    ...project.artifacts,
    finalRenderUrl: relativeVideoUrl,
  };
  project.status = 'READY';
  project.renderProgress = 100;
  await project.save();

  return {
    videoUrl: relativeVideoUrl,
    durationInSeconds: Math.round(durationInFrames / fps),
    filePath: outputFilePath,
  };
}
