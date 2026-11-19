import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'cricmotion_default_dev_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation failed',
      });
      return;
    }

    const { email, password, firstName, lastName } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      passwordHash,
      profile: {
        firstName: firstName || 'Cricket',
        lastName: lastName || 'Creator',
      },
      wallet: {
        generationCredits: 50,
        subscriptionTier: 'FREE',
      },
    });

    const token = generateToken(newUser._id.toString(), newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        profile: newUser.profile,
        wallet: newUser.wallet,
        oauth: {
          instagramConnected: Boolean(newUser.oauth?.instagramAccountId),
          instagramAccountId: newUser.oauth?.instagramAccountId || null,
          instagramUsername: newUser.oauth?.instagramUsername || null,
        },
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation failed',
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        wallet: user.wallet,
        settings: user.settings,
        oauth: {
          instagramConnected: Boolean(user.oauth?.instagramAccountId),
          instagramAccountId: user.oauth?.instagramAccountId || null,
          instagramUsername: user.oauth?.instagramUsername || null,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message,
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        wallet: user.wallet,
        settings: user.settings,
        oauth: {
          instagramConnected: Boolean(user.oauth?.instagramAccountId),
          instagramAccountId: user.oauth?.instagramAccountId || null,
          instagramUsername: user.oauth?.instagramUsername || null,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

/**
 * Connect Instagram Professional / Creator account
 * POST /v1/auth/instagram/connect
 */
export const connectInstagram = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { instagramAccountId, instagramAccessToken, instagramUsername } = req.body;

    if (!instagramAccountId || typeof instagramAccountId !== 'string' || !instagramAccountId.trim()) {
      res.status(400).json({
        success: false,
        message: 'Instagram Account ID is required (e.g. Meta Graph account ID).',
      });
      return;
    }

    if (!instagramAccessToken || typeof instagramAccessToken !== 'string' || !instagramAccessToken.trim()) {
      res.status(400).json({
        success: false,
        message: 'Meta Graph API Access Token is required to link Instagram Reels publishing.',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.oauth) {
      user.oauth = {};
    }

    user.oauth.instagramAccountId = instagramAccountId.trim();
    user.oauth.instagramAccessToken = instagramAccessToken.trim();
    user.oauth.instagramUsername = (instagramUsername || '').trim();
    user.oauth.instagramConnectedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Instagram Professional account successfully connected!',
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        wallet: user.wallet,
        settings: user.settings,
        oauth: {
          instagramConnected: true,
          instagramAccountId: user.oauth.instagramAccountId,
          instagramUsername: user.oauth.instagramUsername,
        },
      },
    });
  } catch (error: any) {
    console.error('connectInstagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Instagram account',
      error: error.message,
    });
  }
};

/**
 * Disconnect Instagram account
 * POST /v1/auth/instagram/disconnect
 */
export const disconnectInstagram = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.oauth) {
      user.oauth.instagramAccountId = undefined;
      user.oauth.instagramAccessToken = undefined;
      user.oauth.instagramUsername = undefined;
      user.oauth.instagramConnectedAt = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Instagram account disconnected.',
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        wallet: user.wallet,
        settings: user.settings,
        oauth: {
          instagramConnected: false,
          instagramAccountId: null,
          instagramUsername: null,
        },
      },
    });
  } catch (error: any) {
    console.error('disconnectInstagram error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Instagram account',
      error: error.message,
    });
  }
};
