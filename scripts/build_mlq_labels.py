#!/usr/bin/env python3
"""Convierte el CSV de etiquetado MLQ del modulo de liderazgo en JSON.

Uso:
    python scripts/build_mlq_labels.py

Lee:
    data/versions/cesfam/modules/mlq5x_leadership/labels/mlq_labels.csv

Valida contra:
    data/versions/cesfam/modules/mlq5x_leadership/scenarios/**/sequence*.ts

Escribe:
    data/versions/cesfam/modules/mlq5x_leadership/labels/mlq_labels.json
"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULE_DIR = ROOT / "data" / "versions" / "cesfam" / "modules" / "mlq5x_leadership"
SCENARIOS_DIR = MODULE_DIR / "scenarios"
LABELS_DIR = MODULE_DIR / "labels"
CSV_PATH = LABELS_DIR / "mlq_labels.csv"
JSON_PATH = LABELS_DIR / "mlq_labels.json"

MLQ_VARIABLES = ["IIA", "IIC", "MI", "EI", "CI", "RC", "DPE-A", "DPE-P", "LF"]
ID_COLUMNS = ["secuencia", "nodo_id", "alternativa_id"]
SKIPPED_OPTION_IDS = {"NEXT"}


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//.*", "", text)
    return text


def _extract_real_choices() -> set[tuple[str, str, str]]:
    """Recorre los archivos de escenarios y devuelve el set de (seq, node, opt) reales,
    excluyendo opciones de pura narracion (NEXT)."""
    real: set[tuple[str, str, str]] = set()
    for ts_path in sorted(SCENARIOS_DIR.rglob("sequence*.ts")):
        text = _strip_comments(ts_path.read_text(encoding="utf-8", errors="ignore"))
        seq_match = re.search(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", text)
        if not seq_match:
            continue
        sequence_id = seq_match.group(1)
        node_matches = list(re.finditer(r"\bnode_id:\s*['\"]([^'\"]+)['\"]", text))
        for i, m in enumerate(node_matches):
            node_id = m.group(1)
            start = m.end()
            end = node_matches[i + 1].start() if i + 1 < len(node_matches) else len(text)
            window = text[start:end]
            for opt_match in re.finditer(r"\boption_id:\s*['\"]([^'\"]+)['\"]", window):
                option_id = opt_match.group(1)
                if option_id in SKIPPED_OPTION_IDS:
                    continue
                real.add((sequence_id, node_id, option_id))
    return real


def _read_csv() -> list[dict]:
    rows: list[dict] = []
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        missing = [c for c in ID_COLUMNS + MLQ_VARIABLES if c not in header]
        if missing:
            raise SystemExit(
                "CSV mal formado: faltan columnas " + ", ".join(missing)
                + ". Esperado: " + ", ".join(ID_COLUMNS + MLQ_VARIABLES)
            )
        unexpected = [c for c in header if c not in ID_COLUMNS + MLQ_VARIABLES]
        if unexpected:
            raise SystemExit("CSV mal formado: columnas inesperadas " + ", ".join(unexpected))
        for line_no, row in enumerate(reader, start=2):
            row["__line__"] = line_no
            rows.append(row)
    return rows


def _parse_score(value: str, line: int, column: str) -> float:
    raw = (value or "").strip()
    if raw in ("", "nan", "NaN", "null"):
        return 0.0
    try:
        return float(raw)
    except ValueError:
        raise SystemExit(f"Linea {line}: valor no numerico en columna {column!r}: {raw!r}")


def main() -> int:
    if not CSV_PATH.exists():
        print(f"ERROR: no existe {CSV_PATH}", file=sys.stderr)
        return 1

    real_choices = _extract_real_choices()
    rows = _read_csv()

    seen_keys: set[tuple[str, str, str]] = set()
    errors: list[str] = []
    out: list[dict] = []

    for row in rows:
        line = row["__line__"]
        key = (
            row["secuencia"].strip(),
            row["nodo_id"].strip(),
            row["alternativa_id"].strip(),
        )
        if any(not p for p in key):
            errors.append(f"Linea {line}: secuencia/nodo_id/alternativa_id vacios")
            continue
        if key in seen_keys:
            errors.append(f"Linea {line}: fila duplicada para {key}")
            continue
        seen_keys.add(key)
        if key not in real_choices:
            errors.append(
                f"Linea {line}: la tupla "
                f"(sequence={key[0]}, node={key[1]}, option={key[2]}) "
                f"no existe en el modulo. Revisa que los IDs coincidan con los archivos de escenario."
            )
            continue

        scores: dict[str, float] = {}
        for var in MLQ_VARIABLES:
            score = _parse_score(row.get(var, ""), line, var)
            if score < 0:
                errors.append(f"Linea {line}: puntaje negativo en {var}: {score}")
                continue
            if score != 0:
                scores[var] = int(score) if score == int(score) else score
        out.append(
            {
                "sequence_id": key[0],
                "node_id": key[1],
                "option_id": key[2],
                "scores": scores,
            }
        )

    missing = sorted(real_choices - seen_keys)
    for sequence_id, node_id, option_id in missing:
        errors.append(
            f"Falta etiqueta para "
            f"(sequence={sequence_id}, node={node_id}, option={option_id})"
        )

    if errors:
        print("Errores al construir mlq_labels.json:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    out.sort(key=lambda r: (r["sequence_id"], r["node_id"], r["option_id"]))
    LABELS_DIR.mkdir(parents=True, exist_ok=True)
    JSON_PATH.write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"OK: {len(out)} etiquetas escritas en {JSON_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
