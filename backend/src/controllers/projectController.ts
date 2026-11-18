import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { generateStoryboard, reviseStoryboard } from '../services/geminiService';

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
    status: 'RENDERING_VIDEO',
    stats: { views: 920000, durationSeconds: 35, tag: 'RENDERING 74%' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1080&auto=format&fit=crop',
    },
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
  },
  {
    title: 'Starc 24.75 CR Drama',
    sourcePrompt: 'Mitchell Starc bidding war reaches unprecedented heights in IPL history.',
    category: 'auction-financial',
    status: 'READY',
    stats: { views: 610000, durationSeconds: 49, tag: '⚡ 610K VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1080&auto=format&fit=crop',
    },
  },
  {
    title: 'Rohit Sharma Century Storm',
    sourcePrompt: 'Rohit Sharma explosive World Cup hundred demolishing bowling attacks.',
    category: 'stats-comparison',
    status: 'READY',
    stats: { views: 2100000, durationSeconds: 60, tag: '🔥 2.1M VIEWS' },
    artifacts: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1080&auto=format&fit=crop',
    },
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
