import type { ScenarioFile } from '../../../../../types';
import * as day03Sequence01 from './scenarios/day03/sequence01';
import * as day03Sequence03 from './scenarios/day03/sequence03';
import * as day03Sequence04 from './scenarios/day03/sequence04';
import * as day03Sequence05 from './scenarios/day03/sequence05';
import * as day04Sequence08 from './scenarios/day04/sequence08';
import * as day04Sequence09 from './scenarios/day04/sequence09';
import * as day04Sequence10 from './scenarios/day04/sequence10';
import * as day04Sequence11 from './scenarios/day04/sequence11';

const scenarioModules = [
  day03Sequence01,
  day03Sequence03,
  day03Sequence04,
  day03Sequence05,
  day04Sequence08,
  day04Sequence09,
  day04Sequence10,
  day04Sequence11,
];

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_MLQ5X_LEADERSHIP',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
