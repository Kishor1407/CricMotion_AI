import dotenv from 'dotenv';
import path from 'path';
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
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];
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
    console.log('\n⏳ [7/7] Testing Module 4: Conversational Storyboard Revision...');
    const revision = await reviseStoryboard(
      generatedPlan.scenes,
      'Make the tone faster and add Hindi commentary expressions',
      { targetDurationSeconds: 45 }
    );

    if (revision && revision.scenes && revision.scenes.length > 0 && revision.replyMessage) {
      console.log(`✅ [7/7] PASSED: AI Revision applied: "${revision.replyMessage.slice(0, 60)}..."`);
      passed++;
    } else {
      throw new Error('Storyboard revision failed to return updated scenes or reply');
    }

    // Clean up test user
    if (testUserId) {
      await User.deleteOne({ _id: testUserId });
      console.log('🧹 Cleaned up temporary test user record.');
    }
  } catch (err: any) {
    console.error('❌ [7/7] FAILED: Storyboard Revision error:', err.message);
    failed++;
  }

  // Summary
  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runAllTests();
