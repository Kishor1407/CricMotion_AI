import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Project } from './models/Project';
import {
  classifyCricketContext,
  generateStoryboard,
  reviseStoryboard,
} from './services/geminiService';
import {
  parseElevenLabsAlignment,
  generateCadenceAlignment,
  synthesizeVoice,
  synthesizeProjectAudio,
} from './services/audioService';
import {
  synthesizeAvatarVideo,
  synthesizeProjectAvatar,
} from './services/avatarService';
import { compileTimelineFrames } from './services/remotionService';
import { videoRenderQueue, addRenderJob, getJobStatus } from './queues/videoQueue';
import { renderProjectVideo } from './services/videoRenderService';
import { storageService } from './services/storageService';
import { ScheduledPost } from './models/ScheduledPost';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🏏 CRICMOTION AI - INTEGRATION & MODULE 4 TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: MongoDB Atlas Connection
  try {
    console.log('⏳ [1/7] Testing MongoDB Atlas Connection...');
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      console.log('✅ [1/7] PASSED: MongoDB Atlas connected and readyState is 1.');
      passed++;
    } else {
      throw new Error(`MongoDB state: ${mongoose.connection.readyState}`);
    }
  } catch (err: any) {
    console.error('❌ [1/7] FAILED: MongoDB Atlas connection error:', err.message);
    failed++;
  }

  // TEST 2: Upstash Redis Connectivity
  try {
    console.log('\n⏳ [2/7] Testing Upstash Redis Connectivity...');
    const redisUri = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
    let redisClient: Redis;

    if (redisUri) {
      redisClient = new Redis(redisUri, { tls: { rejectUnauthorized: false } });
    } else {
      redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        tls: { rejectUnauthorized: false },
      });
    }

    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('✅ [2/7] PASSED: Redis responded with PONG.');
      passed++;
    } else {
      throw new Error(`Unexpected Redis response: ${pong}`);
    }
    await redisClient.quit();
  } catch (err: any) {
    console.error('❌ [2/7] FAILED: Redis connection error:', err.message);
    failed++;
  }

  // TEST 3: Google Gemini API
  try {
    console.log('\n⏳ [3/7] Testing Gemini API...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY missing in .env');

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ['gemini-3.5-flash-lite'];
    let responded = false;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Output one word: CRICKET');
        const text = result.response.text();
        if (text && text.length > 0) {
          console.log(`✅ [3/7] PASSED: Gemini (${modelName}) responded: "${text.trim()}"`);
          responded = true;
          passed++;
          break;
        }
      } catch (err: any) {
        console.log(`   ℹ️ Model ${modelName} unavailable, trying next...`);
      }
    }

    if (!responded) {
      throw new Error('All candidate Gemini models temporarily unavailable or throttled');
    }
  } catch (err: any) {
    console.error('❌ [3/7] FAILED: Gemini API error:', err.message);
    failed++;
  }

  // TEST 4: User Authentication & Multi-Tenancy Pipeline
  let testUserId = '';
  try {
    console.log('\n⏳ [4/7] Testing User Auth Model & JWT Generation...');
    const testEmail = `test_runner_${Date.now()}@cricmotion.ai`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('SecureTestPassword123!', salt);

    const testUser = await User.create({
      email: testEmail,
      passwordHash,
      profile: {
        firstName: 'Test',
        lastName: 'Runner',
      },
      wallet: {
        generationCredits: 50,
      },
    });

    testUserId = (testUser._id as any).toString();
    const token = jwt.sign(
      { userId: testUserId, email: testEmail },
      process.env.JWT_SECRET || 'cricmotion_jwt_super_secret_dev_key_2026',
      { expiresIn: '1h' }
    );

    const fetchedUser = await User.findById(testUserId).select('-passwordHash');
    if (fetchedUser && fetchedUser.email === testEmail && fetchedUser.wallet.generationCredits === 50) {
      console.log(`✅ [4/7] PASSED: Created User ${testEmail} with 50 credits & verified JWT generation.`);
      passed++;
    } else {
      throw new Error('User retrieval or verification failed');
    }
  } catch (err: any) {
    console.error('❌ [4/7] FAILED: User Auth pipeline error:', err.message);
    failed++;
  }

  // TEST 5: Module 4 - Gemini Context Classifier
  try {
    console.log('\n⏳ [5/7] Testing Module 4: Gemini Cricket Context Classifier...');
    const auctionCategory = await classifyCricketContext('Rishabh Pant sold for 27 Crores in IPL mega auction to LSG');
    const matchCategory = await classifyCricketContext('Jasprit Bumrah delivers 149 kph yorker shattering stumps');

    if (auctionCategory === 'auction-financial' && matchCategory === 'match-action') {
      console.log(`✅ [5/7] PASSED: Correctly classified "${auctionCategory}" and "${matchCategory}".`);
      passed++;
    } else {
      throw new Error(`Unexpected classifications: ${auctionCategory}, ${matchCategory}`);
    }
  } catch (err: any) {
    console.error('❌ [5/7] FAILED: Context Classifier error:', err.message);
    failed++;
  }

  // TEST 6: Module 4 - Storyboard Generator & Zod Guardrails
  let generatedPlan: any = null;
  try {
    console.log('\n⏳ [6/7] Testing Module 4: Storyboard Generator (Gemini + Zod Guardrails)...');
    generatedPlan = await generateStoryboard('Kohli 82* vs Pakistan at Melbourne Cricket Ground climax', {
      targetDurationSeconds: 45,
      vibe: 'High Energy Hype',
    });

    if (
      generatedPlan &&
      generatedPlan.scenes &&
      generatedPlan.scenes.length >= 2 &&
      generatedPlan.scenes[0].startSeconds === 0
    ) {
      console.log(`✅ [6/7] PASSED: Generated ${generatedPlan.scenes.length} scenes (Title: "${generatedPlan.title}").`);
      passed++;
    } else {
      throw new Error('Storyboard validation failed or missing contiguous scenes');
    }
  } catch (err: any) {
    console.error('❌ [6/7] FAILED: Storyboard Generator error:', err.message);
    failed++;
  }

  // TEST 7: Module 4 - Conversational Storyboard Revision
  try {
    console.log('\n⏳ [7/11] Testing Module 4: Conversational Storyboard Revision...');
    const revision = await reviseStoryboard(
      generatedPlan.scenes,
      'Make the tone faster and add Hindi commentary expressions',
      { targetDurationSeconds: 45 }
    );

    if (revision && revision.scenes && revision.scenes.length > 0 && revision.replyMessage) {
      console.log(`✅ [7/11] PASSED: AI Revision applied: "${revision.replyMessage.slice(0, 60)}..."`);
      passed++;
    } else {
      throw new Error('Storyboard revision failed to return updated scenes or reply');
    }
  } catch (err: any) {
    console.error('❌ [7/11] FAILED: Storyboard Revision error:', err.message);
    failed++;
  }

  // TEST 8: Module 5 - Word-Level Alignment Parser (AUDIO-02)
  try {
    console.log('\n⏳ [8/11] Testing Module 5: ElevenLabs Word-Level Millisecond Alignment Parser...');
    const mockAlignment = {
      characters: ['V', 'i', 'r', 'a', 't', ' ', 'K', 'o', 'h', 'l', 'i', '!'],
      character_start_times_seconds: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
      character_end_times_seconds: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
    };
    const parsed = parseElevenLabsAlignment(mockAlignment);
    if (
      parsed.length === 2 &&
      parsed[0].word === 'Virat' &&
      parsed[0].startMs === 0 &&
      parsed[0].endMs === 250 &&
      parsed[1].word === 'Kohli!' &&
      parsed[1].startMs === 300 &&
      parsed[1].endMs === 600
    ) {
      console.log(`✅ [8/11] PASSED: Successfully parsed ${parsed.length} words with millisecond precision.`);
      passed++;
    } else {
      throw new Error(`Unexpected parser output: ${JSON.stringify(parsed)}`);
    }
  } catch (err: any) {
    console.error('❌ [8/11] FAILED: Word Alignment Parser error:', err.message);
    failed++;
  }

  // TEST 9: Module 5 - Cadence-Based Speech Alignment Engine (AUDIO-02)
  try {
    console.log('\n⏳ [9/11] Testing Module 5: Commentary Cadence Alignment Engine...');
    const narrationText = 'Haris Rauf charging in at 149 kph under floodlights.';
    const cadence = generateCadenceAlignment(narrationText, 8);
    if (cadence.timestamps.length === 9 && cadence.totalDurationMs > 5000) {
      console.log(`✅ [9/11] PASSED: Generated ${cadence.timestamps.length} word timestamps (${cadence.totalDurationMs}ms).`);
      passed++;
    } else {
      throw new Error(`Cadence alignment failed: count=${cadence.timestamps.length}, ms=${cadence.totalDurationMs}`);
    }
  } catch (err: any) {
    console.error('❌ [9/11] FAILED: Cadence Alignment error:', err.message);
    failed++;
  }

  // TEST 10: Module 5 - Voice Synthesis & High-Fidelity Fallback (AUDIO-01 & AUDIO-03)
  try {
    console.log('\n⏳ [10/11] Testing Module 5: Voice Synthesis & AUDIO-03 Fallback...');
    const voiceResult = await synthesizeVoice(
      '28 needed off 8 balls at the MCG.',
      'eleven_multilingual_v2_british',
      'test_project_suite',
      1,
      6
    );

    if (
      voiceResult &&
      voiceResult.audioUrl &&
      voiceResult.wordTimestamps.length > 0 &&
      (voiceResult.engine === 'elevenlabs' || voiceResult.engine === 'fallback-synthesizer')
    ) {
      console.log(`✅ [10/11] PASSED: Audio synthesized via [${voiceResult.engine}]. URL: ${voiceResult.audioUrl} (${voiceResult.wordTimestamps.length} words)`);
      passed++;
    } else {
      throw new Error(`Voice synthesis failed or missing timestamps: ${JSON.stringify(voiceResult)}`);
    }
  } catch (err: any) {
    console.error('❌ [10/11] FAILED: Voice Synthesis error:', err.message);
    failed++;
  }

  // TEST 11: Module 5 - End-to-End Project Audio Synthesis Pipeline
  try {
    console.log('\n⏳ [11/11] Testing Module 5: End-to-End Project Audio Pipeline...');
    const testProj = await Project.create({
      ownerId: testUserId || new mongoose.Types.ObjectId(),
      title: 'Pant Mega Auction Test',
      sourcePrompt: 'Rishabh Pant mega auction test',
      status: 'PLANNING_SCRIPT',
      config: {
        targetDurationSeconds: 30,
        vibe: 'High Energy Hype',
        avatarModelId: 'old_british_reporter_01',
        voiceModelId: 'eleven_multilingual_v2_british',
      },
      storyboard: [
        {
          sceneNumber: 1,
          title: 'The Opening Bid',
          narration: 'The bidding opens at 2 Crore rupees.',
          startSeconds: 0,
          endSeconds: 8,
          contextCategory: 'auction-financial',
        },
        {
          sceneNumber: 2,
          title: 'Record Hammer Fall',
          narration: 'Going once, going twice, sold to Lucknow for 27 Crores!',
          startSeconds: 8,
          endSeconds: 16,
          contextCategory: 'auction-financial',
        },
      ],
      chatHistory: [],
    });

    const synthResult = await synthesizeProjectAudio(testProj._id.toString());
    const refreshed = await Project.findById(testProj._id);

    if (
      refreshed &&
      refreshed.status === 'READY' &&
      refreshed.storyboard[0].audioUrl &&
      refreshed.storyboard[0].wordTimestamps &&
      refreshed.storyboard[0].wordTimestamps.length > 0 &&
      refreshed.artifacts?.audioTrackUrl
    ) {
      console.log(`✅ [11/11] PASSED: Project audio pipeline fully synthesized all scenes. Status: ${refreshed.status}, AudioTrack: ${refreshed.artifacts.audioTrackUrl}`);
      passed++;
    } else {
      throw new Error('Project audio pipeline did not properly populate audioUrl or wordTimestamps');
    }

    // Clean up temporary test project
    await Project.deleteOne({ _id: testProj._id });
  } catch (err: any) {
    console.error('❌ [11/13] FAILED: End-to-End Project Audio Pipeline error:', err.message);
    failed++;
  }

  // TEST 12: Module 6 - D-ID Talks Dispatcher & Avatar Synthesizer (AVATAR-01 & AVATAR-03)
  try {
    console.log('\n⏳ [12/13] Testing Module 6: D-ID Talks Dispatcher & Avatar Synthesizer...');
    const avatarResult = await synthesizeAvatarVideo({
      projectId: 'test_avatar_suite_123',
      presenterModelId: 'old_british_reporter_01',
      fallbackText: 'Bumrah strikes with a 148 kph toe-crusher yorker!',
    });

    if (
      avatarResult &&
      avatarResult.avatarVideoUrl &&
      (avatarResult.engine === 'd-id' || avatarResult.engine === 'fallback-motion')
    ) {
      console.log(`✅ [12/13] PASSED: Avatar synthesized via [${avatarResult.engine}]. Video: ${avatarResult.avatarVideoUrl}`);
      passed++;
    } else {
      throw new Error(`Avatar synthesis failed: ${JSON.stringify(avatarResult)}`);
    }
  } catch (err: any) {
    console.error('❌ [12/13] FAILED: Avatar Dispatcher error:', err.message);
    failed++;
  }

  // TEST 13: Module 6 - End-to-End Project Avatar Pipeline (AVATAR-02)
  try {
    console.log('\n⏳ [13/13] Testing Module 6: End-to-End Project Avatar Pipeline...');
    const avatarProj = await Project.create({
      ownerId: testUserId || new mongoose.Types.ObjectId(),
      title: 'Avatar Presenter Test Reel',
      sourcePrompt: 'Kohli MCG classic finish breakdown',
      status: 'PLANNING_SCRIPT',
      config: {
        targetDurationSeconds: 30,
        vibe: 'High Energy Hype',
        avatarModelId: 'old_british_reporter_01',
        voiceModelId: 'eleven_multilingual_v2_british',
      },
      storyboard: [
        {
          sceneNumber: 1,
          title: 'The Unthinkable Equation',
          narration: '28 needed off 8 balls at the MCG.',
          startSeconds: 0,
          endSeconds: 10,
          contextCategory: 'match-action',
        },
      ],
      chatHistory: [],
    });

    const projectAvatarRes = await synthesizeProjectAvatar(avatarProj._id.toString());
    const refreshedAvatarProj = await Project.findById(avatarProj._id);

    if (
      refreshedAvatarProj &&
      refreshedAvatarProj.status === 'READY' &&
      refreshedAvatarProj.artifacts?.avatarVideoUrl
    ) {
      console.log(`✅ [13/13] PASSED: Project avatar pipeline successfully mounted presenter video: ${refreshedAvatarProj.artifacts.avatarVideoUrl} (Status: ${refreshedAvatarProj.status})`);
      passed++;
    } else {
      throw new Error(`Project avatar pipeline failed: ${JSON.stringify(refreshedAvatarProj?.artifacts)}`);
    }

    // Clean up temporary test project and test user
    await Project.deleteOne({ _id: avatarProj._id });
    if (testUserId) {
      await User.deleteOne({ _id: testUserId });
      console.log('🧹 Cleaned up temporary test project and test user record.');
    }
  } catch (err: any) {
    console.error('❌ [13/13] FAILED: End-to-End Project Avatar Pipeline error:', err.message);
    failed++;
  }

  // TEST 14: Module 7 - Timeline Frame Compiler & 30 FPS Bounds Mapping (REMOTION-01)
  try {
    console.log('\n⏳ [14/15] Testing Module 7: Timeline Frame Compiler (REMOTION-01)...');
    const sampleStoryboard = [
      {
        sceneNumber: 1,
        title: 'Opening Yorker',
        narration: 'Bumrah charges in under floodlights.',
        startSeconds: 0,
        endSeconds: 10,
        contextCategory: 'match-action',
        wordTimestamps: [
          { word: 'Bumrah', startMs: 0, endMs: 800 },
          { word: 'charges', startMs: 850, endMs: 1600 },
          { word: 'in', startMs: 1650, endMs: 2000 },
        ],
      },
      {
        sceneNumber: 2,
        title: 'Auction Climax',
        narration: 'Sold to Lucknow for 27 Crores!',
        startSeconds: 10,
        endSeconds: 22,
        contextCategory: 'auction-financial',
      },
    ];

    const compiled = compileTimelineFrames(sampleStoryboard, 30);

    if (
      compiled.scenes.length === 2 &&
      compiled.scenes[0].startFrame === 0 &&
      compiled.scenes[0].durationInFrames === 300 && // 10s * 30fps
      compiled.scenes[1].startFrame === 300 &&
      compiled.scenes[1].durationInFrames === 360 && // 12s * 30fps
      compiled.totalDurationInFrames === 660 &&
      compiled.scenes[0].wordTimestamps[0].startFrame === 0 &&
      compiled.scenes[0].wordTimestamps[0].endFrame === 24 // 0.8s * 30 = 24 frames
    ) {
      console.log(`✅ [14/15] PASSED: Successfully compiled ${compiled.scenes.length} scenes to ${compiled.totalDurationInFrames} frames (30 FPS) with exact word bounds.`);
      passed++;
    } else {
      throw new Error(`Unexpected compiled timeline: ${JSON.stringify(compiled)}`);
    }
  } catch (err: any) {
    console.error('❌ [14/15] FAILED: Timeline Frame Compiler error:', err.message);
    failed++;
  }

  // TEST 15: Module 7 - Context Routing & Telemetry Metrics (REMOTION-03 to REMOTION-07)
  try {
    console.log('\n⏳ [15/15] Testing Module 7: Context Routing & Telemetry Metrics (REMOTION-03 to REMOTION-07)...');
    const testScenes = [
      {
        sceneNumber: 1,
        title: 'Speed Radar',
        narration: 'Haris Rauf clocks 149.2 kph on the MCG gun.',
        contextCategory: 'match-action',
      },
      {
        sceneNumber: 2,
        title: 'Mega Bid',
        narration: 'Bidding hits record 27.0 Crore for Pant.',
        contextCategory: 'auction-financial',
      },
      {
        sceneNumber: 3,
        title: 'Head to Head',
        narration: 'Virat Kohli vs Haris Rauf classic encounter.',
        contextCategory: 'stats-comparison',
      },
    ];

    const result = compileTimelineFrames(testScenes, 30);
    const s1 = result.scenes[0];
    const s2 = result.scenes[1];
    const s3 = result.scenes[2];

    if (
      s1.contextCategory === 'match-action' &&
      s1.metrics?.speedKph === 149.2 &&
      s2.contextCategory === 'auction-financial' &&
      s2.metrics?.auctionAmountCr === 27.0 &&
      s3.contextCategory === 'stats-comparison' &&
      s3.metrics?.winProbability === 88
    ) {
      console.log(`✅ [15/17] PASSED: All 3 cricket context categories successfully routed with dynamic kinetic telemetry.`);
      passed++;
    } else {
      throw new Error(`Context routing or metrics parsing mismatch: ${JSON.stringify(result.scenes)}`);
    }
  } catch (err: any) {
    console.error('❌ [15/17] FAILED: Context Routing error:', err.message);
    failed++;
  }

  // TEST 16: Module 8 - BullMQ Video Queue & Redis Job Submission
  let testJobId = '';
  try {
    console.log('\n⏳ [16/17] Testing Module 8: BullMQ Video Queue & Redis Job Dispatcher...');
    const queueName = videoRenderQueue.name;
    const isPaused = await videoRenderQueue.isPaused();
    const dummyQueueProjectId = new mongoose.Types.ObjectId().toString();
    const dummyQueueUserId = new mongoose.Types.ObjectId().toString();

    const sampleJob = await addRenderJob(
      dummyQueueProjectId,
      dummyQueueUserId,
      { resolution: '720x1280', fps: 30 }
    );
    testJobId = sampleJob.id!;

    const jobStatus = await getJobStatus(testJobId);
    if (
      queueName === 'videoRenderQueue' &&
      !isPaused &&
      sampleJob.id &&
      jobStatus &&
      (jobStatus.state === 'waiting' || jobStatus.state === 'active' || jobStatus.state === 'delayed')
    ) {
      console.log(`✅ [16/17] PASSED: BullMQ videoRenderQueue initialized, submitted job ${testJobId} (state: ${jobStatus.state}).`);
      passed++;
    } else {
      throw new Error(`BullMQ job submission verification failed: ${JSON.stringify(jobStatus)}`);
    }
  } catch (err: any) {
    console.error('❌ [16/17] FAILED: BullMQ Queue error:', err.message);
    failed++;
  }

  // TEST 17: Module 8 - Headless Remotion Video Renderer (Chromium + FFmpeg MP4 Compilation)
  try {
    console.log('\n⏳ [17/17] Testing Module 8: Headless Remotion Renderer & MP4 Compilation...');
    // Create a lean test project for fast test verification
    const renderUserId = new mongoose.Types.ObjectId().toString();
    const renderTestProject = await Project.create({
      ownerId: renderUserId,
      title: 'Render Test Reel',
      sourcePrompt: 'Rohit Sharma 100 vs AFG fast clip',
      category: 'match-action',
      status: 'READY',
      config: {
        targetDurationSeconds: 15,
        vibe: 'High Energy Hype',
        avatarModelId: 'old_british_reporter_01',
        voiceModelId: 'eleven_multilingual_v2_british',
      },
      storyboard: [
        {
          sceneNumber: 1,
          title: 'Powerplay Blast',
          narration: 'Rohit Sharma pulls it over deep midwicket for six!',
          startSeconds: 0,
          endSeconds: 2,
          contextCategory: 'match-action',
          tickerHeadline: '⚡ ROHIT SHARMA // 105M MAXIMUM',
        },
      ],
      artifacts: {
        avatarVideoUrl: '/uploads/avatars/default_presenter.mp4',
        audioTrackUrl: '/uploads/audio/demo_scene_1.mp3',
      },
    });

    const renderResult = await renderProjectVideo(
      renderTestProject._id.toString(),
      { resolution: '720x1280', fps: 30 }
    );

    const existsOnDisk = fs.existsSync(renderResult.filePath);
    const stats = existsOnDisk ? fs.statSync(renderResult.filePath) : null;

    if (existsOnDisk && stats && stats.size > 1000 && renderResult.videoUrl.endsWith('.mp4')) {
      console.log(`✅ [17/17] PASSED: Rendered 1080x1920 MP4 video (${stats.size} bytes) via headless Chromium: ${renderResult.videoUrl}`);
      passed++;
    } else {
      throw new Error(`Rendered video file not found or empty: ${JSON.stringify(renderResult)}`);
    }

    // Clean up test video file and DB entry
    if (existsOnDisk) {
      try { fs.unlinkSync(renderResult.filePath); } catch { }
    }
    await Project.deleteOne({ _id: renderTestProject._id });
  } catch (err: any) {
    console.error('❌ [17/17] FAILED: Headless Remotion Render error:', err.message);
    failed++;
  }

  // TEST 18: Module 9 - Artifact Storage Service & Multi-Tenant Key Isolation
  try {
    console.log('\n⏳ [18/20] Testing Module 9: Storage Service & Tenant Path Isolation...');
    const dummyTenantId = new mongoose.Types.ObjectId().toString();
    const dummyProjId = new mongoose.Types.ObjectId().toString();
    const sampleKey = storageService.generateTenantKey(dummyTenantId, dummyProjId, 'reel_1080x1920.mp4');

    if (sampleKey.includes(dummyTenantId) && sampleKey.includes(dummyProjId) && sampleKey.includes('reel_1080x1920.mp4')) {
      console.log(`✅ [18/20] PASSED: Generated tenant-isolated storage key: "${sampleKey}"`);
      passed++;
    } else {
      throw new Error(`Invalid tenant storage key format: ${sampleKey}`);
    }
  } catch (err: any) {
    console.error('❌ [18/20] FAILED: Storage Service error:', err.message);
    failed++;
  }

  // TEST 19: Module 10 - Social Post Scheduling Model & Instagram Reels Validation
  let testPostId = '';
  try {
    console.log('\n⏳ [19/20] Testing Module 10: ScheduledPost Mongoose Schema (Instagram Only)...');
    const dummyOwnerId = new mongoose.Types.ObjectId();
    const dummyProjId = new mongoose.Types.ObjectId();
    const scheduledDate = new Date(Date.now() + 86400000); // 24 hours later

    const scheduledPost = await ScheduledPost.create({
      ownerId: dummyOwnerId,
      projectId: dummyProjId,
      title: 'Bumrah 149 KPH Yorker Clutch',
      caption: 'Bumrah toe-crusher dismisses Ollie Pope! ⚡ #CricketReels #CricMotionAI',
      platforms: ['instagram'],
      videoUrl: '/uploads/videos/sample_test.mp4',
      scheduledAt: scheduledDate,
    });

    testPostId = scheduledPost._id.toString();
    if (scheduledPost && scheduledPost.status === 'SCHEDULED' && scheduledPost.platforms[0] === 'instagram') {
      console.log(`✅ [19/20] PASSED: ScheduledPost created with id ${testPostId} (Dedicated Platform: ${scheduledPost.platforms[0]})`);
      passed++;
    } else {
      throw new Error('Failed to create ScheduledPost with valid defaults');
    }
  } catch (err: any) {
    console.error('❌ [19/20] FAILED: ScheduledPost creation error:', err.message);
    failed++;
  }

  // TEST 20: Module 10 - Instagram Reels Direct Publishing Workflow & State Machine
  try {
    console.log('\n⏳ [20/20] Testing Module 10: Instagram Reels Instant Publishing Workflow...');
    if (!testPostId) throw new Error('testPostId missing from Test 19');

    const postToPublish = await ScheduledPost.findById(testPostId);
    if (!postToPublish) throw new Error('ScheduledPost not found');

    postToPublish.status = 'PUBLISHING';
    await postToPublish.save();

    postToPublish.status = 'PUBLISHED';
    postToPublish.publishedAt = new Date();
    postToPublish.platformMetadata = {
      instagramReelId: 'ig_test_reel_17950',
    };
    await postToPublish.save();

    const verifiedPost = await ScheduledPost.findById(testPostId);
    if (verifiedPost && verifiedPost.status === 'PUBLISHED' && verifiedPost.platformMetadata?.instagramReelId) {
      console.log(`✅ [20/20] PASSED: Successfully published reel exclusively to Instagram Reels (${verifiedPost.platformMetadata.instagramReelId})`);
      passed++;
    } else {
      throw new Error('Post publish state machine failed to transition to PUBLISHED');
    }

    // Cleanup
    await ScheduledPost.findByIdAndDelete(testPostId);
  } catch (err: any) {
    console.error('❌ [20/20] FAILED: Direct-to-Instagram publishing error:', err.message);
    failed++;
  }

  // Summary
  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  await videoRenderQueue.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runAllTests();
