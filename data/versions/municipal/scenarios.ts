import type { ScenarioFile } from '../../../types';
import * as day01 from './scenarios/day01';

const scenarioModules = [
  day01
];

export const scenarios: ScenarioFile = {
  simulation_id: 'MUNICIPAL',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
