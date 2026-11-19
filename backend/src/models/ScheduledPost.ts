import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledPost extends Document {
  ownerId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  caption: string;
  hashtags: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  platforms: ('instagram')[];
  scheduledAt: Date;
  status: 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
  publishedAt?: Date;
  platformMetadata?: {
    instagramReelId?: string;
  };
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledPostSchema: Schema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    hashtags: {
      type: [String],
      default: ['#CricketReels', '#CricMotionAI', '#CricketReel'],
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    platforms: {
      type: [String],
      enum: ['instagram'],
      default: ['instagram'],
      validate: [(val: string[]) => val.length > 0, 'At least one platform must be selected'],
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    platformMetadata: {
      instagramReelId: { type: String },
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ScheduledPostSchema.index({ ownerId: 1, scheduledAt: 1 });

export const ScheduledPost = mongoose.model<IScheduledPost>('ScheduledPost', ScheduledPostSchema);
