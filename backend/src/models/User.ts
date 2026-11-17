import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string;
  oauth: {
    googleId?: string;
    instagramAccessToken?: string;
    instagramAccountId?: string;
  };
  profile: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  wallet: {
    generationCredits: number;
    subscriptionTier: 'FREE' | 'PRO';
  };
  settings: {
    defaultVoiceId: string;
    defaultAvatarId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    oauth: {
      googleId: { type: String, sparse: true },
      instagramAccessToken: { type: String, select: false },
      instagramAccountId: { type: String },
    },
    profile: {
      firstName: { type: String, default: 'Cricket' },
      lastName: { type: String, default: 'Creator' },
      avatarUrl: { type: String, default: '' },
    },
    wallet: {
      generationCredits: { type: Number, default: 50 },
      subscriptionTier: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    },
    settings: {
      defaultVoiceId: { type: String, default: 'eleven_multilingual_v2_british' },
      defaultAvatarId: { type: String, default: 'old_british_reporter_01' },
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
