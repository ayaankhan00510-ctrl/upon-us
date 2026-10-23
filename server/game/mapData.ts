/**
 * Impostor Protocol - Map Data
 * Defines room boundaries, meeting table center, vents, and spawn positions.
 */

export interface MapRoom {
  id: string;
  name: string;
  color: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const MAP_ROOMS: MapRoom[] = [
  { id: 'cafeteria', name: 'Cafeteria', color: '#3b82f6', bounds: { minX: -10, maxX: 10, minZ: -12, maxZ: 0 } },
  { id: 'medbay', name: 'Medbay', color: '#06b6d4', bounds: { minX: -18, maxX: -10, minZ: -8, maxZ: 0 } },
  { id: 'upper_engine', name: 'Upper Engine', color: '#8b5cf6', bounds: { minX: -26, maxX: -18, minZ: -14, maxZ: -6 } },
  { id: 'reactor', name: 'Reactor', color: '#ef4444', bounds: { minX: -34, maxX: -26, minZ: -10, maxZ: 2 } },
  { id: 'security', name: 'Security', color: '#6366f1', bounds: { minX: -22, maxX: -14, minZ: -4, maxZ: 2 } },
  { id: 'lower_engine', name: 'Lower Engine', color: '#8b5cf6', bounds: { minX: -26, maxX: -18, minZ: 4, maxZ: 12 } },
  { id: 'electrical', name: 'Electrical', color: '#eab308', bounds: { minX: -16, maxX: -8, minZ: 4, maxZ: 12 } },
  { id: 'storage', name: 'Storage', color: '#d97706', bounds: { minX: -8, maxX: 4, minZ: 6, maxZ: 16 } },
  { id: 'admin', name: 'Admin', color: '#10b981', bounds: { minX: 4, maxX: 14, minZ: 0, maxZ: 8 } },
  { id: 'communications', name: 'Communications', color: '#14b8a6', bounds: { minX: 4, maxX: 14, minZ: 10, maxZ: 16 } },
  { id: 'shields', name: 'Shields', color: '#3b82f6', bounds: { minX: 14, maxX: 22, minZ: 6, maxZ: 14 } },
  { id: 'navigation', name: 'Navigation', color: '#ec4899', bounds: { minX: 24, maxX: 34, minZ: -4, maxZ: 4 } },
  { id: 'o2', name: 'O2', color: '#22c55e', bounds: { minX: 10, maxX: 18, minZ: -6, maxZ: 0 } },
  { id: 'weapons', name: 'Weapons', color: '#f97316', bounds: { minX: 14, maxX: 24, minZ: -14, maxZ: -6 } },
];
