"""Generate TypeScript interfaces from backend Pydantic models."""

from __future__ import annotations

from pathlib import Path
import sys
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "src"))

from miro_backend.schemas.user_info import UserInfo  # noqa: E402

_TYPE_MAP: dict[str, str] = {
    "string": "string",
    "integer": "number",
    "number": "number",
    "boolean": "boolean",
}


def _generate_interface(schema: dict[str, Any]) -> str:
    lines = [
        "// Generated from src/miro_backend/schemas/user_info.py",
        "export interface UserInfo {",
    ]
    for name, prop in schema["properties"].items():
        prop_type = str(prop.get("type", "string"))
        ts_type = _TYPE_MAP.get(prop_type, "string")
        lines.append(f"  {name}: {ts_type};")
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    """Write TypeScript interface for ``UserInfo`` to the generated folder."""
    schema = UserInfo.model_json_schema()
    content = _generate_interface(schema)
    out_path = ROOT / "web" / "client" / "src" / "generated" / "user-info.ts"
    out_path.write_text(content)


if __name__ == "__main__":
    main()
