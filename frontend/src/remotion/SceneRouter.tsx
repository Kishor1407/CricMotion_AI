import React from 'react';
import { RemotionScene } from './types';
import { BiddingWarLayout } from './layouts/BiddingWarLayout';
import { MatchActionLayout } from './layouts/MatchActionLayout';
import { StatExplosionLayout } from './layouts/StatExplosionLayout';
import { NewsHeadlineLayout } from './layouts/NewsHeadlineLayout';

interface SceneRouterProps {
  scene: RemotionScene;
}

/**
 * REMOTION-03: Dynamic Scene Router
 * Maps contextCategory to specialized Remotion layouts.
 */
export const SceneRouter: React.FC<SceneRouterProps> = ({ scene }) => {
  switch (scene.contextCategory) {
    case 'auction-financial':
      return (
        <BiddingWarLayout
          amountCr={scene.metrics?.auctionAmountCr || 27.0}
          title={scene.title}
        />
      );
    case 'match-action':
      return (
        <MatchActionLayout
          speedKph={scene.metrics?.speedKph || 149.2}
          batSpeedKph={scene.metrics?.batSpeedKph || 138.0}
          title={scene.title}
        />
      );
    case 'stats-comparison':
      return (
        <StatExplosionLayout
          winProbability={scene.metrics?.winProbability || 88}
          title={scene.title}
        />
      );
    case 'news-headline':
    default:
      return <NewsHeadlineLayout title={scene.title} />;
  }
};
