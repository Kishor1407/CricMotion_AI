import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface StatExplosionLayoutProps {
  winProbability?: number;
  title: string;
}

/**
 * REMOTION-06: Stat Explosion Layout
 * Head-to-head comparison cards, dynamic win probability meters, and strike rate metrics.
 */
export const StatExplosionLayout: React.FC<StatExplosionLayoutProps> = ({
  winProbability = 88,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Probability progress bar animation
  const animatedWinProb = interpolate(frame, [0, 25], [12, winProbability], {
    extrapolateRight: 'clamp',
  });

  // Card slide-in spring
  const slideIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
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
      {/* Dual Comparison Cards */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          width: '85%',
          maxWidth: 640,
          marginBottom: 20,
          transform: `scale(${slideIn})`,
        }}
      >
        {/* Card 1: Player / Shot */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#FFFC00',
            color: '#000000',
            border: '5px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
            }}
          >
            SHOT DISTANCE
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 42,
              lineHeight: 1.1,
              display: 'block',
            }}
          >
            105<span style={{ fontSize: 22 }}>M</span>
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              fontSize: 12,
              backgroundColor: '#000000',
              color: '#FFFC00',
              padding: '2px 8px',
              borderRadius: 6,
              display: 'inline-block',
              marginTop: 4,
            }}
          >
            OVER LONG-ON
          </span>
        </div>

        {/* Card 2: Strike Rate */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            border: '5px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 13,
              color: '#FFFC00',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
            }}
          >
            DEATH OVERS S/R
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 42,
              lineHeight: 1.1,
              display: 'block',
              color: '#00F050',
            }}
          >
            212.5
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              fontSize: 12,
              color: '#A0A0A0',
              display: 'inline-block',
              marginTop: 4,
            }}
          >
            PEAK IMPACT
          </span>
        </div>
      </div>

      {/* Win Probability Bar */}
      <div
        style={{
          width: '85%',
          maxWidth: 640,
          backgroundColor: '#000000',
          border: '5px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          borderRadius: 20,
          padding: '16px 22px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 14,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
            }}
          >
            WIN PROBABILITY METER
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 900,
              fontSize: 22,
              color: '#FFFC00',
            }}
          >
            {animatedWinProb.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div
          style={{
            height: 18,
            backgroundColor: '#222222',
            borderRadius: 9999,
            overflow: 'hidden',
            border: '2px solid #000000',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${animatedWinProb}%`,
              backgroundColor: '#FFFC00',
              borderRadius: 9999,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};
