'use client';

import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { NewsroomComposition } from './NewsroomComposition';
import { RemotionScene } from './types';

interface PlayerWrapperProps {
  scenes: RemotionScene[];
  avatarVideoUrl?: string;
  totalDurationInFrames: number;
  isPlaying?: boolean;
  onPlayChange?: (playing: boolean) => void;
  onFrameUpdate?: (frame: number) => void;
}

/**
 * REMOTION-13: Client @remotion/player In-Browser Live Stage
 * High-performance 30/60 FPS client video player embedded inside the Neobrutalist iPhone chassis.
 */
export const PlayerWrapper: React.FC<PlayerWrapperProps> = ({
  scenes,
  avatarVideoUrl,
  totalDurationInFrames,
  isPlaying,
  onPlayChange,
  onFrameUpdate,
}) => {
  const playerRef = useRef<PlayerRef>(null);

  // Synchronize external play/pause state with Remotion Player
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  // Listen to frame updates from Player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = () => {
      const frame = player.getCurrentFrame();
      if (onFrameUpdate) onFrameUpdate(frame);
    };

    const onPlay = () => {
      if (onPlayChange) onPlayChange(true);
    };

    const onPause = () => {
      if (onPlayChange) onPlayChange(false);
    };

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [onFrameUpdate, onPlayChange]);

  const duration = Math.max(30, totalDurationInFrames);

  return (
    <div className="relative w-full h-full bg-black rounded-[30px] overflow-hidden">
      <Player
        ref={playerRef}
        component={NewsroomComposition}
        inputProps={{
          scenes,
          avatarVideoUrl,
          totalDurationInFrames: duration,
        }}
        durationInFrames={duration}
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        loop
        autoPlay={false}
      />
    </div>
  );
};
