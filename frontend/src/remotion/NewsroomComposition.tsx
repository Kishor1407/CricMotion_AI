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
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0A0A',
        fontFamily: 'Montserrat, sans-serif',
        overflow: 'hidden',
      }}
    >
      {scenes.map((scene) => {
        const fullAudioUrl = scene.audioUrl
          ? scene.audioUrl.startsWith('http')
            ? scene.audioUrl
            : `http://localhost:5050${scene.audioUrl}`
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
