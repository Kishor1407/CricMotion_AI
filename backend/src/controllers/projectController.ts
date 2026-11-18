import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';

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
          targetDurationSeconds: reel.stats.durationSeconds,
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

    const project = await Project.create({
      ownerId,
      title: title || sourcePrompt.slice(0, 36) + '...',
      sourcePrompt,
      status: 'PLANNING_SCRIPT',
      config: {
        targetDurationSeconds: config?.targetDurationSeconds || 60,
        vibe: config?.vibe || 'News',
        avatarModelId: config?.avatarModelId || 'old_british_reporter_01',
        voiceModelId: config?.voiceModelId || 'eleven_multilingual_v2_british',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project initialized and queued for planning',
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
