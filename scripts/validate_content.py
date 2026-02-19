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


def main() -> int:
    errors: list[str] = []

    for version in VERSIONS:
        base = ROOT / "data" / "versions" / version
        stakeholders_path = base / "stakeholders.ts"
        scenarios_path = base / "scenarios.ts"

        if not stakeholders_path.exists() or not scenarios_path.exists():
            errors.append(f"[{version}] Missing required files in {base}")
            continue

        stakeholders_text = strip_comments(read_text(stakeholders_path))
        scenarios_text = strip_comments(read_text(scenarios_path))

        stakeholder_ids = re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", stakeholders_text)
        duplicate_stakeholder_ids = find_duplicates(stakeholder_ids)
        if duplicate_stakeholder_ids:
            errors.append(f"[{version}] Duplicate stakeholder ids: {', '.join(duplicate_stakeholder_ids)}")

        stakeholder_id_set = set(stakeholder_ids)

        node_ids = re.findall(r"\bnode_id:\s*['\"]([^'\"]+)['\"]", scenarios_text)
        sequence_ids = re.findall(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", scenarios_text)

        duplicate_node_ids = find_duplicates(node_ids)
        if duplicate_node_ids:
            errors.append(f"[{version}] Duplicate node ids: {', '.join(duplicate_node_ids)}")

        duplicate_sequence_ids = find_duplicates(sequence_ids)
        if duplicate_sequence_ids:
            errors.append(f"[{version}] Duplicate sequence ids: {', '.join(duplicate_sequence_ids)}")

        # Validate each node has stakeholderId close to its declaration.
        for match in re.finditer(r"\bnode_id:\s*['\"]([^'\"]+)['\"]", scenarios_text):
            node_id = match.group(1)
            window = scenarios_text[match.end() : match.end() + 700]
            sid_match = re.search(r"\bstakeholderId:\s*['\"]([^'\"]+)['\"]", window)
            if not sid_match:
                errors.append(f"[{version}] Node {node_id} missing stakeholderId")
                continue
            stakeholder_id = sid_match.group(1)
            if stakeholder_id not in stakeholder_id_set:
                errors.append(
                    f"[{version}] Node {node_id} references unknown stakeholderId '{stakeholder_id}'"
                )

        # Validate each sequence has stakeholderId and valid node refs.
        node_id_set = set(node_ids)
        for match in re.finditer(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", scenarios_text):
            sequence_id = match.group(1)
            window = scenarios_text[match.end() : match.end() + 1400]
            sid_match = re.search(r"\bstakeholderId:\s*['\"]([^'\"]+)['\"]", window)
            if not sid_match:
                errors.append(f"[{version}] Sequence {sequence_id} missing stakeholderId")
            else:
                stakeholder_id = sid_match.group(1)
                if stakeholder_id not in stakeholder_id_set:
                    errors.append(
                        f"[{version}] Sequence {sequence_id} references unknown stakeholderId '{stakeholder_id}'"
                    )

            nodes_match = re.search(r"\bnodes:\s*\[([^\]]*)\]", window, flags=re.DOTALL)
            if not nodes_match:
                errors.append(f"[{version}] Sequence {sequence_id} missing nodes[]")
                continue
            referenced_nodes = re.findall(r"['\"]([^'\"]+)['\"]", nodes_match.group(1))
            for node_id in referenced_nodes:
                if node_id not in node_id_set:
                    errors.append(
                        f"[{version}] Sequence {sequence_id} references missing node '{node_id}'"
                    )

    if errors:
        print("Content validation failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Content validation passed for all versions.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
