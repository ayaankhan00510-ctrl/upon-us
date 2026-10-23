/**
 * Impostor Protocol - Game View
 * Connects 3D Spaceship Game Scene, network snapshots, and Game HUD overlay.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameSettings } from '../../shared/constants';
import { GameStateSnapshot } from '../../shared/events';
import { net } from '../net';
import { CameraViewMode } from '../render/cameraController';
import { GameScene } from '../render/gameScene';
import { GameHud } from './gameHud';

interface GameViewProps {
  settings: GameSettings;
  onLeave: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ settings, onLeave }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GameScene | null>(null);

  const [currentRoom, setCurrentRoom] = useState<string>('Cafeteria');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('third_person');
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: -14 });

  const socketId = net.getSocketId() || '';

  useEffect(() => {
    if (mountRef.current && !sceneRef.current) {
      sceneRef.current = new GameScene(mountRef.current, settings, socketId, (room) => {
        setCurrentRoom(room);
      });
    }

    const unsubSnapshot = net.onSnapshot((snapshot: GameStateSnapshot) => {
      if (sceneRef.current) {
        sceneRef.current.handleSnapshot(snapshot);
      }
    });

    // Update map marker pos
    const posTimer = setInterval(() => {
      if (sceneRef.current) {
        setPlayerPos({
          x: sceneRef.current.localPos.x,
          z: sceneRef.current.localPos.z,
        });
      }
    }, 100);

    return () => {
      unsubSnapshot();
      clearInterval(posTimer);
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [socketId, settings]);

  const handleToggleCamera = () => {
    if (sceneRef.current) {
      const newMode = sceneRef.current.cameraController.toggleViewMode();
      setCameraMode(newMode);
    }
  };

  const handleLeaveMatch = () => {
    net.leaveLobby();
    onLeave();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Game HUD Overlay */}
      <GameHud
        currentRoom={currentRoom}
        cameraMode={cameraMode}
        onToggleCamera={handleToggleCamera}
        onLeave={handleLeaveMatch}
        playerPos={playerPos}
      />
    </div>
  );
};
