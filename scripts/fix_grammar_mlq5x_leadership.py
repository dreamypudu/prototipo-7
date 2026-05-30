#!/usr/bin/env python3
"""Aplica correcciones gramaticales basicas a los archivos del modulo MLQ-5X de liderazgo.

Para cada archivo TS objetivo, procesa solo los STRING LITERALS (entre comillas)
y aplica:
  1. Sustituciones seguras (palabras sin tilde -> con tilde, nombres propios).
  2. Acentuacion del primer pronombre interrogativo al inicio de cada pregunta.
  3. Insercion de '¿' al inicio de cada pregunta (segmento que termina en '?').

Solo toca contenido de string literals; el codigo TS no se modifica.

Uso:
    python scripts/fix_grammar_mlq5x_leadership.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULE_DIR = ROOT / "data" / "versions" / "cesfam" / "modules" / "mlq5x_leadership"

TARGETS = sorted([
    *MODULE_DIR.rglob("sequence*.ts"),
    MODULE_DIR / "stakeholders.ts",
    MODULE_DIR / "emails.ts",
    MODULE_DIR / "documents.ts",
])

# Sustituciones seguras: word-boundary aware, case-sensitive.
# Cada par genera tambien su variante capitalizada.
SAFE_SUBS: list[tuple[str, str]] = [
    # Nombres propios
    ("Sofia", "Sofía"),
    ("Andres", "Andrés"),
    ("Rios", "Ríos"),
    ("Solis", "Solís"),
    ("Guzman", "Guzmán"),
    # Sustantivos -cion
    ("atencion", "atención"),
    ("decision", "decisión"),
    ("informacion", "información"),
    ("situacion", "situación"),
    ("direccion", "dirección"),
    ("intencion", "intención"),
    ("supervision", "supervisión"),
    ("revision", "revisión"),
    ("derivacion", "derivación"),
    ("asignacion", "asignación"),
    ("organizacion", "organización"),
    ("sancion", "sanción"),
    ("infraccion", "infracción"),
    ("accion", "acción"),
    ("comunicacion", "comunicación"),
    ("indicacion", "indicación"),
    ("formacion", "formación"),
    ("evaluacion", "evaluación"),
    ("planificacion", "planificación"),
    ("ejecucion", "ejecución"),
    ("gestion", "gestión"),
    ("postergacion", "postergación"),
    ("reasignacion", "reasignación"),
    ("observacion", "observación"),
    ("motivacion", "motivación"),
    ("solucion", "solución"),
    ("coordinacion", "coordinación"),
    ("condicion", "condición"),
    ("tradicion", "tradición"),
    ("funcion", "función"),
    ("explicacion", "explicación"),
    ("reorganizacion", "reorganización"),
    ("reorganizacion", "reorganización"),
    # Sustantivos -sion
    ("mision", "misión"),
    ("vision", "visión"),
    ("ocasion", "ocasión"),
    ("presion", "presión"),
    ("tension", "tensión"),
    # Adjetivos / adverbios comunes
    ("tambien", "también"),
    ("rapido", "rápido"),
    ("rapidamente", "rápidamente"),
    ("facil", "fácil"),
    ("dificil", "difícil"),
    ("tecnico", "técnico"),
    ("tecnica", "técnica"),
    ("tecnicas", "técnicas"),
    ("tecnicos", "técnicos"),
    ("tecnicamente", "técnicamente"),
    ("publico", "público"),
    ("publica", "pública"),
    ("logico", "lógico"),
    ("minimo", "mínimo"),
    ("maximo", "máximo"),
    ("ultimo", "último"),
    ("ultima", "última"),
    ("ultimas", "últimas"),
    ("ultimos", "últimos"),
    ("proximo", "próximo"),
    ("proxima", "próxima"),
    ("proximas", "próximas"),
    ("proximos", "próximos"),
    ("ningun", "ningún"),
    ("algun", "algún"),
    ("asi", "así"),
    ("aqui", "aquí"),
    ("alli", "allí"),
    ("jamas", "jamás"),
    ("despues", "después"),
    ("numero", "número"),
    ("clinica", "clínica"),
    ("clinico", "clínico"),
    ("clinicas", "clínicas"),
    ("clinicos", "clínicos"),
    ("practica", "práctica"),
    ("practicas", "prácticas"),
    ("practicos", "prácticos"),
    ("medico", "médico"),
    ("medica", "médica"),
    ("medicos", "médicos"),
    ("medicas", "médicas"),
    ("area", "área"),
    ("areas", "áreas"),
    ("lider", "líder"),
    ("razon", "razón"),
    ("corazon", "corazón"),
    ("linea", "línea"),
    ("lineas", "líneas"),
    ("dia", "día"),
    ("dias", "días"),
    ("miercoles", "miércoles"),
    ("sabado", "sábado"),
    ("antiguedad", "antigüedad"),
    ("ano", "año"),
    ("anos", "años"),
    ("mas", "más"),
    ("via", "vía"),
    # Verbos pasado/futuro/condicional (formas mas seguras)
    ("actuo", "actuó"),
    ("llego", "llegó"),
    ("atendio", "atendió"),
    ("escucho", "escuchó"),
    ("informo", "informó"),
    ("derivo", "derivó"),
    ("venia", "venía"),
    ("tenia", "tenía"),
    ("habia", "había"),
    ("podia", "podía"),
    ("queria", "quería"),
    ("sabia", "sabía"),
    ("debia", "debía"),
    ("haria", "haría"),
    ("iria", "iría"),
    ("estaria", "estaría"),
    ("seria", "sería"),
    ("podria", "podría"),
    ("quedaria", "quedaría"),
    ("deberia", "debería"),
    ("tendria", "tendría"),
    ("sera", "será"),
    ("estara", "estará"),
    ("hara", "hará"),
    ("habra", "habrá"),
    ("vendra", "vendrá"),
    ("hare", "haré"),
    ("ire", "iré"),
    ("vere", "veré"),
    ("sere", "seré"),
    ("podra", "podrá"),
    ("podran", "podrán"),
    ("podre", "podré"),
    ("debera", "deberá"),
    ("deberan", "deberán"),
    ("deberas", "deberás"),
    ("debere", "deberé"),
    ("visitaria", "visitaría"),
    ("podrian", "podrían"),
    ("haria", "haría"),
    ("tendran", "tendrán"),
    ("tendra", "tendrá"),
    ("tendre", "tendré"),
    ("estaran", "estarán"),
    ("seran", "serán"),
    ("haran", "harán"),
    # Sustantivos faltantes
    ("reunion", "reunión"),
    ("manana", "mañana"),
    ("justificacion", "justificación"),
    # Futuro 1ra/3ra (-are/-era)
    ("considerare", "consideraré"),
    ("revisare", "revisaré"),
    ("revisara", "revisará"),
    ("revisaran", "revisarán"),
    ("considerara", "considerará"),
    ("tomara", "tomará"),
    ("tomare", "tomaré"),
    ("dara", "dará"),
    ("dare", "daré"),
    ("daran", "darán"),
    ("aplicara", "aplicará"),
    ("aplicare", "aplicaré"),
    ("avisare", "avisaré"),
    ("avisara", "avisará"),
    ("intentare", "intentaré"),
    ("informare", "informaré"),
    ("informara", "informará"),
    ("respondera", "responderá"),
    ("respondere", "responderé"),
    ("dejare", "dejaré"),
    ("dejara", "dejará"),
    ("trabajare", "trabajaré"),
    ("apoyare", "apoyaré"),
    # Condicional (-aria / -eria / -iria)
    ("daria", "daría"),
    ("haria", "haría"),
    ("iria", "iría"),
    ("seria", "sería"),
    ("estaria", "estaría"),
    ("podria", "podría"),
    ("quedaria", "quedaría"),
    ("deberia", "debería"),
    ("tendria", "tendría"),
    ("vendria", "vendría"),
    ("permitiria", "permitiría"),
    ("ayudaria", "ayudaría"),
    ("trabajaria", "trabajaría"),
    # Mas terminos sustantivos / adjetivos
    ("cafe", "café"),
    ("antiseptico", "antiséptico"),
    ("critico", "crítico"),
    ("critica", "crítica"),
    ("criticos", "críticos"),
    ("criticas", "críticas"),
    ("reagendacion", "reagendación"),
    ("segun", "según"),
    ("demas", "demás"),
    ("impresion", "impresión"),
    ("auditoria", "auditoría"),
    ("facilmente", "fácilmente"),
    ("exito", "éxito"),
    ("politica", "política"),
    ("politicas", "políticas"),
    ("politico", "político"),
    ("interes", "interés"),
    ("eficaz", "eficaz"),  # sin cambio (placeholder)
    # Verbos pasado 3ra persona terminacion -io
    ("aprobo", "aprobó"),
    ("respondio", "respondió"),
    ("decidio", "decidió"),
    ("permitio", "permitió"),
    ("sucedio", "sucedió"),
    ("ocurrio", "ocurrió"),
    ("subio", "subió"),
    ("cumplio", "cumplió"),
    ("pidio", "pidió"),
    # Verbos pasado 3ra persona terminacion -o (riesgo bajo en este corpus)
    ("comento", "comentó"),
    ("tomo", "tomó"),
    ("notifico", "notificó"),
    ("delego", "delegó"),
    ("acostumbro", "acostumbró"),
    # Sustantivos / palabras faltantes
    ("documentacion", "documentación"),
    ("mantencion", "mantención"),
    ("aprobacion", "aprobación"),
    ("psicologica", "psicológica"),
    ("psicologico", "psicológico"),
    ("ultimamente", "últimamente"),
    ("estan", "están"),
    ("mantendriamos", "mantendríamos"),
    ("senal", "señal"),
    ("senales", "señales"),
    # Verbos imperfecto -ia adicionales
    ("decia", "decía"),
    ("veia", "veía"),
    ("creia", "creía"),
    ("leia", "leía"),
    # Frases con "esta" (verbo) frecuentes
    ("esta bien", "está bien"),
    ("Esta bien", "Está bien"),
    ("esta dispuesto", "está dispuesto"),
    ("esta dispuesta", "está dispuesta"),
    ("esta seguro", "está seguro"),
    ("esta segura", "está segura"),
    ("esta claro", "está claro"),
    ("esta clara", "está clara"),
    ("esta comenzando", "está comenzando"),
    ("esta esperando", "está esperando"),
    ("esta golpeando", "está golpeando"),
    ("esta listo", "está listo"),
    ("esta lista", "está lista"),
    ("esta presente", "está presente"),
    ("esta corresponde", "esta corresponde"),  # sin cambio (placeholder)
]

INTERROG_PRONOUNS = {
    "Que": "Qué", "Como": "Cómo", "Cuando": "Cuándo",
    "Cuanto": "Cuánto", "Cuanta": "Cuánta",
    "Cuantos": "Cuántos", "Cuantas": "Cuántas",
    "Donde": "Dónde", "Cual": "Cuál", "Cuales": "Cuáles",
    "Quien": "Quién", "Quienes": "Quiénes",
}

STRING_PATTERN = re.compile(r"(['\"`])((?:\\.|(?!\1).)*?)\1", re.DOTALL)

# Cuando el contenido pasa por el regex, las secuencias de escape (`\n`, `\t`, ...)
# aparecen como dos chars literales (`\` + letra). El word-boundary `\b` no detecta
# transicion entre la letra del escape y la siguiente palabra (p. ej. `\nSofia` deja
# `n` y `S` adyacentes, ambos word chars). Para corregirlo, "blindamos" los escapes
# envolviendo la letra con `\x00` (no-word), aplicamos sustituciones, y restauramos.
ESCAPE_PATTERN = re.compile(r"\\([nrtbfv'\"\\])")


def _shield_escapes(content: str) -> str:
    return ESCAPE_PATTERN.sub(lambda m: f"\x00{m.group(1)}\x00", content)


def _restore_escapes(content: str) -> str:
    return re.sub(r"\x00(.)\x00", lambda m: f"\\{m.group(1)}", content)


def apply_safe(content: str) -> str:
    for old, new in SAFE_SUBS:
        for variant_old, variant_new in [(old, new), (old.capitalize(), new.capitalize())]:
            content = re.sub(r"\b" + re.escape(variant_old) + r"\b", variant_new, content)
    return content


def fix_question(text: str) -> str:
    stripped = text.lstrip()
    prefix = text[: len(text) - len(stripped)]
    if not stripped or stripped[0] in "¿¡":
        return text
    word_match = re.match(r"(\w+)", stripped)
    if word_match:
        first = word_match.group(1)
        if first in INTERROG_PRONOUNS:
            stripped = INTERROG_PRONOUNS[first] + stripped[len(first):]
    return prefix + "¿" + stripped


def fix_questions_in_content(content: str) -> str:
    parts = re.split(r"([.!?])", content)
    out: list[str] = []
    i = 0
    while i < len(parts):
        text_part = parts[i]
        delim = parts[i + 1] if i + 1 < len(parts) else ""
        if delim == "?":
            text_part = fix_question(text_part)
        out.append(text_part)
        out.append(delim)
        i += 2
    return "".join(out)


def transform_content(content: str) -> str:
    content = _shield_escapes(content)
    content = apply_safe(content)
    content = fix_questions_in_content(content)
    content = _restore_escapes(content)
    return content


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    changes = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal changes
        quote = match.group(1)
        content = match.group(2)
        new_content = transform_content(content)
        if new_content != content:
            changes += 1
        return quote + new_content + quote

    new_text = STRING_PATTERN.sub(replacer, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return changes


def main() -> int:
    total_files_changed = 0
    total_strings_changed = 0
    for target in TARGETS:
        if not target.exists():
            print(f"  skip (no existe): {target.relative_to(ROOT)}")
            continue
        n = process_file(target)
        if n > 0:
            total_files_changed += 1
            total_strings_changed += n
            print(f"  {n:>3} strings modificadas: {target.relative_to(ROOT)}")
    print(f"\nTotal: {total_files_changed} archivos, {total_strings_changed} strings modificadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
