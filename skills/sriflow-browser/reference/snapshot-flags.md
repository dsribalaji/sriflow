# Snapshot Flags Reference

**Syntax:** `$B snapshot [flags]`

## Flags

```
-i        --interactive           Interactive elements only (buttons, links, inputs) with @e refs. Also auto-enables cursor-interactive scan (-C) to capture dropdowns and popovers.
-c        --compact               Compact (no empty structural nodes)
-d <N>    --depth                 Limit tree depth (0 = root only, default: unlimited)
-s <sel>  --selector              Scope to CSS selector
-D        --diff                  Unified diff against previous snapshot (first call stores baseline)
-a        --annotate              Annotated screenshot with red overlay boxes and ref labels
-o <path> --output                Output path for annotated screenshot (default: <temp>/browse-annotated.png)
-C        --cursor-interactive    Cursor-interactive elements (@c refs — divs with pointer, onclick). Auto-enabled when -i is used.
-H <json> --heatmap               Color-coded overlay screenshot from JSON map: '{"@e1":"green","@e3":"red"}'. Valid colors: green, yellow, red, blue, orange, gray.
```

All flags can be combined freely. `-o` only applies when `-a` is also used.
Example: `$B snapshot -i -a -C -o /tmp/annotated.png`

## Flag Details

- **`-d <N>`**: depth 0 = root element only, 1 = root + direct children, etc. Default: unlimited. Works with all other flags including `-i`.
- **`-s <sel>`**: any valid CSS selector (`#main`, `.content`, `nav > ul`, `[data-testid="hero"]`). Scopes the tree to that subtree.
- **`-D`**: outputs a unified diff (lines prefixed with `+`/`-`/` `) comparing the current snapshot against the previous one. First call stores the baseline and returns the full tree. Baseline persists across navigations until the next `-D` call resets it.
- **`-a`**: saves an annotated screenshot (PNG) with red overlay boxes and @ref labels drawn on each interactive element. The screenshot is a separate output from the text tree — both are produced when `-a` is used.

## Ref Numbering

- **@e refs** are assigned sequentially (@e1, @e2, ...) in tree order.
- **@c refs** from `-C` are numbered separately (@c1, @c2, ...).

After snapshot, use @refs as selectors in any command:
```bash
$B click @e3       $B fill @e4 "value"     $B hover @e1
$B html @e2        $B css @e5 "color"      $B attrs @e6
$B click @c1       # cursor-interactive ref (from -C)
```

## Output Format

Indented accessibility tree with @ref IDs, one element per line:
```
  @e1 [heading] "Welcome" [level=1]
  @e2 [textbox] "Email"
  @e3 [button] "Submit"
```

Refs are invalidated on navigation — run `snapshot` again after `goto`.
