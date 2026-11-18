import mongoose, { Document, Schema, Model } from 'mongoose';

export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNING_SCRIPT'
  | 'GENERATING_AUDIO'
  | 'GENERATING_AVATAR'
  | 'RENDERING_VIDEO'
  | 'READY'
  | 'PUBLISHED'
  | 'FAILED';

export interface IWordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export interface IStoryboardScene {
  sceneNumber: number;
  title: string;
  narration: string;
  startSeconds: number;
  endSeconds: number;
  contextCategory: 'auction-financial' | 'match-action' | 'press-conference' | 'stats-comparison' | 'news-headline';
  visualPrompt?: string;
  tickerHeadline?: string;
  audioUrl?: string;
  wordTimestamps?: IWordTimestamp[];
}

export interface IChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  sourcePrompt: string;
  status: ProjectStatus;
  errorCode?: string;
  category: 'auction-financial' | 'match-action' | 'press-conference' | 'stats-comparison' | 'news-headline';
  config: {
    targetDurationSeconds: number;
    vibe: string;
    avatarModelId: string;
    voiceModelId: string;
  };
  storyboard: IStoryboardScene[];
  chatHistory: IChatMessage[];
  artifacts: {
    audioTrackUrl?: string;
    avatarVideoUrl?: string;
    finalRenderUrl?: string;
    thumbnailUrl?: string;
  };
  stats: {
    views: number;
    durationSeconds: number;
    tag?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Cricket Reel',
      trim: true,
    },
    sourcePrompt: {
      type: String,
      required: [true, 'Source prompt is required'],
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PLANNING_SCRIPT',
        'GENERATING_AUDIO',
        'GENERATING_AVATAR',
        'RENDERING_VIDEO',
        'READY',
        'PUBLISHED',
        'FAILED',
      ],
      default: 'READY',
      index: true,
    },
    errorCode: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'auction-financial',
        'match-action',
        'press-conference',
        'stats-comparison',
        'news-headline',
      ],
      default: 'match-action',
    },
    config: {
      targetDurationSeconds: {
        type: Number,
        default: 60,
        min: 10,
        max: 90,
      },
      vibe: {
        type: String,
        default: 'News',
      },
      avatarModelId: {
        type: String,
        default: 'old_british_reporter_01',
      },
      voiceModelId: {
        type: String,
        default: 'eleven_multilingual_v2_british',
      },
    },
    storyboard: [
      {
        sceneNumber: { type: Number, required: true },
        title: { type: String, required: true },
        narration: { type: String, required: true },
        startSeconds: { type: Number, default: 0 },
        endSeconds: { type: Number, default: 15 },
        contextCategory: {
          type: String,
          enum: [
            'auction-financial',
            'match-action',
            'press-conference',
            'stats-comparison',
            'news-headline',
          ],
          default: 'match-action',
        },
        visualPrompt: { type: String },
        tickerHeadline: { type: String },
        audioUrl: { type: String },
        wordTimestamps: [
          {
            word: { type: String, required: true },
            startMs: { type: Number, required: true },
            endMs: { type: Number, required: true },
          },
        ],
      },
    ],
    chatHistory: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    artifacts: {
      audioTrackUrl: { type: String },
      avatarVideoUrl: { type: String },
      finalRenderUrl: { type: String },
      thumbnailUrl: { type: String },
    },
    stats: {
      views: { type: Number, default: 0 },
      durationSeconds: { type: Number, default: 45 },
      tag: { type: String, default: 'VIRAL' },
    },
  },
  {
    timestamps: true,
  }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
