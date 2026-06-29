# Offline Render Mode

Rasterize your own HTML/JSON, zero network. Blessed path for "turn local HTML or JSON into PNG/PDF/bytes on disk" — Excalidraw diagrams, tweet/quote cards, og-images, report rasterization.

**Plain headless, shared Chromium, no proxy, no anti-bot stealth.** Default `$B` is already exactly this; do not pass `--headed` or `--proxy`. One Chromium per box, shared by every skill — **do not `npm i puppeteer` and ship a second browser**.

## Two Output Shapes

### A) Visual output → `screenshot --selector` (preferred)

If the thing you want is a picture of something on the page, screenshot it. The PNG is written from the browser process straight to disk — the image bytes never cross the CDP wire.

```bash
echo '<div id="card" style="width:400px;height:200px;background:#1da1f2;color:#fff;padding:20px">hi</div>' > /tmp/card.html
$B viewport 480x600 --scale 2
$B load-html /tmp/card.html
$B screenshot /tmp/card.png --selector '#card'   # disk path — no megabytes over CDP
```

### B) Bytes a function returns → `js --out` / `eval --out`

When a library hands you the result as a return value (a base64 data URL, a blob, computed JSON) rather than painting a stable element — e.g. Excalidraw's export function returns a PNG data URL — write the evaluate result straight to disk. `--out` decodes a `data:*;base64,...` result to raw bytes automatically (pass `--raw` to write the literal string). The payload is written by the daemon and never serialized back out to the CLI/stdout.

```bash
# Load the render bundle, signal readiness, then render-to-file.
$B load-html /tmp/excalidraw-export.html        # bundle sets window.__render + a #done flag
$B wait '#done'                                  # deterministic ready handshake
$B js "window.__render(SCENE_JSON)" --out /tmp/diagram.png   # data URL → decoded PNG on disk
```

`--out` is a WRITE: parent directories are created; malformed base64 errors instead of writing corrupt bytes. Pick A when you can (no CDP transfer at all); reach for B only when the bytes come back as a return value.

## Retina Screenshots (deviceScaleFactor)

```bash
$B viewport 480x600 --scale 2       # 2x deviceScaleFactor
$B load-html /tmp/tweet.html        # or: $B goto file://./tweet.html
$B screenshot /tmp/out.png --selector .tweet-card
# → /tmp/out.png is 2x the pixel dimensions of the element
```

Scale must be 1-3 (policy cap). Changing `--scale` recreates the browser context; refs from `snapshot` are invalidated (rerun `snapshot`), but `load-html` content is replayed automatically.
