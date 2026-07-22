## Scope Questions (AUQ D1)

Ask once before starting if any of these are unclear:

1. **What to extract?** — text, links, form data, specific element, structured data
2. **How deep?** — single page, follow links N levels, paginate through all results
3. **What to do with the data?** — return in chat, save to file, pass to test runner

Do not ask all three at once. Ask only what's actually unclear. If the user said "scrape product names from example.com/products", that answers all three — proceed.

D1 format if needed:

```
D1 — What should I extract from this page?
ELI10: You asked me to browse a page but didn't say what you want from it.
       Should I summarize the content, grab specific elements, list links, or extract structured data?
Recommendation: A — page summary covers most use cases.
A) Page summary — title, H1, main content in 2-3 sentences (recommended)
B) Specific element — tell me what to find (selector, text, heading)
C) All links — returns a list of every href on the page
D) Structured data — extract tables, lists, product cards as JSON
```

---

## Operational Self-Improvement

Before completing, if you discovered a non-obvious pattern, pitfall, or insight during this session, log it to project memory:

```bash
if [ -f "SRIFLOW_MEMORY.md" ]; then
  cat >> SRIFLOW_MEMORY.md << LOGEOF

### BROWSER_LEARNING | $(date -u +%Y-%m-%dT%H:%M:%SZ)
Key: SHORT_KEY
Insight: DESCRIPTION
Confidence: N/10
LOGEOF
fi
```

Only log genuine discoveries. "Port 3000 is the dev port" is not worth logging if it came from package.json as expected. "This app runs on 5173 despite package.json saying 3000 because of a .env.local override" is worth logging.
