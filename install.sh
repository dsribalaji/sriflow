#!/bin/sh
# SriFlow installer — detects hosts and installs skills to correct directories
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

echo "SriFlow installer"
echo "================="
echo ""

HOSTS=""

if [ -d "$HOME/.claude" ] || command -v claude >/dev/null 2>&1; then
  HOSTS="$HOSTS claude"
  echo "Detected: Claude Code"
fi

if [ -d "$HOME/.config/opencode" ] || command -v opencode >/dev/null 2>&1; then
  HOSTS="$HOSTS opencode"
  echo "Detected: OpenCode"
fi

if [ -d "$HOME/.github" ] || command -v gh >/dev/null 2>&1; then
  HOSTS="$HOSTS copilot"
  echo "Detected: GitHub Copilot"
fi

if [ -z "$HOSTS" ]; then
  echo "No supported hosts detected."
  echo "Install Claude Code, OpenCode, or GitHub Copilot first."
  exit 1
fi

echo ""

for HOST in $HOSTS; do
  case "$HOST" in
    claude)
      DEST="$HOME/.claude/skills"
      ;;
    opencode)
      DEST="$HOME/.config/opencode/skills"
      ;;
    copilot)
      DEST=".github/copilot-skills"
      ;;
  esac

  echo "Installing to $HOST ($DEST)..."
  mkdir -p "$DEST"

  for skill_dir in "$SKILLS_DIR"/sriflow-*/; do
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
      ln -sfn "$skill_dir" "$DEST/$skill_name"
      echo "  ✓ $skill_name"
    fi
  done

  if [ -f "$SKILLS_DIR/sriflow/SKILL.md" ]; then
    ln -sfn "$SKILLS_DIR/sriflow" "$DEST/sriflow"
    echo "  ✓ sriflow (router)"
  fi

  echo ""
done

echo "Installation complete."
echo "Restart your AI assistant to pick up the new skills."
