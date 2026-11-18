import React from 'react';
import { useCurrentFrame } from 'remotion';
import { RemotionWordTimestamp } from '../types';

interface CaptionsLayerProps {
  wordTimestamps: RemotionWordTimestamp[];
  narration: string;
}

/**
 * REMOTION-12: Z-40 Kinetic Captions Layer
 * Frame-accurate kinetic subtitles. The active spoken word scales and highlights in yellow.
 */
export const CaptionsLayer: React.FC<CaptionsLayerProps> = ({
  wordTimestamps,
  narration,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 40,
        right: 40,
        minHeight: 220,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px',
        background:
          'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 70%, transparent 100%)',
        borderRadius: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          maxWidth: 960,
          textAlign: 'center',
        }}
      >
        {wordTimestamps.map((w, idx) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;

          return (
            <span
              key={`${w.word}-${idx}`}
              style={{
                display: 'inline-block',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: isActive ? 44 : 36,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                padding: isActive ? '6px 16px' : '4px 6px',
                borderRadius: isActive ? 12 : 6,
                backgroundColor: isActive ? '#FFFC00' : 'transparent',
                color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.75)',
                border: isActive ? '4px solid #000000' : '4px solid transparent',
                boxShadow: isActive ? '5px 5px 0px #000000' : 'none',
                transform: isActive ? 'scale(1.12) rotate(-1.5deg)' : 'scale(1.0)',
                transition: 'transform 0.08s ease-out, background-color 0.08s ease-out',
                textShadow: isActive ? 'none' : '2px 2px 4px rgba(0,0,0,0.9)',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
