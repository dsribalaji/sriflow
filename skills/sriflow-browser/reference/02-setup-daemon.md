## SETUP (run this check BEFORE any browse command)

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
B=""
# 1. In-repo (working on sriflow itself)
[ -n "$_ROOT" ] && [ -x "$_ROOT/browse/dist/browse" ] && B="$_ROOT/browse/dist/browse"
# 2. Global install (install.sh symlinks browse/ as <skills>/sriflow-browse)
for _cand in \
  "$HOME/.claude/skills/sriflow-browse/dist/browse" \
  "$HOME/.config/opencode/skills/sriflow-browse/dist/browse"; do
  [ -z "$B" ] && [ -x "$_cand" ] && B="$_cand"
done
if [ -n "$B" ] && [ -x "$B" ]; then
  echo "READY: $B"
else
  echo "NEEDS_SETUP"
fi
```

If `NEEDS_SETUP`:
1. Tell the user: "sriflow browse needs a one-time setup. OK to proceed?" Then STOP and wait.
2. Resolve the browse dir and run its setup script:
   `_BROWSE="$_ROOT/browse"; [ -d "$_BROWSE" ] || _BROWSE="$HOME/.claude/skills/sriflow-browse"; [ -d "$_BROWSE" ] || _BROWSE="$HOME/.config/opencode/skills/sriflow-browse"`
   then `(cd "$_BROWSE" && ./setup)`
3. If `bun` is not installed, the setup script prints install instructions; or install it: `curl -fsSL https://bun.sh/install | bash`

## Daemon Architecture

The browse daemon runs as a long-lived process on localhost. The `$B` wrapper script:
1. Reads the state file (`.sriflow/browse.json`) to find the daemon port
2. If daemon not running, starts it automatically (~3s)
3. Sends commands via HTTP POST to `/command`
4. Returns the result to stdout

State file location (cascade): git root `.sriflow/browse.json` → CWD `.sriflow/browse.json` → `~/.sriflow/browse.json`
