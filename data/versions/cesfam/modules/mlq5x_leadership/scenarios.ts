import type { ScenarioFile } from '../../../../../types';
import * as day03Sequence01 from './scenarios/day03/sequence01';
import * as day03Sequence03 from './scenarios/day03/sequence03';
import * as day03Sequence04 from './scenarios/day03/sequence04';
import * as day03Sequence05 from './scenarios/day03/sequence05';

const scenarioModules = [
  day03Sequence01,
  day03Sequence03,
  day03Sequence04,
  day03Sequence05,
];

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_MLQ5X_LEADERSHIP',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
