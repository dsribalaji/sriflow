#!/usr/bin/env python3
"""Validate sriflow skills against the Agent Skills spec, with sriflow extended fields allowed."""

import sys
import unicodedata
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"

# Agent Skills spec allowed fields
CORE_FIELDS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
# Sriflow extended fields (beyond spec, sriflow-internal)
SRIFLOW_EXTENDED = {
    "preamble-tier", "version", "category", "related",
    "triggers", "next-skill", "outputs", "gate", "prerequisite", "rule", "signal",
}
ALLOWED_FIELDS = CORE_FIELDS | SRIFLOW_EXTENDED

MAX_NAME_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 1024


def parse_frontmatter(content: str):
    if not content.startswith("---"):
        return None, "must start with YAML frontmatter (---)"
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, "frontmatter not properly closed with ---"
    frontmatter_str = parts[1]
    body = parts[2].strip()
    metadata = {}
    for line in frontmatter_str.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip()
            if val.startswith("- "):
                metadata[key] = [v.strip("- ") for v in line.split("\n") if v.strip().startswith("- ")]
            else:
                metadata[key] = val
    return metadata, None


def validate_skill(skill_dir: Path) -> list[str]:
    errors = []
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return [f"Missing SKILL.md in {skill_dir}"]

    content = skill_md.read_text()
    metadata, err = parse_frontmatter(content)
    if err:
        return [f"{skill_dir.name}: {err}"]
    if metadata is None:
        return [f"{skill_dir.name}: could not parse frontmatter"]

    extra = set(metadata.keys()) - ALLOWED_FIELDS
    if extra:
        errors.append(f"unexpected fields: {', '.join(sorted(extra))}")

    name = metadata.get("name")
    if not name:
        errors.append("missing required 'name'")
    else:
        if len(name) > MAX_NAME_LENGTH:
            errors.append(f"name exceeds {MAX_NAME_LENGTH} chars ({len(name)})")
        if name != name.lower():
            errors.append(f"name must be lowercase: '{name}'")
        if not all(c.isalnum() or c in "-" for c in name):
            errors.append(f"name has invalid chars: '{name}'")
        dir_name = unicodedata.normalize("NFKC", skill_dir.name)
        if dir_name != name:
            errors.append(f"dir '{skill_dir.name}' != name '{name}'")

    desc = metadata.get("description")
    if not desc:
        errors.append("missing required 'description'")

    return errors


def main():
    skill_dirs = sorted(SKILLS_DIR.iterdir())
    total_errors = 0

    for skill_dir in skill_dirs:
        if not skill_dir.is_dir():
            continue
        errors = validate_skill(skill_dir)
        if errors:
            total_errors += len(errors)
            for e in errors:
                print(f"  FAIL  {skill_dir.name}: {e}")
        else:
            print(f"  PASS  {skill_dir.name}")

    if total_errors:
        print(f"\n{total_errors} validation error(s) found")
        sys.exit(1)
    else:
        print(f"\nAll {len([d for d in skill_dirs if d.is_dir()])} skills valid against Agent Skills spec")


if __name__ == "__main__":
    main()
