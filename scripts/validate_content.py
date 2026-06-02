#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
VERSIONS = ["cesfam", "innovatec", "leykarin", "sercotec", "municipal"]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//.*", "", text)
    return text


def find_duplicates(values: list[str]) -> list[str]:
    seen = set()
    duplicates = set()
    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    return sorted(duplicates)


def collect_scenario_paths(base: Path) -> list[Path]:
    scenarios_dir = base / "scenarios"
    if scenarios_dir.exists():
        return sorted(scenarios_dir.rglob("*.ts"))
    scenarios_path = base / "scenarios.ts"
    return [scenarios_path] if scenarios_path.exists() else []


def build_validation_targets(version: str) -> list[tuple[str, Path, list[Path]]]:
    base = ROOT / "data" / "versions" / version
    if version != "cesfam":
        return [(version, base / "stakeholders.ts", collect_scenario_paths(base))]

    modules_base = base / "modules"
    return [
        (
            "cesfam/ethics",
            modules_base / "ethics" / "stakeholders.ts",
            collect_scenario_paths(modules_base / "ethics"),
        ),
        (
            "cesfam/mlq5x_leadership",
            modules_base / "mlq5x_leadership" / "stakeholders.ts",
            collect_scenario_paths(modules_base / "mlq5x_leadership"),
        ),
    ]


def validate_target(label: str, stakeholders_path: Path, scenario_paths: list[Path], errors: list[str]) -> None:
    if not stakeholders_path.exists() or not scenario_paths:
        errors.append(f"[{label}] Missing required files near {stakeholders_path.parent}")
        return

    stakeholders_text = strip_comments(read_text(stakeholders_path))
    scenarios_text = strip_comments("\n".join(read_text(path) for path in scenario_paths))

    stakeholder_ids = re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", stakeholders_text)
    duplicate_stakeholder_ids = find_duplicates(stakeholder_ids)
    if duplicate_stakeholder_ids:
        errors.append(f"[{label}] Duplicate stakeholder ids: {', '.join(duplicate_stakeholder_ids)}")

    stakeholder_id_set = set(stakeholder_ids)

    node_ids = re.findall(r"\bnode_id:\s*['\"]([^'\"]+)['\"]", scenarios_text)
    sequence_ids = re.findall(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", scenarios_text)

    duplicate_node_ids = find_duplicates(node_ids)
    if duplicate_node_ids:
        errors.append(f"[{label}] Duplicate node ids: {', '.join(duplicate_node_ids)}")

    duplicate_sequence_ids = find_duplicates(sequence_ids)
    if duplicate_sequence_ids:
        errors.append(f"[{label}] Duplicate sequence ids: {', '.join(duplicate_sequence_ids)}")

    for stakeholder_id in re.findall(r"\bstakeholderId:\s*['\"]([^'\"]+)['\"]", scenarios_text):
        if stakeholder_id not in stakeholder_id_set:
            errors.append(f"[{label}] Unknown stakeholderId '{stakeholder_id}'")

    node_id_set = set(node_ids)
    for match in re.finditer(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", scenarios_text):
        sequence_id = match.group(1)
        window = scenarios_text[match.end() : match.end() + 1800]
        nodes_match = re.search(r"\bnodes:\s*\[([^\]]*)\]", window, flags=re.DOTALL)
        if not nodes_match:
            errors.append(f"[{label}] Sequence {sequence_id} missing nodes[]")
            continue
        referenced_nodes = re.findall(r"['\"]([^'\"]+)['\"]", nodes_match.group(1))
        for node_id in referenced_nodes:
            if node_id not in node_id_set:
                errors.append(
                    f"[{label}] Sequence {sequence_id} references missing node '{node_id}'"
                )


def main() -> int:
    errors: list[str] = []

    for version in VERSIONS:
        for label, stakeholders_path, scenario_paths in build_validation_targets(version):
            validate_target(label, stakeholders_path, scenario_paths, errors)

    if errors:
        print("Content validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Content validation passed for all versions.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
