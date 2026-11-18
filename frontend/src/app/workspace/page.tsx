'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Zap,
  Play,
  Pause,
  Clock,
  Mic,
  UserCheck,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Layers,
  Film,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { apiRequest, authStorage, User } from '@/lib/api';
import { FloatingDock } from '@/components/FloatingDock';

interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

interface StoryboardScene {
  sceneNumber: number;
  title: string;
  narration: string;
  startSeconds: number;
  endSeconds: number;
  contextCategory?: string;
  visualPrompt?: string;
  tickerHeadline?: string;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string | Date;
}

interface ProjectData {
  _id?: string;
  title: string;
  sourcePrompt: string;
  status: string;
  category: string;
  config: {
    targetDurationSeconds: number;
    vibe: string;
    avatarModelId: string;
    voiceModelId: string;
  };
  storyboard: StoryboardScene[];
  chatHistory: ChatMessage[];
  artifacts?: {
    thumbnailUrl?: string;
    audioTrackUrl?: string;
  };
}

function calculateCadenceTimestamps(narration: string, durationSec: number = 10): WordTimestamp[] {
  const words = narration.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const totalMs = Math.max(1000, durationSec * 1000);
  const msPerWord = Math.max(180, Math.floor(totalMs / words.length));
  return words.map((w, idx) => ({
    word: w,
    startMs: idx * msPerWord,
    endMs: (idx + 1) * msPerWord - 25,
  }));
}

const STARTER_PROMPTS = [
  '🔥 Pant 27 CR Mega Auction War: How LSG broke the all-time record',
  '⚡ Bumrah 149 KPH Toe-Crusher Yorker to dismiss Ollie Pope',
  '👑 Kohli 82* vs PAK: Breaking down the impossible MCG physics',
  '📊 Rohit Sharma vs Chris Gayle: Six-hitting masterclass comparison',
];

