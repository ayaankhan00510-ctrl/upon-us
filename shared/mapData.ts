/**
 * Impostor Protocol - Full Spaceship Map Definition (The Skeld layout)
 * 14 rooms, connecting corridors, wall line segments for collision, vents, and stations.
 */

export interface WallSegment {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  height?: number;
}

export interface MapRoom {
  id: string;
  name: string;
  color: string;
  floorHex: string;
  labelPos: { x: number; z: number };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface VentDefinition {
  id: string;
  room: string;
  x: number;
  z: number;
  connectedTo: string[];
}

export interface TaskStationSpot {
  id: string;
  taskId: string;
  name: string;
  room: string;
  x: number;
  z: number;
  step: number;
}

export const MAP_ROOMS_DETAIL: MapRoom[] = [
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    color: '#38bdf8',
    floorHex: '#1e293b',
    labelPos: { x: 0, z: -14 },
    bounds: { minX: -12, maxX: 12, minZ: -22, maxZ: -6 },
  },
  {
    id: 'medbay',
    name: 'Medbay',
    color: '#06b6d4',
    floorHex: '#134e4a',
    labelPos: { x: -16, z: -9 },
    bounds: { minX: -22, maxX: -12, minZ: -14, maxZ: -4 },
  },
  {
    id: 'upper_engine',
    name: 'Upper Engine',
    color: '#a855f7',
    floorHex: '#2e1065',
    labelPos: { x: -29, z: -14 },
    bounds: { minX: -36, maxX: -22, minZ: -20, maxZ: -8 },
  },
  {
    id: 'reactor',
    name: 'Reactor',
    color: '#ef4444',
    floorHex: '#450a0a',
    labelPos: { x: -44, z: -4 },
    bounds: { minX: -50, maxX: -38, minZ: -12, maxZ: 4 },
  },
  {
    id: 'security',
    name: 'Security',
    color: '#6366f1',
    floorHex: '#1e1b4b',
    labelPos: { x: -23, z: -2 },
    bounds: { minX: -28, maxX: -18, minZ: -6, maxZ: 2 },
  },
  {
    id: 'lower_engine',
    name: 'Lower Engine',
    color: '#a855f7',
    floorHex: '#2e1065',
    labelPos: { x: -29, z: 10 },
    bounds: { minX: -36, maxX: -22, minZ: 4, maxZ: 16 },
  },
  {
    id: 'electrical',
    name: 'Electrical',
    color: '#eab308',
    floorHex: '#422006',
    labelPos: { x: -16, z: 8 },
    bounds: { minX: -22, maxX: -10, minZ: 2, maxZ: 14 },
  },
  {
    id: 'storage',
    name: 'Storage',
    color: '#f97316',
    floorHex: '#431407',
    labelPos: { x: 0, z: 14 },
    bounds: { minX: -10, maxX: 10, minZ: 6, maxZ: 22 },
  },
  {
    id: 'admin',
    name: 'Admin',
    color: '#10b981',
    floorHex: '#064e3b',
    labelPos: { x: 15, z: 1 },
    bounds: { minX: 8, maxX: 22, minZ: -4, maxZ: 6 },
  },
  {
    id: 'communications',
    name: 'Communications',
    color: '#14b8a6',
    floorHex: '#042f2e',
    labelPos: { x: 14, z: 16 },
    bounds: { minX: 8, maxX: 20, minZ: 12, maxZ: 20 },
  },
  {
    id: 'shields',
    name: 'Shields',
    color: '#3b82f6',
    floorHex: '#172554',
    labelPos: { x: 25, z: 11 },
    bounds: { minX: 18, maxX: 32, minZ: 6, maxZ: 16 },
  },
  {
    id: 'navigation',
    name: 'Navigation',
    color: '#ec4899',
    floorHex: '#500724',
    labelPos: { x: 42, z: 0 },
    bounds: { minX: 36, maxX: 48, minZ: -6, maxZ: 6 },
  },
  {
    id: 'o2',
    name: 'O2',
    color: '#22c55e',
    floorHex: '#14532d',
    labelPos: { x: 17, z: -12 },
    bounds: { minX: 12, maxX: 22, minZ: -16, maxZ: -8 },
  },
  {
    id: 'weapons',
    name: 'Weapons',
    color: '#f97316',
    floorHex: '#3b0764',
    labelPos: { x: 27, z: -18 },
    bounds: { minX: 20, maxX: 34, minZ: -24, maxZ: -12 },
  },
];

