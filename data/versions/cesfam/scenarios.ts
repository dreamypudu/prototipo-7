import type { ScenarioFile } from '../../../types';
import * as day03OfficeIntro from './scenarios/day03/officeIntro';
import * as day03ScheduleWar from './scenarios/day03/scheduleWar';
import * as day03AzulMeeting1 from './scenarios/day03/azulMeeting1';
import * as day03RojoMeeting1 from './scenarios/day03/rojoMeeting1';
import * as day03AmarilloMeeting1 from './scenarios/day03/amarilloMeeting1';
import * as day04AgendaCrisisDetonator from './scenarios/day04/agendaCrisisDetonator';
import * as day04AzulNegotiation from './scenarios/day04/azulNegotiation';
import * as day04RojoNegotiation from './scenarios/day04/rojoNegotiation';
import * as day04AmarilloNegotiation from './scenarios/day04/amarilloNegotiation';
import * as day05AgendaCrisisResolution from './scenarios/day05/agendaCrisisResolution';
import * as day06Contingencies from './scenarios/day06/contingencies';
import * as day06Case2RoboIntro from './scenarios/day06/case2RoboIntro';
import * as day06Case2Marcela from './scenarios/day06/case2Marcela';
import * as day06Case2Guzman from './scenarios/day06/case2Guzman';
import * as day06Case2Daniel from './scenarios/day06/case2Daniel';
import * as day07Case2Verdict from './scenarios/day07/case2Verdict';

const scenarioModules = [
  day03OfficeIntro,
  day03ScheduleWar,
  day03AzulMeeting1,
  day03RojoMeeting1,
  day03AmarilloMeeting1,
  day04AgendaCrisisDetonator,
  day04AzulNegotiation,
  day04RojoNegotiation,
  day04AmarilloNegotiation,
  day05AgendaCrisisResolution,
  day06Contingencies,
  day06Case2RoboIntro,
  day06Case2Marcela,
  day06Case2Guzman,
  day06Case2Daniel,
  day07Case2Verdict
];

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_SECTORS_MANAGEMENT',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
