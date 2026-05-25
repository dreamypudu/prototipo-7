import type { ScenarioFile } from '../../../../../types';
import * as day03Opening from './scenarios/day03/opening';
import * as day04IdealizedInfluence from './scenarios/day04/idealizedInfluence';
import * as day05InspirationalMotivation from './scenarios/day05/inspirationalMotivation';
import * as day06IntellectualStimulation from './scenarios/day06/intellectualStimulation';
import * as day07IndividualConsideration from './scenarios/day07/individualConsideration';

const scenarioModules = [
  day03Opening,
  day04IdealizedInfluence,
  day05InspirationalMotivation,
  day06IntellectualStimulation,
  day07IndividualConsideration,
];

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_MLQ5X_LEADERSHIP',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
