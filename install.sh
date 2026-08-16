#!/bin/sh
# SriFlow installer — symlinks all sriflow skills into the agent skill dirs it detects.
# Usage: sh install.sh   (or: sh install.sh --dry-run)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  echo "(dry run — no changes will be made)"
fi

echo "SriFlow installer"
echo "================="
echo ""

HOSTS=""
if [ -d "$HOME/.claude" ] || command -v claude >/dev/null 2>&1; then
  HOSTS="$HOSTS claude"; echo "Detected: Claude Code"
fi
if [ -d "$HOME/.config/opencode" ] || command -v opencode >/dev/null 2>&1; then
  HOSTS="$HOSTS opencode"; echo "Detected: OpenCode"
fi
if [ -d "$HOME/.github" ] || command -v gh >/dev/null 2>&1; then
  HOSTS="$HOSTS copilot"; echo "Detected: GitHub Copilot"
fi
if [ -z "$HOSTS" ]; then
  echo "No supported agents detected. Install Claude Code, OpenCode, or GitHub Copilot first."
  exit 1
fi

for HOST in $HOSTS; do
  case "$HOST" in
    claude)   DEST="$HOME/.claude/skills" ;;
    opencode) DEST="$HOME/.config/opencode/skills" ;;
    copilot)  DEST=".github/copilot-skills" ;;
  esac

  echo ""
  echo "Installing to $HOST ($DEST)..."
  [ "$DRY_RUN" = 0 ] && mkdir -p "$DEST"

  for skill_dir in "$SKILLS_DIR"/sriflow*; do
    [ -f "$skill_dir/SKILL.md" ] || continue
    skill_name=$(basename "$skill_dir")
    if [ "$DRY_RUN" = 0 ]; then
      ln -sfn "$skill_dir" "$DEST/$skill_name"
    fi
    echo "  ✓ $skill_name"
  done

  # CLI helpers for the memory skill
  BIN_DEST="$DEST/bin"
  if [ -d "$SCRIPT_DIR/bin" ]; then
    [ "$DRY_RUN" = 0 ] && mkdir -p "$BIN_DEST"
    for script in "$SCRIPT_DIR"/bin/sriflow-*; do
      [ -f "$script" ] || continue
      [ "$DRY_RUN" = 0 ] && ln -sfn "$script" "$BIN_DEST/$(basename "$script")"
    done
    echo "  ✓ bin/ CLI helpers"
  fi
done

echo ""
echo "Installation complete."
echo "Restart your AI assistant to pick up the new skills."
