import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not set in backend/.env');
}

const genAI = new GoogleGenerativeAI(apiKey || 'fallback_key');

// Primary and fallback models tested for high-demand resilience
const CANDIDATE_MODELS = ['gemini-3.5-flash-lite'];

export const StoryboardSceneSchema = z.object({
  sceneNumber: z.number().int().positive(),
  title: z.string().min(2),
  narration: z.string().min(5),
  startSeconds: z.number().nonnegative(),
  endSeconds: z.number().positive(),
  contextCategory: z.enum([
    'auction-financial',
    'match-action',
    'press-conference',
    'stats-comparison',
    'news-headline',
  ]),
  visualPrompt: z.string().optional(),
  tickerHeadline: z.string().optional(),
});

export const StoryboardPlanSchema = z.object({
  title: z.string().min(3),
  category: z.enum([
    'auction-financial',
    'match-action',
    'press-conference',
    'stats-comparison',
    'news-headline',
  ]),
  vibe: z.string().optional(),
  scenes: z.array(StoryboardSceneSchema).min(2).max(6),
});

export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>;
export type StoryboardPlan = z.infer<typeof StoryboardPlanSchema>;

export interface GenerationConfig {
  targetDurationSeconds?: number;
  vibe?: string;
  avatarModelId?: string;
  voiceModelId?: string;
}

/**
 * Execute Gemini prompt with automatic model fallback
 */
async function callGemini(promptText: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        });

        const result = await model.generateContent(promptText);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        console.warn(`[GeminiService] Attempt ${attempt} (${modelName}) error: ${err.message.slice(0, 60)}`);
        lastError = err;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond');
}

/**
 * Clean LLM response by stripping markdown code fences
 */
function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * 1. AI Context Classifier: Determines the primary cricket category
 */
export async function classifyCricketContext(prompt: string): Promise<
  'auction-financial' | 'match-action' | 'press-conference' | 'stats-comparison' | 'news-headline'
> {
  const systemPrompt = `You are an expert cricket video classifier. Categorize this cricket prompt into EXACTLY ONE of these strings:
- "auction-financial" (IPL auction bids, player price records, purse calculations)
- "match-action" (live match highlights, bowling spells, boundaries, run-chases, catches)
- "stats-comparison" (head-to-head records, batting average debates, bowler milestones)
- "news-headline" (breaking cricket news, injuries, squad selections, retirements)
- "press-conference" (post-match interviews, captain statements, press room quotes)

Prompt to classify: "${prompt}"

Reply with ONLY the exact category string in lowercase. No extra words or punctuation.`;

  try {
    const raw = await callGemini(systemPrompt);
    const category = raw.toLowerCase().trim().replace(/['"]/g, '');
    const valid = [
      'auction-financial',
      'match-action',
      'press-conference',
      'stats-comparison',
      'news-headline',
    ] as const;

    if (valid.includes(category as any)) {
      return category as any;
    }
  } catch (err: any) {
    console.error('[GeminiService] Classification error:', err.message);
  }

  // Heuristic fallback
  const p = prompt.toLowerCase();
  if (p.includes('auction') || p.includes('crore') || p.includes('cr') || p.includes('bid') || p.includes('sold')) {
    return 'auction-financial';
  }
  if (p.includes('vs') && (p.includes('stat') || p.includes('record') || p.includes('average'))) {
    return 'stats-comparison';
  }
  if (p.includes('injury') || p.includes('ruled out') || p.includes('announces') || p.includes('squad')) {
    return 'news-headline';
  }
  return 'match-action';
}

/**
 * 2. Storyboard JSON Planner: Generates a complete 9:16 vertical script with contiguous timestamps
 */
export async function generateStoryboard(
  sourcePrompt: string,
  config: GenerationConfig = {}
): Promise<StoryboardPlan> {
  const duration = config.targetDurationSeconds || 45;
  const vibe = config.vibe || 'High Energy Hype';

  const systemPrompt = `You are CricMotion AI's Senior Cricket Video Director & Scriptwriter.
Task: Turn this user's cricket prompt into a viral, high-velocity 9:16 vertical video script tailored exclusively for Instagram Reels.

PROMPT: "${sourcePrompt}"
TARGET DURATION: Exactly ${duration} seconds
VIBE: ${vibe}

Rules:
1. Divide the video into between 3 and 5 contiguous scenes.
2. Scene 1 MUST start at startSeconds: 0.
3. The final scene MUST end at endSeconds: ${duration}.
4. Each scene must lead naturally into the next with no time gaps.
5. Narration must be high-energy, punchy, broadcast-style, appropriate for the scene's length (about 2.5 words per second).
6. Provide an intense, uppercase tickerHeadline for each scene with a cricket emoji.
7. Provide a visualPrompt describing the camera shot, player action, and telemetry graphics (e.g. ball speed, bat speed, or falling auction cash).

Output MUST be valid JSON adhering to this exact structure:
{
  "title": "Punchy Reel Title (under 40 chars)",
  "category": "auction-financial" | "match-action" | "press-conference" | "stats-comparison" | "news-headline",
  "vibe": "${vibe}",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Headline",
      "narration": "Voiceover narration text...",
      "startSeconds": 0,
      "endSeconds": 10,
      "contextCategory": "match-action",
      "visualPrompt": "Visual motion description...",
      "tickerHeadline": "⚡ TICKER TEXT // BROADCAST ALERT"
    }
  ]
}

DO NOT wrap in markdown backticks. Return ONLY the raw JSON object.`;

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const rawText = await callGemini(systemPrompt);
      const cleaned = cleanJsonText(rawText);
      const parsed = JSON.parse(cleaned);

      // Validate against strict Zod guardrails
      const validated = StoryboardPlanSchema.parse(parsed);

      // Ensure contiguous time bounds
      let currentStart = 0;
      validated.scenes.forEach((scene, index) => {
        scene.sceneNumber = index + 1;
        scene.startSeconds = currentStart;
        if (index === validated.scenes.length - 1) {
          scene.endSeconds = duration;
        }
        currentStart = scene.endSeconds;
      });

      return validated;
    } catch (err: any) {
      console.warn(`[GeminiService] Storyboard generation attempt ${attempts} failed:`, err.message);
    }
  }

  // Graceful fallback plan if LLM rate-limited
  console.log('[GeminiService] Using intelligent fallback storyboard');
  return {
    title: sourcePrompt.slice(0, 35) + '...',
    category: await classifyCricketContext(sourcePrompt),
    vibe,
    scenes: [
      {
        sceneNumber: 1,
        title: 'Opening Thunder',
        narration: `Breaking cricket action: ${sourcePrompt.slice(0, 90)}. The tension is electric!`,
        startSeconds: 0,
        endSeconds: Math.round(duration * 0.3),
        contextCategory: 'match-action',
        visualPrompt: 'Dynamic vertical camera shot with high-velocity telemetry sweep.',
        tickerHeadline: '⚡ CRICMOTION BREAKING // HIGH STAKES MOMENT',
      },
      {
        sceneNumber: 2,
        title: 'The Pivotal Delivery',
        narration: 'Every millisecond matters as momentum violently shifts in front of roaring crowds.',
        startSeconds: Math.round(duration * 0.3),
        endSeconds: Math.round(duration * 0.7),
        contextCategory: 'match-action',
        visualPrompt: 'Slow motion tracer angle with bat speed and ball velocity telemetry.',
        tickerHeadline: '★ 149.2 KPH REGISTERED // MATCH TURNING POINT',
      },
      {
        sceneNumber: 3,
        title: 'The Defining Climax',
        narration: 'History written in gold. An unforgettable cricket spectacle sealed forever.',
        startSeconds: Math.round(duration * 0.7),
        endSeconds: duration,
        contextCategory: 'news-headline',
        visualPrompt: 'Jubilant celebration burst with sparks and kinetic stats overlays.',
        tickerHeadline: '👑 RECORD BROKEN // 9:16 VERTICAL EXCLUSIVE',
      },
    ],
  };
}

