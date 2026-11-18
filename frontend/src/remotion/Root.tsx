import React from 'react';
import { Composition } from 'remotion';
import { NewsroomComposition } from './NewsroomComposition';
import { NewsroomCompositionProps } from './types';

export const RemotionRoot: React.FC = () => {
  const defaultProps: NewsroomCompositionProps = {
    scenes: [
      {
        sceneNumber: 1,
        title: 'The Unthinkable Equation',
        narration: '28 needed off 8 balls at the MCG. 90,000 screaming fans, Pakistan on the verge of victory.',
        startSeconds: 0,
        endSeconds: 10,
        startFrame: 0,
        durationInFrames: 300,
        contextCategory: 'match-action',
        tickerHeadline: '⚡ 28 NEEDED OFF 8 BALLS // T20 WORLD CUP CLIMAX',
        wordTimestamps: [],
      },
    ],
    avatarVideoUrl: '/uploads/avatars/default_presenter.mp4',
    totalDurationInFrames: 300,
    fps: 30,
  };

  return (
    <>
      <Composition
        id="NewsroomComposition"
        component={NewsroomComposition as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps as any}
      />
    </>
  );
};
