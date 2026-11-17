export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-black text-white">
      <div className="w-full max-w-2xl bg-white text-black border-4 border-black rounded-3xl p-8 shadow-brutal text-center space-y-6">
        <div className="inline-block bg-brand-yellow px-6 py-2 border-4 border-black rounded-full font-display font-extrabold text-2xl uppercase tracking-wider">
          🏏 CricMotion AI
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-tight">
          Make Cricket Reels. Fast.
        </h1>
        <p className="text-gray-700 text-lg font-medium">
          Zero-friction, multi-tenant AI video studio. Scaffold successfully initialized and ready for feature implementation.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <div className="px-5 py-2.5 bg-brand-yellow border-4 border-black rounded-full font-bold shadow-brutal text-sm">
            ✨ Snapchat Neobrutalism
          </div>
          <div className="px-5 py-2.5 bg-brand-green border-4 border-black rounded-full font-bold shadow-brutal text-sm">
            ⚡ Remotion Compositing
          </div>
          <div className="px-5 py-2.5 bg-gray-100 border-4 border-black rounded-full font-bold shadow-brutal text-sm">
            🤖 Gemini + ElevenLabs
          </div>
        </div>
      </div>
    </main>
  );
}
