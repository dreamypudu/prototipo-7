import type { ScenarioFile } from '../../../../../types';
import * as day03OfficeIntro from '../ethics/scenarios/day03/officeIntro';
import * as day03ScheduleWar from '../ethics/scenarios/day03/scheduleWar';

const scenarioModules = [
  day03OfficeIntro,
  day03ScheduleWar,
];

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_TUTORIAL',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
