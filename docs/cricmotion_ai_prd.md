# CRICMOTION AI (V1 MVP)

## Product Requirements Document (PRD)

**Document Type:** Detailed Engineering, UX, and Product Blueprint
**Target Audience:** Personal Portfolio / Developer Showcase (MVP SaaS)
**Core Philosophy:** Zero-friction UX, minimal clicks, highly visual interfaces, and AI-driven hybrid video generation.

## 1. Executive Summary & Product Vision

**CricMotion AI** is a frictionless, multi-tenant SaaS platform tailored for sports creators, meme pages, and brands. It transforms a single text prompt into a fully produced, 9:16 vertical motion-graphic video featuring an AI lip-syncing avatar (News Reporter style) overlaid with dynamic broadcast graphics.

This V1 release eliminates traditional video editing timelines and text-heavy forms entirely. Users rely on a visual "Omnibar" and conversational AI chat to generate and revise videos. The UI adopts a highly engaging, Snapchat-inspired Neobrutalist design (vibrant yellow/black, thick borders) to make the creation process feel like a playful, native mobile experience, masking the massive backend processing required to orchestrate LLMs, TTS, Avatar APIs, and programmatic rendering.

## 2. Technical Architecture & Infrastructure (Free-Tier Optimized)

The V1 stack utilizes a hybrid rendering approach, combining pre-rendered AI Avatars with headless programmatic React motion graphics.

* **Frontend Ecosystem:** Next.js (App Router), React, Tailwind CSS for styling, Redux Toolkit for complex state management, Zod for strict type validation.
* **Backend Server:** Node.js with Express.js. Handles API routing, rate limiting, and async worker delegation.
* **Database:** MongoDB Atlas. Utilizes strict Mongoose schemas for data integrity and tenant isolation.
* **Storage Pipeline:** Cloudflare R2 (S3-compatible) for MP4s, generated Avatars, and audio chunks for zero-cost, high-bandwidth delivery.
* **AI Logic & Layout Planner:** Google Gemini 1.5 Pro. Acts as the director, researcher, and UI router.
* **Voice Engine:** ElevenLabs API. Uses `eleven_multilingual_v2` for accurate Indian/British accents and extracts word-level timestamp metadata.
* **Avatar Engine:** D-ID or HeyGen API. Generates the speaking video based on the ElevenLabs audio track.
* **Compositing Engine:** Remotion.dev. A React-based headless renderer that layers the Avatar, overhead SVGs, and kinetic captions, compiling them into MP4 files using FFmpeg.
* **Social Publishing:** Meta Instagram Graph API (Direct-to-Reels).

## 3. UI/UX Design System (The "Snapchat Brutalism" Theme)

To ensure high engagement and a modern feel, the UI strictly adheres to the following design system:

* **Colors:** Vibrant Yellow (`bg-[#FFFC00]`), Deep Black (`bg-neutral-950`), and crisp White.
* **Styling:** Neobrutalism. Thick solid black borders (`border-4 border-black`), sharp drop shadows (`shadow-[6px_6px_0px_rgba(0,0,0,1)]`), and heavily rounded corners (`rounded-2xl`, `rounded-full`).
* **Typography:** Ultra-bold, quirky display fonts (e.g., Space Grotesk or Clash Display) for headings; highly readable sans-serif for UI text.
* **Navigation:** No top nav bars. Uses a bottom-centered "Floating Dock" (Apple iPad style, but brutalist) with icon-only buttons (Grid/Dashboard, Plus/New Reel, Calendar/Schedule, User/Profile).
* **Frictionless Inputs:** Traditional forms are replaced by visual toggle-pills (icons only) and a single master "Omnibar". Interactive elements must physically press down on click (translating X/Y and removing the shadow).

## 4. Authentication & Strict User Isolation (Multi-Tenancy)

To function as a true SaaS, the platform supports multiple independent creators without data bleeding.

* **Frictionless Login:** Split-screen layout. Left side: Massive rotating 3D cricket emoji on yellow. Right side: Two massive pill buttons ("Continue with Google", "Continue with Email").
* **Session Management:** Secure, HTTP-only JWT cookies manage sessions.
* **Strict Data Isolation:** Every database query for projects, drafts, or videos is strictly filtered by a unique `ownerId` assigned at login (e.g., `Project.find({ ownerId: req.user.id })`).
* **Protected Routes:** Next.js Middleware automatically intercepts requests to the workspace. If no valid JWT is found, the user is redirected to `/login`.

## 5. Core Product Constraints (Non-Negotiable Rules)

