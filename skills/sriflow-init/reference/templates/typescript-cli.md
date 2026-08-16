# TypeScript CLI Scaffold (commander, vitest, biome)

commander for argument parsing, vitest for tests, biome for lint+format.
Layout:

```
<project>/
├── package.json
├── tsconfig.json
├── biome.json
├── src/
│   ├── index.ts            # commander entrypoint
│   └── greet.ts            # logic — no parsing in here
└── test/
    └── greet.test.ts
```

## package.json

```json
{
  "name": "<project>",
  "version": "0.1.0",
  "type": "module",
  "bin": { "<project>": "./dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsx src/index.ts",
    "lint": "biome check .",
    "format": "biome format --write .",
    "test": "vitest run"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

## biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "files": { "ignore": ["dist"] },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 }
}
```

## src/index.ts

```ts
#!/usr/bin/env node
import { Command } from "commander";
import { greet } from "./greet.js";

const program = new Command();

program
  .name("<project>")
  .description("<one-line description>")
  .version("0.1.0")
  .argument("[name]", "who to greet", "world")
  .option("-n, --count <n>", "number of greetings", "1")
  .action((name: string, opts: { count: string }) => {
    console.log(greet(name, Number(opts.count)));
  });

program.parse();
```

## src/greet.ts

```ts
export function greet(name: string, count: number): string {
  const target = name === "" ? "world" : name;
  return Array.from({ length: count }, () => `Hello, ${target}!`).join("\n");
}
```

## test/greet.test.ts

```ts
import { describe, expect, it } from "vitest";
import { greet } from "../src/greet.js";

describe("greet", () => {
  it("greets the given name", () => {
    expect(greet("Sri", 1)).toBe("Hello, Sri!");
  });

  it("repeats count times", () => {
    expect(greet("Sri", 3)).toBe("Hello, Sri!\nHello, Sri!\nHello, Sri!");
  });
});
```

Run: `npm test`.

## Build

```bash
npm run build      # tsc → dist/
npm link           # makes `bin` executable available locally
```

## CI

Workflow at `reference/templates/ci-github-actions.md` — TypeScript section
(`npm ci`, `npm run lint`, `npm run build`, `npm test`).

## Init checklist

- [ ] `package-lock.json` committed (required for `npm ci` in CI)
- [ ] logic in `src/` modules, parsing only in `index.ts`
- [ ] one passing vitest suite
- [ ] `biome check .` clean on commit #1
- [ ] `.gitignore` Node/TS block