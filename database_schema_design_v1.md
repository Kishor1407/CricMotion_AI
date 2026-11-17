# CRICMOTION AI - Database Schema Design
**Version:** 1.0 (Final Foundation)

## 1. Overview and Database Paradigm
This document defines the MongoDB (Mongoose) schemas for CricMotion AI V1. The database is designed strictly for a **multi-tenant SaaS** environment. Every core operational document contains an `ownerId` to guarantee strict data isolation.

## 2. Core Collections

### 2.1 Users Collection (`users`)
Stores authentications, tenant configurations, Instagram OAuth tokens, and system credits.

```javascript
const UserSchema = new Schema({
  _id: ObjectId,
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, select: false }, 
  oauth: {
    googleId: { type: String, sparse: true },
    instagramAccessToken: { type: String, select: false },
    instagramAccountId: { type: String }
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    avatarUrl: { type: String }
  },
  wallet: {
    generationCredits: { type: Number, default: 10 },
    subscriptionTier: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }
  },
  settings: {
    defaultVoiceId: { type: String, default: 'eleven_multilingual_v2_british' },
    defaultAvatarId: { type: String, default: 'old_british_reporter_01' }
  },
  createdAt: { type: Date, default: Date.now }
});
```

### 2.2 Projects Collection (`projects`)
The central entity for the video generator. Every generation run triggered from the Dashboard is a Project.

```javascript
const ProjectSchema = new Schema({
  _id: ObjectId,
  ownerId: { type: ObjectId, ref: 'User', required: true, index: true },
  
  title: { type: String, default: "Untitled Reel" },
  sourcePrompt: { type: String, required: true }, // The initial Omnibar input
  
  // Pipeline State Machine
  status: { 
    type: String, 
    enum: [
      'DRAFT', 'PLANNING_SCRIPT', 'GENERATING_AUDIO', 
      'GENERATING_AVATAR', 'RENDERING_VIDEO', 'READY', 
      'PUBLISHED', 'FAILED'
    ],
    default: 'DRAFT' 
  },
  errorCode: { type: String, required: false },
  
  config: {
    targetDurationSeconds: { type: Number, enum: [30, 60, 90], default: 60 },
    vibe: { type: String, default: 'News' },
    avatarModelId: { type: String },
    voiceModelId: { type: String }
  },

  artifacts: {
    audioTrackUrl: { type: String },
    avatarVideoUrl: { type: String },
    finalRenderUrl: { type: String },
    thumbnailUrl: { type: String }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 2.3 Script Contracts / Storyboards (`script_revisions`)
Separated from the Project to allow for non-destructive AI revisions via the Omnibar chat.

```javascript
const ScriptRevisionSchema = new Schema({
  _id: ObjectId,
  projectId: { type: ObjectId, ref: 'Project', required: true, index: true },
  versionNumber: { type: Number, required: true }, // Increments on every Omnibar chat revision
  
  // The Gemini Context Router output
  contextCategory: { 
    type: String, 
    enum: ['auction-financial', 'match-action', 'press-conference', 'stats-comparison', 'news-headline'],
    required: true
  },
  
  estimatedDurationMs: { type: Number },
  
  scenes: [{
    sceneId: { type: String, required: true },
    narrationText: { type: String, required: true },
    headlineTickerText: { type: String, required: true },
    
    // UI Logic for Remotion
    overheadAnimations: {
      primaryAsset: { type: String, enum: ['jersey', 'player-cutout', 'trophy', 'team-logo'] },
      primaryAssetData: { type: String },
      actionAsset: { type: String, enum: ['gavel', 'money-rain', 'fire', 'graph-up', 'none'] },
      punchyText: { type: String }
    },
    
    // Populated asynchronously by ElevenLabs
    timing: {
      startFrame: { type: Number },
      endFrame: { type: Number },
      wordAlignments: [{
        word: { type: String },
        startMs: { type: Number },
        endMs: { type: Number }
      }]
    }
  }],
  
  createdAt: { type: Date, default: Date.now }
});

ScriptRevisionSchema.index({ projectId: 1, versionNumber: -1 });
```

### 2.4 Agent Revision Chat Log (`agent_chat_logs`)
Stores the Omnibar chat history to provide conversation context to Gemini during revisions.

```javascript
const ChatLogSchema = new Schema({
  _id: ObjectId,
  projectId: { type: ObjectId, ref: 'Project', required: true, index: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['USER', 'ASSISTANT', 'SYSTEM'], required: true },
  message: { type: String, required: true },
  resultedInScriptVersion: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});
```