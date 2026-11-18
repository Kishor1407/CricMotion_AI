export interface RemotionWordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
  startFrame: number;
  endFrame: number;
}

export type ContextCategory =
  | 'match-action'
  | 'auction-financial'
  | 'stats-comparison'
  | 'news-headline';

export interface RemotionScene {
  sceneNumber: number;
  title: string;
  narration: string;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  durationInFrames: number;
  contextCategory: ContextCategory;
  visualPrompt?: string;
  tickerHeadline?: string;
  audioUrl?: string;
  wordTimestamps: RemotionWordTimestamp[];
  metrics?: {
    speedKph?: number;
    batSpeedKph?: number;
    auctionAmountCr?: number;
    winProbability?: number;
  };
}

export interface RawSceneInput {
  sceneNumber: number;
  title: string;
  narration: string;
  startSeconds?: number;
  endSeconds?: number;
  contextCategory?: string;
  visualPrompt?: string;
  tickerHeadline?: string;
  audioUrl?: string;
  wordTimestamps?: Array<{ word: string; startMs: number; endMs: number }>;
}

/**
 * REMOTION-01: Timeline Frame Compiler
 * Compiles raw storyboard and millisecond alignments into deterministic 30 FPS frame ranges.
 */
export function compileTimelineFrames(
  rawScenes: RawSceneInput[],
  fps: number = 30
): { scenes: RemotionScene[]; totalDurationInFrames: number } {
  let accumulatedFrame = 0;

  const scenes: RemotionScene[] = rawScenes.map((sc, index) => {
    const rawStartSec = typeof sc.startSeconds === 'number' ? sc.startSeconds : index * 10;
    const rawEndSec = typeof sc.endSeconds === 'number' ? sc.endSeconds : rawStartSec + 10;
    const durationSeconds = Math.max(2, rawEndSec - rawStartSec);
    const durationInFrames = Math.round(durationSeconds * fps);

    const startFrame = accumulatedFrame;
    accumulatedFrame += durationInFrames;

    // Compile word alignments to frame bounds relative to this scene's startFrame
    const rawWords = sc.wordTimestamps || [];
    let compiledWords: RemotionWordTimestamp[] = [];

    if (rawWords.length > 0) {
      compiledWords = rawWords.map((w) => {
        const wordStartFrame = startFrame + Math.floor((w.startMs / 1000) * fps);
        const wordEndFrame = Math.max(
          wordStartFrame + 2,
          startFrame + Math.ceil((w.endMs / 1000) * fps)
        );
        return {
          word: w.word,
          startMs: w.startMs,
          endMs: w.endMs,
          startFrame: wordStartFrame,
          endFrame: wordEndFrame,
        };
      });
    } else {
      const words = sc.narration.trim().split(/\s+/).filter(Boolean);
      const framesPerWord = Math.max(3, Math.floor(durationInFrames / Math.max(1, words.length)));

      compiledWords = words.map((word, wIdx) => {
        const wStart = startFrame + wIdx * framesPerWord;
        const wEnd = Math.min(startFrame + durationInFrames, wStart + framesPerWord - 1);
        return {
          word,
          startMs: Math.round(((wIdx * framesPerWord) / fps) * 1000),
          endMs: Math.round(((wEnd - startFrame) / fps) * 1000),
          startFrame: wStart,
          endFrame: wEnd,
        };
      });
    }

    const validCategory = (
      ['match-action', 'auction-financial', 'stats-comparison', 'news-headline'].includes(
        sc.contextCategory || ''
      )
        ? sc.contextCategory
        : 'match-action'
    ) as ContextCategory;

    let metrics: RemotionScene['metrics'] = {};
    if (validCategory === 'match-action') {
      const speedMatch = sc.narration.match(/(\d{2,3}(?:\.\d+)?)\s*kph/i);
      metrics.speedKph = speedMatch ? parseFloat(speedMatch[1]) : 149.2;
      metrics.batSpeedKph = 138;
    } else if (validCategory === 'auction-financial') {
      const crMatch = sc.narration.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/i);
      metrics.auctionAmountCr = crMatch ? parseFloat(crMatch[1]) : 27.0;
    } else if (validCategory === 'stats-comparison') {
      metrics.winProbability = 88;
    }

    return {
      sceneNumber: sc.sceneNumber || index + 1,
      title: sc.title || `Scene ${index + 1}`,
      narration: sc.narration,
      startSeconds: rawStartSec,
      endSeconds: rawEndSec,
      startFrame,
      durationInFrames,
      contextCategory: validCategory,
      visualPrompt: sc.visualPrompt,
      tickerHeadline: sc.tickerHeadline,
      audioUrl: sc.audioUrl,
      wordTimestamps: compiledWords,
      metrics,
    };
  });

  return {
    scenes,
    totalDurationInFrames: Math.max(30, accumulatedFrame),
  };
}
