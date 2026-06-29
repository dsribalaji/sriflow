# Lens 4: LLM TRUST BOUNDARIES

If the diff contains no LLM API calls, prompt construction, or LLM output handling: skip this lens and note `LLM TRUST: no LLM integration in diff.`

## Prompt injection vectors

User content flowing into an LLM prompt without sanitization creates prompt injection risk. The attacker controls the user content; if that content instructs the LLM to ignore previous instructions or exfiltrate data, the model may comply.

Check for:
- User-controlled strings concatenated directly into a system prompt or user message: `systemPrompt = "You are an assistant. " + req.body.userContext`
- User profile fields, message history, or document content inserted into prompts without any treatment
- Tool descriptions or few-shot examples built from user-supplied data

For each instance: is there any sanitization, escaping, or structural separation (e.g., XML tags, delimiters) between the instruction content and the user content? If not, flag as `CRITICAL`.

## Structural prompt injection
- System prompt and user content not structurally separated — a user who sends `</system>` or `[INST]` can escape their content slot
- Delimiter injection: system prompt uses `---` as a section delimiter, user can inject `---` to close the section early

Flag structural injection vectors as `CRITICAL`.

## LLM output trust
- LLM-generated code executed via `eval()` or `exec()` without review or sandboxing
- LLM-generated SQL executed directly against the database (double injection risk: user -> LLM -> SQL)
- LLM-generated HTML rendered into the DOM without escaping (LLM output -> XSS)
- LLM-generated file paths used in `fs.readFile` / `fs.writeFile` without validation
- LLM-generated URLs passed to HTTP clients (LLM output -> SSRF)

Any of these: `CRITICAL`. The LLM is not a trusted source for values that will be interpreted by the runtime.

## Unvalidated structured LLM output
- `JSON.parse(llmResponse)` without try/catch — the LLM may return malformed JSON
- Accessing `llmJson.field` without checking the field exists — structured output schemas are not enforced by the model
- Using `llmJson.count` as a loop bound without bounding the value first
- Schema validation missing for function-calling / tool-use responses

Flag as `WARN`.

## Trust boundary violations
- LLM API key or prompt content logged to output that could be observed (console, log files, error responses)
- Rate limiting absent on endpoints that trigger LLM calls (user can cause unbounded spend)
- User-supplied `max_tokens`, `temperature`, or model parameters passed directly to the LLM API without validation
- LLM response content returned raw to the user without stripping system-internal fields (e.g., internal reasoning, tool call results)

Flag API key exposure as `CRITICAL`. Flag rate-limiting gaps on LLM endpoints as `WARN`. Flag raw response passthrough as `NITPICK` unless it leaks internal structure.

## Context window poisoning
- User-controlled data of unbounded length inserted into the prompt context without truncation or size limits
- A single user message can exhaust the context window, causing the model to drop earlier (more trusted) instructions

Flag as `WARN`.
