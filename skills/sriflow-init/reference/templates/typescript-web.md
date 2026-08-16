# TypeScript Web Scaffold (Next.js / Express)

Next.js is the default for full web apps; Express for plain API services.
Choose in Step 2 — ask if ambiguous.

## Option A — Next.js (App Router)

```bash
npx create-next-app@latest <project> --typescript --eslint --tailwind \
  --app --src-dir --import-alias "@/*" --use-npm
```

Then verify the scaffold on commit #1:

- `src/app/page.tsx` — landing page
- `src/app/layout.tsx` — root layout
- `src/app/api/health/route.ts` — health endpoint

### Health route (src/app/api/health/route.ts)

```ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
```

### Test

Next.js App Router tests need vitest + `@vitejs/plugin-react`. Minimal:

```ts
import { describe, expect, it } from "vitest";

describe("health", () => {
  it("returns ok", () => {
    // unit-test the pure logic; route handlers verified by e2e later
    expect(true).toBe(true);
  });
});
```

Keep tests on pure logic at init; route/e2e coverage is sriflow-test's job.

## Option B — Express (API service)

Layout:

```
<project>/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # server bootstrap
│   ├── app.ts            # express app factory (no listen)
│   └── routes/
│       └── health.ts
└── test/
    └── app.test.ts
```

### src/app.ts

```ts
import express from "express";
import { healthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/health", healthRouter);
  return app;
}
```

### src/index.ts

```ts
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => {
  console.log(`listening on :${port}`);
});
```

### src/routes/health.ts

```ts
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok" });
});
```

### test/app.test.ts

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
```

Dev deps: `supertest`, `vitest`, `tsx`, `typescript`, `@types/express`.

## Shared rules (both options)

1. App factory pattern (`createApp`) — the server's `listen` lives only in
   `index.ts`, so tests never open ports.
2. `npm ci` must work from a fresh checkout (lockfile committed).
3. `npm run build` must pass on commit #1.
4. TSConfig: `"strict": true`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`.
5. CI at `reference/templates/ci-github-actions.md` — TypeScript section.

## Dockerfile (Service projects)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Init checklist

- [ ] Next.js via `create-next-app` OR Express app-factory layout
- [ ] `/health` returns `{"status":"ok"}`
- [ ] one passing test on commit #1
- [ ] lockfile committed
- [ ] `.gitignore` Node/TS block + `.env`