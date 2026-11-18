import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface NewsHeadlineLayoutProps {
  title: string;
}

/**
 * REMOTION-07: News Headline Layout
 * Breaking news flash lower-third banners, urgent alert stamps, and headline cards.
 */
export const NewsHeadlineLayout: React.FC<NewsHeadlineLayoutProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Flashing alert badge opacity
  const alertFlash = interpolate(Math.sin(frame / 4), [-1, 1], [0.8, 1]);

  // Stamp slam entrance
  const stampScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 9, stiffness: 220 },
    from: 2.2,
    to: 1.0,
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      {/* Flashing Urgent Alert Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#FF2E2E',
          color: '#FFFFFF',
          border: '4px solid #000000',
          boxShadow: '6px 6px 0px #000000',
          borderRadius: 9999,
          padding: '8px 24px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
          opacity: alertFlash,
        }}
      >
        <span style={{ fontSize: 20 }}>🚨</span>
        <span>BREAKING BULLETIN // OFFICIAL</span>
      </div>

      {/* Primary Newspaper Headline Card */}
      <div
        style={{
          width: '85%',
          maxWidth: 680,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          border: '6px solid #000000',
          boxShadow: '10px 10px 0px #000000',
          borderRadius: 24,
          padding: '24px 32px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 16,
            color: '#666666',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'block',
            marginBottom: 8,
          }}
        >
          T20 WORLD CUP SPECIAL EDITION
        </span>

        <h1
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 44,
            lineHeight: 1.15,
            color: '#000000',
            letterSpacing: '-0.02em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>

        {/* Slammed Official Stamp */}
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            right: 20,
            backgroundColor: '#FFFC00',
            color: '#000000',
            border: '4px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            borderRadius: 12,
            padding: '6px 16px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 15,
            textTransform: 'uppercase',
            transform: `scale(${stampScale}) rotate(-8deg)`,
            pointerEvents: 'none',
          }}
        >
          ★ THE KING RECLAIMS MCG
        </div>
      </div>
    </div>
  );
};
