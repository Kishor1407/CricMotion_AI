# CRICMOTION AI - UI/UX Design System & Flow Architecture

**Version:** 1.0
**Design Theme:** Snapchat-Inspired Neobrutalism
**Core Philosophy:** Zero-Friction, Highly Visual, Minimal Clicks, Conversational UI

---

## 1. GLOBAL DESIGN SYSTEM

This section defines the foundational visual primitives used across the entire application. All frontend code (Tailwind CSS) must strictly adhere to these variables.

### 1.1 Color Palette
The color palette is intentionally restricted to create a high-contrast, energetic, and playful aesthetic.

*   **Primary Accent:** Vibrant Snapchat Yellow
    *   Hex: `#FFFC00`
    *   Usage: Primary action buttons, active states, highlighted text backgrounds, success indicators.
    *   Tailwind: `bg-[#FFFC00]`, `text-[#FFFC00]`
*   **Primary Background (Dark Mode Default):** Deep Black
    *   Hex: `#0A0A0A` (Neutral 950)
    *   Usage: Main application wrapper, modal overlays, inactive panel backgrounds.
    *   Tailwind: `bg-neutral-950`
*   **Surface / Card Background:** Crisp White
    *   Hex: `#FFFFFF`
    *   Usage: Project cards, the floating dock, input fields, chat bubbles.
    *   Tailwind: `bg-white`
*   **Borders & Shadows:** Pure Black
    *   Hex: `#000000`
    *   Usage: The structural lines of the Neobrutalist design.
*   **Semantic Colors (Minimal Usage):**
    *   Success Green: `#4ADE80` (Status dots, completed renders)
    *   Warning Orange: `#FB923C` (Generating states, loading bars)
    *   Error Red: `#F87171` (Failed renders, deleted projects)

### 1.2 Typography System
Typography must feel bold, editorial, and unapologetic. 

*   **Heading Font:** `Space Grotesk` or `Clash Display` (Ultra-Bold)
    *   H1 (Hero): 56px to 72px, leading-none, tracking-tight.
    *   H2 (Section): 32px to 48px, leading-tight.
    *   H3 (Card Titles): 24px.
*   **Body / UI Font:** `Inter` or `Bricolage Grotesque` (Medium)
    *   Base text (Chat, Input): 16px.
    *   Small text (Tooltips, metadata): 12px to 14px.
*   **Readability Constraints:** All text must meet WCAG AAA contrast ratios. Yellow text is strictly forbidden on white backgrounds; it must only be used on pure black.

### 1.3 Neobrutalist UI Primitives
Standard modern UI uses soft blurs and thin lines. CricMotion AI explicitly rejects this in favor of high-impact geometric brutalism.

*   **Borders:** All interactive elements (cards, inputs, buttons, docks) MUST have a solid, thick black border.
    *   Tailwind: `border-4 border-black`
*   **Border Radius:** Extreme rounding to balance the aggressive borders.
    *   Buttons/Pills: `rounded-full`
    *   Cards/Panels: `rounded-2xl` or `rounded-3xl`
*   **Drop Shadows:** Hard, offset, non-blurred black shapes.
    *   Tailwind: `shadow-[6px_6px_0px_rgba(0,0,0,1)]`
    *   Hover State: Shadow slightly expands `shadow-[8px_8px_0px_rgba(0,0,0,1)]`
    *   Active/Pressed State: Shadow disappears `shadow-none translate-x-[6px] translate-y-[6px]`.

### 1.4 Micro-Interactions & Animation
*   **Button Press:** The core physical interaction. When a user clicks a button, it must visually "press down" into the screen by translating on the X and Y axes to match its shadow offset, while the shadow opacity drops to 0.
*   **Transitions:** Fast, snappy, non-easing.
    *   Tailwind: `transition-all duration-150 ease-in-out`
*   **Loading States:** Instead of standard spinners, use high-contrast scrolling diagonal stripes or skeletal blocks with a sweeping white gradient.

---

## 2. GLOBAL NAVIGATION: THE FLOATING DOCK

Traditional SaaS platforms use top nav bars or massive left sidebars. CricMotion AI uses a bottom-centered floating dock.

### 2.1 Dock Structure
*   **Position:** `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`
*   **Container:** `bg-white border-4 border-black rounded-full shadow-[6px_6px_0px_rgba(0,0,0,1)] px-6 py-3 flex gap-8 items-center`
*   **Icons (Lucide React):** 
    *   Grid Icon -> Routes to Dashboard
    *   Plus Icon -> Routes to Workspace (New Reel)
    *   Calendar Icon -> Routes to Schedule View
    *   User Icon -> Routes to Profile/Settings
