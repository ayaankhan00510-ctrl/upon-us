/**
 * Impostor Protocol - Shared Socket Event Definitions and Payloads
 */

import { GameSettings, GameState, MeetingSubstate } from './constants';

export const EVENTS = {
  // Client -> Server
  CREATE_LOBBY: 'createLobby',
  JOIN_LOBBY: 'joinLobby',
  LEAVE_LOBBY: 'leaveLobby',
  UPDATE_SETTINGS: 'updateSettings',
  SET_COLOR: 'setColor',
  SET_HAT: 'setHat',
  KICK_PLAYER: 'kickPlayer',
  START_GAME: 'startGame',
  START_TEST_GAME: 'startTestGame', // Host can start in test mode with 1-3 players
  LOBBY_INPUT: 'lobbyInput',
  PLAYER_INPUT: 'playerInput',
  USE_TASK: 'useTask',
  COMPLETE_TASK_STEP: 'completeTaskStep',
  KILL_ATTEMPT: 'killAttempt',
  REPORT_BODY: 'reportBody',
  CALL_EMERGENCY: 'callEmergency',
  VENT_ENTER: 'ventEnter',
  VENT_MOVE: 'ventMove',
  VENT_EXIT: 'ventExit',
  SABOTAGE: 'sabotage',
  FIX_SABOTAGE: 'fixSabotage',
  CHAT_MESSAGE: 'chatMessage',
  CAST_VOTE: 'castVote',
  REJOIN: 'rejoin',

  // Server -> Client
  LOBBY_STATE: 'lobbyState',
  LOBBY_ERROR: 'lobbyError',
  LOBBY_MOVEMENT_SYNC: 'lobbyMovementSync',
  GAME_STARTING: 'gameStarting',
  GAME_STARTED: 'gameStarted',
  STATE_SNAPSHOT: 'stateSnapshot',
  PLAYER_KILLED: 'playerKilled',
  BODY_LIST: 'bodyList',
  MEETING_STARTED: 'meetingStarted',
  CHAT_BROADCAST: 'chatBroadcast',
  VOTE_PROGRESS: 'voteProgress',
  VOTE_RESULTS: 'voteResults',
  EJECTION: 'ejection',
  TASK_PROGRESS: 'taskProgress',
  SABOTAGE_STARTED: 'sabotageStarted',
  SABOTAGE_UPDATED: 'sabotageUpdated',
  SABOTAGE_RESOLVED: 'sabotageResolved',
  GAME_OVER: 'gameOver',
  ERROR_MESSAGE: 'errorMessage',
} as const;

export interface LobbyPlayer {
  id: string; // Socket ID
  name: string;
  colorId: string;
  hatId: string;
  isHost: boolean;
  isReady?: boolean;
  x: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  isAlive?: boolean;
  room?: string;
}

export interface LobbyData {
  code: string;
  hostId: string;
  isPrivate: boolean;
  players: LobbyPlayer[];
  settings: GameSettings;
  state: GameState;
  startingCountdown?: number;
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  colorId: string;
  hatId: string;
  isHost: boolean;
  x: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  isAlive: boolean;
  room: string;
}

export interface GameStateSnapshot {
  state: GameState;
  players: Record<string, PlayerSnapshot>;
  timestamp: number;
}
