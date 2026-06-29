# Puppeteer → browse Cheatsheet

Migrating from Puppeteer? Here's the 1:1 mapping for the core workflow:

| Puppeteer | browse |
|---|---|
| `await page.goto(url)` | `$B goto <url>` |
| `await page.setContent(html)` | `$B load-html <file>` (or `$B goto file://<abs>`) |
| `await page.setViewport({width, height})` | `$B viewport WxH` |
| `await page.setViewport({width, height, deviceScaleFactor: 2})` | `$B viewport WxH --scale 2` |
| `await (await page.$('.x')).screenshot({path})` | `$B screenshot <path> --selector .x` |
| `await page.screenshot({fullPage: true, path})` | `$B screenshot <path>` (full page default) |
| `await page.screenshot({clip: {x, y, w, h}, path})` | `$B screenshot <path> --clip x,y,w,h` |
| `const r = await page.evaluate(fn)` | `$B js "<expr>"` (result to stdout) |
| `fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1],'base64'))` | `$B js "<expr>" --out <file>` (data URL auto-decoded) |

## Worked Example

The tweet-renderer flow — Puppeteer → browse:

```bash
# Generate HTML in memory, render at 2x scale, screenshot the tweet card.
echo '<div class="tweet-card" style="width:400px;height:200px;background:#1da1f2;color:white;padding:20px">hello</div>' > /tmp/tweet.html
$B viewport 480x600 --scale 2
$B load-html /tmp/tweet.html
$B screenshot /tmp/out.png --selector .tweet-card
# /tmp/out.png is 800x400 px, crisp (2x deviceScaleFactor).
```

## Aliases

- Typing `setcontent` or `set-content` routes to `load-html` automatically.
- Typing a typo (`load-htm`) returns `Did you mean 'load-html'?`.

## Don't Bundle Your Own Puppeteer/Chromium

`browse` is the one shared Chromium per box. Skills that need to rasterize local HTML/JSON (diagrams, cards, og-images) should route through `browse` — `screenshot --selector` for visual output, `load-html` + `js --out` for bytes a function returns — instead of `npm i puppeteer` and downloading a second Chromium that drifts out of version sync. One install to pin, one daemon's lifecycle to manage.
