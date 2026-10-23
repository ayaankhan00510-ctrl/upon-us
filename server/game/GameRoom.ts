/**
 * Impostor Protocol - Game Room
 * Server-authoritative match simulation at 20 Hz with wall collision and state broadcasting.
 */

import { Server, Socket } from 'socket.io';
import { GameSettings, GAME_STATES, GameState } from '../../shared/constants';
import { EVENTS, GameStateSnapshot, PlayerSnapshot } from '../../shared/events';
import { detectRoom, getSpawnPosition } from '../../shared/mapData';
import { resolveWallCollisions } from '../../shared/physics';
import { assignRoles, PlayerRoleAssignment } from './roles';
import { GameStateMachine } from './stateMachine';

export class GameRoom {
  public code: string;
  public io: Server;
  public settings: GameSettings;
  public stateMachine: GameStateMachine;
  public roles: Map<string, PlayerRoleAssignment> = new Map();
  public players: Map<string, PlayerSnapshot> = new Map();

  private tickInterval: NodeJS.Timeout | null = null;
  private lastTickTime: number = Date.now();

  constructor(
    code: string,
    io: Server,
    settings: GameSettings,
    lobbyPlayers: { id: string; name: string; colorId: string; hatId: string; isHost: boolean }[]
  ) {
    this.code = code;
    this.io = io;
    this.settings = settings;
    this.stateMachine = new GameStateMachine();

    // Assign roles
    const playerIds = lobbyPlayers.map((p) => p.id);
    this.roles = assignRoles(playerIds, settings.impostorCount);

    // Initialize players at Cafeteria spawn spots
    lobbyPlayers.forEach((lp, idx) => {
      const spawn = getSpawnPosition(idx, lobbyPlayers.length);
      const snapshot: PlayerSnapshot = {
        id: lp.id,
        name: lp.name,
        colorId: lp.colorId,
        hatId: lp.hatId,
        isHost: lp.isHost,
        x: spawn.x,
        z: spawn.z,
        rotation: 0,
        isMoving: false,
        isAlive: true,
        room: 'Cafeteria',
      };
      this.players.set(lp.id, snapshot);
    });

    this.stateMachine.transitionTo(GAME_STATES.PLAYING);
    this.startSimulation();
  }

  public handlePlayerInput(
    socketId: string,
    input: { seq: number; x: number; z: number; rotation: number; isMoving: boolean }
  ): void {
    const player = this.players.get(socketId);
    if (!player || !player.isAlive) return;

    // Authoritative collision resolution against map walls
    const resolved = resolveWallCollisions(input.x, input.z);
    player.x = resolved.x;
    player.z = resolved.z;
    player.rotation = input.rotation || 0;
    player.isMoving = !!input.isMoving;
    player.room = detectRoom(player.x, player.z);
  }

  public removePlayer(socketId: string): void {
    this.players.delete(socketId);
    this.roles.delete(socketId);
  }

  private startSimulation(): void {
    this.lastTickTime = Date.now();
    // 20 Hz simulation tick (50ms)
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 50);
  }

  private tick(): void {
    const now = Date.now();
    const playersObj: Record<string, PlayerSnapshot> = {};

    for (const [id, p] of this.players) {
      playersObj[id] = { ...p };
    }

    const snapshot: GameStateSnapshot = {
      state: this.stateMachine.currentState,
      players: playersObj,
      timestamp: now,
    };

    // Broadcast snapshot to all players in the room
    this.io.to(this.code).emit(EVENTS.STATE_SNAPSHOT, snapshot);
  }

  public destroy(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