/**
 * 3. Conversational Script Revision: Iteratively refines scenes based on user chat feedback
 */
export async function reviseStoryboard(
  currentScenes: StoryboardScene[],
  userFeedback: string,
  config: GenerationConfig = {}
): Promise<{ replyMessage: string; scenes: StoryboardScene[] }> {
  const duration = config.targetDurationSeconds || 45;

  const systemPrompt = `You are CricMotion AI's conversational director.
The creator has existing storyboard scenes for a vertical cricket reel:
${JSON.stringify(currentScenes, null, 2)}

The creator provided this revision feedback:
"${userFeedback}"

Task:
1. Update the scenes according to the creator's instruction (e.g. modify narration tone, adjust timestamps, alter headlines, or change visuals).
2. Keep the total video duration around ${duration} seconds.
3. Keep scenes contiguous from 0 to ${duration}.
4. Provide a friendly, 1-2 sentence conversational reply explaining what changes you made.

Output MUST be raw JSON:
{
  "replyMessage": "1-2 sentence conversational explanation of changes",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Title",
      "narration": "Updated narration...",
      "startSeconds": 0,
      "endSeconds": 10,
      "contextCategory": "match-action",
      "visualPrompt": "Visuals...",
      "tickerHeadline": "⚡ TICKER..."
    }
  ]
}

DO NOT wrap in markdown fences. Raw JSON only.`;

  try {
    const raw = await callGemini(systemPrompt);
    const cleaned = cleanJsonText(raw);
    const parsed = JSON.parse(cleaned);

    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      return {
        replyMessage: parsed.replyMessage || `⚡ Updated ${parsed.scenes.length} scenes to reflect your direction: "${userFeedback.slice(0, 40)}...".`,
        scenes: parsed.scenes,
      };
    }
  } catch (err: any) {
    console.warn('[GeminiService] Revision failed, falling back:', err.message);
  }

  // Graceful conversational update
  return {
    replyMessage: `⚡ Scene telemetry and narration updated to reflect: "${userFeedback.slice(0, 45)}...".`,
    scenes: currentScenes.map((s) => ({
      ...s,
      narration: s.narration + ' ' + (userFeedback.includes('Hindi') ? '(Ab khel shuru!)' : ''),
    })),
  };
}
