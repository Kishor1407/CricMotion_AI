import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface TickerLayerProps {
  headline?: string;
  category?: string;
}

/**
 * REMOTION-11: Z-30 Scrolling News Ticker Bar
 * Continuous frame-driven lower-third marquee in Snapchat Neobrutalism branding.
 */
export const TickerLayer: React.FC<TickerLayerProps> = ({
  headline = '⚡ CRICMOTION AI // 9:16 VERTICAL AUTO-CUT',
  category = 'match-action',
}) => {
  const frame = useCurrentFrame();

  // Scroll offset: moves 5px per frame to the left
  const offset = (frame * 5) % 1200;

  const tickerText = `${headline} • 60FPS REMOTION COMPOSITING • LIVE TELEMETRY RADAR • ${headline} • CRICKET REEL GENERATOR • `;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 340,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#FFFC00',
        borderTop: '5px solid #000000',
        borderBottom: '5px solid #000000',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          transform: `translateX(-${offset}px)`,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: 22,
          color: '#000000',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </div>
  );
};
