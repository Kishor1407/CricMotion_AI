import React from 'react';
import { RemotionScene } from '../types';
import { SceneRouter } from '../SceneRouter';

interface PhysicsLayerProps {
  scene: RemotionScene;
}

/**
 * REMOTION-10: Z-20 Overhead Physics & Telemetry Layer
 * Hosts the dynamic context layouts with spring transitions.
 */
export const PhysicsLayer: React.FC<PhysicsLayerProps> = ({ scene }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <SceneRouter scene={scene} />
    </div>
  );
};