// Corridors connecting the rooms
export interface Corridor {
  id: string;
  name: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const MAP_CORRIDORS: Corridor[] = [
  // West Main Hallway (Cafeteria to Medbay / Upper Engine)
  { id: 'hall_west', name: 'West Hallway', bounds: { minX: -22, maxX: -12, minZ: -18, maxZ: -14 } },
  // Upper Engine to Reactor
  { id: 'hall_upper_reactor', name: 'Upper Reactor Hallway', bounds: { minX: -38, maxX: -36, minZ: -16, maxZ: -10 } },
  // Reactor to Lower Engine / Security
  { id: 'hall_lower_reactor', name: 'Lower Reactor Hallway', bounds: { minX: -38, maxX: -36, minZ: 2, maxZ: 8 } },
  // Security Hallway
  { id: 'hall_security', name: 'Security Hallway', bounds: { minX: -26, maxX: -20, minZ: -2, maxZ: 4 } },
  // Lower Engine to Electrical & Storage
  { id: 'hall_lower_storage', name: 'Lower Storage Hallway', bounds: { minX: -22, maxX: -10, minZ: 14, maxZ: 18 } },
  // Cafeteria to Storage (Central Main Corridor)
  { id: 'hall_central', name: 'Main Corridor', bounds: { minX: -4, maxX: 4, minZ: -6, maxZ: 6 } },
  // East Main Hallway (Cafeteria to Weapons / O2)
  { id: 'hall_east', name: 'East Hallway', bounds: { minX: 12, maxX: 20, minZ: -20, maxZ: -16 } },
  // Weapons to Navigation
  { id: 'hall_weapons_nav', name: 'Weapons Navigation Hallway', bounds: { minX: 30, maxX: 38, minZ: -14, maxZ: -4 } },
  // Navigation to Shields
  { id: 'hall_nav_shields', name: 'Nav Shields Hallway', bounds: { minX: 30, maxX: 38, minZ: 4, maxZ: 12 } },
  // Shields to Storage / Comms
  { id: 'hall_shields_storage', name: 'Shields Storage Hallway', bounds: { minX: 10, maxX: 18, minZ: 6, maxZ: 10 } },
  // Storage to Admin
  { id: 'hall_storage_admin', name: 'Storage Admin Hallway', bounds: { minX: 6, maxX: 10, minZ: 0, maxZ: 4 } },
];

// Wall Segments for physics collision and raycast line-of-sight
export const MAP_WALLS: WallSegment[] = [
  // --- CAFETERIA ---
  { x1: -12, z1: -22, x2: 12, z2: -22 }, // North wall
  { x1: -12, z1: -22, x2: -12, z2: -18 }, // West upper
  // doorway at Z: -18 to -14
  { x1: -12, z1: -14, x2: -12, z2: -6 }, // West lower
  { x1: -12, z1: -6, x2: -4, z2: -6 }, // South west
  // central south door at X: -4 to 4
  { x1: 4, z1: -6, x2: 12, z2: -6 }, // South east
  { x1: 12, z1: -6, x2: 12, z2: -16 }, // East lower
  // doorway at Z: -16 to -20
  { x1: 12, z1: -20, x2: 12, z2: -22 }, // East upper

  // --- MEDBAY ---
  { x1: -22, z1: -14, x2: -16, z2: -14 },
  { x1: -22, z1: -14, x2: -22, z2: -4 },
  { x1: -22, z1: -4, x2: -14, z2: -4 },
  { x1: -14, z1: -4, x2: -14, z2: -8 },
  // doorway to hallway at Z: -14 to -12

  // --- UPPER ENGINE ---
  { x1: -36, z1: -20, x2: -22, z2: -20 },
  { x1: -22, z1: -20, x2: -22, z2: -16 },
  // doorway to West hall
  { x1: -22, z1: -12, x2: -22, z2: -8 },
  { x1: -22, z1: -8, x2: -36, z2: -8 },
  { x1: -36, z1: -8, x2: -36, z2: -12 },
  // doorway to Reactor upper hall at Z: -12 to -16
  { x1: -36, z1: -16, x2: -36, z2: -20 },

  // --- REACTOR ---
  { x1: -50, z1: -12, x2: -38, z2: -12 },
  // doorway at Z: -12 to -8
  { x1: -38, z1: -8, x2: -38, z2: 0 },
  // doorway at Z: 0 to 4
  { x1: -38, z1: 4, x2: -50, z2: 4 },
  { x1: -50, z1: 4, x2: -50, z2: -12 },

  // --- LOWER ENGINE ---
  { x1: -36, z1: 4, x2: -36, z2: 6 },
  // doorway from Reactor lower hall
  { x1: -36, z1: 10, x2: -36, z2: 16 },
  { x1: -36, z1: 16, x2: -22, z2: 16 },
  { x1: -22, z1: 16, x2: -22, z2: 12 },
  // doorway to Lower Storage hall
  { x1: -22, z1: 6, x2: -22, z2: 4 },
  { x1: -22, z1: 4, x2: -36, z2: 4 },

  // --- SECURITY ---
  { x1: -28, z1: -6, x2: -18, z2: -6 },
  { x1: -18, z1: -6, x2: -18, z2: -2 },
  // doorway at Z: -2 to 2
  { x1: -18, z1: 2, x2: -28, z2: 2 },
  { x1: -28, z1: 2, x2: -28, z2: -6 },

  // --- ELECTRICAL ---
  { x1: -22, z1: 2, x2: -14, z2: 2 },
  // doorway at X: -14 to -10
  { x1: -10, z1: 2, x2: -10, z2: 14 },
  { x1: -10, z1: 14, x2: -22, z2: 14 },
  { x1: -22, z1: 14, x2: -22, z2: 2 },

  // --- STORAGE ---
  { x1: -10, z1: 6, x2: -4, z2: 6 },
  // doorway from central corridor at X: -4 to 4
  { x1: 4, z1: 6, x2: 10, z2: 6 },
  { x1: 10, z1: 6, x2: 10, z2: 10 },
  // doorway to Shields/Comms hall at Z: 10 to 14
  { x1: 10, z1: 14, x2: 10, z2: 22 },
  { x1: 10, z1: 22, x2: -10, z2: 22 },
  { x1: -10, z1: 22, x2: -10, z2: 16 },
  // doorway to Electrical hall at Z: 14 to 16
  { x1: -10, z1: 12, x2: -10, z2: 6 },

  // --- ADMIN ---
  { x1: 8, z1: -4, x2: 22, z2: -4 },
  { x1: 22, z1: -4, x2: 22, z2: 6 },
  { x1: 22, z1: 6, x2: 14, z2: 6 },
  // doorway to Storage hall at X: 14 to 8
  { x1: 8, z1: 4, x2: 8, z2: -4 },

  // --- COMMUNICATIONS ---
  { x1: 8, z1: 12, x2: 20, z2: 12 },
  { x1: 20, z1: 12, x2: 20, z2: 20 },
  { x1: 20, z1: 20, x2: 8, z2: 20 },
  { x1: 8, z1: 20, x2: 8, z2: 16 },
  // doorway at Z: 16 to 12

  // --- SHIELDS ---
  { x1: 18, z1: 6, x2: 32, z2: 6 },
  { x1: 32, z1: 6, x2: 32, z2: 10 },
  // doorway to Nav hall at Z: 10 to 14
  { x1: 32, z1: 14, x2: 32, z2: 16 },
  { x1: 32, z1: 16, x2: 18, z2: 16 },
  { x1: 18, z1: 16, x2: 18, z2: 10 },
  // doorway to Storage hall

  // --- NAVIGATION ---
  { x1: 36, z1: -6, x2: 48, z2: -6 },
  { x1: 48, z1: -6, x2: 48, z2: 6 },
  { x1: 48, z1: 6, x2: 36, z2: 6 },
  { x1: 36, z1: 6, x2: 36, z2: 2 },
  // doorway to Shields/Weapons hall at Z: 2 to -2
  { x1: 36, z1: -2, x2: 36, z2: -6 },

  // --- O2 ---
  { x1: 12, z1: -16, x2: 22, z2: -16 },
  { x1: 22, z1: -16, x2: 22, z2: -8 },
  { x1: 22, z1: -8, x2: 16, z2: -8 },
  // doorway to East hall
  { x1: 12, z1: -8, x2: 12, z2: -16 },

  // --- WEAPONS ---
  { x1: 20, z1: -24, x2: 34, z2: -24 },
  { x1: 34, z1: -24, x2: 34, z2: -12 },
  { x1: 34, z1: -12, x2: 26, z2: -12 },
  // doorway to East / Nav hall
  { x1: 22, z1: -12, x2: 20, z2: -12 },
  { x1: 20, z1: -12, x2: 20, z2: -24 },
];

export const CAFETERIA_TABLE_CENTER = { x: 0, z: -14 };
export const SPAWN_RADIUS = 3.5;

export function getSpawnPosition(playerIndex: number, totalPlayers: number = 10): { x: number; z: number } {
  const angle = (playerIndex / Math.max(totalPlayers, 1)) * Math.PI * 2;
  return {
    x: CAFETERIA_TABLE_CENTER.x + Math.sin(angle) * SPAWN_RADIUS,
    z: CAFETERIA_TABLE_CENTER.z + Math.cos(angle) * SPAWN_RADIUS,
  };
}

export function detectRoom(x: number, z: number): string {
  for (const room of MAP_ROOMS_DETAIL) {
    if (x >= room.bounds.minX && x <= room.bounds.maxX && z >= room.bounds.minZ && z <= room.bounds.maxZ) {
      return room.name;
    }
  }
  for (const corridor of MAP_CORRIDORS) {
    if (
      x >= corridor.bounds.minX &&
      x <= corridor.bounds.maxX &&
      z >= corridor.bounds.minZ &&
      z <= corridor.bounds.maxZ
    ) {
      return corridor.name;
    }
  }
  return 'Corridor';
}
