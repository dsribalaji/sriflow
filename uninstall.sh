#!/bin/sh
# SriFlow uninstaller — removes installed skill symlinks from agent dirs.
set -e

echo "SriFlow uninstaller"
echo "==================="
echo ""

for DEST in "$HOME/.claude/skills" "$HOME/.config/opencode/skills" ".github/copilot-skills"; do
  [ -d "$DEST" ] || continue
  for link in "$DEST"/sriflow*; do
    if [ -L "$link" ]; then
      rm -f "$link"
      echo "  removed $link"
    fi
  done
  # remove bin helpers if they're symlinks into this repo
  if [ -d "$DEST/bin" ]; then
    for b in "$DEST"/bin/sriflow-*; do
      [ -L "$b" ] && rm -f "$b"
    done
  fi
done

echo ""
echo "Uninstall complete."
