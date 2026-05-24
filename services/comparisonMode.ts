// Define si el simulador resuelve comparaciones en frontend o delega el resultado final al backend.
import type { ComparisonMode } from '../types';

const rawMode = ((import.meta as any)?.env?.VITE_COMPARISON_MODE ?? 'frontend')
  .toString()
  .trim()
  .toLowerCase();

export const COMPARISON_MODE: ComparisonMode = rawMode === 'backend' ? 'backend' : 'frontend';

export const isFrontendComparisonMode = COMPARISON_MODE === 'frontend';
