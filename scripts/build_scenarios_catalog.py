#!/usr/bin/env python3
"""Genera scenarios_catalog.json desde los archivos TS del modulo MLQ-5X de liderazgo.

Salida: data/versions/cesfam/modules/mlq5x_leadership/scenarios_catalog.json

Estructura:
{
  "narratives": [{ "narrative_id": "...", "label": "..." }],
  "sequences": [{
      "sequence_id": "...",
      "narrative_id": "...",
      "version_id": "...",
      "stakeholder_ids": [...],
      "node_ids": [...],
      "day": N,
      "time_slot": "manana"|"tarde"
  }],
  "nodes": [{
      "node_id": "...",
      "sequence_id": "...",
      "narrative_id": "...",
      "node_text": "...",
      "day": N,
      "time_slot": "manana",
      "stakeholder_id": "..." (opcional)
  }],
  "options": [{
      "node_id": "...",
      "option_id": "...",
      "option_text": "...",
      "is_decision": true|false
  }]
}

El backend lo carga al boot (backend/normalizers/scenarios_catalog.py) y puebla
narratives, scenario_sequences, decision_nodes, decision_options. Para agregar
otro modulo (etica, etc.), agrega su narrative_id y rutas a TARGET_MODULES.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

# Cada entrada: (narrative_id, label, scenarios_dir, output_path, version_id)
TARGET_MODULES: list[dict] = [
    {
        "narrative_id": "mlq5x_leadership",
        "label": "Liderazgo MLQ-5X (CESFAM)",
        "version_id": "CESFAM",
        "scenarios_dir": ROOT / "data" / "versions" / "cesfam" / "modules" / "mlq5x_leadership" / "scenarios",
        "output_path": ROOT / "data" / "versions" / "cesfam" / "modules" / "mlq5x_leadership" / "scenarios_catalog.json",
    },
]


# Regexes (word-boundary aware para no pisar source_node_id / target_node_id).
SEQUENCE_ID_RE = re.compile(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]")
TRIGGER_MAP_RE = re.compile(r"\btriggerMap:\s*\{\s*day:\s*(\d+)\s*,\s*slot:\s*['\"]([^'\"]+)['\"]")
NODES_LIST_RE = re.compile(r"\bnodes:\s*\[([^\]]+)\]", re.DOTALL)
NODE_ID_RE = re.compile(r"\bnode_id:\s*['\"]([^'\"]+)['\"]")
OPTION_ID_RE = re.compile(r"\boption_id:\s*['\"]([^'\"]+)['\"]")
STAKEHOLDER_ID_RE = re.compile(r"\bstakeholderId:\s*['\"]([^'\"]+)['\"]")
PARTICIPANT_IDS_RE = re.compile(r"\bparticipantIds:\s*\[([^\]]+)\]", re.DOTALL)
DIALOGUE_RE = re.compile(
    r"\bdialogue:\s*(['\"`])((?:\\.|(?!\1).)*?)\1",
    re.DOTALL,
)
TEXT_RE = re.compile(
    r"\btext:\s*(['\"`])((?:\\.|(?!\1).)*?)\1",
    re.DOTALL,
)
STRING_LIST_ITEM_RE = re.compile(r"['\"]([^'\"]+)['\"]")


def strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//.*", "", text)
    return text


def parse_scenario_file(path: Path, narrative_id: str, version_id: str):
    """Devuelve (sequence_record, node_records, option_records) para un archivo .ts."""
    text = strip_comments(path.read_text(encoding="utf-8", errors="ignore"))

    seq_match = SEQUENCE_ID_RE.search(text)
    if not seq_match:
        return None, [], []
    sequence_id = seq_match.group(1)

    trigger_match = TRIGGER_MAP_RE.search(text)
    seq_day = int(trigger_match.group(1)) if trigger_match else None
    seq_slot = trigger_match.group(2) if trigger_match else None

    node_ids_in_sequence: list[str] = []
    nodes_list_match = NODES_LIST_RE.search(text)
    if nodes_list_match:
        node_ids_in_sequence = STRING_LIST_ITEM_RE.findall(nodes_list_match.group(1))

    node_matches = list(NODE_ID_RE.finditer(text))
    nodes: list[dict] = []
    options: list[dict] = []
    stakeholder_ids_set: set[str] = set()

    for i, match in enumerate(node_matches):
        node_id = match.group(1)
        start = match.start()
        end = node_matches[i + 1].start() if i + 1 < len(node_matches) else len(text)
        block = text[start:end]

        sh_match = STAKEHOLDER_ID_RE.search(block)
        stakeholder_id = sh_match.group(1) if sh_match else None
        if stakeholder_id:
            stakeholder_ids_set.add(stakeholder_id)

        part_match = PARTICIPANT_IDS_RE.search(block)
        if part_match:
            for participant in STRING_LIST_ITEM_RE.findall(part_match.group(1)):
                stakeholder_ids_set.add(participant)

        diag_match = DIALOGUE_RE.search(block)
        node_text = diag_match.group(2).strip() if diag_match else None

        nodes.append({
            "node_id": node_id,
            "sequence_id": sequence_id,
            "narrative_id": narrative_id,
            "node_text": node_text,
            "day": seq_day,
            "time_slot": seq_slot,
            "stakeholder_id": stakeholder_id,
        })

        option_matches = list(OPTION_ID_RE.finditer(block))
        explicit_ids: set[str] = set()
        for j, opt_match in enumerate(option_matches):
            opt_id = opt_match.group(1)
            explicit_ids.add(opt_id)
            opt_start = opt_match.end()
            opt_end = option_matches[j + 1].start() if j + 1 < len(option_matches) else len(block)
            opt_block = block[opt_start:opt_end]
            text_match = TEXT_RE.search(opt_block)
            option_text = text_match.group(2).strip() if text_match else None
            options.append({
                "node_id": node_id,
                "option_id": opt_id,
                "option_text": option_text,
                "is_decision": opt_id != "NEXT",
            })

        # Si el nodo usa nextOption() (helper) y no tiene NEXT explicito, agrega sintetico.
        if "nextOption()" in block and "NEXT" not in explicit_ids:
            options.append({
                "node_id": node_id,
                "option_id": "NEXT",
                "option_text": "Continuar",
                "is_decision": False,
            })

    sequence_record = {
        "sequence_id": sequence_id,
        "narrative_id": narrative_id,
        "version_id": version_id,
        "stakeholder_ids": sorted(stakeholder_ids_set),
        "node_ids": node_ids_in_sequence,
        "day": seq_day,
        "time_slot": seq_slot,
    }
    return sequence_record, nodes, options


def build_module_catalog(module: dict) -> dict:
    narrative_id = module["narrative_id"]
    version_id = module["version_id"]
    scenarios_dir: Path = module["scenarios_dir"]

    sequences: list[dict] = []
    nodes: list[dict] = []
    options: list[dict] = []

    for path in sorted(scenarios_dir.rglob("sequence*.ts")):
        seq_record, ns, opts = parse_scenario_file(path, narrative_id, version_id)
        if seq_record is None:
            continue
        sequences.append(seq_record)
        nodes.extend(ns)
        options.extend(opts)

    return {
        "narratives": [{"narrative_id": narrative_id, "label": module["label"]}],
        "sequences": sequences,
        "nodes": nodes,
        "options": options,
    }


def main() -> int:
    grand_total = {"sequences": 0, "nodes": 0, "options": 0}
    for module in TARGET_MODULES:
        catalog = build_module_catalog(module)
        output_path: Path = module["output_path"]
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(
            f"OK [{module['narrative_id']}]: "
            f"{len(catalog['sequences'])} seq, {len(catalog['nodes'])} nodos, {len(catalog['options'])} opciones "
            f"-> {output_path.relative_to(ROOT)}"
        )
        grand_total["sequences"] += len(catalog["sequences"])
        grand_total["nodes"] += len(catalog["nodes"])
        grand_total["options"] += len(catalog["options"])
    print(
        f"\nTotal global: {grand_total['sequences']} seq, "
        f"{grand_total['nodes']} nodos, {grand_total['options']} opciones."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
