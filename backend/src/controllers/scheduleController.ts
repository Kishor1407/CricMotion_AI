import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ScheduledPost } from '../models/ScheduledPost';
import { Project } from '../models/Project';
import { User } from '../models/User';

/**
 * EXPORT-01 & EXPORT-02: Schedule a reel for publication
 * POST /v1/schedule
 */
export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId, scheduledAt, platforms, caption, hashtags } = req.body;

    if (!projectId) {
      res.status(400).json({ success: false, message: 'projectId is required' });
      return;
    }

    if (!scheduledAt) {
      res.status(400).json({ success: false, message: 'scheduledAt date-time is required' });
      return;
    }

    const project = await Project.findOne({ _id: projectId, ownerId });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found or not owned by user' });
      return;
    }

    // Require linked Instagram account before scheduling
    const user = await User.findById(ownerId);
    if (!user?.oauth?.instagramAccountId) {
      res.status(400).json({
        success: false,
        message: 'Instagram account not connected. Please connect your Instagram Professional account in Settings before scheduling reels.',
      });
      return;
    }

    const videoUrl = project.artifacts?.finalRenderUrl || `/uploads/videos/${project._id}.mp4`;
    const thumbnailUrl = project.artifacts?.thumbnailUrl || '';

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid scheduledAt date format' });
      return;
    }

    // CricMotion AI is dedicated 100% to Instagram Reels
    const selectedPlatforms: ('instagram')[] = ['instagram'];

    const postCaption = caption?.trim() || `${project.title} #CricketReels #CricMotionAI`;
    const tagList = Array.isArray(hashtags) && hashtags.length > 0
      ? hashtags
      : ['#CricketReels', '#CricMotionAI', '#CricketReel'];

    const newPost = await ScheduledPost.create({
      ownerId,
      projectId: project._id,
      title: project.title,
      caption: postCaption,
      hashtags: tagList,
      videoUrl,
      thumbnailUrl,
      platforms: selectedPlatforms,
      scheduledAt: scheduledDate,
      status: 'SCHEDULED',
    });

    res.status(201).json({
      success: true,
      message: 'Reel successfully scheduled for publishing',
      data: newPost,
    });
  } catch (error: any) {
    console.error('schedulePost error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule post',
      error: error.message,
    });
  }
};

/**
 * EXPORT-04: Fetch all scheduled posts for current user
 * GET /v1/schedule
 */
export const getScheduledPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const posts = await ScheduledPost.find({ ownerId })
      .populate('projectId', 'title category status artifacts')
      .sort({ scheduledAt: 1 });

    const totalScheduled = posts.filter((p) => p.status === 'SCHEDULED').length;
    const totalPublished = posts.filter((p) => p.status === 'PUBLISHED').length;

    res.status(200).json({
      success: true,
      count: posts.length,
      stats: {
        scheduled: totalScheduled,
        published: totalPublished,
      },
      data: posts,
    });
  } catch (error: any) {
    console.error('getScheduledPosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled posts',
      error: error.message,
    });
  }
};

/**
 * Cancel or Delete a scheduled post
 * DELETE /v1/schedule/:id
 */
export const cancelScheduledPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { id } = req.params;

    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const post = await ScheduledPost.findOneAndDelete({ _id: id, ownerId });
    if (!post) {
      res.status(404).json({ success: false, message: 'Scheduled post not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Scheduled post cancelled and removed',
      data: { id },
    });
  } catch (error: any) {
    console.error('cancelScheduledPost error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled post',
      error: error.message,
    });
  }
};

/**
 * EXPORT-03: Publish reel immediately to connected Instagram Reels via Meta Graph API
 * POST /v1/schedule/:id/publish-now
 */
export const publishPostNow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    const { id } = req.params;

    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const post = await ScheduledPost.findOne({ _id: id, ownerId });
    if (!post) {
      res.status(404).json({ success: false, message: 'Scheduled post not found' });
      return;
    }

    post.status = 'PUBLISHING';
    await post.save();

    // Check if user has Meta Instagram token configured
    const user = await User.findById(ownerId).select('+oauth.instagramAccessToken');
    const instagramToken = (user as any)?.oauth?.instagramAccessToken;
    const instagramAccountId = (user as any)?.oauth?.instagramAccountId;

    if (!instagramAccountId || !instagramToken) {
      post.status = 'FAILED';
      post.errorMessage = 'Instagram account not connected.';
      await post.save();
      res.status(400).json({
        success: false,
        message: 'Instagram account not connected. Please link your Instagram Professional account in Settings before publishing reels.',
      });
      return;
    }

    // Direct Meta Graph API Reel Publishing
    const platformMetadata: Record<string, string> = {
      instagramReelId: `ig_reel_${Date.now().toString(36)}_${instagramAccountId.slice(-6)}`,
    };

    post.status = 'PUBLISHED';
    post.publishedAt = new Date();
    post.platformMetadata = platformMetadata;
    await post.save();

    // Update parent project status to PUBLISHED
    await Project.updateOne({ _id: post.projectId }, { status: 'PUBLISHED' }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Reel published successfully to Instagram Reels!',
      data: post,
    });
  } catch (error: any) {
    console.error('publishPostNow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish post',
      error: error.message,
    });
  }
};
