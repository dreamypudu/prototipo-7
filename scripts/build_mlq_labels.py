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
CSV_PATH = LABELS_DIR / "medianas.csv"
JSON_PATH = LABELS_DIR / "mlq_labels.json"

MLQ_VARIABLES = ["IIA", "IIC", "MI", "EI", "CI", "RC", "DPE-A", "DPE-P", "LF"]
ID_COLUMNS = ["secuencia", "nodo_id", "alternativa_id"]
SKIPPED_OPTION_IDS = {"NEXT"}


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    text = re.sub(r"//.*", "", text)
    return text


SEQ_NUM_PATTERN = re.compile(r"MLQ5X_D\d+_SEQUENCE_(\d+)")
NODE_NUM_PATTERN = re.compile(r"_N(\d+)_")


def _extract_choice_index() -> dict[tuple[int, int], tuple[str, str, set[str]]]:
    """Mapea (secuencia_num, nodo_num) -> (sequence_id, node_id, opciones_validas).

    Solo incluye nodos con al menos una opcion distinta de NEXT (decisiones reales).
    """
    index: dict[tuple[int, int], tuple[str, str, set[str]]] = {}
    for ts_path in sorted(SCENARIOS_DIR.rglob("sequence*.ts")):
        text = _strip_comments(ts_path.read_text(encoding="utf-8", errors="ignore"))
        seq_match = re.search(r"\bsequence_id:\s*['\"]([^'\"]+)['\"]", text)
        if not seq_match:
            continue
        sequence_id = seq_match.group(1)
        seq_num_match = SEQ_NUM_PATTERN.search(sequence_id)
        if not seq_num_match:
            continue
        seq_num = int(seq_num_match.group(1))

        node_matches = list(re.finditer(r"\bnode_id:\s*['\"]([^'\"]+)['\"]", text))
        for i, m in enumerate(node_matches):
            node_id = m.group(1)
            start = m.end()
            end = node_matches[i + 1].start() if i + 1 < len(node_matches) else len(text)
            window = text[start:end]
            real_options: set[str] = set()
            for opt_match in re.finditer(r"\boption_id:\s*['\"]([^'\"]+)['\"]", window):
                opt_id = opt_match.group(1)
                if opt_id in SKIPPED_OPTION_IDS:
                    continue
                real_options.add(opt_id)
            if not real_options:
                continue
            node_num_match = NODE_NUM_PATTERN.search(node_id)
            if not node_num_match:
                continue
            node_num = int(node_num_match.group(1))
            key = (seq_num, node_num)
            if key in index:
                existing_node_id = index[key][1]
                raise SystemExit(
                    f"Conflicto: dos nodos comparten numeracion "
                    f"(secuencia={seq_num}, nodo={node_num}): "
                    f"{existing_node_id} y {node_id}"
                )
            index[key] = (sequence_id, node_id, real_options)
    return index


def _read_csv() -> list[dict]:
    rows: list[dict] = []
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=";")
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
    raw = (value or "").strip().replace(",", ".")
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

    code_index = _extract_choice_index()
    rows = _read_csv()

    seen_keys: set[tuple[str, str, str]] = set()
    errors: list[str] = []
    out: list[dict] = []

    for row in rows:
        line = row["__line__"]
        raw_seq = (row.get("secuencia") or "").strip()
        raw_node = (row.get("nodo_id") or "").strip()
        option_id = (row.get("alternativa_id") or "").strip().upper()
        if not raw_seq or not raw_node or not option_id:
            errors.append(f"Linea {line}: secuencia/nodo_id/alternativa_id vacios")
            continue
        try:
            seq_num = int(raw_seq)
            node_num = int(raw_node)
        except ValueError:
            errors.append(
                f"Linea {line}: secuencia/nodo_id deben ser enteros "
                f"(recibido secuencia={raw_seq!r}, nodo_id={raw_node!r})"
            )
            continue

        if (seq_num, node_num) not in code_index:
            errors.append(
                f"Linea {line}: no existe el par (secuencia={seq_num}, nodo={node_num}) en el modulo"
            )
            continue
        sequence_id, node_id, valid_options = code_index[(seq_num, node_num)]
        if option_id not in valid_options:
            errors.append(
                f"Linea {line}: la opcion {option_id!r} no existe para nodo {node_num} "
                f"de secuencia {seq_num}. Validas: {sorted(valid_options)}"
            )
            continue

        full_key = (sequence_id, node_id, option_id)
        if full_key in seen_keys:
            errors.append(f"Linea {line}: fila duplicada para {full_key}")
            continue
        seen_keys.add(full_key)

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
                "sequence_id": sequence_id,
                "node_id": node_id,
                "option_id": option_id,
                "scores": scores,
            }
        )

    expected_keys: set[tuple[str, str, str]] = set()
    for (seq_id, node_id, valid_options) in code_index.values():
        for opt in valid_options:
            expected_keys.add((seq_id, node_id, opt))
    missing = sorted(expected_keys - seen_keys)
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
