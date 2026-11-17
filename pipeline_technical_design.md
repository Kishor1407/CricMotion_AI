# CRICMOTION AI - Pipeline Technical Design 
**Version:** 1.0 (Final Foundation)

## 1. Executive Summary & Tech Stack

This document defines the headless Node.js/TypeScript pipeline responsible for orchestrating the automated video generation process. 

**V1 Core Architecture:** The pipeline utilizes a **Hybrid Avatar Compositing** model. It explicitly forbids monolithic template rendering. Instead, it features a **Dynamic Visual Routing Engine** that understands the semantic context of the prompt (e.g., an auction vs. a live match) and layers dynamic overhead React motion graphics around an AI-generated presenter.

*   **Language & Runtime:** TypeScript on Node.js (v20+).
*   **Job Queueing:** BullMQ (Redis-backed) for asynchronous, non-blocking heavy processing.
*   **Planner & Context Router:** Google Gemini 1.5 Pro.
*   **Narrator Voice & Timing:** ElevenLabs API (`eleven_multilingual_v2`).
*   **Avatar Lip-Sync Engine:** D-ID API or HeyGen API.
*   **Compositing & Rendering Engine:** Remotion.dev (React-based headless FFmpeg compilation).
*   **Artifact Persistence:** Cloudflare R2 (S3-compatible).

## 2. The Video Generation Pipeline (State Machine)

The backend worker executes the following directed acyclic graph (DAG) for every video request triggered from the frontend Omnibar:

1.  **Ingestion & Classification:** Receive the raw prompt, vibe parameters, and preferred Avatar ID.
2.  **Contextual Planning (Gemini):** The LLM writes the script, categorizes the event theme (e.g., `auction-financial`), and assigns specific 2D assets (e.g., `jersey`, `hammer`) for overhead physics.
3.  **Strict Schema Validation:** Pass the LLM's JSON output through Zod schemas. If it hallucinates, the pipeline auto-retries up to 3 times.
4.  **Audio & Alignment (ElevenLabs):** Generate the MP3 and extract word-level timestamp metadata in milliseconds.
5.  **Avatar Synthesis (Async Polling):** Send the MP3 and Avatar ID to the D-ID/HeyGen API. The pipeline polls via webhook/interval until the lip-synced `.mp4` is returned.
6.  **Timeline Compilation:** Map milliseconds to strict frame bounds based on the target FPS (30fps).
7.  **Dynamic Scene Routing & Compositing (Remotion):** The Remotion `<Composition>` reads the JSON contract, mounts the correct contextual UI components, and executes a headless browser render to compile the final `.mp4`.
8.  **Artifact Upload:** Push the MP4 to Cloudflare R2 and notify the client via WebSocket/Polling.

## 3. Core Contracts & Schemas

To prevent visual mismatches, the LLM must output a strictly typed visual intent for the new Avatar layout.

### 3.1 Scene Contract (The LLM Output / Database Revisions)
```typescript
interface SceneContract {
  sceneId: string;
  narrationText: string; 
  contextCategory: 'auction-financial' | 'match-action' | 'press-conference' | 'stats-comparison' | 'news-headline';
  headlineTickerText: string; // e.g., "RECORD SHATTERED: PANT TO LSG"
  
  // Instructions for the Remotion Physics Engine
  overheadAnimations: {
    primaryAsset: 'jersey' | 'player-cutout' | 'trophy' | 'team-logo';
    primaryAssetData: string; // e.g., "17" or "LSG"
    actionAsset: 'gavel' | 'money-rain' | 'fire' | 'graph-up' | 'none';
    punchyText: string; // e.g., "₹27 CRORE!"
  };
}
```

### 3.2 Compiled Timeline Contract (The Remotion Input)
```typescript
interface CompiledTimelineContract {
  projectId: string;
  totalFrames: number;
  fps: number;
  assets: {
    audioTrackUrl: string;
    avatarVideoUrl: string;
  };
  scenes: Array<SceneContract & {
    startFrame: number;
    endFrame: number;
    wordAlignments: Array<{ word: string; startFrame: number; endFrame: number; }>;
  }>;
}
```

## 4. The Dynamic Visual Routing Engine

The pipeline utilizes modular, context-aware React component routing to dynamically assemble the scene. 

```tsx
// Inside src/components/SceneRouter.tsx
export const SceneRouter: React.FC<{ sceneData: SceneContract }> = ({ sceneData }) => {
  switch(sceneData.contextCategory) {
    case 'auction-financial':
      return <BiddingWarLayout animations={sceneData.overheadAnimations} />;
    case 'match-action':
      return <MatchActionLayout animations={sceneData.overheadAnimations} />;
    case 'stats-comparison':
      return <StatExplosionLayout animations={sceneData.overheadAnimations} />;
    default:
      return <NewsHeadlineLayout animations={sceneData.overheadAnimations} />;
  }
}
```

## 5. The "Newsroom" Compositing Architecture (Remotion Z-Index)

Remotion acts as a programmatic video compositor. The layering is strictly enforced:

*   **Z-Index 0 (Background):** `AbsoluteFill` containing a static or slowly panning blurred 3D studio background.
*   **Z-Index 10 (The Presenter):** The generated Avatar `<Video>` component, pinned bottom-center. Applies `ChromaKey` filters if the Avatar provider outputs a green screen.
*   **Z-Index 20 (Overhead Physics):** The output of the `SceneRouter`. SVGs (Gavels, Jerseys) that use Remotion's `spring()` and `interpolate()` functions to enter, react to the audio impact, and exit.
*   **Z-Index 30 (Ticker UI):** A lower-third scrolling marquee component.
*   **Z-Index 40 (Kinetic Text):** Rendered above the ticker. Maps the `wordAlignments` to frame numbers to scale and highlight words exactly as the Avatar speaks them.

## 6. Conversational Revision Pipeline

When a user chats with the Omnibar (e.g., "Make scene 2 more aggressive"), the pipeline executes a revision branch:

1.  **State Lookup:** Fetch the current JSON `ScriptRevision` from the database.
2.  **LLM Delta Prompt:** Send the current JSON and the user's natural language command to Gemini.
3.  **New Version Creation:** Save the updated output as `versionNumber + 1`. This guarantees non-destructive edits (immutability).
4.  **Partial Re-Render Trigger:** If the revision only changes text/layout (and not narration), the pipeline skips ElevenLabs and Avatar generation, directly sending the cached audio/video and the *new* JSON to Remotion, cutting rendering time from minutes to seconds.

## 7. Run State & Artifact Storage Topology

During active rendering, temporary assets are held locally on the worker node or in an ephemeral R2 bucket.

```text
/temp_workspace/{projectId}/
 ├── 01_raw_prompt.txt
 ├── 02_gemini_plan_v1.json      (Strictly typed routing data)
 ├── 03_audio_track.mp3          (From ElevenLabs)
 ├── 04_avatar_raw.mp4           (From D-ID/HeyGen)
 ├── 05_timeline_contract.json   (The compiled Remotion props)
 └── final_render.mp4            (Uploaded to R2, then deleted locally)
```