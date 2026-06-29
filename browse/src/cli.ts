/**
 * Minimal CLI for sriflow browse daemon
 *
 * Handles: state file read, server health check, command sending via HTTP.
 * Simplified from gstack's cli.ts — no tunnel, no terminal-agent, no xvfb.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ServerState {
  port: number;
  token: string | null;
  pid: number;
  surface: 'local';
  version?: string;
  serverVersion?: string;
  clientVersion?: string;
  daemonVersion?: string;
  bunRuntime?: string;
  bunVersion?: string;
  bunfs?: string;
}

const STATE_PATH = path.join(
  process.env.HOME || '~',
  '.sriflow',
  'browse.json'
);

const BROWSE_RELATIVE = 'browse/src/server.ts';

/**
 * Resolve the server script path for sriflow.
 *
 * Priority:
 * 1. SRIFLOW_BROWSE_SRC env override
 * 2. bunfs:// path (compiled binary)
 * 3. Walk up from this file to find browse/src/server.ts
 */
export function resolveServerScript(
  env: NodeJS.ProcessEnv = process.env,
  bunfsPrefix?: string,
  fallbackExecPath?: string,
): string {
  // Env override
  if (env.SRIFLOW_BROWSE_SRC) return env.SRIFLOW_BROWSE_SRC;

  // Bunified binary: bunfs:// path
  const bunfsArg = bunfsPrefix ?? process.argv[1];
  if (bunfsArg?.startsWith('bunfs://')) {
    const bunfsRoot = bunfsArg.replace('bunfs://', '/');
    const bunfsServerPath = path.join(bunfsRoot, BROWSE_RELATIVE);
    if (fs.existsSync(bunfsServerPath)) return bunfsServerPath;
  }

  // Fallback exec path
  if (fallbackExecPath) {
    const fromExec = path.join(path.dirname(fallbackExecPath), BROWSE_RELATIVE);
    if (fs.existsSync(fromExec)) return fromExec;
  }

  // Walk up from this file (src/cli.ts → browse/src/server.ts)
  const srcDir = path.dirname(new URL(import.meta.url).pathname);
  const serverPath = path.join(srcDir, 'server.ts');
  if (fs.existsSync(serverPath)) return serverPath;

  // Final fallback: assume standard sriflow layout
  return path.resolve(process.cwd(), 'my-stack/browse/src/server.ts');
}

export function readState(): ServerState | null {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    const state = JSON.parse(raw) as ServerState;
    if (!state || typeof state.port !== 'number') return null;
    if (!state.token || typeof state.token !== 'string') return null;
    return state;
  } catch {
    return null;
  }
}

export async function isServerHealthy(port: number): Promise<boolean> {
  try {
    const state = readState();
    if (!state || state.port !== port) return false;
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return false;
    const data = await res.json() as { pid?: number; daemonVersion?: string };
    if (!data || typeof data !== 'object') return false;
    if (typeof data.pid !== 'number') return false;
    return true;
  } catch {
    return false;
  }
}
