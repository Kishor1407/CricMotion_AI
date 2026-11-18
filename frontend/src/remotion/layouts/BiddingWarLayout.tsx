import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface BiddingWarLayoutProps {
  amountCr?: number;
  title: string;
}

/**
 * REMOTION-04: Bidding War Layout
 * Auction gavel strike physics, exploding currency counters, and bidder paddles.
 */
export const BiddingWarLayout: React.FC<BiddingWarLayoutProps> = ({
  amountCr = 27.0,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gavel strike spring animation
  const gavelAngle = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: -45,
    to: 15,
  });

  // Currency counter animation ticking up
  const currentCr = interpolate(frame, [5, 35], [2.0, amountCr], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Shockwave ring scale on hammer hit (at frame 18)
  const shockwave = interpolate(frame, [15, 45], [0, 2.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shockOpacity = interpolate(frame, [15, 45], [0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Falling currency particles
  const particles = [
    { x: -140, y: (frame * 12) % 600, label: '₹ 10 CR', rotate: -12 },
    { x: 160, y: ((frame + 10) * 14) % 650, label: '₹ 20 CR', rotate: 18 },
    { x: -40, y: ((frame + 20) * 11) % 620, label: '₹ 27 CR', rotate: 6 },
    { x: 190, y: ((frame + 5) * 15) % 680, label: 'SOLD!', rotate: -8 },
  ];

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
      {/* Floating Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${p.x}px)`,
            top: `${p.y - 100}px`,
            backgroundColor: '#00F050',
            color: '#000000',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            borderRadius: 8,
            padding: '4px 10px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 16,
            transform: `rotate(${p.rotate}deg)`,
            pointerEvents: 'none',
            opacity: 0.9,
          }}
        >
          {p.label}
        </div>
      ))}

      {/* Hammer Gavel SVG */}
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 140,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Shockwave ring on strike */}
        <div
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 9999,
            border: '6px solid #FFFC00',
            transform: `scale(${shockwave})`,
            opacity: shockOpacity,
          }}
        />

        <div
          style={{
            transform: `rotate(${gavelAngle}deg)`,
            transformOrigin: 'bottom right',
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* Gavel Head */}
            <rect
              x="20"
              y="20"
              width="60"
              height="26"
              rx="6"
              fill="#FFFC00"
              stroke="#000000"
              strokeWidth="5"
            />
            {/* Gavel Handle */}
            <rect
              x="45"
              y="46"
              width="12"
              height="48"
              rx="4"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="4"
            />
            {/* Gold accents */}
            <line x1="28" y1="20" x2="28" y2="46" stroke="#000000" strokeWidth="3" />
            <line x1="72" y1="20" x2="72" y2="46" stroke="#000000" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Huge Brutalist Currency Card */}
      <div
        style={{
          backgroundColor: '#FFFC00',
          border: '6px solid #000000',
          boxShadow: '10px 10px 0px #000000',
          borderRadius: 24,
          padding: '24px 36px',
          textAlign: 'center',
          maxWidth: 720,
          transform: 'rotate(-1.5deg)',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 20,
            color: '#000000',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          AUCTION RECORD BROKEN
        </span>

        <div
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 68,
            lineHeight: 1,
            color: '#000000',
            letterSpacing: '-0.02em',
          }}
        >
          ₹ {currentCr.toFixed(2)} CR
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            backgroundColor: '#000000',
            color: '#FFFC00',
            padding: '6px 18px',
            borderRadius: 9999,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 900,
            fontSize: 16,
            textTransform: 'uppercase',
          }}
        >
          ★ RECORD HAMMER FALL
        </div>
      </div>
    </div>
  );
};
