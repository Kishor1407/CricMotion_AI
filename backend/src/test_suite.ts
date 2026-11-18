import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Project } from './models/Project';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAllTests = async () => {
  console.log('\n=============================================');
  console.log('🏏 CRICMOTION AI - FULL INTEGRATION TEST SUITE');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: MongoDB Atlas Connection
  try {
    console.log('⏳ [1/5] Testing MongoDB Atlas Connection...');
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      console.log('✅ [1/5] PASSED: MongoDB Atlas connected and readyState is 1.');
      passed++;
    } else {
      throw new Error(`MongoDB state: ${mongoose.connection.readyState}`);
    }
  } catch (err: any) {
    console.error('❌ [1/5] FAILED: MongoDB Atlas connection error:', err.message);
    failed++;
  }

  // TEST 2: Upstash Redis Connectivity
  try {
    console.log('\n⏳ [2/5] Testing Upstash Redis Connectivity...');
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
      console.log('✅ [2/5] PASSED: Redis responded with PONG.');
      passed++;
    } else {
      throw new Error(`Unexpected Redis response: ${pong}`);
    }
    await redisClient.quit();
  } catch (err: any) {
    console.error('❌ [2/5] FAILED: Redis connection error:', err.message);
    failed++;
  }

  // TEST 3: Google Gemini API (with fallback models)
  try {
    console.log('\n⏳ [3/5] Testing Gemini API...');
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
          console.log(`✅ [3/5] PASSED: Gemini (${modelName}) responded: "${text.trim()}"`);
          responded = true;
          passed++;
          break;
        }
      } catch (err: any) {
        console.log(`   ℹ️ Model ${modelName} unavailable (${err.message.slice(0, 50)}...), trying next...`);
      }
    }

    if (!responded) {
      throw new Error('All candidate Gemini models temporarily unavailable or throttled');
    }
  } catch (err: any) {
    console.error('❌ [3/5] FAILED: Gemini API error:', err.message);
    failed++;
  }

  // TEST 4: User Authentication & Multi-Tenancy Pipeline
  let testUserId = '';
  let testToken = '';
  try {
    console.log('\n⏳ [4/5] Testing User Auth Model & JWT Generation...');
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
    testToken = token;

    const fetchedUser = await User.findById(testUserId).select('-passwordHash');
    if (fetchedUser && fetchedUser.email === testEmail && fetchedUser.wallet.generationCredits === 50) {
      console.log(`✅ [4/5] PASSED: Created User ${testEmail} with 50 credits & verified JWT generation.`);
      passed++;
    } else {
      throw new Error('User retrieval or verification failed');
    }
  } catch (err: any) {
    console.error('❌ [4/5] FAILED: User Auth pipeline error:', err.message);
    failed++;
  }

  // TEST 5: Project Management & Multi-Tenancy Scoping
  try {
    console.log('\n⏳ [5/5] Testing Project Schema & Multi-Tenancy Querying...');
    const testProject = await Project.create({
      ownerId: testUserId,
      title: 'IPL 2026 Mega Auction: Starc Breaks Record',
      sourcePrompt: 'Generate a dramatic breakdown of the auction bidding war.',
      category: 'auction-financial',
      status: 'READY',
      config: {
        aspectRatio: '9:16',
        targetDurationSeconds: 45,
        videoResolution: '1080x1920',
      },
      stats: {
        views: 1250000,
        durationSeconds: 45,
        tag: '🔥 1.2M VIEWS',
      },
    });

    const userProjects = await Project.find({ ownerId: testUserId });
    if (userProjects.length === 1 && userProjects[0].title.includes('IPL 2026')) {
      console.log(`✅ [5/5] PASSED: Created & queried Project "${userProjects[0].title}" successfully.`);
      passed++;
    } else {
      throw new Error(`Expected 1 project for test owner, found ${userProjects.length}`);
    }

    // Clean up test data
    await Project.deleteOne({ _id: testProject._id });
    await User.deleteOne({ _id: testUserId });
    console.log('🧹 Cleaned up temporary test user and project records.');
  } catch (err: any) {
    console.error('❌ [5/5] FAILED: Project pipeline error:', err.message);
    failed++;
  }

  // Summary
  console.log('\n=============================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runAllTests();
