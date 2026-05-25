def as_record(value):
    return value if isinstance(value, dict) else {}


def pick_detail_value(value_final: dict, payload: dict, *keys):
    for key in keys:
        if key in payload:
            return payload.get(key)
        if key in value_final:
            return value_final.get(key)
    return None
