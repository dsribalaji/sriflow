# Lens 6: TRIM AUDIT

This lens asks a single question: **which lines in this diff do not need to exist at all?**

Not "which lines could be written better" — that's Complexity. Not "which lines have bugs" — that's Correctness. This is the pure waste finder: code that has zero runtime value and adds only noise.

## Development leftovers
- `console.log`, `print`, `logger.debug`, `pp`, `puts` statements that are clearly debugging artifacts (not intentional logging)
- `debugger` statements
- `breakpoint()` calls
- Commented-out code blocks (actual code, not explanatory comments)

List by file and line: `path/file.ext:LINE-LINE: NITPICK: development artifact. Fix: delete.`

## Wrapper-only functions
Functions whose entire body is a single call to another function with identical arguments:

```javascript
// This:
function getUser(id) {
  return userRepository.getUser(id);
}
// Only exists to rename. Delete it; call userRepository.getUser directly.
```

List by file and function name: `path/file.ext:LINE: NITPICK: wrapper-only function <name>. Fix: delete; callers use <wrapped_function> directly.`

## Immediately-returned variables
Variables that are assigned a value on one line and returned on the next, with no operations on the variable between assignment and return:

```javascript
// This:
const result = computeValue(x);
return result;
// Is: return computeValue(x);
```

List by file and line.

## Restating-the-obvious comments
Comments that describe what the code obviously does, adding no information about WHY:

```javascript
// Increment counter   <- obvious from i++
i++;

// Return the user    <- obvious from return user
return user;
```

List by file and line: `path/file.ext:LINE: NITPICK: comment restates code. Fix: delete comment.`

## Redundant imports
Imports that are never referenced in the file.

Before flagging, confirm with:
```bash
grep -n "<imported_name>" path/to/file.ext
```

List by file and line.

## Blank-line ceremony
More than 2 consecutive blank lines, or blank lines at the start/end of a function body. Only flag if there are 3+ consecutive blanks — 1-2 are formatting, not waste.

## Output

Start with: `TRIM AUDIT: lines that do not need to exist:`

Then list findings as `NITPICK` findings in the standard format. If no trim findings: `TRIM AUDIT: diff is clean — no trim targets found.`
