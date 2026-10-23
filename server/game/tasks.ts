/**
 * Impostor Protocol - Tasks Definitions
 */

export interface TaskDefinition {
  id: string;
  name: string;
  room: string;
  type: 'common' | 'short' | 'long';
  totalSteps: number;
}

export const ALL_TASKS: TaskDefinition[] = [
  { id: 'fix_wiring', name: 'Fix Wiring', room: 'Electrical', type: 'common', totalSteps: 3 },
  { id: 'swipe_card', name: 'Swipe Card', room: 'Admin', type: 'common', totalSteps: 1 },
  { id: 'fuel_engines', name: 'Fuel Engines', room: 'Storage', type: 'long', totalSteps: 2 },
  { id: 'empty_garbage', name: 'Empty Garbage', room: 'Cafeteria', type: 'long', totalSteps: 2 },
  { id: 'download_data', name: 'Download Data', room: 'Cafeteria', type: 'long', totalSteps: 2 },
  { id: 'align_engine', name: 'Align Engine Output', room: 'Upper Engine', type: 'short', totalSteps: 1 },
  { id: 'clean_o2', name: 'Clean O2 Filter', room: 'O2', type: 'short', totalSteps: 1 },
  { id: 'prime_shields', name: 'Prime Shields', room: 'Shields', type: 'short', totalSteps: 1 },
  { id: 'calibrate_distributor', name: 'Calibrate Distributor', room: 'Electrical', type: 'short', totalSteps: 3 },
  { id: 'divert_power', name: 'Divert Power', room: 'Electrical', type: 'short', totalSteps: 2 },
  { id: 'start_reactor', name: 'Start Reactor', room: 'Reactor', type: 'long', totalSteps: 1 },
  { id: 'unlock_manifolds', name: 'Unlock Manifolds', room: 'Reactor', type: 'short', totalSteps: 1 },
  { id: 'inspect_sample', name: 'Inspect Sample', room: 'Medbay', type: 'long', totalSteps: 2 },
  { id: 'chart_course', name: 'Chart Course', room: 'Navigation', type: 'short', totalSteps: 1 },
  { id: 'stabilize_steering', name: 'Stabilize Steering', room: 'Navigation', type: 'short', totalSteps: 1 },
];
