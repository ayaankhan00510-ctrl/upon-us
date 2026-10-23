/**
 * Impostor Protocol - Role Assignment
 */

export type Role = 'crewmate' | 'impostor';

export interface PlayerRoleAssignment {
  playerId: string;
  role: Role;
  isAlive: boolean;
}

export function assignRoles(playerIds: string[], impostorCount: number): Map<string, PlayerRoleAssignment> {
  const assignments = new Map<string, PlayerRoleAssignment>();
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

  const actualImpostorCount = Math.max(1, Math.min(impostorCount, Math.floor(playerIds.length / 2)));
  const impostorIds = new Set(shuffled.slice(0, actualImpostorCount));

  for (const id of playerIds) {
    assignments.set(id, {
      playerId: id,
      role: impostorIds.has(id) ? 'impostor' : 'crewmate',
      isAlive: true,
    });
  }

  return assignments;
}
