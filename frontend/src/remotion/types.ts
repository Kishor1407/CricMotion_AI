import { z } from 'zod';

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

export interface NewsroomCompositionProps {
  scenes: RemotionScene[];
  avatarVideoUrl?: string;
  totalDurationInFrames: number;
  fps?: number;
  theme?: 'snapchat-neobrutalism' | 'classic-cricket';
}
