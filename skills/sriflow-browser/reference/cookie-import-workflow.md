# Cookie Import Workflow (absorbed from gstack/setup-browser-cookies)

Import logged-in sessions from real Chromium browser into headless browse session.

---

## CDP Mode Check

First, check if browse is already connected to real browser:
```bash
$B status 2>/dev/null | grep -q "Mode: cdp" && echo "CDP_MODE=true" || echo "CDP_MODE=false"
```
If `CDP_MODE=true`: "Not needed — connected to real browser via CDP. Cookies and sessions already available." Stop.

---

## How It Works

1. Find browse binary
2. Run `cookie-import-browser` to detect installed browsers and open picker UI
3. User selects which cookie domains to import
4. Cookies decrypted and loaded into Playwright session

---

## Steps

### 1. Find Browse Binary

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
B=""
[ -n "$_ROOT" ] && [ -x "$_ROOT/browse/dist/browse" ] && B="$_ROOT/browse/dist/browse"
[ -z "$B" ] && B="$HOME/browse/dist/browse"
[ -x "$B" ] && echo "READY: $B" || echo "NEEDS_SETUP"
```

If `NEEDS_SETUP`: "Browse needs one-time build (~10 seconds). OK to proceed?" Then STOP and wait.
Run: `cd <skill-dir> && ./setup`

### 2. Open Cookie Picker

```bash
$B cookie-import-browser
```

Auto-detects installed Chromium browsers, opens interactive picker UI in default browser:
- Switch between installed browsers
- Search domains
- Click "+" to import a domain's cookies
- Click trash to remove imported cookies

Tell user: **"Cookie picker opened — select domains to import, then tell me when done."**

### 3. Direct Import (Alternative)

If user specifies domain directly (e.g., `/sriflow-browser cookies github.com`):
```bash
$B cookie-import-browser --domain github.com
```

### 4. Verify

After user confirms done:
```bash
$B cookies
```

Show summary of imported cookies (domain counts).

---

## Notes

- macOS: first import per browser may trigger Keychain dialog — click "Allow" / "Always Allow"
- Linux: v11 cookies may require secret-tool/libsecret access; v10 use standard fallback key
- Cookie picker served on same port as browse server (no extra process)
- Only domain names and cookie counts shown in UI — no cookie values exposed
- Browse session persists cookies between commands, imported cookies work immediately
