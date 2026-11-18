import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface BackgroundLayerProps {
  durationInFrames: number;
  category: string;
}

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  'match-action':
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop', // Melbourne / cricket stadium under floodlights
  'auction-financial':
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1080&auto=format&fit=crop', // Golden stadium luxury arena
  'stats-comparison':
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?q=80&w=1080&auto=format&fit=crop', // Pitch analytics turf
  'news-headline':
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop', // News stadium
};

/**
 * REMOTION-08: Z-0 Newsroom Background Layer
 * Programmatic Ken Burns zoom, vignette, and ambient lighting.
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ durationInFrames, category }) => {
  const frame = useCurrentFrame();

  // Subtle cinematic zoom in from 1.0 to 1.08
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateRight: 'clamp',
  });

  // Slow horizontal pan
  const translateX = interpolate(frame, [0, durationInFrames], [0, -15], {
    extrapolateRight: 'clamp',
  });

  const bgUrl = CATEGORY_BACKGROUNDS[category] || CATEGORY_BACKGROUNDS['match-action'];

  return (
    <AbsoluteFill style={{ zIndex: 0, overflow: 'hidden', backgroundColor: '#070707' }}>
      {/* Stadium Visual with Ken-Burns Motion */}
      <img
        src={bgUrl}
        alt="Stadium Visual"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${translateX}px)`,
          filter: 'brightness(0.42) contrast(1.15) saturate(1.2)',
        }}
      />

      {/* Heavy Brutalist Vignette Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.85) 90%), linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Animated Subtle Noise Grid Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#FFFC00 0.75px, transparent 0.75px)',
          backgroundSize: '36px 36px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
