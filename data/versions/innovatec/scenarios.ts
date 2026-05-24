import type { ScenarioFile } from '../../../types';
import * as day01RicardoVargasMeeting1 from './scenarios/day01/ricardoVargasMeeting1';
import * as day01CarolinaSotoMeeting1 from './scenarios/day01/carolinaSotoMeeting1';
import * as day01DavidReyesMeeting1 from './scenarios/day01/davidReyesMeeting1';
import * as day01MonicaFloresMeeting1 from './scenarios/day01/monicaFloresMeeting1';
import * as day01JavierNunezMeeting1 from './scenarios/day01/javierNunezMeeting1';
import * as day02RicardoVargasMeeting2 from './scenarios/day02/ricardoVargasMeeting2';
import * as day02CarolinaSotoMeeting2 from './scenarios/day02/carolinaSotoMeeting2';
import * as day02DavidReyesMeeting2 from './scenarios/day02/davidReyesMeeting2';

const scenarioModules = [
  day01RicardoVargasMeeting1,
  day01CarolinaSotoMeeting1,
  day01DavidReyesMeeting1,
  day01MonicaFloresMeeting1,
  day01JavierNunezMeeting1,
  day02RicardoVargasMeeting2,
  day02CarolinaSotoMeeting2,
  day02DavidReyesMeeting2
];

export const scenarios: ScenarioFile = {
  simulation_id: 'QUANTUM_LEAP_V1',
  scenarios: scenarioModules.flatMap((module) => module.nodes),
  sequences: scenarioModules.flatMap((module) => module.sequences),
};
