/**
 * Impostor Protocol - In-Game HUD & Map Overlay
 * Floating room banner, camera view toggle (V key), schematic map (Tab/M), and action buttons.
 */

import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Video,
  Settings,
  Eye,
  LogOut,
  Sparkles,
  Hand,
  Megaphone,
  Skull,
  Wind,
  X,
  Volume2,
} from 'lucide-react';
import { MAP_ROOMS_DETAIL } from '../../shared/mapData';
import { soundEngine } from '../audio';
import { CameraViewMode } from '../render/cameraController';

interface GameHudProps {
  currentRoom: string;
  cameraMode: CameraViewMode;
  onToggleCamera: () => void;
  onLeave: () => void;
  playerPos: { x: number; z: number };
}

export const GameHud: React.FC<GameHudProps> = ({
  currentRoom,
  cameraMode,
  onToggleCamera,
  onLeave,
  playerPos,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings
  const [sensitivity, setSensitivity] = useState(50);
  const [headBob, setHeadBob] = useState(true);

  // Key listeners for M/Tab (Map)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' || e.code === 'Tab') {
        e.preventDefault();
        soundEngine.playClick();
        setShowMap((prev) => !prev);
      }
      if (e.code === 'Escape') {
        setShowMap(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4">
      {/* TOP BAR */}
      <div className="w-full flex items-start justify-between">
        {/* Left: Map & Camera View Pill */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowMap((prev) => !prev);
            }}
            className={`p-2.5 rounded-2xl backdrop-blur-md border-2 transition-all cursor-pointer shadow-xl flex items-center space-x-2 ${
              showMap
                ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black'
                : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 text-cyan-300'
            }`}
            title="Toggle Map (Tab / M)"
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-xs font-black tracking-wider hidden sm:inline">MAP (M)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleCamera();
            }}
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border-2 border-slate-700/80 text-slate-200 hover:text-white transition-all cursor-pointer shadow-xl flex items-center space-x-2"
            title="Toggle First / Third Person (V key)"
          >
            {cameraMode === 'third_person' ? <Eye className="w-5 h-5 text-cyan-400" /> : <Video className="w-5 h-5 text-yellow-400" />}
            <span className="text-xs font-black tracking-wider hidden sm:inline">
              {cameraMode === 'third_person' ? '3RD PERSON [V]' : '1ST PERSON [V]'}
            </span>
          </button>
        </div>

        {/* Center: Dynamic Room Name Banner */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/90 backdrop-blur-md px-6 py-2 rounded-2xl border-2 border-slate-700/90 shadow-2xl flex items-center space-x-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
            <span className="text-base sm:text-lg font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-100">
              {currentRoom}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Spaceship Skeld • Deck 1
          </span>
        </div>

        {/* Right: Settings & Exit */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowSettings(true);
            }}
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border-2 border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onLeave}
            className="p-2.5 rounded-2xl bg-red-950/85 hover:bg-red-900 backdrop-blur-md border-2 border-red-700/80 text-red-200 hover:text-white transition-all shadow-xl cursor-pointer"
            title="Leave Match"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* BOTTOM-RIGHT ACTION BUTTONS */}
      <div className="w-full flex items-end justify-between">
        {/* Controls Hint on bottom left */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs text-slate-400 font-medium hidden md:block">
          <div><strong className="text-cyan-300">WASD / Arrows:</strong> Walk</div>
          <div><strong className="text-cyan-300">Mouse Drag:</strong> Orbit Camera</div>
          <div><strong className="text-cyan-300">V:</strong> Toggle 1st/3rd Person</div>
          <div><strong className="text-cyan-300">Tab / M:</strong> Ship Map</div>
        </div>

        {/* Bottom Right Action Buttons */}
        <div className="flex items-center space-x-3 pointer-events-auto ml-auto">
          {/* USE BUTTON */}
          <button
            onClick={() => soundEngine.playClick()}
            className="flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_8px_20px_rgba(6,182,212,0.4)] border-2 border-cyan-300 cursor-pointer active:scale-95 transition-all"
          >
            <Hand className="w-7 h-7 sm:w-8 sm:h-8 fill-current mb-0.5" />
            <span className="text-[11px] tracking-wider text-slate-950">USE [E]</span>
          </button>

          {/* REPORT BUTTON */}
          <button
            onClick={() => soundEngine.playClick()}
            className="flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/80 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-60"
            disabled
          >
            <Megaphone className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5" />
            <span className="text-[11px] tracking-wider">REPORT</span>
          </button>
        </div>
      </div>

      {/* FULL SCHEMATIC MAP MODAL (Tab / M) */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto">
          <div className="relative w-full max-w-4xl bg-slate-950 border-2 border-cyan-500/80 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-black text-cyan-300 tracking-wider">
                  THE SKELD • SHIP BLUEPRINT
                </h3>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schematic SVG Map */}
            <div className="relative w-full aspect-[16/9] bg-slate-900/90 rounded-2xl border-2 border-slate-800 p-2 overflow-hidden flex items-center justify-center">
              <svg viewBox="-55 -28 110 56" className="w-full h-full">
                {/* Rooms */}
                {MAP_ROOMS_DETAIL.map((r) => {
                  const width = r.bounds.maxX - r.bounds.minX;
                  const height = r.bounds.maxZ - r.bounds.minZ;
                  return (
                    <g key={r.id}>
                      <rect
                        x={r.bounds.minX}
                        y={r.bounds.minZ}
                        width={width}
                        height={height}
                        fill={r.floorHex}
                        stroke={r.color}
                        strokeWidth="0.6"
                        rx="1"
                        opacity="0.85"
                      />
                      <text
                        x={r.labelPos.x}
                        y={r.labelPos.z}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize="2.2"
                        fontWeight="bold"
                        fontFamily="Fredoka, sans-serif"
                      >
                        {r.name}
                      </text>
                    </g>
                  );
                })}

                {/* Local Player Marker */}
                <circle
                  cx={playerPos.x}
                  cy={playerPos.z}
                  r="1.4"
                  fill="#facc15"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
                <circle
                  cx={playerPos.x}
                  cy={playerPos.z}
                  r="2.5"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="0.3"
                  opacity="0.8"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                <span className="font-bold text-yellow-300">Your Current Position</span>
              </div>
              <span>Press [Tab] or [M] to close map</span>
            </div>
          </div>
        </div>
      )}

      {/* COMFORT & CAMERA SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-black text-white">CAMERA & COMFORT</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>CAMERA SENSITIVITY</span>
                  <span>{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
                <span>FIRST-PERSON HEAD BOB</span>
                <button
                  onClick={() => setHeadBob(!headBob)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    headBob ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {headBob ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
                <span>CAMERA MODE</span>
                <button
                  onClick={onToggleCamera}
                  className="px-3 py-1 rounded-lg font-bold bg-cyan-600 text-white cursor-pointer"
                >
                  {cameraMode === 'third_person' ? '3RD PERSON' : '1ST PERSON'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl cursor-pointer"
            >
              APPLY & RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
