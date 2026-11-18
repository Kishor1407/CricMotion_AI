import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { generateStoryboard, reviseStoryboard } from '../services/geminiService';
import {
  synthesizeProjectAudio,
  synthesizeVoice,
  generateCadenceAlignment,
} from '../services/audioService';

// Seed demo projects for new accounts so the dashboard looks vibrant
const DEMO_REELS = [
  {
    title: 'Kohli 82* vs PAK (MCG Classic)',
    sourcePrompt: 'Virat Kohli historic 82 not out against Pakistan at the MCG in T20 World Cup 2022.',
    category: 'match-action',
    status: 'READY',
    stats: { views: 1420000, durationSeconds: 42, tag: '🔥 1.4M VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'The Unthinkable Equation',
        narration: '28 needed off 8 balls at the MCG. 90,000 screaming fans, Pakistan on the verge of victory.',
        startSeconds: 0,
        endSeconds: 10,
        contextCategory: 'match-action',
        visualPrompt: 'Haris Rauf charging in at 149 kph under MCG floodlights.',
        tickerHeadline: '⚡ 28 NEEDED OFF 8 BALLS // T20 WORLD CUP CLIMAX',
      },
      {
        sceneNumber: 2,
        title: 'Shot of an Emperor',
        narration: 'Back-foot punch straight back over the bowler’s head. A physics-defying six into the Melbourne night sky!',
        startSeconds: 10,
        endSeconds: 22,
        contextCategory: 'match-action',
        visualPrompt: 'Slow motion straight six over long-on, ball sailing into crowd.',
        tickerHeadline: '★ SHOT OF THE CENTURY // 105M MAXIMUM DETECTED',
      },
      {
        sceneNumber: 3,
        title: 'Flick Over Fine Leg',
        narration: 'Next ball: angled on the pads, flicked effortlessly over fine leg into the seats! 16 off two deliveries!',
        startSeconds: 22,
        endSeconds: 32,
        contextCategory: 'stats-comparison',
        visualPrompt: 'Wrist flick tracer path graphic with bat speed meter peaking at 138 kph.',
        tickerHeadline: '⚡ BAT SPEED: 138 KPH // WIN PROBABILITY SWINGS TO 88%',
      },
      {
        sceneNumber: 4,
        title: 'The King Reclaims Melbourne',
        narration: 'Ashwin lifts it over mid-off, Kohli drops to his knees. The greatest T20 innings ever played.',
        startSeconds: 32,
        endSeconds: 42,
        contextCategory: 'news-headline',
        visualPrompt: 'Virat Kohli emotional celebration, fireworks and roaring stadium.',
        tickerHeadline: '👑 KOHLI 82* (53) // INDIA WINS BY 4 WICKETS',
      },
    ],
    chatHistory: [
      {
        role: 'user',
        content: 'Create an intense 45-second reel capturing Kohli’s iconic MCG finish with high-speed physics telemetry.',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        role: 'assistant',
        content: '⚡ Analyzed 2022 MCG climax. Generated 4 dynamic scenes: Hook, Straight Six, Fine-Leg Maximum, and the Roar. Telemetry layers configured.',
        timestamp: new Date(Date.now() - 3500000),
      },
    ],
  },
  {
    title: 'Pant 27 CR Mega Auction War',
    sourcePrompt: 'Rishabh Pant sold to LSG for record-breaking 27 Crores in IPL 2025 mega auction.',
    category: 'auction-financial',
    status: 'READY',
    stats: { views: 850000, durationSeconds: 58, tag: '⚡ 850K VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'The Paddle War Begins',
        narration: 'Base price 2 Crores. Within thirty seconds, paddles are flying as Delhi and Punjab go toe-to-toe.',
        startSeconds: 0,
        endSeconds: 15,
        contextCategory: 'auction-financial',
        visualPrompt: 'Auction hammer banging, paddle numbers flashing with rapid bid counter.',
        tickerHeadline: '⚡ BIDDING WAR ERUPTS // PANT BASE: ₹2 CR',
      },
      {
        sceneNumber: 2,
        title: 'Crossing the 20 Crore Ceiling',
        narration: 'Punjab Capitals push past 20 Crores. The entire ballroom gasps as Lucknow Super Giants enter the fray!',
        startSeconds: 15,
        endSeconds: 30,
        contextCategory: 'auction-financial',
        visualPrompt: 'Falling dollar/rupee physics simulation with intense amber glow.',
        tickerHeadline: '★ 20 CRORE MILESTONE SHATTERED // LSG ENTERS WITH RTM THREAT',
      },
      {
        sceneNumber: 3,
        title: 'The Final Slam of the Gavel',
        narration: '27 CRORES! The gavel crashes down. Rishabh Pant becomes the most expensive player in IPL history!',
        startSeconds: 30,
        endSeconds: 58,
        contextCategory: 'news-headline',
        visualPrompt: 'Gavel impact VFX, bold golden typography: ₹27,00,00,000.',
        tickerHeadline: '👑 HISTORIC RECORD // SOLD TO LSG FOR ₹27 CRORE',
      },
    ],
    chatHistory: [
      {
        role: 'user',
        content: 'Break down Rishabh Pant’s auction bidding war with falling cash graphics and gavel sounds.',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        role: 'assistant',
        content: '💰 Storyboard generated with 3 escalating financial scenes: Rapid Bidding, Ceiling Break, and the 27 Crore Record Hammer.',
        timestamp: new Date(Date.now() - 7100000),
      },
    ],
  },
  {
    title: 'Dhoni Helicopter Six Clutch',
    sourcePrompt: 'MS Dhoni finishes in style with his legendary helicopter shot under pressure.',
    category: 'match-action',
    status: 'READY',
    stats: { views: 920000, durationSeconds: 35, tag: '⚡ 920K VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'Final Over Tension',
        narration: 'Twelve needed off four balls. Wankhede holds its collective breath as the bowler runs in.',
        startSeconds: 0,
        endSeconds: 12,
        contextCategory: 'match-action',
        visualPrompt: 'Stadium floodlights, high tension crowd with heartbeat monitor pulsing.',
        tickerHeadline: '⚡ 12 NEEDED OFF 4 BALLS // DHONI ON STRIKE',
      },
      {
        sceneNumber: 2,
        title: 'The Iconic Helicopter',
        narration: 'Full yorker dug out with sheer wrist power! The bat whips around in the legendary helicopter arc over wide long-on!',
        startSeconds: 12,
        endSeconds: 24,
        contextCategory: 'match-action',
        visualPrompt: 'Slow motion 360 rotation bat tracker with bat speed peaking at 144 kph.',
        tickerHeadline: '★ LEGENDARY HELICOPTER SHOT // 98M MAXIMUM LAUNCHED',
      },
      {
        sceneNumber: 3,
        title: 'Wankhede Erupts',
        narration: 'Into the roaring Mumbai night crowd! Dhoni twirls his bat and walks off like an absolute king.',
        startSeconds: 24,
        endSeconds: 35,
        contextCategory: 'news-headline',
        visualPrompt: 'Fireworks exploding over Wankhede Stadium, golden ticker flashes victory.',
        tickerHeadline: '👑 FINISHES OFF IN STYLE // MUMBAI ERUPTS IN CELEBRATION',
      },
    ],
  },
  {
    title: 'Bumrah 148 KPH Toe-Crusher',
    sourcePrompt: 'Jasprit Bumrah delivers an unplayable yorker shattering the stumps at 148 kph.',
    category: 'match-action',
    status: 'READY',
    stats: { views: 1950000, durationSeconds: 30, tag: '🔥 1.9M VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'The Stuttering Approach',
        narration: 'Third over of the spell. Bumrah begins his trademark unorthodox stuttering run-up.',
        startSeconds: 0,
        endSeconds: 10,
        contextCategory: 'match-action',
        visualPrompt: 'Speed radar UI ticking up as Bumrah accelerates toward the crease.',
        tickerHeadline: '⚡ BUMRAH SPELL: 2-0-8-1 // SPEED TRACKER ENGAGED',
      },
      {
        sceneNumber: 2,
        title: '148 KPH Toe-Crusher',
        narration: 'A blistering 148.4 kph inswinging yorker dipping right at the base of off stump!',
        startSeconds: 10,
        endSeconds: 20,
        contextCategory: 'match-action',
        visualPrompt: 'Ball trajectory arc with flame particle effect and 148.4 kph telemetry.',
        tickerHeadline: '🔥 148.4 KPH CLOCKED // PERFECT ZERO-DEVIATION YORKER',
      },
      {
        sceneNumber: 3,
        title: 'Timber Everywhere',
        narration: 'The off-stump cartwheels backward through the air. Pure, unadulterated bowling genius!',
        startSeconds: 20,
        endSeconds: 30,
        contextCategory: 'news-headline',
        visualPrompt: 'Shattered stumps flying in ultra-slow motion with shockwave ring.',
        tickerHeadline: '🎯 STUMP CARTWHEELS 15 METERS // BATTER UTTERLY HELPLESS',
      },
    ],
  },
  {
    title: 'Starc 24.75 CR Drama',
    sourcePrompt: 'Mitchell Starc bidding war reaches unprecedented heights in IPL history.',
    category: 'auction-financial',
    status: 'READY',
    stats: { views: 610000, durationSeconds: 45, tag: '⚡ 610K VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'The Opening Paddle',
        narration: 'Mitchell Starc enters the auction ring. Bids erupt immediately past ten crores!',
        startSeconds: 0,
        endSeconds: 15,
        contextCategory: 'auction-financial',
        visualPrompt: 'Paddle numbers rising with currency counter surging past 10 Cr.',
        tickerHeadline: '⚡ RECORD SURGE // STARC BID PASSES ₹10 CRORE IN 40 SECONDS',
      },
      {
        sceneNumber: 2,
        title: 'The 20 Crore Milestone',
        narration: 'Kolkata and Gujarat go hammer and tongs, pushing past the mythical 24 Crore barrier!',
        startSeconds: 15,
        endSeconds: 30,
        contextCategory: 'auction-financial',
        visualPrompt: 'Golden gavel slamming down with falling currency graphics.',
        tickerHeadline: '★ CEILING SHATTERED // BID HITS ₹24.75 CRORE',
      },
      {
        sceneNumber: 3,
        title: 'History Rewritten',
        narration: 'Going once, going twice, SOLD to KKR for 24.75 Crores! The most expensive player in cricket history.',
        startSeconds: 30,
        endSeconds: 45,
        contextCategory: 'news-headline',
        visualPrompt: 'KKR purple fireworks and gold confetti falling over auction ballroom.',
        tickerHeadline: '👑 HISTORIC DEAL // ₹24.75 CR RECORD SHATTERED BY KKR',
      },
    ],
  },
  {
    title: 'Rohit Sharma Century Storm',
    sourcePrompt: 'Rohit Sharma explosive World Cup hundred demolishing bowling attacks.',
    category: 'stats-comparison',
    status: 'READY',
    stats: { views: 2100000, durationSeconds: 45, tag: '🔥 2.1M VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1080&auto=format&fit=crop',
    },
    storyboard: [
      {
        sceneNumber: 1,
        title: 'Opening Carnage',
        narration: 'Rohit steps out in the first over and lofts the ball straight into the second tier!',
        startSeconds: 0,
        endSeconds: 15,
        contextCategory: 'stats-comparison',
        visualPrompt: 'Shot tracer showing ball trajectory over long-on with 102M graphic.',
        tickerHeadline: '⚡ POWERPLAY EXPLOSION // 6 OFF FIRST BALL FACED',
      },
      {
        sceneNumber: 2,
        title: 'The Trademark Pull',
        narration: 'Short ball bowled, and Rohit executes that effortless, lazy-elegance pull shot for six more!',
        startSeconds: 15,
        endSeconds: 30,
        contextCategory: 'match-action',
        visualPrompt: 'Wrist angle analysis graphic with bat contact speed at 142 kph.',
        tickerHeadline: '★ MASTERCLASS PULL SHOT // 600TH INTERNATIONAL SIX',
      },
      {
        sceneNumber: 3,
        title: 'Century Standing Ovation',
        narration: 'A breathtaking hundred off just sixty balls. The Hitman raises his bat to a roaring crowd!',
        startSeconds: 30,
        endSeconds: 45,
        contextCategory: 'news-headline',
        visualPrompt: 'Rohit Sharma celebrating with helmet raised and standing ovation.',
        tickerHeadline: '👑 ROHIT 100* (60) // 7TH WORLD CUP CENTURY CONFIRMED',
      },
    ],
  },
];

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let projects = await Project.find({ ownerId }).sort({ createdAt: -1 });

    // Seed demo reels for new accounts so dashboard is vibrant
    if (projects.length === 0) {
      const seeded = DEMO_REELS.map((reel) => ({
        ...reel,
        ownerId,
        config: {
          targetDurationSeconds: reel.stats?.durationSeconds || 45,
          vibe: 'News',
          avatarModelId: 'old_british_reporter_01',
          voiceModelId: 'eleven_multilingual_v2_british',
        },
        storyboard: (reel.storyboard || []).map((sc) => {
          const duration = sc.endSeconds - sc.startSeconds;
          const { timestamps } = generateCadenceAlignment(sc.narration, duration);
          return {
            ...sc,
            wordTimestamps: timestamps,
          };
        }),
      }));
      await Project.insertMany(seeded);
      projects = await Project.find({ ownerId }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    console.error('getProjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, ownerId });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error('getProjectById error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message,
    });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { sourcePrompt, config, title } = req.body;

    if (!sourcePrompt || typeof sourcePrompt !== 'string') {
      res.status(400).json({ success: false, message: 'sourcePrompt is required' });
      return;
    }

    // Call Gemini AI Storyboard Planner with Zod validation
    const plan = await generateStoryboard(sourcePrompt, config);

    const project = await Project.create({
      ownerId,
      title: title || plan.title,
      sourcePrompt,
      category: plan.category,
      status: 'READY',
      config: {
        targetDurationSeconds: config?.targetDurationSeconds || 45,
        vibe: config?.vibe || plan.vibe || 'High Energy Hype',
        avatarModelId: config?.avatarModelId || 'old_british_reporter_01',
        voiceModelId: config?.voiceModelId || 'eleven_multilingual_v2_british',
      },
      storyboard: plan.scenes,
      chatHistory: [
        {
          role: 'user',
          content: sourcePrompt,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: `⚡ CricMotion AI analyzed "${plan.title}". Generated ${plan.scenes.length} viral 9:16 vertical scenes with broadcast telemetry & synchronized captions. Ready for review!`,
          timestamp: new Date(),
        },
      ],
      stats: {
        views: 0,
        durationSeconds: config?.targetDurationSeconds || 45,
        tag: 'DRAFT',
      },
    });

    // Auto-synthesize voiceover and word alignment for all scenes
    try {
      await synthesizeProjectAudio(project._id.toString(), ownerId);
      const enrichedProject = await Project.findById(project._id);
      if (enrichedProject) {
        res.status(201).json({
          success: true,
          message: 'Project created, storyboard planned & voiceover synthesized',
          projectId: enrichedProject._id.toString(),
          data: enrichedProject,
        });
        return;
      }
    } catch (audioErr: any) {
      console.warn('Initial audio synthesis note:', audioErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Project created and storyboard generated via Gemini AI',
      projectId: project._id.toString(),
      data: project,
    });
  } catch (error: any) {
    console.error('createProject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
};

export const synthesizeAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ success: false, message: 'projectId is required' });
      return;
    }

    const id = Array.isArray(projectId) ? projectId[0] : projectId;
    console.log(`🎙️ Triggering audio synthesis for project ${id}...`);
    const result = await synthesizeProjectAudio(id, ownerId);

    res.status(200).json({
      success: true,
      message: 'Voice synthesis & word-level millisecond alignment completed successfully',
      data: result.project,
      metrics: result.metrics,
    });
  } catch (error: any) {
    console.error('synthesizeAudio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synthesize project audio',
      error: error.message,
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, ownerId },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error: any) {
    console.error('updateProject error:', error);
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
};

export const addProjectChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { projectId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'message is required' });
      return;
    }

    const project = await Project.findOne({ _id: projectId, ownerId });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Append user message
    project.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Call Gemini to intelligently revise storyboard scenes based on user comment
    const revision = await reviseStoryboard(project.storyboard as any, message, project.config);
    project.storyboard = revision.scenes as any;

    project.chatHistory.push({
      role: 'assistant',
      content: revision.replyMessage,
      timestamp: new Date(),
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Storyboard revised and chat updated via Gemini AI',
      data: {
        chatHistory: project.chatHistory,
        storyboard: project.storyboard,
      },
    });
  } catch (error: any) {
    console.error('addProjectChat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat', error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { projectId } = req.params;

    const project = await Project.findOneAndDelete({ _id: projectId, ownerId });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
};
