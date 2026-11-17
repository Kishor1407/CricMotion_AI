# CricMotion AI 🏏⚡

> **Frictionless, Multi-Tenant AI Video Generator for Cricket Reels & Shorts**  
> Transform single text prompts into 9:16 vertical broadcast motion-graphic videos featuring an AI lip-syncing anchor and dynamic physics-based graphics.

---

## ⚡ Overview

**CricMotion AI** eliminates traditional video editing timelines, clip dragging, and form clutter. Using a visual **Omnibar** and conversational AI revisions, sports creators, meme pages, and brands can generate production-grade vertical reels in seconds.

The interface is built with an ultra-engaging **Snapchat-inspired Neobrutalism** theme (Vibrant Yellow `#FFFC00`, Deep Black `#0A0A0A`, thick 4px black borders, and tactile physical press micro-interactions).

---

## 🛠️ Key Architectural Pillars

* **Zero-Timeline Editing:** All scene composition, timing, and creative adjustments are managed through natural language conversational chat.
* **Hybrid Video Compositing:** Remotion.dev acts as a broadcast video control room, layering 5 distinct Z-index planes:
  * `Z-0`: Blurred 3D newsroom broadcast environment
  * `Z-10`: Lip-synced AI presenter video (D-ID / HeyGen) with chroma keying
  * `Z-20`: Dynamic overhead physics animations (jerseys, gavels, money rain, trophies via Remotion `spring()`)
  * `Z-30`: Continuous scrolling `<NewsTicker>` marquee
  * `Z-40`: Word-level kinetic caption highlighting synced to milliseconds
* **Dynamic Visual Routing:** The AI planner (Gemini 1.5 Pro) semantically classifies prompts (e.g., `auction-financial`, `match-action`, `stats-comparison`) and routes Remotion to dedicated contextual React layouts.
* **Strict Multi-Tenancy:** Isolated storage and database querying enforcing `ownerId` scoping across all MongoDB collections and Cloudflare R2 object buckets.

---

## 🏗️ Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS (Neobrutalism), Redux Toolkit, Zod, Lucide React, `@remotion/player` |
| **Backend** | Node.js (v20+), Express.js, TypeScript, Mongoose |
| **Worker & Queue** | BullMQ, Redis (Upstash / Redis Cloud) |
| **Compositing Engine** | Remotion.dev, Headless Chromium, FFmpeg |
| **Database & Storage** | MongoDB Atlas, Cloudflare R2 (S3-compatible) |
| **AI & Media APIs** | Google Gemini 1.5 Pro, ElevenLabs (`eleven_multilingual_v2`), D-ID / HeyGen, Meta Instagram Graph API |

---

## 📚 Complete Project Documentation

| Document | Description |
| :--- | :--- |
| **[`cricmotion_ai_prd.md`](./cricmotion_ai_prd.md)** | Full Product Requirements Document, core constraints, user journeys & resilience |
| **[`system_design_architecture_v1.md`](./system_design_architecture_v1.md)** | System topology, Client-Server-Worker DAG, storage architecture & deployment |
| **[`pipeline_technical_design.md`](./pipeline_technical_design.md)** | Technical pipeline specification, contracts, scene routing & compositing |
| **[`database_schema_design_v1.md`](./database_schema_design_v1.md)** | MongoDB schemas for users, projects, script revisions, and agent chat logs |
| **[`api_design_document_v1.md`](./api_design_document_v1.md)** | RESTful API specifications under `/v1/` for auth, projects, and revisions |
| **[`ui_ux_design_document.md`](./ui_ux_design_document.md)** | Neobrutalist design system, tokens, floating dock, and screen-by-screen flows |
| **[`PROJECT_STATUS.md`](./PROJECT_STATUS.md)** | Live project tracking log, completed milestones, and roadmap |

---

## 🚦 Current Status

- **Current Milestone:** **Phase 1 Complete** (System Architecture & Foundation Documentation finalized).
- **Next Up:** Phase 2 (Project Scaffolding & Core Infrastructure Setup).

For full details on development history and current status, refer to **[`PROJECT_STATUS.md`](./PROJECT_STATUS.md)**.
