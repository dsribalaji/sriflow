## Core QA Patterns

### 1. Verify a page loads correctly
```bash
$B goto https://yourapp.com
$B text                          # content loads?
$B console --errors              # JS errors?
$B network                       # failed requests?
$B is visible ".main-content"    # key elements present?
```

### 2. Test a user flow
```bash
$B goto https://app.com/login
$B snapshot -i                   # see all interactive elements
$B fill @e3 "user@test.com"
$B fill @e4 "password"
$B click @e5                     # submit
$B snapshot -D                   # diff: what changed after submit?
$B is visible ".dashboard"       # success state present?
```

### 3. Verify an action worked
```bash
$B snapshot                      # baseline
$B click @e3                     # do something
$B snapshot -D                   # unified diff shows exactly what changed
```

### 4. Visual evidence for bug reports
```bash
$B snapshot -i -a -o /tmp/annotated.png   # labeled screenshot
$B screenshot /tmp/bug.png                # plain screenshot
$B console --errors                       # error log
```

### 5. Find all clickable elements (including non-ARIA)
```bash
$B snapshot -C                   # finds divs with cursor:pointer, onclick, tabindex
$B click @c1                     # interact with them
```

### 6. Assert element states
```bash
$B is visible ".modal"
$B is enabled "#submit-btn"
$B is disabled "#submit-btn"
$B is checked "#agree-checkbox"
$B is editable "#name-field"
$B is focused "#search-input"
$B js "document.body.textContent.includes('Success')"
```

### 7. Test responsive layouts
```bash
$B responsive /tmp/layout        # mobile + tablet + desktop screenshots
$B viewport 375x812              # or set specific viewport
$B screenshot /tmp/mobile.png
```

### 8. Test file uploads
```bash
$B upload "#file-input" /path/to/file.pdf
$B is visible ".upload-success"
```

### 9. Test dialogs
```bash
$B dialog-accept "yes"           # set up handler
$B click "#delete-button"        # trigger dialog
$B dialog                        # see what appeared
$B snapshot -D                   # verify deletion happened
```

### 10. Compare environments
```bash
$B diff https://staging.app.com https://prod.app.com
```

### 11. Show screenshots to the user
After `$B screenshot`, `$B snapshot -a -o`, or `$B responsive`, always use the Read tool on the output PNG(s) so the user can see them. Without this, screenshots are invisible.

### 12. Render local HTML (no HTTP server needed)
Two paths, pick the cleaner one:
```bash
# HTML file on disk → goto file:// (absolute, or cwd-relative)
$B goto file:///tmp/report.html
$B goto file://./docs/page.html        # cwd-relative
$B goto file://~/Documents/page.html   # home-relative

# HTML generated in memory → load-html reads the file into setContent
echo '<div class="tweet">hello</div>' > /tmp/tweet.html
$B load-html /tmp/tweet.html
```

`goto file://...` is usually cleaner (URL is saved in state, relative asset URLs resolve against the file's dir, scale changes replay naturally). `load-html` uses `page.setContent()` — URL stays `about:blank`, but the content survives `viewport --scale` via in-memory replay. Both are scoped to files under cwd or `$TMPDIR`.

### 13. Retina screenshots (deviceScaleFactor)
```bash
$B viewport 480x600 --scale 2       # 2x deviceScaleFactor
$B load-html /tmp/tweet.html        # or: $B goto file://./tweet.html
$B screenshot /tmp/out.png --selector .tweet-card
# → /tmp/out.png is 2x the pixel dimensions of the element
```
Scale must be 1-3 (policy cap). Changing `--scale` recreates the browser context; refs from `snapshot` are invalidated (rerun `snapshot`), but `load-html` content is replayed automatically.

### 14. Offline render mode (rasterize your own HTML/JSON, zero network)

This is the blessed path for "I just want to turn my own local HTML or JSON into a
PNG/PDF/bytes on disk" — Excalidraw diagrams, tweet/quote cards, og-images,
report rasterization. It is **plain headless, shared Chromium, no proxy, no anti-bot stealth**. Default `$B` is already exactly this; you do not pass
`--headed` or `--proxy`. One Chromium per box, shared by every skill — **do not
`npm i puppeteer` and ship a second browser**.

Two output shapes, pick by what you have:

**A) Visual output → `screenshot --selector` (preferred).** If the thing you want
is a picture of something on the page, screenshot it. The PNG is written from the
browser process straight to disk — the image bytes never cross the CDP wire.

```bash
echo '<div id="card" style="width:400px;height:200px;background:#1da1f2;color:#fff;padding:20px">hi</div>' > /tmp/card.html
$B viewport 480x600 --scale 2
$B load-html /tmp/card.html
$B screenshot /tmp/card.png --selector '#card'   # disk path — no megabytes over CDP
```

**B) Bytes a function returns → `js --out` / `eval --out`.** When a library hands
you the result as a return value (a base64 data URL, a blob, computed JSON) rather
than painting a stable element — e.g. Excalidraw's export function returns a PNG
data URL — write the evaluate result straight to disk. `--out` decodes a
`data:*;base64,...` result to raw bytes automatically (pass `--raw` to write the
literal string). The payload is written by the daemon and never serialized back
out to the CLI/stdout.

```bash
# Load the render bundle, signal readiness, then render-to-file.
$B load-html /tmp/excalidraw-export.html        # bundle sets window.__render + a #done flag
$B wait '#done'                                  # deterministic ready handshake
$B js "window.__render(SCENE_JSON)" --out /tmp/diagram.png   # data URL → decoded PNG on disk
```

`--out` is a WRITE: parent directories are created; malformed base64 errors instead of writing corrupt bytes. Pick A when you can (no CDP transfer at all); reach for B only when the bytes come back as a return value.