*   **Active State:** The currently active route highlights the icon in `#FFFC00` (Yellow) with a small black dot underneath it.

---

## 3. SCREEN-BY-SCREEN ARCHITECTURE

### SCREEN 1: AUTHENTICATION (Login / Sign-Up)
**Purpose:** Frictionless entry point to establish the `ownerId` tenant session.
**Layout:** 50/50 Split Screen (`h-screen w-full flex`).

*   **Left Panel (Brand Hook):**
    *   Background: `#FFFC00` (Yellow).
    *   Content: A massive, bold H1 typography: "Make Cricket Reels. Fast."
    *   Visual: A large rotating 3D cricket emoji or mascot (rendered via Three.js or a looping GIF).
*   **Right Panel (Auth Actions):**
    *   Background: `#0A0A0A` (Black).
    *   Content: Centered flexbox.
    *   UI Elements: Two massive pill-shaped buttons taking up 80% width.
        *   Button 1: White background, Google Icon, "Continue with Google".
        *   Button 2: Yellow background, Mail Icon, "Continue with Email".
*   **Interactions:** Clicking an auth button triggers the OAuth flow. Upon success, screen wipes to Screen 2.

### SCREEN 2: VISUAL DASHBOARD (Project Repository)
**Purpose:** A visually stunning grid of past generated work.
**Layout:** Full width, black background. Top padding applied to account for a hidden nav. Bottom padding applied to avoid overlapping the Floating Dock.

*   **Header Area:** 
    *   H2: "Your Reels" (White text).
    *   Right side: A simple "Credits: 42" pill.
*   **Masonry Grid:**
    *   Tailwind: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`
*   **Project Cards (The Items):**
    *   Shape: 9:16 aspect ratio (Vertical video).
    *   Style: `border-4 border-black rounded-2xl overflow-hidden`.
    *   Background: Displays the generated thumbnail (or a gray placeholder if generating).
    *   Overlay (Hover): A dark semi-transparent overlay with a massive white Play button appears on mouse hover.
    *   Status Indicator: A small absolute-positioned dot at top-right. Green = Ready, Yellow = Generating, Red = Failed.
*   **The Master FAB (Floating Action Button):**
    *   Position: Bottom right (above the dock).
    *   Style: Massive Yellow circle, black border, black Plus icon. `w-20 h-20 shadow-[6px_6px_0px_rgba(0,0,0,1)]`.
    *   Interaction: Clicks instantly push the router to Screen 3 (Workspace).

### SCREEN 3: THE WORKSPACE (Core Pipeline Editor)
**Purpose:** The engine room. Where prompt-to-video happens. No timelines, no complex properties panels.
**Layout:** Desktop Split View. `flex flex-row h-screen w-full`. Mobile: Stacked view.

#### 3.1 Left Panel (The Omnibar & Revision Engine) - 60% Width
*   **Background:** Crisp White (`#FFFFFF`).
*   **Top Section (The Filmstrip):**
    *   A horizontal scrolling container (`overflow-x-auto`).
    *   Populated by "Scene Cards" generated by the AI.
    *   Card Style: Square, black border, contains a Lucide icon representing the `contextCategory` (e.g., Gavel for Auction, Lightning for Hype).
    *   Loading State: If generating, these cards pulse with a yellow gradient.
*   **Middle Section (Chat History):**
    *   A vertically scrolling container.
    *   User Bubbles: Aligned right, yellow background, black text.
    *   System Bubbles: Aligned left, minimal text ("Revising script...", "Updating timeline...").
*   **Bottom Section (The Omnibar Setup):**
    *   **Vibe Toggles:** A row of 3 pills just above the input.
        *   Avatar Toggle: [None] | [Indian Reporter] | [British Anchor]
        *   Voice Toggle: [Hype] | [Serious]
        *   Length: [30s] | [60s]
    *   **The Omnibar Input:** 
        *   A massive `textarea` that auto-expands.
        *   Style: `w-full border-4 border-black rounded-3xl p-4 bg-gray-50 shadow-[6px_6px_0px_rgba(0,0,0,1)]`.
        *   Placeholder: "Enter your cricket news or ask for a revision..."
        *   Submit Button: Inside the input, absolute right. Black circle with a white upward arrow.

