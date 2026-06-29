# Browser — Complete Reference

sriflow's browser surface. TypeScript/Bun daemon, 58 commands, ref-based element selection, persistent Chromium. ~100-200ms per call.

## Quick start

```bash
# One-time: build the binary
cd my-stack && bun install && bun run build

# Set $B once
B=./browse/dist/sriflow-browse

# Drive a page
$B goto https://news.ycombinator.com
$B snapshot -i                   # @e refs for click/fill/inspect
$B click @e30                    # click ref 30
$B text                          # clean page text
$B screenshot /tmp/hn.png
```

## Architecture

```
Agent: $B snapshot -i
        │
        ▼
┌──────────────────┐
│  CLI (compiled)  │
│  POST /command   │
│  localhost:PORT  │
└────────┬─────────┘
         │ HTTP
┌────────▼─────────┐
│  Bun.serve()     │
│  dispatches cmd  │
│  talks to CDP    │
└────────┬─────────┘
         │ CDP
┌────────▼─────────┐
│  Chromium        │
│  persistent tabs │
│  cookies persist │
│  30min idle       │
└──────────────────┘
```

First call starts everything (~3s). Every call after: ~100-200ms.

### State file

`~/.sriflow/browse.json` (atomic write, mode 0o600):

```json
{ "pid": 12345, "port": 34567, "token": "uuid-v4", "startedAt": "...", "binaryVersion": "abc123" }
```

### Port selection

Random 10000-60000. Zero config, zero conflicts across workspaces.

### Auto-shutdown

30 minutes idle. Server exits, CLI auto-restarts on next command.

## Command reference

### READ commands (19)

| Command | Description |
|---------|-------------|
| `text` | Cleaned page text |
| `html` | innerHTML of selector (or full page) |
| `links` | All links as "text -> href" |
| `forms` | Form fields as JSON |
| `accessibility` | Full ARIA tree |
| `js` | Run inline JS expression |
| `eval` | Run JS from file |
| `css` | Computed CSS value |
| `attrs` | Element attributes as JSON |
| `console` | Console messages |
| `network` | Network requests |
| `cookies` | All cookies as JSON |
| `storage` | localStorage + sessionStorage |
| `perf` | Page load timings |
| `dialog` | Dialog messages |
| `is` | State check (visible/enabled/etc) |
| `inspect` | Deep CSS inspection via CDP |
| `media` | All media elements |
| `data` | Structured data: JSON-LD, Open Graph, Twitter Cards |

### WRITE commands (22)

| Command | Description |
|---------|-------------|
| `goto` | Navigate to URL |
| `back` | History back |
| `forward` | History forward |
| `reload` | Reload page |
| `load-html` | Load HTML via setContent |
| `click` | Click element |
| `fill` | Fill input |
| `select` | Select dropdown option |
| `hover` | Hover element |
| `type` | Type into focused element |
| `press` | Press keyboard key |
| `scroll` | Scroll element into view |
| `wait` | Wait for element/network/page load |
| `viewport` | Set viewport size |
| `cookie` | Set cookie on current domain |
| `cookie-import` | Import cookies from JSON |
| `header` | Set custom request header |
| `useragent` | Set user agent |
| `upload` | Upload file(s) |
| `dialog-accept` | Auto-accept next dialog |
| `dialog-dismiss` | Auto-dismiss next dialog |
| `style` | Modify CSS property |
| `cleanup` | Remove page clutter |
| `prettyscreenshot` | Clean screenshot with cleanup |
| `download` | Download URL to disk |
| `scrape` | Bulk download all media |
| `archive` | Save complete page as MHTML |

### META commands (17)

| Command | Description |
|---------|-------------|
| `tabs` | List open tabs |
| `tab` | Switch to tab |
| `tab-each` | Run command on every tab |
| `newtab` | Open new tab |
| `closetab` | Close tab |
| `status` | Health check |
| `stop` | Shutdown server |
| `restart` | Restart server |
| `screenshot` | Save screenshot |
| `pdf` | Save page as PDF |
| `responsive` | Screenshots at mobile/tablet/desktop |
| `chain` | Run JSON command sequence |
| `diff` | Text diff between two pages |
| `url` | Print current URL |
| `snapshot` | Accessibility tree with @e/@c refs |
| `handoff` | Open visible Chrome for user takeover |
| `resume` | Re-snapshot after takeover |
| `connect` | Launch headed Chromium |
| `disconnect` | Disconnect headed browser |
| `frame` | Switch to iframe context |
| `domain-skill` | Per-site notes |
| `skill` | Run a browser-skill |
| `cdp` | Raw CDP method dispatch |
| `memory` | Heap + process snapshot |

## Snapshot system

### Ref-based selection

`$B snapshot -i` produces an annotated accessibility tree:

```
@e1 [button] "Sign In"
@e2 [link] "Documentation"
@e3 [textbox] "Search..."
```

Agent says `$B click @e3` → server resolves via Playwright Locator → `locator.click()`.

### Ref types

- `@e1`, `@e2`, ... — standard interactive refs (ARIA tree)
- `@c1`, `@c2`, ... — cursor-interactive refs (cursor:pointer, onclick, tabindex)

### Snapshot flags

| Flag | Long | Description |
|------|------|-------------|
| `-i` | `--interactive` | Interactive elements only. Auto-enables `-C`. |
| `-c` | `--compact` | Remove empty structural nodes |
| `-d` | `--depth` | Limit tree depth |
| `-s` | `--selector` | Scope to CSS selector |
| `-D` | `--diff` | Unified diff against previous snapshot |
| `-a` | `--annotate` | Annotated screenshot with red overlay |
| `-o` | `--output` | Output path for annotated screenshot |
| `-C` | `--cursor-interactive` | Scan for cursor:pointer elements |

### Ref lifecycle

Refs clear on navigation. After navigation, run `snapshot` again for fresh refs.

Staleness detection: `resolveRef()` checks `locator.count() > 0` before using any ref. Stale refs throw immediately instead of timing out.

## Security

- **Localhost only** — server binds to 127.0.0.1, not reachable from network
- **Bearer token** — random UUID, mode 0o600, every mutating request requires auth
- **Unicode sanitization** — lone surrogates → U+FFFD at every egress point
- **No remote access** — no ngrok, no tunnel, no sidebar agent

## Dev mode vs Automation mode

### Dev mode (localhost)
- Auto-detect local port from package.json / config
- Fast preview, hot-reload visibility
- No stealth headers needed

### Automation mode (external sites)
- Real sites, forms, scraping, auth
- Stealth headers by default
- Cookie import from real browser

## Troubleshooting

**Binary not found:** `cd my-stack && bun install && bun run build`

**Port conflict:** Server auto-selects random port. Kill stale processes: `pkill -f sriflow-browse`

**Stale state:** Delete `~/.sriflow/browse.json` and restart

**Chromium crash:** Server auto-exits. Next command auto-restarts.
