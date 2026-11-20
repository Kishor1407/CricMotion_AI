import React from 'react';
import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { NewsroomCompositionProps } from './types';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { PresenterLayer } from './layers/PresenterLayer';
import { PhysicsLayer } from './layers/PhysicsLayer';
import { TickerLayer } from './layers/TickerLayer';
import { CaptionsLayer } from './layers/CaptionsLayer';

/**
 * REMOTION-02: Master 9:16 Newsroom Composition
 * 1080x1920 portrait composition orchestrating all 5 layers across timeline scenes.
 */
export const NewsroomComposition: React.FC<NewsroomCompositionProps> = ({
  scenes,
  avatarVideoUrl,
}) => {
  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#0A0A0A',
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 36,
            backgroundColor: '#FFFC00',
            border: '6px solid #000000',
            boxShadow: '8px 8px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 64 }}>⚡</span>
        </div>
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: 40,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          Ready to Create
        </h2>
        <p
          style={{
            color: '#9CA3AF',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.4,
            maxWidth: 600,
          }}
        >
          Type a cricket prompt below to generate your 9:16 vertical reel!
        </p>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0A0A',
        fontFamily: 'Montserrat, sans-serif',
        overflow: 'hidden',
      }}
    >
      {scenes.map((scene) => {
        const backendBase =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          (typeof window !== 'undefined' ? '' : 'http://localhost:5050');
        const fullAudioUrl = scene.audioUrl
          ? scene.audioUrl.startsWith('http')
            ? scene.audioUrl
            : `${backendBase}${scene.audioUrl}`
          : undefined;

        return (
          <Sequence
            key={`scene-${scene.sceneNumber}-${scene.startFrame}`}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
          >
            {/* Z-0: Newsroom Background Layer */}
            <BackgroundLayer
              durationInFrames={scene.durationInFrames}
              category={scene.contextCategory}
            />

            {/* Z-10: Presenter Avatar Layer */}
            <PresenterLayer avatarVideoUrl={avatarVideoUrl} />

            {/* Z-20: Overhead Physics & Telemetry Layer */}
            <PhysicsLayer scene={scene} />

            {/* Z-30: Scrolling News Ticker Lower-Third */}
            <TickerLayer
              headline={scene.tickerHeadline}
              category={scene.contextCategory}
            />

            {/* Z-40: Kinetic Captions Layer */}
            <CaptionsLayer
              wordTimestamps={scene.wordTimestamps}
              narration={scene.narration}
            />

            {/* Audio Voiceover Layer */}
            {fullAudioUrl && <Audio src={fullAudioUrl} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
