import type { ScenarioFile, ScenarioNode } from '../../../../../types';
import { mlqTags } from './scenarios/tags';
import mlqLabels from './labels/mlq_labels.json';
import * as day03Sequence01 from './scenarios/day03/sequence01';
import * as day03Sequence03 from './scenarios/day03/sequence03';
import * as day03Sequence04 from './scenarios/day03/sequence04';
import * as day03Sequence05 from './scenarios/day03/sequence05';
import * as day04Sequence08 from './scenarios/day04/sequence08';
import * as day04Sequence09 from './scenarios/day04/sequence09';
import * as day04Sequence10 from './scenarios/day04/sequence10';
import * as day04Sequence11 from './scenarios/day04/sequence11';
import * as day05Sequence14 from './scenarios/day05/sequence14';
import * as day05Sequence15 from './scenarios/day05/sequence15';
import * as day05Sequence16 from './scenarios/day05/sequence16';
import * as day05Sequence18 from './scenarios/day05/sequence18';
import * as day06Sequence19 from './scenarios/day06/sequence19';
import * as day06Sequence20 from './scenarios/day06/sequence20';
import * as day07Sequence21 from './scenarios/day07/sequence21';
import * as day07Sequence22 from './scenarios/day07/sequence22';
import * as day07Sequence23 from './scenarios/day07/sequence23';

const scenarioModules = [
  day03Sequence01,
  day03Sequence03,
  day03Sequence04,
  day03Sequence05,
  day04Sequence08,
  day04Sequence09,
  day04Sequence10,
  day04Sequence11,
  day05Sequence14,
  day05Sequence15,
  day05Sequence16,
  day05Sequence18,
  day06Sequence19,
  day06Sequence20,
  day07Sequence21,
  day07Sequence22,
  day07Sequence23,
];

type LabelEntry = {
  sequence_id: string;
  node_id: string;
  option_id: string;
  scores: Record<string, number>;
};

const rawNodes: ScenarioNode[] = scenarioModules.flatMap((module) => module.nodes);
const rawSequences = scenarioModules.flatMap((module) => module.sequences);

const sequenceIdsByNodeId = new Map<string, string[]>();
for (const seq of rawSequences) {
  for (const nodeId of seq.nodes) {
    const list = sequenceIdsByNodeId.get(nodeId) ?? [];
    list.push(seq.sequence_id);
    sequenceIdsByNodeId.set(nodeId, list);
  }
}

const labelIndex = new Map<string, Record<string, number>>();
for (const entry of mlqLabels as LabelEntry[]) {
  labelIndex.set(`${entry.sequence_id}|${entry.node_id}|${entry.option_id}`, entry.scores);
}

const decoratedNodes: ScenarioNode[] = rawNodes.map((node) => {
  const sequenceIds = sequenceIdsByNodeId.get(node.node_id) ?? [];
  if (sequenceIds.length === 0) return node;
  return {
    ...node,
    options: node.options.map((opt) => {
      for (const seqId of sequenceIds) {
        const scores = labelIndex.get(`${seqId}|${node.node_id}|${opt.option_id}`);
        if (scores) {
          return { ...opt, tags: mlqTags(scores as Parameters<typeof mlqTags>[0]) };
        }
      }
      return opt;
    }),
  };
});

export const scenarios: ScenarioFile = {
  simulation_id: 'CESFAM_MLQ5X_LEADERSHIP',
  scenarios: decoratedNodes,
  sequences: rawSequences,
};
