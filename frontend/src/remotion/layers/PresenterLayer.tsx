import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Video } from 'remotion';

interface PresenterLayerProps {
  avatarVideoUrl?: string;
}

/**
 * REMOTION-09: Z-10 Presenter Layer
 * Pinned PIP anchor inside Snapchat-Neobrutalism circular frame with spring pop-in.
 */
export const PresenterLayer: React.FC<PresenterLayerProps> = ({ avatarVideoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance pop
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });

  const fullVideoUrl = avatarVideoUrl
    ? avatarVideoUrl.startsWith('http')
      ? avatarVideoUrl
      : `http://localhost:5050${avatarVideoUrl}`
    : 'http://localhost:5050/uploads/avatars/default_presenter.mp4';

  // Subtle breathing scale while speaking
  const breathing = interpolate(Math.sin(frame / 6), [-1, 1], [0.99, 1.01]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 45,
        zIndex: 10,
        transform: `scale(${entrance * breathing})`,
        transformOrigin: 'top left',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Brutalist Circular Video Frame */}
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 140,
          borderRadius: 9999,
          border: '6px solid #000000',
          boxShadow: '6px 6px 0px #000000',
          backgroundColor: '#FFFC00',
          overflow: 'hidden',
        }}
      >
        <Video
          src={fullVideoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loop
          muted
        />

        {/* Live Active Recording Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            width: 22,
            height: 22,
            borderRadius: 9999,
            backgroundColor: '#00F050',
            border: '3px solid #000000',
            boxShadow: '1px 1px 0px #000000',
          }}
        />
      </div>

      {/* Brutalist Presenter Tag */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          border: '3px solid #000000',
          borderRadius: 12,
          padding: '8px 14px',
          boxShadow: '4px 4px 0px #000000',
        }}
      >
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 18,
            color: '#FFFFFF',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          AI PRESENTER
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            fontSize: 14,
            color: '#FFFC00',
            letterSpacing: '0.02em',
          }}
        >
          ▶ LIP-SYNC 30 FPS
        </span>
      </div>
    </div>
  );
};