#### 3.2 Right Panel (The 9:16 Canvas) - 40% Width
*   **Background:** Deep Black (`#0A0A0A`).
*   **Center Piece (The Phone Mockup):**
    *   A large div locked to a 9:16 aspect ratio.
    *   Style: `border-[12px] border-black rounded-[3rem] overflow-hidden bg-neutral-900`.
    *   Content: This mounts the `Remotion` Player component to stream the React animation in real-time.
*   **Action Dock (Beneath Phone):**
    *   Flex container, centered.
    *   Button 1: [▶️ Play Render] - White pill, black border.
    *   Button 2: [🚀 Export & Schedule] - Yellow pill, black border.

### SCREEN 4: EXPORT & SCHEDULE MODAL
**Purpose:** Handles the final delivery of the MP4 artifact to social networks.
**Layout:** Full-screen overlay.
*   **Backdrop:** Black with 70% opacity and background blur (`backdrop-blur-md`).
*   **Modal Card:**
    *   Centered. Yellow background (`#FFFC00`), thick black border.
    *   H2: "Deploy Reel"
*   **Toggles:**
    *   Large, chunky switch components for [Instagram] and [YouTube].
*   **Scheduler:**
    *   A custom minimal date picker. Input fields with thick black borders.
*   **Primary Action:**
    *   Massive black button at the bottom: "Confirm Schedule". Text is white.
    *   Interaction: Clicks down -> loading animation -> replaces modal with a massive Green checkmark -> routes back to Dashboard.

### SCREEN 5: PROFILE & SETTINGS
**Purpose:** Manage account logic, API keys, and subscription tier.
**Layout:** Similar to Dashboard, but mounts a centered content card.
*   **Background:** Black.
*   **Settings Card:**
    *   White background, black border, offset shadow.
    *   **Profile Section:** Avatar image, Name, Email.
    *   **Wallet Section:** "Credits Remaining: 42". Yellow "Upgrade to Pro" button.
    *   **Developer Keys (Hidden by default):** Masked inputs for users to supply their own ElevenLabs or Gemini API keys to bypass credit limits.
    *   **Danger Zone:** Red button "Sign Out".

---

## 4. CRITICAL USER FLOWS & INTERACTION MAPPING

### Flow 1: Zero-to-One Generation
1.  User clicks `+` in Floating Dock -> routes to Workspace.
2.  User configures visual toggles (Reporter, Hype, 60s).
3.  User types "MS Dhoni wins 2011 world cup" in Omnibar and hits Enter.
4.  **UI State Change:** Omnibar input clears. A chat bubble appears. Filmstrip container fades in.
5.  **Backend Call:** Trigger `/projects` POST.
6.  **Progress UI:** A yellow loading bar appears atop the phone mockup. Filmstrip cards populate one by one as JSON arrives.
7.  **Completion:** The phone mockup mounts the Remotion Player. The video starts auto-playing.

### Flow 2: The Conversational Revision
1.  User watches the video on the right panel.
2.  User clicks into the Omnibar on the left and types: "Make the avatar sound angry".
3.  **UI State Change:** Filmstrip cards immediately show skeletal loading states.
4.  **Backend Call:** Triggers `/projects/:id/chat`. Database creates a new immutable version.
5.  **Completion:** Filmstrip cards pop back in. The Remotion Player on the right automatically re-mounts with the updated audio track.

### Flow 3: Error & Fallback States
*   **ElevenLabs Timeout:** If the TTS API fails, the backend triggers an error socket.
*   **UI Reflection:** The specific Filmstrip card that failed turns Red. A system chat bubble appears in the chat history: "Audio engine failed. Retrying..."
*   **Avatar Timeout:** If D-ID fails, a modal prompts the user: "Avatar generation took too long. Proceed with Motion Graphics only?" with a yellow [Proceed] button.

---

## 5. ACCESSIBILITY (A11Y)
Despite the aggressive brutalist design, accessibility is strictly maintained.
*   **Focus Rings:** Standard browser focus rings are suppressed. Custom focus rings are applied: `focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#FFFC00]`.
*   **Contrast:** The Yellow (`#FFFC00`) and Black (`#0A0A0A`) pairing exceeds WCAG AAA standards for contrast (19:1 ratio).
*   **ARIA Labels:** All icon-only buttons in the Floating Dock and Workspace MUST contain descriptive `aria-label` attributes (e.g., `aria-label="Navigate to Dashboard"`).

*End of Design System Document*