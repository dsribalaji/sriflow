# License File Templates

MIT is the default for sriflow-init personal projects. Offer the alternatives
below when the user's context warrants them. The rule: license choice is a
user decision, never an agent assumption — ask in Step 1 if the project may
leave personal scope.

## MIT (default — permissive, universal)

Write verbatim to `LICENSE`, filling the copyright line:

```
MIT License

Copyright (c) 2026 <YOUR NAME>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## When to choose something else

| Context | License | Why |
|---------|---------|-----|
| Personal/hobby, no restrictions | **MIT** | Permissive, zero obligations, broadly compatible |
| Open-source library with corporate adoption | **Apache-2.0** | Permissive + explicit patent grant, safer for libraries |
| Copyleft enforcement desired | **GPL-3.0** | Derivative works must stay open source |
| Nothing, public domain intent | **Unlicense** | No copyright at all; not recommended for libraries |
| Not for public release | none — add `LICENSE` note | Add a `NOTICE` or keep `LICENSE` absent |

## Rules

1. The full MIT text above is the license — no truncated or paraphrased
   versions.
2. `<YOUR NAME>` is replaced with the name the user gives in Step 1, never
   guessed from the repo.
3. Only one license file per project. If the user is unsure and the project
   stays personal, MIT. If the user is unsure and the project is a library
   that may be consumed by others, Apache-2.0.
4. Record the choice in `SRIFLOW_MEMORY.md` so the decision survives.