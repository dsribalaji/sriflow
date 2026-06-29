#!/bin/sh
# SriFlow uninstaller — removes all installed skills, CLIs, and state
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

echo "SriFlow uninstaller"
echo "==================="
echo ""

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  echo "(dry run — no changes will be made)"
  echo ""
fi

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
  exit 1
fi

echo ""

for HOST in $HOSTS; do
  case "$HOST" in
    claude)
      DEST="$HOME/.claude/skills"
      PROFILE="$HOME/.bashrc"
      ;;
    opencode)
      DEST="$HOME/.config/opencode/skills"
      PROFILE="$HOME/.bashrc"
      ;;
    copilot)
      DEST=".github/copilot-skills"
      PROFILE="$HOME/.bashrc"
      ;;
  esac

  echo "Cleaning $HOST ($DEST)..."

  # Remove skill symlinks
  for skill_dir in "$SKILLS_DIR"/sriflow-*/; do
    skill_name=$(basename "$skill_dir")
    LINK="$DEST/$skill_name"
    if [ -L "$LINK" ]; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "  [dry] remove $LINK"
      else
        rm -f "$LINK"
        echo "  ✓ removed $skill_name"
      fi
    fi
  done

  # Remove router symlink
  LINK="$DEST/sriflow"
  if [ -L "$LINK" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "  [dry] remove $LINK"
    else
      rm -f "$LINK"
      echo "  ✓ removed sriflow (router)"
    fi
  fi

  # Remove bin/ symlinks
  BIN_DIR="$DEST/bin"
  if [ -d "$BIN_DIR" ]; then
    for script in "$BIN_DIR"/sriflow-*; do
      if [ -L "$script" ]; then
        script_name=$(basename "$script")
        if [ "$DRY_RUN" -eq 1 ]; then
          echo "  [dry] remove $script"
        else
          rm -f "$script"
        fi
      fi
    done
    # Remove bin/ dir if empty
    if [ "$DRY_RUN" -eq 0 ]; then
      rmdir "$BIN_DIR" 2>/dev/null && echo "  ✓ removed bin/" || true
    fi
  fi

  # Remove PATH entry from profile
  if [ -f "$PROFILE" ]; then
    if grep -qF "# SriFlow CLI tools" "$PROFILE" 2>/dev/null; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "  [dry] remove PATH entry from $PROFILE"
      else
        sed -i '/# SriFlow CLI tools/d' "$PROFILE"
        sed -i "\|$DEST/bin|d" "$PROFILE"
        echo "  ✓ removed PATH entry from $PROFILE"
      fi
    fi
  fi

  # Clean up copilot-specific directory
  if [ "$HOST" = "copilot" ] && [ -d "$DEST" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "  [dry] remove $DEST"
    else
      rm -rf "$DEST"
      echo "  ✓ removed $DEST"
    fi
  fi

  echo ""
done

# Remove state directory
if [ -d "$HOME/.sriflow" ]; then
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry] remove ~/.sriflow/"
  else
    rm -rf "$HOME/.sriflow"
    echo "✓ removed ~/.sriflow/"
  fi
fi

echo ""
if [ "$DRY_RUN" -eq 1 ]; then
  echo "Dry run complete. Run without --dry-run to apply."
else
  echo "Uninstall complete."
  echo "Restart your AI assistant to unload skills."
fi
