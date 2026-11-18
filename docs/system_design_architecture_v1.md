# CRICMOTION AI - System Design Architecture
**Version:** 1.0 (Final Foundation)

## 1. Architectural Overview
CricMotion AI V1 operates on a modern, decoupled Client-Server-Worker architecture designed for heavy asynchronous media processing and strict multi-tenant isolation. The system relies on a directed acyclic graph (DAG) for data flow, ensuring a seamless pipeline from text ingestion via the "Omnibar" to a published 9:16 Instagram Reel.

**Core V1 Philosophy:**
* **Frictionless UX:** Zero timeline editing; state mutations occur strictly via natural language processing (Conversational AI Revisions).
* **Hybrid Video Rendering:** Combines pre-rendered AI Avatar video layers with programmatic React-based motion graphics (Remotion).
* **Multi-Tenant Isolation:** Strict asset and workspace segregation at the storage and logic layers using robust `ownerId` tagging.

## 2. Core System Modules

### 2.1 Frontend Client (Next.js Application)
* **Framework:** Next.js (App Router) for SEO-friendly marketing pages and highly interactive Client Components for the AI Studio.
* **Styling:** Tailwind CSS implementing the "Snapchat Neobrutalism" theme (Vibrant Yellow, Thick Black Borders).
* **State Management:** Redux Toolkit.
  * *`WorkspaceSlice`*: Manages dashboard state, project lists, and filters.
  * *`StudioSlice`*: Manages the active generation pipeline, loading metrics, and Vibe/Avatar/Voice parameters.
  * *`OmnibarSlice`*: Manages the conversational revision history and optimistic UI updates for the Filmstrip.
* **Validation:** Zod for strictly typing user inputs and validating JSON payloads before dispatch.

### 2.2 Backend Orchestrator (Node.js/Express)
* **Role:** Acts as the traffic cop. Authenticates users, manages sessions, reads/writes to MongoDB, and dispatches heavy jobs to the Worker layer.
* **Session Management:** Stateless, HTTP-only JWTs.
* **Module Segregation:**
  * *`AuthManager`*: Handles OAuth and local credential verification.
  * *`ProjectManager`*: Handles CRUD logic for projects and immutable script drafts.
  * *`PipelineController`*: Validates generation requests and pushes them to the Job Queue.

### 2.3 Async Job Worker (The Rendering Engine)
Generating LLM scripts, ElevenLabs audio, D-ID/HeyGen avatars, and Remotion MP4s takes significant time (30s to 3 minutes). This cannot block the main Node.js event loop.
* **Queue System:** BullMQ (Redis-backed queue) for processing background tasks.
* **Step-Functions:**
  1. *LLM Job*: Interacts with Gemini 1.5 Pro to output strictly structured JSON.
  2. *Audio Job*: Interacts with ElevenLabs to generate MP3s and timestamp metadata.
  3. *Avatar Job*: Long-polling interaction with the Avatar provider to generate lip-sync video.
  4. *Remotion Job*: Spawns a heavy CPU child process to run FFmpeg and compile the React components into an MP4.

## 3. Storage & Asset Architecture (Cloudflare R2)
Strict multi-tenant directory structure is enforced at the storage level to prevent data leakage and manage ephemeral rendering costs.

### 3.1 Bucket Topology
* `cricmotion-assets-bucket` (Public Read, Internal Write)
  * `/avatars/` - Pre-approved static presenter images for D-ID reference.
  * `/ui-elements/` - Raw SVGs, team logos, and Lottie JSONs.
* `cricmotion-user-data-bucket` (Private Read/Write, Signed URLs only)
  * `/{tenant_userId}/`
    * `/projects/{projectId}/`
      * `audio_temp.mp3` (Ephemeral - 24hr TTL)
      * `avatar_temp.mp4` (Ephemeral - 24hr TTL)
      * `final_export.mp4` (Persistent)

## 4. Infrastructure & Deployment Topology
* **Frontend (Edge Deployment):** Hosted on Vercel. Global CDN distribution, optimized for caching and fast Edge Middleware (used for JWT route protection).
* **Backend & Worker (Compute Intensive):** Hosted on AWS EC2 or Render Performance Tier. Vercel Serverless functions have hard timeout limits (e.g., 60s on Pro) and lack persistent file systems. The Backend requires a persistent Node.js environment with raw CPU power and FFmpeg installed natively on the OS.
* **Database:** MongoDB Atlas (Serverless/Dedicated).
* **Queue Cache:** Redis (Upstash or AWS ElastiCache).