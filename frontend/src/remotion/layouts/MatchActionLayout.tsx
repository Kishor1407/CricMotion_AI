import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface MatchActionLayoutProps {
  speedKph?: number;
  batSpeedKph?: number;
  title: string;
}

/**
 * REMOTION-05: Match Action Layout
 * High-speed telemetry speedometer dial, ball tracer physics, and high-impact match badges.
 */
export const MatchActionLayout: React.FC<MatchActionLayoutProps> = ({
  speedKph = 149.2,
  batSpeedKph = 138.0,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Speedometer needle spring animation
  const needleRotation = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 140 },
    from: -90,
    to: 55,
  });

  // Telemetry number readout ticking up
  const currentSpeed = interpolate(frame, [0, 20], [80, speedKph], {
    extrapolateRight: 'clamp',
  });

  // Ball tracer motion across the scene
  const tracerProgress = interpolate(frame, [10, 45], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Particle fire burst
  const burstScale = spring({
    frame: frame - 18,
    fps,
    config: { damping: 8, stiffness: 200 },
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
      {/* Telemetry Speed Radar HUD Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          backgroundColor: '#0A0A0A',
          border: '5px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          borderRadius: 24,
          padding: '16px 28px',
          marginBottom: 24,
          transform: 'rotate(-2deg)',
        }}
      >
        {/* Analog Speedometer Dial SVG */}
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          <svg width="90" height="90" viewBox="0 0 100 100">
            {/* Speed Gauge Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="10"
              strokeDasharray="188"
              strokeDashoffset="45"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#FFFC00"
              strokeWidth="10"
              strokeDasharray="188"
              strokeDashoffset="75"
            />
            {/* Rotating Needle */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#FF2E2E"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${needleRotation} 50 50)`}
            />
            <circle cx="50" cy="50" r="7" fill="#000000" stroke="#FFFFFF" strokeWidth="3" />
          </svg>
        </div>

        {/* Speed Readout */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 14,
              color: '#FFFC00',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            SPEED RADAR
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 48,
              lineHeight: 1,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            {currentSpeed.toFixed(1)}{' '}
            <span style={{ fontSize: 24, color: '#FFFC00' }}>KPH</span>
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: 13,
              color: '#A0A0A0',
              marginTop: 4,
            }}
          >
            BAT SPEED: {batSpeedKph} KPH
          </span>
        </div>
      </div>

      {/* Ball Tracer Graphic */}
      <div
        style={{
          width: '78%',
          height: 8,
          backgroundColor: '#1E1E1E',
          borderRadius: 9999,
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 20,
          border: '2px solid #000000',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${tracerProgress}%`,
            background: 'linear-gradient(90deg, #FFFC00, #FF2E2E)',
            boxShadow: '0 0 12px #FFFC00',
          }}
        />
      </div>

      {/* High-Impact Situation Badge */}
      <div
        style={{
          backgroundColor: '#FFFC00',
          color: '#000000',
          border: '4px solid #000000',
          boxShadow: '6px 6px 0px #000000',
          borderRadius: 16,
          padding: '12px 24px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: 22,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>⚡ 28 NEEDED OFF 8 BALLS</span>
        <span
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 14,
          }}
        >
          CLIMAX
        </span>
      </div>
    </div>
  );
};