1. **Hard Length Cap (90 Seconds Maximum):** The absolute maximum duration for any video is 90 seconds. The backend strictly instructs Gemini to cap scripts at ~220 words.
2. **AI-Only Conversational Revisions:** Users **cannot** manually click into text boxes to edit the script, drag clips, or alter timelines. All revisions must be executed via the Omnibar chat (e.g., typing "Make the avatar sound more shocked").
3. **Dynamic Visual Routing:** The system must *never* use a monolithic "dummy stadium" for all videos. Gemini must categorize the prompt (e.g., `auction`, `match-play`, `controversy`) and explicitly route Remotion to use the correct high-end UI layout component.

## 6. Comprehensive User Journeys & Micro-Interactions

### Flow A: Visual Dashboard (Workspace)
1. User lands on `/dashboard`.
2. UI displays a clean masonry grid of previously generated reels.
3. Cards contain zero text—only a large 9:16 video thumbnail placeholder.
4. UI overlays a tiny status dot (Green for complete, Yellow for generating) and a subtle play icon on hover.
5. User clicks the massive, floating circular "Generate +" button anchored to the bottom right.

### Flow B: The Omnibar Creation Pipeline
1. **The Setup:** The screen splits cleanly: Editor (Left, 60% width) and 9:16 Preview Canvas (Right, 40% width).
2. **Prompting:** The user clicks the "Omnibar" at the bottom of the Editor. They type: *"Pant sold to LSG for 27 Crores."*
3. **Visual Toggles:** Above the Omnibar, the user clicks icon-pills to set parameters (🎙️ Hype Voice, 👔 British Reporter, ⏱️ 60s).
4. **Generation:** User hits Enter. Gemini categorizes the prompt as `auction-financial` and generates the scene schema.
5. **The Filmstrip:** A horizontal scrolling "filmstrip" of square thumbnails appears above the Omnibar. Each square visually represents a scene's layout (e.g., a gavel icon for an auction scene).
6. **Rendering:** The backend sequentially polls ElevenLabs and D-ID, then runs Remotion. The sticky mobile-phone mockup on the right displays the final video.

### Flow C: Conversational Revisions
1. User watches the preview and feels Scene 1 needs a different visual.
2. User clicks back into the Omnibar and types: *"Change the overhead graphic in scene 1 to falling money."*
3. The backend sends *only* the current JSON schema + the chat prompt to Gemini.
4. Gemini creates an updated schema (`versionNumber + 1`).
5. The Filmstrip shows a sleek loading skeleton, updates visually, and seamlessly triggers a re-render of the specific scene.

## 7. Deep-Dive: The Remotion "Newsroom" Compositing

Remotion does not draw characters manually; it acts as a broadcast video control room, layering assets strictly by Z-Index:

* **Z-Index 0 (Environment):** Professional, slightly blurred 3D news studio background.
* **Z-Index 10 (The Presenter):** The downloaded MP4 of the lip-syncing reporter, positioned at the bottom center. Remotion applies chroma-key filters (green screen removal) if required.
* **Z-Index 20 (Overhead Physics):** Dynamic SVGs/Lotties (Jerseys, Gavels, Money, Player Cutouts). Bound to Remotion's `spring()` physics engine to enter/exit dynamically above the Avatar's head based on LLM-defined action triggers.
* **Z-Index 30 (Ticker UI):** A continuous scrolling `<NewsTicker>` component at the bottom edge.
* **Z-Index 40 (Kinetic Text):** Word-level caption highlighting, synced to ElevenLabs milliseconds, placed directly above the news ticker to guarantee readability.

## 8. Edge Cases, Limits & Resilience

| Failure Scenario | Backend Resolution | User-Facing UX | 
| ----- | ----- | ----- | 
| **D-ID/HeyGen Timeout** | Backend polling hits a 5-minute timeout limit. | Omnibar notifies: "Avatar engine delayed. Falling back to Motion-Graphics only." | 
| **ElevenLabs Quota Exhaustion** | API returns 401/429. Backend updates project status to `FAILED_AUDIO`. | "Audio generation paused: System limits reached. Please try again later." | 
| **Invalid Gemini JSON** | Gemini hallucinates markdown or invalid UI components. | Backend Zod validation fails; silently auto-retries prompt up to 3 times before erroring. | 
| **User Closes Tab During Render** | Remotion is running on the backend Node server. | None. When the user returns to the dashboard, the video will simply show as `READY`. | 
| **Instagram API Token Expired** | Meta tokens expire. Backend catches the 400 error on the publish attempt. | Modal pops up: "Instagram requires you to reconnect your account to verify permissions." | 

*End of Document*