const DURATION_OPTIONS = [30, 45, 60, 90];
const VIBE_OPTIONS = ['Breaking News', 'High Energy Hype', 'Stats Deep Dive'];
const VOICE_OPTIONS = [
  { id: 'eleven_multilingual_v2_british', name: 'Vintage British' },
  { id: 'eleven_multilingual_v2_indian', name: 'Indian Commentator' },
  { id: 'eleven_multilingual_v2_aussie', name: 'Aussie Pundit' },
];
const AVATAR_OPTIONS = [
  { id: 'old_british_reporter_01', name: 'Vintage Reporter' },
  { id: 'modern_sports_anchor_02', name: 'Studio Anchor' },
  { id: 'motion_graphics_only', name: 'Motion Only' },
];

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('projectId');

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectData>({
    title: 'New Cricket Reel Project',
    sourcePrompt: '',
    status: 'DRAFT',
    category: 'match-action',
    config: {
      targetDurationSeconds: 45,
      vibe: 'High Energy Hype',
      avatarModelId: 'old_british_reporter_01',
      voiceModelId: 'eleven_multilingual_v2_british',
    },
    storyboard: [],
    chatHistory: [],
  });

  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSocialOverlay, setShowSocialOverlay] = useState(true);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [audioNotification, setAudioNotification] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Authenticate user & load project if param present
  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    if (projectIdParam) {
      loadProject(projectIdParam);
    } else {
      // Setup demo initial state with pre-calculated word timestamps
      const sc1Text = '28 needed off 8 balls at the MCG. 90,000 screaming fans, Pakistan on the verge of victory.';
      const sc2Text = 'Back-foot punch straight back over the bowler’s head. A physics-defying six into the Melbourne night sky!';
      const sc3Text = 'Next ball: angled on the pads, flicked effortlessly over fine leg! 16 off two deliveries!';
      const sc4Text = 'Ashwin lifts it over mid-off, Kohli drops to his knees. The greatest T20 innings ever played.';

      setProject((prev) => ({
        ...prev,
        title: 'Kohli 82* vs PAK (MCG Climax)',
        sourcePrompt: 'Virat Kohli historic 82 not out against Pakistan at the MCG in T20 World Cup 2022.',
        status: 'READY',
        storyboard: [
          {
            sceneNumber: 1,
            title: 'The Unthinkable Equation',
            narration: sc1Text,
            startSeconds: 0,
            endSeconds: 10,
            contextCategory: 'match-action',
            visualPrompt: 'Haris Rauf charging in at 149 kph under floodlights.',
            tickerHeadline: '⚡ 28 NEEDED OFF 8 BALLS // T20 WORLD CUP CLIMAX',
            wordTimestamps: calculateCadenceTimestamps(sc1Text, 10),
          },
          {
            sceneNumber: 2,
            title: 'Shot of an Emperor',
            narration: sc2Text,
            startSeconds: 10,
            endSeconds: 22,
            contextCategory: 'match-action',
            visualPrompt: 'Slow motion straight six over long-on with tracer line.',
            tickerHeadline: '★ SHOT OF THE CENTURY // 105M MAXIMUM DETECTED',
            wordTimestamps: calculateCadenceTimestamps(sc2Text, 12),
          },
          {
            sceneNumber: 3,
            title: 'Flick Over Fine Leg',
            narration: sc3Text,
            startSeconds: 22,
            endSeconds: 32,
            contextCategory: 'stats-comparison',
            visualPrompt: 'Wrist flick tracer path graphic with bat speed meter peaking at 138 kph.',
            tickerHeadline: '⚡ BAT SPEED: 138 KPH // WIN PROBABILITY SWINGS TO 88%',
            wordTimestamps: calculateCadenceTimestamps(sc3Text, 10),
          },
          {
            sceneNumber: 4,
            title: 'The King Reclaims Melbourne',
            narration: sc4Text,
            startSeconds: 32,
            endSeconds: 45,
            contextCategory: 'news-headline',
            visualPrompt: 'Virat Kohli emotional celebration, fireworks and roaring stadium.',
            tickerHeadline: '👑 KOHLI 82* (53) // INDIA WINS BY 4 WICKETS',
            wordTimestamps: calculateCadenceTimestamps(sc4Text, 13),
          },
        ],
        chatHistory: [
          {
            role: 'user',
            content: 'Generate a 45s vertical reel breakdown of Kohli’s MCG finish with 149 KPH telemetry.',
          },
          {
            role: 'assistant',
            content: '⚡ CricMotion AI generated 4 dynamic scenes. Timestamps, kinetic captions, and audio sync ready for preview.',
          },
        ],
      }));
    }
  }, [projectIdParam, router]);

  const loadProject = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/projects/${id}`);
      if (res.data) {
        // Ensure word timestamps exist for all scenes
        const enrichedStoryboard = (res.data.storyboard || []).map((sc: StoryboardScene) => ({
          ...sc,
          wordTimestamps:
            sc.wordTimestamps && sc.wordTimestamps.length > 0
              ? sc.wordTimestamps
              : calculateCadenceTimestamps(sc.narration, (sc.endSeconds || 10) - (sc.startSeconds || 0)),
        }));
        setProject({ ...res.data, storyboard: enrichedStoryboard });
        if (enrichedStoryboard.length > 0) {
          setActiveSceneIndex(0);
        }
      }
    } catch (err: any) {
      console.error('Failed to load project:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Synthesize voiceover audio and millisecond timestamps (Module 5)
  const handleSynthesizeAudio = async () => {
    setIsSynthesizingAudio(true);
    setAudioNotification('🎙️ Synthesizing Voiceover (ElevenLabs & Cadence Engine)...');
    try {
      let targetProjectId = project._id;
      // If project has not been saved yet, save it first
      if (!targetProjectId) {
        const createRes = await apiRequest('/projects', {
          method: 'POST',
          body: JSON.stringify({
            sourcePrompt: project.sourcePrompt || project.title,
            config: project.config,
            title: project.title,
          }),
        });
        if (createRes.data) {
          setProject(createRes.data);
          targetProjectId = createRes.data._id;
          router.push(`/workspace?projectId=${createRes.data._id}`);
          setAudioNotification('✅ Voiceover & millisecond alignments synthesized successfully!');
          setTimeout(() => setAudioNotification(null), 4000);
          return;
        }
      }

      if (targetProjectId) {
        const synthRes = await apiRequest(`/projects/${targetProjectId}/synthesize-audio`, {
          method: 'POST',
        });
        if (synthRes.data) {
          const enrichedStoryboard = (synthRes.data.storyboard || []).map((sc: StoryboardScene) => ({
            ...sc,
            wordTimestamps:
              sc.wordTimestamps && sc.wordTimestamps.length > 0
                ? sc.wordTimestamps
                : calculateCadenceTimestamps(sc.narration, (sc.endSeconds || 10) - (sc.startSeconds || 0)),
          }));
          setProject({ ...synthRes.data, storyboard: enrichedStoryboard });
          setAudioNotification('✅ Voiceover & millisecond alignments synthesized successfully!');
          setTimeout(() => setAudioNotification(null), 4000);
        }
      }
    } catch (err: any) {
      console.error('Audio synthesis failed:', err.message);
      setAudioNotification(`⚠️ Synthesis note: ${err.message}`);
      setTimeout(() => setAudioNotification(null), 5000);
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  // Video preview playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const maxDuration = project.config.targetDurationSeconds || 45;
          if (prev >= maxDuration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 0.5;
          // Sync active scene based on time
          const currentSceneIdx = project.storyboard.findIndex(
            (s) => next >= s.startSeconds && next <= s.endSeconds
          );
          if (currentSceneIdx !== -1 && currentSceneIdx !== activeSceneIndex) {
            setActiveSceneIndex(currentSceneIdx);
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, project, activeSceneIndex]);

  // Audio playback synchronization effect (Module 5)
  useEffect(() => {
    if (!audioRef.current) return;
    const currentScene = project.storyboard[activeSceneIndex];
    if (!currentScene?.audioUrl) return;

    const fullAudioUrl = currentScene.audioUrl.startsWith('http')
      ? currentScene.audioUrl
      : `http://localhost:5050${currentScene.audioUrl}`;

    if (audioRef.current.src !== fullAudioUrl) {
      audioRef.current.src = fullAudioUrl;
      audioRef.current.load();
    }

    audioRef.current.muted = isMuted;

    if (isPlaying) {
      const sceneOffset = Math.max(0, currentTime - currentScene.startSeconds);
      if (Math.abs(audioRef.current.currentTime - sceneOffset) > 0.4) {
        audioRef.current.currentTime = sceneOffset;
      }
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeSceneIndex, isMuted, currentTime, project.storyboard]);

  const handleAudioEnded = () => {
    if (activeSceneIndex < project.storyboard.length - 1) {
      const nextIdx = activeSceneIndex + 1;
      setActiveSceneIndex(nextIdx);
      setCurrentTime(project.storyboard[nextIdx].startSeconds);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveSceneIndex(0);
    }
  };

  // Handle Omnibar submit
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    const userMessage = promptInput.trim();
    setPromptInput('');
    setLoading(true);

    // Optimistically update chat
    setProject((prev) => ({
      ...prev,
      chatHistory: [
        ...prev.chatHistory,
        { role: 'user', content: userMessage, timestamp: new Date() },
      ],
    }));

    try {
      if (project._id) {
        // Send chat revision
        const res = await apiRequest(`/projects/${project._id}/chat`, {
          method: 'POST',
          body: JSON.stringify({ message: userMessage }),
        });
        if (res.data) {
          setProject((prev) => ({
            ...prev,
            chatHistory: res.data.chatHistory || (Array.isArray(res.data) ? res.data : prev.chatHistory),
            storyboard: res.data.storyboard || prev.storyboard,
          }));
        }
      } else {
        // Create new project
        const res = await apiRequest('/projects', {
          method: 'POST',
          body: JSON.stringify({
            sourcePrompt: userMessage,
            config: project.config,
          }),
        });
        if (res.data) {
          setProject(res.data);
          router.push(`/workspace?projectId=${res.data._id}`);
        }
      }
    } catch (err: any) {
      console.error('Error generating:', err.message);
    } finally {
      setLoading(false);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeScene = project.storyboard[activeSceneIndex] || {
    sceneNumber: 1,
    title: 'Loading Scene...',
    narration: 'Synthesizing voiceover and video telemetry...',
    startSeconds: 0,
    endSeconds: 15,
    tickerHeadline: '⚡ CRICMOTION // BROADCAST PIPELINE ACTIVE',
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white antialiased flex flex-col justify-between pb-28">
      {/* 1. STUDIO HEADER */}
      <header className="w-full bg-[#0A0A0A] border-b-4 border-black px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-brutal flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 bg-brand-yellow hover:bg-yellow-300 border-2 border-black rounded-xl shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-black"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-white">
                {project.title.slice(0, 32)}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-display font-extrabold bg-brand-yellow text-black border border-black rounded uppercase">
                {project.status}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-bold hidden sm:inline">
              9:16 Studio Omnibar & Storyboard Engine
            </span>
          </div>
        </div>

        {/* User Credits & Quick Status */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 bg-brand-yellow text-black px-3.5 py-1.5 border-2 border-black rounded-full shadow-brutal-sm font-display font-black text-xs">
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>{user?.wallet?.generationCredits ?? 50} CREDITS</span>
          </div>

          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black border-2 border-black rounded-full font-display font-bold text-xs shadow-brutal-sm hover:bg-gray-100 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
            <span>{isPlaying ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 60/40 SPLIT LAYOUT */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT PANEL (60%): CREATOR COMMAND & STORYBOARD STUDIO    */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
            
            {/* A. Tactile Parameter Toggle Strip */}
            <div className="bg-[#121212] border-4 border-black rounded-2xl p-4 shadow-brutal space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black/40 pb-2">
                <span className="text-xs font-display font-black text-brand-yellow tracking-wider uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-yellow" />
                  REEL PARAMETERS
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  Auto-synced to Remotion pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Duration Picker */}
                <div>
                  <label className="text-[10px] font-display font-extrabold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Target Duration
                  </label>
                  <div className="flex rounded-lg border-2 border-black overflow-hidden bg-black p-0.5">
                    {DURATION_OPTIONS.map((sec) => (
                      <button
                        key={sec}
                        onClick={() =>
                          setProject((p) => ({
                            ...p,
                            config: { ...p.config, targetDurationSeconds: sec },
                          }))
                        }
                        className={`flex-1 py-1 text-xs font-display font-black transition-all ${
                          project.config.targetDurationSeconds === sec
                            ? 'bg-brand-yellow text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Voice Selector */}
                <div>
                  <label className="text-[10px] font-display font-extrabold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Commentary Voice
                  </label>
                  <select
                    value={project.config.voiceModelId}
                    onChange={(e) =>
                      setProject((p) => ({
                        ...p,
                        config: { ...p.config, voiceModelId: e.target.value },
                      }))
                    }
                    className="w-full bg-black text-white border-2 border-black rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-brand-yellow"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Presenter Avatar */}
                <div>
                  <label className="text-[10px] font-display font-extrabold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Presenter Model
                  </label>
                  <select
                    value={project.config.avatarModelId}
                    onChange={(e) =>
                      setProject((p) => ({
                        ...p,
                        config: { ...p.config, avatarModelId: e.target.value },
                      }))
                    }
                    className="w-full bg-black text-white border-2 border-black rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-brand-yellow"
                  >
                    {AVATAR_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Module 5: Audio Synthesis & Word Alignment Control Strip */}
              <div className="pt-3 border-t-2 border-black/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.storyboard.some((s) => s.audioUrl)
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-brand-yellow'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-display font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-brand-yellow" />
                      {project.storyboard.some((s) => s.audioUrl)
                        ? 'VOICEOVER & ALIGNMENT ACTIVE'
                        : 'VOICEOVER READY TO SYNTHESIZE'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {project.storyboard.reduce((acc, s) => acc + (s.wordTimestamps?.length || 0), 0)}{' '}
                      words millisecond-aligned
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSynthesizeAudio}
                  disabled={isSynthesizingAudio || project.storyboard.length === 0}
                  className="w-full sm:w-auto px-4 py-2 bg-brand-yellow hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>
                    {isSynthesizingAudio
                      ? 'SYNTHESIZING AUDIO & TIMESTAMPS...'
                      : project.storyboard.some((s) => s.audioUrl)
                      ? 'RE-SYNTHESIZE VOICEOVER'
                      : 'SYNTHESIZE VOICEOVER (11LABS)'}
                  </span>
                </button>
              </div>

              {/* Toast / Notification pill */}
              {audioNotification && (
                <div className="p-2.5 bg-neutral-900 border-2 border-brand-yellow text-brand-yellow rounded-xl text-xs font-display font-black tracking-wide flex items-center gap-2">
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>{audioNotification}</span>
                </div>
              )}
            </div>

            {/* B. Storyboard Filmstrip Carousel */}
            <div className="bg-[#121212] border-4 border-black rounded-2xl p-4 sm:p-5 shadow-brutal flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-brand-yellow" />
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                    Storyboard Filmstrip ({project.storyboard.length} Scenes)
                  </h3>
                </div>
                <span className="text-[10px] font-display font-bold text-gray-400">
                  Click a scene to preview in 9:16 frame
                </span>
              </div>

              {loading ? (
                /* Skeleton Loading Pulse */
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="min-w-[220px] h-36 rounded-xl border-3 border-black bg-neutral-800 animate-pulse p-4 flex flex-col justify-between"
                    >
                      <div className="w-16 h-4 bg-neutral-700 rounded-full" />
                      <div className="space-y-2">
                        <div className="w-full h-4 bg-neutral-700 rounded" />
                        <div className="w-3/4 h-3 bg-neutral-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : project.storyboard.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs font-medium border-2 border-dashed border-neutral-700 rounded-xl">
                  Enter a cricket prompt below to generate your multi-scene storyboard.
                </div>
              ) : (
                /* Horizontal Filmstrip Cards */
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                  {project.storyboard.map((scene, idx) => {
                    const isActive = idx === activeSceneIndex;
                    return (
                      <div
                        key={scene.sceneNumber}
                        onClick={() => {
                          setActiveSceneIndex(idx);
                          setCurrentTime(scene.startSeconds);
                        }}
                        className={`min-w-[240px] max-w-[240px] rounded-xl border-3 border-black p-3.5 flex flex-col justify-between transition-all cursor-pointer select-none ${
                          isActive
                            ? 'bg-brand-yellow text-black shadow-brutal-sm -translate-y-1'
                            : 'bg-[#181818] text-white hover:bg-neutral-800 hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Card Header: Scene # & Time Range */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-display font-black border ${
                              isActive
                                ? 'bg-black text-brand-yellow border-black'
                                : 'bg-neutral-800 text-gray-300 border-neutral-700'
                            }`}
                          >
                            SCENE {scene.sceneNumber.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono font-bold opacity-80">
                            {scene.startSeconds}s - {scene.endSeconds}s
                          </span>
                        </div>

                        {/* Title & Narration */}
                        <div className="space-y-1 mb-2">
                          <h4 className="font-display font-black text-xs line-clamp-1 leading-snug">
                            {scene.title}
                          </h4>
                          <p
                            className={`text-[11px] line-clamp-2 font-medium leading-relaxed ${
                              isActive ? 'text-black/80' : 'text-gray-400'
                            }`}
                          >
                            {scene.narration}
                          </p>
                        </div>

                        {/* Audio Status Chip (Module 5) */}
                        <div className="flex items-center gap-1.5 my-1.5">
                          {scene.audioUrl ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isActive
                                  ? 'bg-black text-brand-yellow border-black'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                              }`}
                            >
                              <Volume2 className="w-2.5 h-2.5" />
                              AUDIO READY ({scene.wordTimestamps?.length || 0}w)
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isActive
                                  ? 'bg-black/80 text-brand-yellow border-black'
                                  : 'bg-neutral-800 text-gray-400 border-neutral-700'
                              }`}
                            >
                              <Mic className="w-2.5 h-2.5" />
                              {scene.wordTimestamps?.length || 0} WORDS
                            </span>
                          )}
                        </div>

                        {/* Footer: Category Tag */}
                        <div className="pt-1.5 border-t border-black/20 flex items-center justify-between text-[9px] font-extrabold uppercase">
                          <span>{scene.contextCategory || 'MATCH PLAY'}</span>
                          <span>{scene.endSeconds - scene.startSeconds}s DURATION</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* C. Conversational Feed & Revision Log */}
            <div className="bg-[#121212] border-4 border-black rounded-2xl p-4 sm:p-5 shadow-brutal flex flex-col h-[280px]">
              <div className="flex items-center gap-2 border-b-2 border-black/40 pb-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-white">
                  Conversational Studio Log & Revisions
                </h3>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                {project.chatHistory.length === 0 ? (
                  <div className="text-gray-500 text-xs italic text-center py-8">
                    Studio dialogue is empty. Tell CricMotion AI what cricket moment you want to generate.
                  </div>
                ) : (
                  project.chatHistory.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium border-2 border-black shadow-sm ${
                            isUser
                              ? 'bg-brand-yellow text-black font-semibold'
                              : 'bg-white text-black'
                          }`}
                        >
                          <div className="text-[9px] font-display font-extrabold uppercase tracking-wider mb-0.5 opacity-70">
                            {isUser ? 'You (Creator)' : 'CricMotion AI Agent'}
                          </div>
                          <p className="leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* D. Neobrutalist Omnibar Input */}
            <div className="bg-[#121212] border-4 border-black rounded-2xl p-4 shadow-brutal space-y-3">
              {/* Starter Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {STARTER_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPromptInput(p)}
                    className="px-3 py-1 bg-[#1E1E1E] hover:bg-brand-yellow hover:text-black border border-black rounded-full text-[11px] font-display font-bold whitespace-nowrap transition-all cursor-pointer"
                  >
                    {p.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Omnibar Form */}
              <form onSubmit={handleGenerate} className="flex gap-2">
                <div className="relative flex-1">
                  <textarea
                    rows={2}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="Describe your cricket reel (e.g. 'Pant 27 CR IPL auction war with falling cash graphics...')"
                    className="w-full bg-black text-white border-3 border-black rounded-xl p-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none placeholder-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !promptInput.trim()}
                  className="px-5 bg-brand-yellow text-black border-3 border-black rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">GENERATE</span>
                </button>
              </form>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL (40%): LIVE 9:16 VERTICAL SMARTPHONE PREVIEW */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center">
            
            {/* View Mode Controls */}
            <div className="w-full max-w-[360px] flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-display font-black text-brand-yellow tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-brand-yellow" />
                9:16 LIVE STAGE
              </span>
              <button
                onClick={() => setShowSocialOverlay(!showSocialOverlay)}
                className={`text-[11px] font-display font-bold px-2.5 py-1 rounded-full border border-black transition-all ${
                  showSocialOverlay
                    ? 'bg-brand-yellow text-black'
                    : 'bg-neutral-800 text-gray-400'
                }`}
              >
                Social UI: {showSocialOverlay ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Smartphone Outer Chassis */}
            <div className="relative w-[340px] sm:w-[360px] aspect-[9/16] bg-black border-4 border-black rounded-[42px] shadow-[8px_8px_0px_#000000] p-3 flex flex-col overflow-hidden select-none">
              
              {/* Phone Inner Screen Glass */}
              <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-neutral-900 border-2 border-black flex flex-col justify-between">
                
                {/* 1. Dynamic Island / Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 border border-neutral-800 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1">
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-brand-yellow animate-pulse h-full" />
                        <span className="w-0.5 bg-brand-yellow animate-pulse h-2" />
                        <span className="w-0.5 bg-brand-yellow animate-pulse h-1" />
                      </div>
                    )}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-900/60 border border-blue-500/30" />
                </div>

                {/* Audio Element (Module 5) */}
                <audio
                  ref={audioRef}
                  onEnded={handleAudioEnded}
                  onError={() => {}}
                />

                {/* Top Audio Controls */}
                <div className="absolute top-3 right-4 z-40 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 bg-black/80 hover:bg-black text-white border border-neutral-700 rounded-full transition-transform active:scale-95 cursor-pointer"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-brand-yellow" />
                    )}
                  </button>
                </div>

                {/* 2. Z-0 Background Layer (Stadium Visuals) */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700"
                  style={{
                    backgroundImage: `url('${
                      project.artifacts?.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop'
                    }')`,
                  }}
                />

                {/* Gradient Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />

                {/* 3. Z-10 Presenter PIP / Avatar Layer */}
                <div className="absolute top-12 left-4 z-20 flex items-center gap-2">
                  <div className="relative w-12 h-12 rounded-full border-2 border-brand-yellow bg-black overflow-hidden shadow-brutal-sm">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop')`,
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-green border border-black rounded-full animate-ping" />
                  </div>
                  <div className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-black">
                    <span className="text-[10px] font-display font-extrabold text-white block">
                      AI PRESENTER
                    </span>
                    <span className="text-[8px] font-mono font-bold text-brand-yellow">
                      LIP-SYNC: 30 FPS
                    </span>
                  </div>
                </div>

                {/* 4. Z-20 Overhead Physics & Telemetry Layer */}
                <div className="absolute top-28 right-4 z-20 flex flex-col items-end gap-1.5">
                  <div className="bg-brand-yellow text-black px-2.5 py-1 rounded-md border-2 border-black font-display font-black text-xs shadow-brutal-sm -rotate-2">
                    ⚡ 149.2 KPH
                  </div>
                  <div className="bg-black/80 text-white px-2 py-0.5 rounded border border-black text-[9px] font-mono font-bold">
                    BAT SPEED: 138 KPH
                  </div>
                </div>

                {/* 5. Center Visual Showcase Area */}
                <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 text-center mt-12">
                  <div className="inline-block bg-white text-black px-3 py-1 rounded-full border-2 border-black shadow-brutal-sm font-display font-black text-xs uppercase mb-2">
                    {activeScene.title}
                  </div>
                  <p className="text-white font-display font-extrabold text-base leading-tight drop-shadow-[2px_2px_0px_#000000] px-2">
                    {activeScene.narration}
                  </p>
                </div>

                {/* 6. Z-30 Scrolling News Ticker Bar */}
                <div className="relative z-30 w-full bg-brand-yellow text-black border-y-2 border-black py-1 px-3 overflow-hidden select-none">
                  <div className="whitespace-nowrap font-display font-extrabold text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-4">
                    <span>{activeScene.tickerHeadline || '⚡ CRICMOTION // 9:16 VERTICAL AUTO-CUT'}</span>
                    <span>•</span>
                    <span>60FPS REMOTION COMPOSITING</span>
                  </div>
                </div>

                {/* 7. Z-40 Kinetic Captions Layer (Dynamic Word Highlight Synced to Milliseconds) */}
                <div className="relative z-30 p-4 pb-14 bg-gradient-to-t from-black via-black/85 to-transparent min-h-[96px] flex items-center justify-center">
                  {(() => {
                    const sceneDuration = Math.max(1, (activeScene.endSeconds || 10) - (activeScene.startSeconds || 0));
                    const sceneWords =
                      activeScene.wordTimestamps && activeScene.wordTimestamps.length > 0
                        ? activeScene.wordTimestamps
                        : calculateCadenceTimestamps(activeScene.narration, sceneDuration);

                    const sceneElapsedMs = Math.max(0, Math.round((currentTime - (activeScene.startSeconds || 0)) * 1000));
                    const activeWordIdx = sceneWords.findIndex(
                      (w) => sceneElapsedMs >= w.startMs && sceneElapsedMs <= w.endMs
                    );

                    return (
                      <div className="text-center flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                        {sceneWords.map((item, wIdx) => {
                          const isCurrentWord = wIdx === activeWordIdx;
                          const isPastWord = sceneElapsedMs > item.endMs;

                          return (
                            <span
                              key={wIdx}
                              className={`transition-all duration-150 inline-block px-1.5 py-0.5 rounded font-display font-black tracking-wide text-xs uppercase ${
                                isCurrentWord
                                  ? 'bg-brand-yellow text-black border-2 border-black scale-110 shadow-brutal-sm -rotate-1 z-10'
                                  : isPastWord
                                  ? 'text-white drop-shadow-[1px_1px_0px_#000]'
                                  : 'text-neutral-500 opacity-60'
                              }`}
                            >
                              {item.word}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* 8. Optional Social Interface Overlay (TikTok / Reels icons) */}
                {showSocialOverlay && (
                  <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-3.5 text-white pointer-events-none opacity-85">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                      </div>
                      <span className="text-[9px] font-bold mt-0.5">142K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[9px] font-bold mt-0.5">Share</span>
                    </div>
                  </div>
                )}

                {/* Phone Bottom Progress Scrubber */}
                <div className="absolute bottom-3 left-4 right-4 z-40 flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 bg-brand-yellow text-black rounded-full border border-black flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black ml-0.5" />}
                  </button>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full border border-black overflow-hidden relative">
                    <div
                      className="h-full bg-brand-yellow transition-all duration-300"
                      style={{
                        width: `${((currentTime || 1) / (project.config.targetDurationSeconds || 45)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white">
                    {Math.round(currentTime)}s
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 3. GLOBAL FLOATING NAVIGATION DOCK */}
      <FloatingDock />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-black flex items-center justify-center text-white font-display font-bold">
          Loading AI Studio...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
