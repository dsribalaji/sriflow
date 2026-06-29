// @bun
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = import.meta.require;

// browse/src/file-permissions.ts
import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
function warnIcaclsFailure(fsPath, err) {
  if (warnedOnce)
    return;
  warnedOnce = true;
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[sriflow] Failed to restrict Windows ACL on ${fsPath}: ${msg}
` + `  Sensitive files may be readable by other accounts on this machine.
` + `  This warning appears once per process; subsequent failures are silent.`);
}
function restrictFilePermissions(filePath) {
  if (process.platform === "win32") {
    try {
      const user = os.userInfo().username;
      execFileSync("icacls", [filePath, "/inheritance:r", "/grant:r", `${user}:(F)`], { stdio: "ignore" });
    } catch (err) {
      warnIcaclsFailure(filePath, err);
    }
    return;
  }
  try {
    fs.chmodSync(filePath, 384);
  } catch {}
}
function restrictDirectoryPermissions(dirPath) {
  if (process.platform === "win32") {
    try {
      const user = os.userInfo().username;
      execFileSync("icacls", [dirPath, "/inheritance:r", "/grant:r", `${user}:(OI)(CI)(F)`], { stdio: "ignore" });
    } catch (err) {
      warnIcaclsFailure(dirPath, err);
    }
    return;
  }
  try {
    fs.chmodSync(dirPath, 448);
  } catch {}
}
function writeSecureFile(filePath, data) {
  fs.writeFileSync(filePath, data, { mode: 384 });
  restrictFilePermissions(filePath);
}
function mkdirSecure(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true, mode: 448 });
  restrictDirectoryPermissions(dirPath);
}
var warnedOnce = false;
var init_file_permissions = () => {};

// browse/src/buffers.ts
class CircularBuffer {
  buffer;
  head = 0;
  _size = 0;
  _totalAdded = 0;
  capacity;
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }
  push(entry) {
    const index = (this.head + this._size) % this.capacity;
    this.buffer[index] = entry;
    if (this._size < this.capacity) {
      this._size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
    this._totalAdded++;
  }
  toArray() {
    const result = [];
    for (let i = 0;i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity]);
    }
    return result;
  }
  last(n) {
    const count = Math.min(n, this._size);
    const result = [];
    const start = (this.head + this._size - count) % this.capacity;
    for (let i = 0;i < count; i++) {
      result.push(this.buffer[(start + i) % this.capacity]);
    }
    return result;
  }
  get length() {
    return this._size;
  }
  get totalAdded() {
    return this._totalAdded;
  }
  clear() {
    this.head = 0;
    this._size = 0;
  }
  get(index) {
    if (index < 0 || index >= this._size)
      return;
    return this.buffer[(this.head + index) % this.capacity];
  }
  set(index, entry) {
    if (index < 0 || index >= this._size)
      return;
    this.buffer[(this.head + index) % this.capacity] = entry;
  }
}
function addConsoleEntry(entry) {
  consoleBuffer.push(entry);
}
function addNetworkEntry(entry) {
  networkBuffer.push(entry);
}
function addDialogEntry(entry) {
  dialogBuffer.push(entry);
}
var HIGH_WATER_MARK = 50000, consoleBuffer, networkBuffer, dialogBuffer;
var init_buffers = __esm(() => {
  consoleBuffer = new CircularBuffer(HIGH_WATER_MARK);
  networkBuffer = new CircularBuffer(HIGH_WATER_MARK);
  dialogBuffer = new CircularBuffer(HIGH_WATER_MARK);
});

// browse/src/activity.ts
function filterArgs(command, args) {
  if (!args || args.length === 0)
    return args;
  if (command === "fill" && args.length >= 2) {
    const selector = args[0];
    if (/password|passwd|secret|token/i.test(selector)) {
      return [selector, "[REDACTED]"];
    }
    return args;
  }
  if (command === "header" && args.length >= 1) {
    const headerLine = args[0];
    if (/^(authorization|x-api-key|cookie|set-cookie)/i.test(headerLine)) {
      const colonIdx = headerLine.indexOf(":");
      if (colonIdx > 0) {
        return [headerLine.substring(0, colonIdx + 1) + "[REDACTED]"];
      }
    }
    return args;
  }
  if (command === "cookie" && args.length >= 1) {
    const cookieStr = args[0];
    const eqIdx = cookieStr.indexOf("=");
    if (eqIdx > 0) {
      return [cookieStr.substring(0, eqIdx + 1) + "[REDACTED]"];
    }
    return args;
  }
  if (command === "type") {
    return ["[REDACTED]"];
  }
  return args.map((arg) => {
    if (arg.startsWith("http://") || arg.startsWith("https://")) {
      try {
        const url = new URL(arg);
        let redacted = false;
        for (const key of url.searchParams.keys()) {
          if (SENSITIVE_PARAM_PATTERN.test(key)) {
            url.searchParams.set(key, "[REDACTED]");
            redacted = true;
          }
        }
        return redacted ? url.toString() : arg;
      } catch {
        return arg;
      }
    }
    return arg;
  });
}
function truncateResult(result) {
  if (!result)
    return;
  if (result.length <= 200)
    return result;
  return result.substring(0, 200) + "...";
}
function emitActivity(entry) {
  const full = {
    ...entry,
    id: nextId++,
    timestamp: Date.now(),
    args: entry.args ? filterArgs(entry.command || "", entry.args) : undefined,
    result: truncateResult(entry.result)
  };
  activityBuffer.push(full);
  for (const notify of subscribers) {
    queueMicrotask(() => {
      try {
        notify(full);
      } catch {}
    });
  }
  return full;
}
function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
function getActivityAfter(afterId) {
  const total = activityBuffer.totalAdded;
  const allEntries = activityBuffer.toArray();
  if (afterId === 0) {
    return { entries: allEntries, gap: false, totalAdded: total };
  }
  const oldestId = allEntries.length > 0 ? allEntries[0].id : nextId;
  if (afterId < oldestId) {
    return {
      entries: allEntries,
      gap: true,
      gapFrom: afterId + 1,
      availableFrom: oldestId,
      totalAdded: total
    };
  }
  const filtered = allEntries.filter((e) => e.id > afterId);
  return { entries: filtered, gap: false, totalAdded: total };
}
function getActivityHistory(limit = 50) {
  const allEntries = activityBuffer.toArray();
  const sliced = limit < allEntries.length ? allEntries.slice(-limit) : allEntries;
  return { entries: sliced, totalAdded: activityBuffer.totalAdded };
}
function getSubscriberCount() {
  return subscribers.size;
}
var BUFFER_CAPACITY = 1000, activityBuffer, nextId = 1, subscribers, SENSITIVE_COMMANDS, SENSITIVE_PARAM_PATTERN;
var init_activity = __esm(() => {
  init_buffers();
  activityBuffer = new CircularBuffer(BUFFER_CAPACITY);
  subscribers = new Set;
  SENSITIVE_COMMANDS = new Set(["fill", "type", "cookie", "header"]);
  SENSITIVE_PARAM_PATTERN = /\b(password|token|secret|key|auth|bearer|api[_-]?key)\b/i;
});

// browse/src/platform.ts
import * as os2 from "os";
import * as path from "path";
function isPathWithin(resolvedPath, dir) {
  return resolvedPath === dir || resolvedPath.startsWith(dir + path.sep);
}
var IS_WINDOWS, TEMP_DIR;
var init_platform = __esm(() => {
  IS_WINDOWS = process.platform === "win32";
  TEMP_DIR = IS_WINDOWS ? os2.tmpdir() : "/tmp";
});

// browse/src/path-security.ts
var exports_path_security = {};
__export(exports_path_security, {
  validateTempPath: () => validateTempPath,
  validateReadPath: () => validateReadPath,
  validateOutputPath: () => validateOutputPath,
  escapeRegExp: () => escapeRegExp,
  SAFE_DIRECTORIES: () => SAFE_DIRECTORIES
});
import * as fs2 from "fs";
import * as path2 from "path";
function validateOutputPath(filePath) {
  const resolved = path2.resolve(filePath);
  try {
    const stat = fs2.lstatSync(resolved);
    if (stat.isSymbolicLink()) {
      const realTarget = fs2.realpathSync(resolved);
      const isSafe2 = SAFE_DIRECTORIES.some((dir2) => isPathWithin(realTarget, dir2));
      if (!isSafe2) {
        throw new Error(`Path must be within: ${SAFE_DIRECTORIES.join(", ")}`);
      }
      return;
    }
  } catch (e) {
    if (e.code !== "ENOENT")
      throw e;
  }
  let dir = path2.dirname(resolved);
  let realDir;
  try {
    realDir = fs2.realpathSync(dir);
  } catch {
    try {
      realDir = fs2.realpathSync(path2.dirname(dir));
    } catch {
      throw new Error(`Path must be within: ${SAFE_DIRECTORIES.join(", ")}`);
    }
  }
  const realResolved = path2.join(realDir, path2.basename(resolved));
  const isSafe = SAFE_DIRECTORIES.some((dir2) => isPathWithin(realResolved, dir2));
  if (!isSafe) {
    throw new Error(`Path must be within: ${SAFE_DIRECTORIES.join(", ")}`);
  }
}
function validateReadPath(filePath) {
  const resolved = path2.resolve(filePath);
  let realPath;
  try {
    realPath = fs2.realpathSync(resolved);
  } catch (err) {
    if (err.code === "ENOENT") {
      try {
        const dir = fs2.realpathSync(path2.dirname(resolved));
        realPath = path2.join(dir, path2.basename(resolved));
      } catch {
        realPath = resolved;
      }
    } else {
      throw new Error(`Cannot resolve real path: ${filePath} (${err.code})`);
    }
  }
  const isSafe = SAFE_DIRECTORIES.some((dir) => isPathWithin(realPath, dir));
  if (!isSafe) {
    throw new Error(`Path must be within: ${SAFE_DIRECTORIES.join(", ")}`);
  }
}
function validateTempPath(filePath) {
  const resolved = path2.resolve(filePath);
  let realPath;
  try {
    realPath = fs2.realpathSync(resolved);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("File not found");
    }
    throw new Error(`Cannot resolve path: ${filePath}`);
  }
  const isSafe = TEMP_ONLY.some((dir) => isPathWithin(realPath, dir));
  if (!isSafe) {
    throw new Error(`Path must be within: ${TEMP_ONLY.join(", ")} (remote file serving is restricted to temp directory)`);
  }
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var SAFE_DIRECTORIES, TEMP_ONLY;
var init_path_security = __esm(() => {
  init_platform();
  SAFE_DIRECTORIES = [TEMP_DIR, process.cwd()].map((d) => {
    try {
      return fs2.realpathSync(d);
    } catch {
      return d;
    }
  });
  TEMP_ONLY = [TEMP_DIR].map((d) => {
    try {
      return fs2.realpathSync(d);
    } catch {
      return d;
    }
  });
});

// browse/src/url-validation.ts
import { fileURLToPath, pathToFileURL } from "url";
import * as path3 from "path";
import * as os3 from "os";
function isBlockedIpv6(addr) {
  const normalized = addr.toLowerCase().replace(/^\[|\]$/g, "");
  if (!normalized.includes(":"))
    return false;
  return BLOCKED_IPV6_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}
function normalizeHostname(hostname) {
  let h = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
  if (h.endsWith("."))
    h = h.slice(0, -1);
  return h;
}
function isMetadataIp(hostname) {
  try {
    const probe = new URL(`http://${hostname}`);
    const normalized = probe.hostname;
    if (BLOCKED_METADATA_HOSTS.has(normalized) || isBlockedIpv6(normalized))
      return true;
    if (normalized.endsWith(".") && BLOCKED_METADATA_HOSTS.has(normalized.slice(0, -1)))
      return true;
  } catch {}
  return false;
}
async function resolvesToBlockedIp(hostname) {
  try {
    const dns = await import("dns");
    const { resolve4, resolve6 } = dns.promises;
    const v4Check = resolve4(hostname).then((addresses) => addresses.some((addr) => BLOCKED_METADATA_HOSTS.has(addr)), () => false);
    const v6Check = resolve6(hostname).then((addresses) => addresses.some((addr) => {
      const normalized = addr.toLowerCase();
      return BLOCKED_METADATA_HOSTS.has(normalized) || isBlockedIpv6(normalized);
    }), () => false);
    const [v4Blocked, v6Blocked] = await Promise.all([v4Check, v6Check]);
    return v4Blocked || v6Blocked;
  } catch {
    return false;
  }
}
function normalizeFileUrl(url) {
  if (!url.toLowerCase().startsWith("file:"))
    return url;
  const qIdx = url.indexOf("?");
  const hIdx = url.indexOf("#");
  let delimIdx = -1;
  if (qIdx >= 0 && hIdx >= 0)
    delimIdx = Math.min(qIdx, hIdx);
  else if (qIdx >= 0)
    delimIdx = qIdx;
  else if (hIdx >= 0)
    delimIdx = hIdx;
  const pathPart = delimIdx >= 0 ? url.slice(0, delimIdx) : url;
  const trailing = delimIdx >= 0 ? url.slice(delimIdx) : "";
  const rest = pathPart.slice("file:".length);
  if (rest.startsWith("///")) {
    if (rest === "///" || rest === "////") {
      throw new Error("Invalid file URL: file:/// has no path. Use file:///<absolute-path>.");
    }
    return pathPart + trailing;
  }
  if (!rest.startsWith("//")) {
    throw new Error(`Invalid file URL: ${url}. Use file:///<absolute-path> or file://./<rel> or file://~/<rel>.`);
  }
  const afterDoubleSlash = rest.slice(2);
  if (afterDoubleSlash === "") {
    throw new Error("Invalid file URL: file:// is empty. Use file:///<absolute-path>.");
  }
  if (afterDoubleSlash === "." || afterDoubleSlash === "./") {
    throw new Error("Invalid file URL: file://./ would list the current directory. Use file://./<filename> to render a specific file.");
  }
  if (afterDoubleSlash === "~" || afterDoubleSlash === "~/") {
    throw new Error("Invalid file URL: file://~/ would list the home directory. Use file://~/<filename> to render a specific file.");
  }
  if (afterDoubleSlash.startsWith("~/")) {
    const rel = afterDoubleSlash.slice(2);
    const absPath2 = path3.join(os3.homedir(), rel);
    return pathToFileURL(absPath2).href + trailing;
  }
  if (afterDoubleSlash.startsWith("./")) {
    const rel = afterDoubleSlash.slice(2);
    const absPath2 = path3.resolve(process.cwd(), rel);
    return pathToFileURL(absPath2).href + trailing;
  }
  if (afterDoubleSlash.toLowerCase().startsWith("localhost/")) {
    return pathPart + trailing;
  }
  const firstSlash = afterDoubleSlash.indexOf("/");
  const segment = firstSlash === -1 ? afterDoubleSlash : afterDoubleSlash.slice(0, firstSlash);
  const looksLikeHost = /[.:\\%]/.test(segment) || segment.startsWith("[");
  if (looksLikeHost) {
    throw new Error(`Unsupported file URL host: ${segment}. Use file:///<absolute-path> for local files (network/UNC paths are not supported).`);
  }
  const absPath = path3.resolve(process.cwd(), afterDoubleSlash);
  return pathToFileURL(absPath).href + trailing;
}
async function validateNavigationUrl(url) {
  let normalized = url;
  if (url.toLowerCase().startsWith("file:")) {
    normalized = normalizeFileUrl(url);
  }
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (parsed.protocol === "file:") {
    if (parsed.host !== "" && parsed.host.toLowerCase() !== "localhost") {
      throw new Error(`Unsupported file URL host: ${parsed.host}. Use file:///<absolute-path> for local files.`);
    }
    let fsPath;
    try {
      fsPath = fileURLToPath(parsed);
    } catch (e) {
      throw new Error(`Invalid file URL: ${url} (${e.message})`);
    }
    validateReadPath(fsPath);
    return pathToFileURL(fsPath).href + parsed.search + parsed.hash;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Blocked: scheme "${parsed.protocol}" is not allowed. Only http:, https:, and file: URLs are permitted.`);
  }
  const hostname = normalizeHostname(parsed.hostname.toLowerCase());
  if (BLOCKED_METADATA_HOSTS.has(hostname) || isMetadataIp(hostname) || isBlockedIpv6(hostname)) {
    throw new Error(`Blocked: ${parsed.hostname} is a cloud metadata endpoint. Access is denied for security.`);
  }
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const isPrivateNet = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname);
  if (!isLoopback && !isPrivateNet && await resolvesToBlockedIp(hostname)) {
    throw new Error(`Blocked: ${parsed.hostname} resolves to a cloud metadata IP. Possible DNS rebinding attack.`);
  }
  return url;
}
var BLOCKED_METADATA_HOSTS, BLOCKED_IPV6_PREFIXES;
var init_url_validation = __esm(() => {
  init_path_security();
  BLOCKED_METADATA_HOSTS = new Set([
    "169.254.169.254",
    "fe80::1",
    "::ffff:169.254.169.254",
    "::ffff:a9fe:a9fe",
    "::a9fe:a9fe",
    "metadata.google.internal",
    "metadata.azure.internal"
  ]);
  BLOCKED_IPV6_PREFIXES = ["fc", "fd", "fe8", "fe9", "fea", "feb"];
});

// browse/src/tab-session.ts
class TabSession {
  page;
  refMap = new Map;
  lastSnapshot = null;
  activeFrame = null;
  loadedHtml = null;
  loadedHtmlWaitUntil;
  constructor(page) {
    this.page = page;
  }
  getPage() {
    return this.page;
  }
  setRefMap(refs) {
    this.refMap = refs;
  }
  clearRefs() {
    this.refMap.clear();
  }
  async resolveRef(selector) {
    if (selector.startsWith("@e") || selector.startsWith("@c")) {
      const ref = selector.slice(1);
      const entry = this.refMap.get(ref);
      if (!entry) {
        throw new Error(`Ref ${selector} not found. Run 'snapshot' to get fresh refs.`);
      }
      const count = await entry.locator.count();
      if (count === 0) {
        throw new Error(`Ref ${selector} (${entry.role} "${entry.name}") is stale \u2014 element no longer exists. ` + `Run 'snapshot' for fresh refs.`);
      }
      return { locator: entry.locator };
    }
    return { selector };
  }
  getRefRole(selector) {
    if (selector.startsWith("@e") || selector.startsWith("@c")) {
      const entry = this.refMap.get(selector.slice(1));
      return entry?.role ?? null;
    }
    return null;
  }
  getRefCount() {
    return this.refMap.size;
  }
  getRefEntries() {
    return Array.from(this.refMap.entries()).map(([ref, entry]) => ({
      ref,
      role: entry.role,
      name: entry.name
    }));
  }
  setLastSnapshot(text) {
    this.lastSnapshot = text;
  }
  getLastSnapshot() {
    return this.lastSnapshot;
  }
  setFrame(frame) {
    this.activeFrame = frame;
  }
  getFrame() {
    return this.activeFrame;
  }
  getActiveFrameOrPage() {
    if (this.activeFrame?.isDetached()) {
      this.activeFrame = null;
      this.clearRefs();
    }
    return this.activeFrame ?? this.page;
  }
  onMainFrameNavigated() {
    this.clearRefs();
    this.activeFrame = null;
    this.loadedHtml = null;
    this.loadedHtmlWaitUntil = undefined;
  }
  async setTabContent(html, opts = {}) {
    const waitUntil = opts.waitUntil ?? "domcontentloaded";
    await this.page.setContent(html, { waitUntil, timeout: 15000 });
    this.loadedHtml = html;
    this.loadedHtmlWaitUntil = waitUntil;
  }
  getLoadedHtml() {
    if (this.loadedHtml === null)
      return null;
    return { html: this.loadedHtml, waitUntil: this.loadedHtmlWaitUntil };
  }
  clearLoadedHtml() {
    this.loadedHtml = null;
    this.loadedHtmlWaitUntil = undefined;
  }
}

// browse/src/error-handling.ts
import * as fs3 from "fs";
function safeUnlink(filePath) {
  try {
    fs3.unlinkSync(filePath);
  } catch (err) {
    if (err?.code !== "ENOENT")
      throw err;
  }
}
function safeUnlinkQuiet(filePath) {
  try {
    fs3.unlinkSync(filePath);
  } catch {}
}
var IS_WINDOWS2;
var init_error_handling = __esm(() => {
  IS_WINDOWS2 = process.platform === "win32";
});

// browse/src/config.ts
import * as fs4 from "fs";
import * as os4 from "os";
import * as path4 from "path";
function getGitRoot() {
  try {
    const proc = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"], {
      stdout: "pipe",
      stderr: "pipe",
      timeout: 2000
    });
    if (proc.exitCode !== 0)
      return null;
    return proc.stdout.toString().trim() || null;
  } catch {
    return null;
  }
}
function resolveConfig(env = process.env) {
  let stateFile;
  let stateDir;
  let projectDir;
  if (env.BROWSE_STATE_FILE) {
    stateFile = env.BROWSE_STATE_FILE;
    stateDir = path4.dirname(stateFile);
    projectDir = path4.dirname(stateDir);
  } else {
    projectDir = getGitRoot() || process.cwd();
    stateDir = path4.join(projectDir, ".sriflow");
    stateFile = path4.join(stateDir, "browse.json");
  }
  return {
    projectDir,
    stateDir,
    stateFile,
    consoleLog: path4.join(stateDir, "browse-console.log"),
    networkLog: path4.join(stateDir, "browse-network.log"),
    dialogLog: path4.join(stateDir, "browse-dialog.log"),
    auditLog: path4.join(stateDir, "browse-audit.jsonl")
  };
}
function ensureStateDir(config) {
  try {
    mkdirSecure(config.stateDir);
  } catch (err) {
    if (err.code === "EACCES") {
      throw new Error(`Cannot create state directory ${config.stateDir}: permission denied`);
    }
    if (err.code === "ENOTDIR") {
      throw new Error(`Cannot create state directory ${config.stateDir}: a file exists at that path`);
    }
    throw err;
  }
  const gitignorePath = path4.join(config.projectDir, ".gitignore");
  try {
    const content = fs4.readFileSync(gitignorePath, "utf-8");
    if (!content.match(/^\.sriflow\/?$/m)) {
      const separator = content.endsWith(`
`) ? "" : `
`;
      fs4.appendFileSync(gitignorePath, `${separator}.sriflow/
`);
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      const logPath = path4.join(config.stateDir, "browse-server.log");
      try {
        fs4.appendFileSync(logPath, `[${new Date().toISOString()}] Warning: could not update .gitignore at ${gitignorePath}: ${err.message}
`);
      } catch {}
    }
  }
}
function readVersionHash(execPath = process.execPath) {
  try {
    const versionFile = path4.resolve(path4.dirname(execPath), ".version");
    return fs4.readFileSync(versionFile, "utf-8").trim() || null;
  } catch {
    return null;
  }
}
function resolveSriflowHome() {
  return process.env.SRIFLOW_HOME || path4.join(os4.homedir(), ".sriflow");
}
function resolveChromiumProfile(explicit) {
  if (explicit && explicit.length > 0)
    return explicit;
  const env = process.env.CHROMIUM_PROFILE;
  if (env && env.length > 0)
    return env;
  return path4.join(resolveSriflowHome(), "chromium-profile");
}
function cleanSingletonLocks(userDataDir) {
  if (!path4.isAbsolute(userDataDir)) {
    console.warn(`[browse] cleanSingletonLocks: refusing relative path: ${userDataDir}`);
    return;
  }
  const resolved = path4.resolve(userDataDir);
  const basename3 = path4.basename(resolved);
  const explicitProfile = process.env.CHROMIUM_PROFILE;
  const explicitAbs = explicitProfile && path4.isAbsolute(explicitProfile) ? path4.resolve(explicitProfile) : null;
  const isSafe = basename3 === "chromium-profile" || explicitAbs !== null && resolved === explicitAbs;
  if (!isSafe) {
    console.warn(`[browse] cleanSingletonLocks: refusing to clean unrecognized profile dir: ${resolved}`);
    return;
  }
  for (const lockFile of ["SingletonLock", "SingletonSocket", "SingletonCookie"]) {
    safeUnlinkQuiet(path4.join(resolved, lockFile));
  }
}
var init_config = __esm(() => {
  init_file_permissions();
  init_error_handling();
});

// browse/src/cdp-allowlist.ts
function lookupCdpMethod(qualifiedName) {
  return CDP_ALLOWLIST_INDEX.get(qualifiedName) ?? null;
}
var CDP_ALLOWLIST, CDP_ALLOWLIST_INDEX;
var init_cdp_allowlist = __esm(() => {
  CDP_ALLOWLIST = Object.freeze([
    {
      domain: "Accessibility",
      method: "getFullAXTree",
      scope: "tab",
      output: "untrusted",
      justification: "Read-only AX tree extraction. Output is third-party page content; wrap in UNTRUSTED."
    },
    {
      domain: "Accessibility",
      method: "getPartialAXTree",
      scope: "tab",
      output: "untrusted",
      justification: "Read-only AX tree subtree by node. Output is third-party page content."
    },
    {
      domain: "Accessibility",
      method: "getRootAXNode",
      scope: "tab",
      output: "untrusted",
      justification: "Read-only root AX node accessor."
    },
    {
      domain: "DOM",
      method: "describeNode",
      scope: "tab",
      output: "untrusted",
      justification: "Inspect a DOM node by backend ID; pure read."
    },
    {
      domain: "DOM",
      method: "getBoxModel",
      scope: "tab",
      output: "trusted",
      justification: "Pure geometric data (box dimensions). No page content leaks; safe trusted."
    },
    {
      domain: "DOM",
      method: "getNodeForLocation",
      scope: "tab",
      output: "trusted",
      justification: "Pure coordinate\u2192nodeId mapping; no content leak."
    },
    {
      domain: "CSS",
      method: "getMatchedStylesForNode",
      scope: "tab",
      output: "untrusted",
      justification: "Read computed cascade for a node; output may contain attacker-controlled selectors."
    },
    {
      domain: "CSS",
      method: "getComputedStyleForNode",
      scope: "tab",
      output: "trusted",
      justification: "Computed style values are bounded (CSS keywords/numbers); safe trusted."
    },
    {
      domain: "CSS",
      method: "getInlineStylesForNode",
      scope: "tab",
      output: "untrusted",
      justification: "Inline style content may contain attacker-controlled custom-property values."
    },
    {
      domain: "Performance",
      method: "getMetrics",
      scope: "tab",
      output: "trusted",
      justification: "Pure numeric metrics (timing, layout count); safe."
    },
    {
      domain: "Performance",
      method: "enable",
      scope: "tab",
      output: "trusted",
      justification: "Domain enable; no content; required prerequisite for getMetrics."
    },
    {
      domain: "Performance",
      method: "disable",
      scope: "tab",
      output: "trusted",
      justification: "Domain disable; no content."
    },
    {
      domain: "Tracing",
      method: "start",
      scope: "browser",
      output: "trusted",
      justification: "Trace category capture. Browser-scoped to serialize against other CDP ops."
    },
    {
      domain: "Tracing",
      method: "end",
      scope: "browser",
      output: "untrusted",
      justification: "Trace dump may contain URLs and page data; wrap."
    },
    {
      domain: "Emulation",
      method: "setDeviceMetricsOverride",
      scope: "tab",
      output: "trusted",
      justification: "Viewport/scale override on the active tab."
    },
    {
      domain: "Emulation",
      method: "clearDeviceMetricsOverride",
      scope: "tab",
      output: "trusted",
      justification: "Clear viewport override."
    },
    {
      domain: "Emulation",
      method: "setUserAgentOverride",
      scope: "tab",
      output: "trusted",
      justification: "UA override on the active tab. NOTE: changes affect future requests; fine for tests."
    },
    {
      domain: "Page",
      method: "captureScreenshot",
      scope: "tab",
      output: "untrusted",
      justification: "Screenshot bytes; output is bounded image data (no marker injection vector)."
    },
    {
      domain: "Page",
      method: "printToPDF",
      scope: "tab",
      output: "untrusted",
      justification: "PDF bytes; bounded binary output."
    },
    {
      domain: "Network",
      method: "enable",
      scope: "tab",
      output: "trusted",
      justification: "Domain enable; required prerequisite. Does not return data."
    },
    {
      domain: "Network",
      method: "disable",
      scope: "tab",
      output: "trusted",
      justification: "Domain disable; mirrors Network.enable for cleanup symmetry."
    },
    {
      domain: "Runtime",
      method: "getProperties",
      scope: "tab",
      output: "untrusted",
      justification: "Inspect properties of an existing remote object. Read-only; output may contain page data."
    }
  ]);
  CDP_ALLOWLIST_INDEX = new Map(CDP_ALLOWLIST.map((e) => [`${e.domain}.${e.method}`, e]));
});

// browse/src/cdp-bridge.ts
async function withCdpSession(page, fn) {
  const session = await page.context().newCDPSession(page);
  try {
    return await fn(session);
  } finally {
    try {
      await session.detach();
    } catch {}
  }
}
async function getOrCreateCdpSession(page, cache) {
  let session = cache.get(page);
  if (session)
    return session;
  session = await page.context().newCDPSession(page);
  cache.set(page, session);
  page.once("close", () => {
    cache.delete(page);
    session.detach().catch(() => {});
  });
  return session;
}
async function getCdpSession(page) {
  return getOrCreateCdpSession(page, sessionCache);
}
async function dispatchCdpCall(input) {
  const qualified = `${input.domain}.${input.method}`;
  const entry = lookupCdpMethod(qualified);
  if (!entry) {
    console.debug(`[cdp] denied: ${input.domain}.${input.method}`);
    throw new Error(`DENIED: ${qualified} is not on the CDP allowlist.
` + `Cause: deny-default posture; method has not been audited and added to cdp-allowlist.ts.
` + `Action: if this method is genuinely needed, open a PR adding it to CDP_ALLOWLIST with a one-line justification + scope (tab|browser) + output (trusted|untrusted).`);
  }
  const acquireStart = Date.now();
  const release = entry.scope === "browser" ? await input.bm.acquireGlobalCdpLock(CDP_ACQUIRE_TIMEOUT_MS) : await input.bm.acquireTabLock(input.tabId, CDP_ACQUIRE_TIMEOUT_MS);
  const acquireMs = Date.now() - acquireStart;
  console.debug(`[cdp] ${input.domain}.${input.method} acquire=${acquireMs}ms`);
  console.debug(`[cdp] called: ${input.domain}.${input.method} scope=${entry.scope}`);
  try {
    const page = input.bm.getPageForTab(input.tabId);
    if (!page) {
      throw new Error(`Cannot dispatch: tab ${input.tabId} not found.
` + `Cause: tab was closed between command queue and dispatch.
` + "Action: $B tabs to list current tabs.");
    }
    let session;
    try {
      session = await getCdpSession(page);
    } catch (e) {
      throw new Error(`CDPSessionInvalidated: ${e.message}
` + `Cause: Playwright context was recreated (e.g., viewport scale change) and the prior CDP session is stale.
` + "Action: retry the command; the bridge will create a fresh session.");
    }
    const callPromise = session.send(qualified, input.params);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`CDPBridgeTimeout: ${qualified} did not return within ${CDP_TIMEOUT_MS}ms`)), CDP_TIMEOUT_MS));
    const raw = await Promise.race([callPromise, timeoutPromise]);
    return { raw, entry };
  } finally {
    release();
  }
}
var CDP_TIMEOUT_MS = 5000, CDP_ACQUIRE_TIMEOUT_MS = 5000, sessionCache;
var init_cdp_bridge = __esm(() => {
  init_cdp_allowlist();
  sessionCache = new WeakMap;
});

// browse/src/stealth.ts
var exports_stealth = {};
__export(exports_stealth, {
  readHostProfile: () => readHostProfile,
  isExtendedStealthEnabled: () => isExtendedStealthEnabled,
  buildStealthScript: () => buildStealthScript,
  buildGStackLaunchArgs: () => buildGStackLaunchArgs,
  applyStealth: () => applyStealth,
  WEBDRIVER_MASK_SCRIPT: () => WEBDRIVER_MASK_SCRIPT,
  STEALTH_LAUNCH_ARGS: () => STEALTH_LAUNCH_ARGS,
  STEALTH_IGNORE_DEFAULT_ARGS: () => STEALTH_IGNORE_DEFAULT_ARGS,
  EXTENDED_STEALTH_SCRIPT: () => EXTENDED_STEALTH_SCRIPT,
  AUTOMATION_ARTIFACT_CLEANUP_SCRIPT: () => AUTOMATION_ARTIFACT_CLEANUP_SCRIPT
});
function readHostProfile() {
  const env = globalThis.process?.env ?? {};
  const concurrency = Number(env.SRIFLOW_HW_CONCURRENCY);
  const memory = Number(env.SRIFLOW_DEVICE_MEMORY);
  return {
    hwConcurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 8,
    deviceMemory: Number.isFinite(memory) && memory > 0 ? memory : 8
  };
}
function buildStealthScript(hw) {
  return `(() => {
  // \u2500\u2500\u2500\u2500 Function.prototype.toString Proxy (must run first) \u2500\u2500\u2500\u2500
  // Make every patched getter / function below report
  // 'function NAME() { [native code] }' at every recursion depth.
  // Defeats fn.toString.toString.toString() integrity checks.
  const patchedFns = new WeakSet();
  const nativeToString = Function.prototype.toString;
  const toStringProxy = new Proxy(nativeToString, {
    apply(target, thisArg, args) {
      if (patchedFns.has(thisArg)) {
        const name = (thisArg && thisArg.name) || '';
        return 'function ' + name + '() { [native code] }';
      }
      return Reflect.apply(target, thisArg, args);
    },
  });
  Object.defineProperty(Function.prototype, 'toString', {
    value: toStringProxy, writable: true, configurable: true,
  });
  const markNative = (fn, name) => {
    if (name) {
      try { Object.defineProperty(fn, 'name', { value: name }); } catch {}
    }
    patchedFns.add(fn);
    return fn;
  };

  // \u2500\u2500\u2500\u2500 navigator.webdriver (canonical mask, kept from D7) \u2500\u2500\u2500\u2500
  try {
    const webdriverGetter = markNative(function() { return false; }, 'get webdriver');
    Object.defineProperty(navigator, 'webdriver', { get: webdriverGetter, configurable: true });
  } catch {}

  // \u2500\u2500\u2500\u2500 window.chrome.* restoration \u2500\u2500\u2500\u2500
  // Real Chrome ships these objects with rich enum / method shape.
  // Headless Chromium / Playwright's launch strips them. Their absence
  // is a universally-checked tell (verified in Cloudflare + DataDome
  // RE catalogs). We don't try to perfectly mimic \u2014 we ship plausible
  // shape with native-code-looking methods.
  try {
    if (!('chrome' in window)) {
      window.chrome = {};
    }
    const chrome = window.chrome;
    if (!chrome.runtime) {
      chrome.runtime = {
        OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install',
                            SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
        OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
        PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64',
                       X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64',
                           X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux',
                     MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
        RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled',
                                   UPDATE_AVAILABLE: 'update_available' },
        connect: markNative(function connect() {
          throw new TypeError('Error in invocation of runtime.connect: No matching signature.');
        }, 'connect'),
        sendMessage: markNative(function sendMessage() {
          throw new TypeError('Error in invocation of runtime.sendMessage: No matching signature.');
        }, 'sendMessage'),
        id: undefined,
      };
    }
    if (!chrome.app) {
      chrome.app = {
        isInstalled: false,
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
      };
    }
    if (typeof chrome.csi !== 'function') {
      chrome.csi = markNative(function csi() {
        return {
          onloadT: Date.now(),
          pageT: performance.now(),
          startE: Date.now() - 1000,
          tran: 15,
        };
      }, 'csi');
    }
    if (typeof chrome.loadTimes !== 'function') {
      chrome.loadTimes = markNative(function loadTimes() {
        const t = performance.timing;
        return {
          requestTime: t.requestStart / 1000,
          startLoadTime: t.requestStart / 1000,
          commitLoadTime: t.responseStart / 1000,
          finishDocumentLoadTime: t.domContentLoadedEventEnd / 1000,
          finishLoadTime: t.loadEventEnd / 1000,
          firstPaintTime: t.responseEnd / 1000,
          firstPaintAfterLoadTime: 0,
          navigationType: 'Other',
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true,
          npnNegotiatedProtocol: 'h2',
          wasAlternateProtocolAvailable: false,
          connectionInfo: 'h2',
        };
      }, 'loadTimes');
    }
  } catch (err) {
    // Non-fatal \u2014 page might have a stricter Content Security Policy
    // that blocks property mutation on window. Leave chrome.* whatever
    // shape it was; navigator.webdriver mask still applies.
  }

  // \u2500\u2500\u2500\u2500 Notification.permission align with Permissions API \u2500\u2500\u2500\u2500
  // The inline addInitScript already overrides permissions.query for
  // notifications \u2192 'prompt'. Notification.permission must match
  // ('default' in real Chrome on pages that haven't asked yet).
  try {
    if (typeof Notification !== 'undefined') {
      const notificationPermissionGetter = markNative(function() { return 'default'; }, 'get permission');
      Object.defineProperty(Notification, 'permission', {
        get: notificationPermissionGetter,
        configurable: true,
      });
    }
  } catch {}

  // \u2500\u2500\u2500\u2500 Per-install hardware values from SRIFLOW_* env (T2) \u2500\u2500\u2500\u2500
  // gbd's host_profile.go fed real host values via cmdline env. Reporting
  // those (not hardcoded defaults) avoids the cross-user GBrowser
  // fingerprint cluster.
  try {
    const hwConcurrencyGetter = markNative(function() { return ${hw.hwConcurrency}; }, 'get hardwareConcurrency');
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: hwConcurrencyGetter,
      configurable: true,
    });
  } catch {}
  try {
    const deviceMemoryGetter = markNative(function() { return ${hw.deviceMemory}; }, 'get deviceMemory');
    Object.defineProperty(navigator, 'deviceMemory', {
      get: deviceMemoryGetter,
      configurable: true,
    });
  } catch {}

  // \u2500\u2500\u2500\u2500 Selenium / Phantom / Nightmare / Playwright global cleanup \u2500\u2500\u2500\u2500
  // Static known-name list of Selenium / Playwright / PhantomJS / Nightmare
  // globals. AUTOMATION_ARTIFACT_CLEANUP_SCRIPT (applied right after this on
  // every path) covers the cdc_/__webdriver dynamic prefixes; this list is the
  // fixed-name complement.
  try {
    const auto = [
      '__driver_evaluate', '__webdriver_evaluate', '__selenium_evaluate', '__fxdriver_evaluate',
      '__driver_unwrapped', '__webdriver_unwrapped', '__selenium_unwrapped', '__fxdriver_unwrapped',
      '_Selenium_IDE_Recorder', '_selenium', 'calledSelenium',
      '$chrome_asyncScriptInfo',
      '__$webdriverAsyncExecutor', '__webdriverFunc',
      'domAutomation', 'domAutomationController',
      '__lastWatirAlert', '__lastWatirConfirm', '__lastWatirPrompt',
      '__webdriver_script_fn', '_WEBDRIVER_ELEM_CACHE',
      'callPhantom', '_phantom', 'phantom', '__nightmare',
      '__pwInitScripts', '__playwright__binding__',
    ];
    for (const k of auto) {
      try { delete window[k]; } catch {}
    }
    try { delete document.__webdriver_script_fn; } catch {}
  } catch {}
})();`;
}
function extendedModeEnabled() {
  const v = process.env.SRIFLOW_STEALTH;
  return v === "extended" || v === "1" || v === "true";
}
async function applyStealth(context) {
  const hw = readHostProfile();
  await context.addInitScript({ content: buildStealthScript(hw) });
  await context.addInitScript({ content: AUTOMATION_ARTIFACT_CLEANUP_SCRIPT });
  if (extendedModeEnabled()) {
    await context.addInitScript({ content: EXTENDED_STEALTH_SCRIPT });
  }
}
function buildGStackLaunchArgs() {
  const env = globalThis.process?.env ?? {};
  const args = [];
  const vendor = env.SRIFLOW_GPU_VENDOR;
  if (vendor)
    args.push(`--sriflow-gpu-vendor=${vendor}`);
  const renderer = env.SRIFLOW_GPU_RENDERER;
  if (renderer)
    args.push(`--sriflow-gpu-renderer=${renderer}`);
  const platform = env.SRIFLOW_PLATFORM;
  if (platform === "MacARM" || platform === "MacIntel") {
    args.push("--sriflow-ua-platform=macOS");
  } else if (platform === "Win32") {
    args.push("--sriflow-ua-platform=Windows");
  } else if (platform && platform.startsWith("Linux")) {
    args.push("--sriflow-ua-platform=Linux");
  }
  const chipset = env.SRIFLOW_GPU_CHIPSET;
  if (chipset)
    args.push(`--sriflow-ua-model=${chipset}`);
  const hw = env.SRIFLOW_HW_CONCURRENCY;
  if (hw)
    args.push(`--sriflow-hw-concurrency=${hw}`);
  const memory = env.SRIFLOW_DEVICE_MEMORY;
  if (memory)
    args.push(`--sriflow-device-memory=${memory}`);
  const cdpStealth = env.SRIFLOW_CDP_STEALTH;
  if (cdpStealth === "on" || cdpStealth === "1" || cdpStealth === "true") {
    args.push("--sriflow-suppress-prepare-stack-trace");
  }
  return args;
}
function isExtendedStealthEnabled() {
  return extendedModeEnabled();
}
var EXTENDED_STEALTH_SCRIPT = `
(() => {
  try {
    // 1. Fully delete navigator.webdriver from the prototype so
    //    \`"webdriver" in navigator\` returns false (not just falsy).
    delete Object.getPrototypeOf(navigator).webdriver;
  } catch {}

  try {
    // 2. WebGL renderer spoof \u2014 SwiftShader is the canonical software-GPU
    //    tell. Spoof to a plausible Apple M1 Pro string.
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      // UNMASKED_VENDOR_WEBGL (37445) \u2192 'Apple Inc.'
      if (parameter === 37445) return 'Apple Inc.';
      // UNMASKED_RENDERER_WEBGL (37446) \u2192 realistic Apple silicon string
      if (parameter === 37446) return 'Apple M1 Pro, OpenGL 4.1';
      return getParameter.call(this, parameter);
    };
  } catch {}

  try {
    // 3. navigator.plugins: real PluginArray with MimeType objects.
    const makePlugin = (name, filename, desc, mimes) => {
      const p = Object.create(Plugin.prototype);
      Object.defineProperties(p, {
        name: { get: () => name },
        filename: { get: () => filename },
        description: { get: () => desc },
        length: { get: () => mimes.length },
      });
      mimes.forEach((m, i) => { p[i] = m; });
      p.item = (i) => mimes[i];
      p.namedItem = (n) => mimes.find((m) => m.type === n);
      return p;
    };
    const makeMime = (type, suffixes, desc) => {
      const m = Object.create(MimeType.prototype);
      Object.defineProperties(m, {
        type: { get: () => type },
        suffixes: { get: () => suffixes },
        description: { get: () => desc },
      });
      return m;
    };
    const pdfMime = makeMime('application/pdf', 'pdf', '');
    const cpdfMime = makeMime('application/x-google-chrome-pdf', 'pdf', 'Portable Document Format');
    const plugins = [
      makePlugin('PDF Viewer', 'internal-pdf-viewer', '', [pdfMime]),
      makePlugin('Chrome PDF Viewer', 'internal-pdf-viewer', '', [cpdfMime]),
      makePlugin('Chromium PDF Viewer', 'internal-pdf-viewer', '', [cpdfMime]),
    ];
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = Object.create(PluginArray.prototype);
        Object.defineProperty(arr, 'length', { get: () => plugins.length });
        plugins.forEach((p, i) => { arr[i] = p; });
        arr.item = (i) => plugins[i];
        arr.namedItem = (n) => plugins.find((p) => p.name === n);
        arr.refresh = () => {};
        return arr;
      },
    });
  } catch {}

  try {
    // 4. window.chrome shape \u2014 chrome.app + chrome.runtime + loadTimes/csi.
    if (!window.chrome) {
      window.chrome = {};
    }
    if (!window.chrome.runtime) {
      window.chrome.runtime = { OnInstalledReason: {}, OnRestartRequiredReason: {} };
    }
    if (!window.chrome.app) {
      window.chrome.app = {
        isInstalled: false,
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
      };
    }
    if (!window.chrome.loadTimes) {
      window.chrome.loadTimes = function () {
        return { commitLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000 };
      };
    }
    if (!window.chrome.csi) {
      window.chrome.csi = function () {
        return { startE: Date.now(), onloadT: Date.now(), pageT: 0, tran: 15 };
      };
    }
  } catch {}

  try {
    // 5. mediaDevices \u2014 some headless builds drop it entirely.
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        get: () => ({ enumerateDevices: () => Promise.resolve([]) }),
      });
    }
  } catch {}

  try {
    // 6. CDP cdc_* property cleanup. Chromium under CDP sets cdc_*-prefixed
    //    globals (driver injection markers); a bot detector finds them by
    //    iterating window keys. Strip all matching keys.
    //    Note: via applyStealth this is redundant with AUTOMATION_ARTIFACT_
    //    CLEANUP_SCRIPT (which runs first on every path). Kept so this script
    //    is self-sufficient if ever applied standalone.
    for (const k of Object.keys(window)) {
      if (k.startsWith('cdc_')) {
        try { delete window[k]; } catch {}
      }
    }
  } catch {}
})();
`, AUTOMATION_ARTIFACT_CLEANUP_SCRIPT = `(() => {
  // cdc_/__webdriver globals are injected by ChromeDriver/CDP. A detector
  // finds them by iterating window keys. Strip immediately and again after a
  // tick in case they are injected late.
  const cleanup = () => {
    for (const key of Object.keys(window)) {
      if (key.startsWith('cdc_') || key.startsWith('__webdriver')) {
        try { delete window[key]; } catch (e) { if (!(e instanceof TypeError)) throw e; }
      }
    }
  };
  cleanup();
  setTimeout(cleanup, 0);

  // Permissions API: automated Chromium returns 'denied' for notifications,
  // a known tell. Return 'prompt' to match real Chrome (and Layer C's
  // Notification.permission = 'default'). Tradeoff: this pins the
  // notifications state to fresh-Chrome values for the whole session, so a
  // site that actually grants/denies notifications would see a stale value.
  // Acceptable for the automation/anti-detection use case (which does not
  // drive real notification grants); only notifications is overridden.
  const originalQuery = window.navigator.permissions && window.navigator.permissions.query;
  if (originalQuery) {
    window.navigator.permissions.query = (params) => {
      if (params && params.name === 'notifications') {
        return Promise.resolve({ state: 'prompt', onchange: null });
      }
      return originalQuery.call(window.navigator.permissions, params);
    };
  }
})();`, WEBDRIVER_MASK_SCRIPT = `Object.defineProperty(navigator, 'webdriver', { get: () => false });`, STEALTH_LAUNCH_ARGS, STEALTH_IGNORE_DEFAULT_ARGS;
var init_stealth = __esm(() => {
  STEALTH_LAUNCH_ARGS = [
    "--disable-blink-features=AutomationControlled"
  ];
  STEALTH_IGNORE_DEFAULT_ARGS = [
    "--enable-automation",
    "--disable-extensions",
    "--disable-component-extensions-with-background-pages",
    "--disable-popup-blocking",
    "--disable-component-update",
    "--disable-default-apps"
  ];
});

// browse/src/browser-manager.ts
import { chromium } from "playwright";
function isCustomChromium() {
  if (process.env.SRIFLOW_CHROMIUM_KIND === "custom-extension-baked")
    return true;
  const p = process.env.SRIFLOW_CHROMIUM_PATH || "";
  return p.includes("GBrowser") || p.includes("gbrowser");
}
function shouldEnableChromiumSandbox() {
  if (process.platform === "win32")
    return false;
  if (process.env.SRIFLOW_CHROMIUM_NO_SANDBOX === "1")
    return false;
  const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
  return !(process.env.CI || process.env.CONTAINER || isRoot);
}
async function resolveDisconnectCause(browser) {
  return "clean";
}
async function handleChromiumDisconnect(browser) {
  const cause = await resolveDisconnectCause(browser);
  if (cause === "clean") {
    console.error("[browse] Chromium closed cleanly (user-initiated quit). Server exiting (0).");
    process.exit(0);
  }
  console.error("[browse] FATAL: Chromium process crashed or was killed. Server exiting (1).");
  console.error("[browse] Console/network logs flushed to .sriflow/browse-*.log");
  process.exit(1);
}

class BrowserManager {
  browser = null;
  context = null;
  proxyConfig = null;
  pages = new Map;
  tabSessions = new Map;
  activeTabId = 0;
  nextTabId = 1;
  extraHeaders = {};
  customUserAgent = null;
  deviceScaleFactor = 1;
  currentViewport = { width: 1280, height: 720 };
  serverPort = 0;
  tabOwnership = new Map;
  dialogAutoAccept = true;
  dialogPromptText = null;
  cookieImportedDomains = new Set;
  isHeaded = false;
  consecutiveFailures = 0;
  watching = false;
  watchInterval = null;
  watchSnapshots = [];
  watchStartTime = 0;
  connectionMode = "launched";
  intentionalDisconnect = false;
  static TAB_GUARDRAIL_SOFT = 50;
  static TAB_GUARDRAIL_HARD = 200;
  tabGuardrailSoftHit = false;
  tabGuardrailHardHit = false;
  checkTabGuardrails() {
    const total = this.pages.size;
    if (!this.tabGuardrailSoftHit && total >= BrowserManager.TAB_GUARDRAIL_SOFT) {
      this.tabGuardrailSoftHit = true;
      const msg = `Tab count crossed ${BrowserManager.TAB_GUARDRAIL_SOFT} (now ${total}). Consider closing unused tabs \u2014 each Chromium tab holds 50\u2013300 MB.`;
      console.warn(`[browse] ${msg}`);
      emitActivity({ type: "error", command: "tab-guardrail", error: msg, tabs: total });
    }
    if (!this.tabGuardrailHardHit && total >= BrowserManager.TAB_GUARDRAIL_HARD) {
      this.tabGuardrailHardHit = true;
      const msg = `Tab count crossed ${BrowserManager.TAB_GUARDRAIL_HARD} (now ${total}). OOM risk imminent. Open the sidebar to see top RAM consumers.`;
      console.error(`[browse] ${msg}`);
      emitActivity({ type: "error", command: "tab-guardrail", error: msg, tabs: total });
    }
  }
  recheckTabGuardrailsOnClose() {
    const total = this.pages.size;
    if (this.tabGuardrailSoftHit && total < BrowserManager.TAB_GUARDRAIL_SOFT) {
      this.tabGuardrailSoftHit = false;
    }
    if (this.tabGuardrailHardHit && total < BrowserManager.TAB_GUARDRAIL_HARD) {
      this.tabGuardrailHardHit = false;
    }
  }
  onDisconnect = null;
  getConnectionMode() {
    return this.connectionMode;
  }
  isWatching() {
    return this.watching;
  }
  startWatch() {
    this.watching = true;
    this.watchSnapshots = [];
    this.watchStartTime = Date.now();
  }
  stopWatch() {
    this.watching = false;
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    const snapshots = this.watchSnapshots;
    const duration = Date.now() - this.watchStartTime;
    this.watchSnapshots = [];
    this.watchStartTime = 0;
    return { snapshots, duration };
  }
  addWatchSnapshot(snapshot) {
    this.watchSnapshots.push(snapshot);
  }
  findExtensionPath() {
    const fs5 = __require("fs");
    const path5 = __require("path");
    const candidates = [
      process.env.BROWSE_EXTENSIONS_DIR || "",
      path5.resolve(__dirname, "..", "..", "extension"),
      path5.join(process.env.HOME || "", ".claude", "skills", "sriflow", "extension"),
      (() => {
        const stateFile = process.env.BROWSE_STATE_FILE || "";
        if (stateFile) {
          const repoRoot = path5.resolve(path5.dirname(stateFile), "..");
          return path5.join(repoRoot, ".claude", "skills", "sriflow", "extension");
        }
        return "";
      })()
    ].filter(Boolean);
    for (const candidate of candidates) {
      try {
        if (fs5.existsSync(path5.join(candidate, "manifest.json"))) {
          return candidate;
        }
      } catch (err) {
        if (err?.code !== "ENOENT" && err?.code !== "EACCES")
          throw err;
      }
    }
    return null;
  }
  setProxyConfig(cfg) {
    this.proxyConfig = cfg;
  }
  getRefMap() {
    try {
      return this.getActiveSession().getRefEntries();
    } catch {
      return [];
    }
  }
  async launch() {
    const extensionsDir = process.env.BROWSE_EXTENSIONS_DIR;
    const { STEALTH_LAUNCH_ARGS: STEALTH_LAUNCH_ARGS2, buildGStackLaunchArgs: buildGStackLaunchArgs2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
    const launchArgs = [...STEALTH_LAUNCH_ARGS2, ...buildGStackLaunchArgs2()];
    let useHeadless = true;
    const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
    if (process.env.CI || process.env.CONTAINER || isRoot) {
      launchArgs.push("--no-sandbox");
    }
    if (extensionsDir) {
      if (!isCustomChromium()) {
        launchArgs.push(`--disable-extensions-except=${extensionsDir}`, `--load-extension=${extensionsDir}`);
      }
      launchArgs.push("--window-position=-9999,-9999", "--window-size=1,1");
      useHeadless = false;
      console.log(`[browse] Extensions loaded from: ${extensionsDir}`);
    }
    this.browser = await chromium.launch({
      headless: useHeadless,
      chromiumSandbox: shouldEnableChromiumSandbox(),
      ...launchArgs.length > 0 ? { args: launchArgs } : {},
      ...this.proxyConfig ? { proxy: this.proxyConfig } : {}
    });
    this.browser.on("disconnected", () => {
      handleChromiumDisconnect(this.browser);
    });
    const contextOptions = {
      viewport: { width: this.currentViewport.width, height: this.currentViewport.height },
      deviceScaleFactor: this.deviceScaleFactor
    };
    if (this.customUserAgent) {
      contextOptions.userAgent = this.customUserAgent;
    }
    this.context = await this.browser.newContext(contextOptions);
    if (Object.keys(this.extraHeaders).length > 0) {
      await this.context.setExtraHTTPHeaders(this.extraHeaders);
    }
    const { applyStealth: applyStealth2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
    await applyStealth2(this.context);
    await this.newTab();
  }
  async launchHeaded(authToken) {
    this.pages.clear();
    this.tabSessions.clear();
    this.nextTabId = 1;
    const extensionPath = this.findExtensionPath();
    const { STEALTH_LAUNCH_ARGS: STEALTH_LAUNCH_ARGS2, buildGStackLaunchArgs: buildGStackLaunchArgs2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
    const launchArgs = [
      "--hide-crash-restore-bubble",
      ...STEALTH_LAUNCH_ARGS2,
      ...buildGStackLaunchArgs2()
    ];
    if (extensionPath) {
      if (!isCustomChromium()) {
        launchArgs.push(`--disable-extensions-except=${extensionPath}`);
        launchArgs.push(`--load-extension=${extensionPath}`);
      }
      if (authToken) {
        const fs6 = __require("fs");
        const path6 = __require("path");
        const sriflowDir = path6.join(process.env.HOME || "/tmp", ".sriflow");
        mkdirSecure(sriflowDir);
        const authFile = path6.join(sriflowDir, ".auth.json");
        try {
          writeSecureFile(authFile, JSON.stringify({ token: authToken, port: this.serverPort || 34567 }));
        } catch (err) {
          console.warn(`[browse] Could not write .auth.json: ${err.message}`);
        }
      }
    }
    const fs5 = __require("fs");
    const path5 = __require("path");
    const userDataDir = resolveChromiumProfile();
    fs5.mkdirSync(userDataDir, { recursive: true });
    cleanSingletonLocks(userDataDir);
    const executablePath = process.env.SRIFLOW_CHROMIUM_PATH || undefined;
    const chromePath = executablePath || chromium.executablePath();
    try {
      const chromeContentsDir = path5.resolve(path5.dirname(chromePath), "..");
      const chromePlist = path5.join(chromeContentsDir, "Info.plist");
      if (fs5.existsSync(chromePlist)) {
        const plistContent = fs5.readFileSync(chromePlist, "utf-8");
        if (plistContent.includes("Google Chrome for Testing")) {
          const patched = plistContent.replace(/Google Chrome for Testing/g, "GStack Browser");
          fs5.writeFileSync(chromePlist, patched);
        }
        const iconCandidates = [
          path5.join(__dirname, "..", "..", "scripts", "app", "icon.icns"),
          path5.join(process.env.HOME || "", ".claude", "skills", "sriflow", "scripts", "app", "icon.icns")
        ];
        const iconSrc = iconCandidates.find((p) => fs5.existsSync(p));
        if (iconSrc) {
          const chromeResources = path5.join(chromeContentsDir, "Resources");
          const iconMatch = plistContent.match(/<key>CFBundleIconFile<\/key>\s*<string>([^<]+)<\/string>/);
          let origIcon = iconMatch ? iconMatch[1] : "app";
          if (!origIcon.endsWith(".icns"))
            origIcon += ".icns";
          const destIcon = path5.join(chromeResources, origIcon);
          try {
            fs5.copyFileSync(iconSrc, destIcon);
          } catch (err) {
            if (err?.code !== "ENOENT" && err?.code !== "EACCES")
              throw err;
          }
        }
      }
    } catch (err) {
      if (err?.code !== "ENOENT" && err?.code !== "EACCES")
        throw err;
    }
    let customUA;
    if (!this.customUserAgent) {
      const chromePath2 = executablePath || chromium.executablePath();
      try {
        const versionProc = Bun.spawnSync([chromePath2, "--version"], {
          stdout: "pipe",
          stderr: "pipe",
          timeout: 5000
        });
        const versionOutput = versionProc.stdout.toString().trim();
        const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+\.\d+)/);
        const chromeVersion = versionMatch ? versionMatch[1] : "131.0.0.0";
        customUA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      } catch {
        customUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
      }
    }
    const { STEALTH_IGNORE_DEFAULT_ARGS: STEALTH_IGNORE_DEFAULT_ARGS2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      chromiumSandbox: shouldEnableChromiumSandbox(),
      args: launchArgs,
      viewport: null,
      userAgent: this.customUserAgent || customUA,
      ...executablePath ? { executablePath } : {},
      ...this.proxyConfig ? { proxy: this.proxyConfig } : {},
      ignoreDefaultArgs: STEALTH_IGNORE_DEFAULT_ARGS2
    });
    this.browser = this.context.browser();
    this.connectionMode = "headed";
    this.intentionalDisconnect = false;
    const { applyStealth: applyStealth2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
    await applyStealth2(this.context);
    const indicatorScript = () => {
      const injectIndicator = () => {
        if (document.getElementById("sriflow-ctrl"))
          return;
        const topLine = document.createElement("div");
        topLine.id = "sriflow-ctrl";
        topLine.style.cssText = `
          position: fixed; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B);
          background-size: 200% 100%;
          animation: sriflow-shimmer 3s linear infinite;
          pointer-events: none; z-index: 2147483647;
          opacity: 0.8;
        `;
        const style = document.createElement("style");
        style.textContent = `
          @keyframes sriflow-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            #sriflow-ctrl { animation: none !important; }
          }
        `;
        document.documentElement.appendChild(style);
        document.documentElement.appendChild(topLine);
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectIndicator);
      } else {
        injectIndicator();
      }
    };
    await this.context.addInitScript(indicatorScript);
    this.context.on("page", (page) => {
      const id = this.nextTabId++;
      this.pages.set(id, page);
      this.tabSessions.set(id, new TabSession(page));
      this.activeTabId = id;
      this.wirePageEvents(page);
      page.evaluate(indicatorScript).catch(() => {});
      console.log(`[browse] New tab detected (id=${id}, total=${this.pages.size})`);
      this.checkTabGuardrails();
    });
    const existingPages = this.context.pages();
    if (existingPages.length > 0) {
      const page = existingPages[0];
      const id = this.nextTabId++;
      this.pages.set(id, page);
      this.tabSessions.set(id, new TabSession(page));
      this.activeTabId = id;
      this.wirePageEvents(page);
      try {
        await page.evaluate(indicatorScript);
      } catch {}
    } else {
      await this.newTab();
    }
    if (this.browser) {
      this.browser.on("disconnected", () => {
        if (this.intentionalDisconnect)
          return;
        const browserRef = this.browser;
        (async () => {
          const cause = await resolveDisconnectCause(browserRef);
          const exitCode = cause === "clean" ? 0 : 2;
          if (cause === "clean") {
            console.error("[browse] Real browser closed cleanly (user-initiated quit). Server exiting (0).");
          } else {
            console.error("[browse] Real browser disconnected (crash or kill). Server exiting (2).");
            console.error("[browse] Run `$B connect` to reconnect.");
          }
          if (!this.onDisconnect) {
            process.exit(exitCode);
            return;
          }
          try {
            const result = this.onDisconnect(exitCode);
            if (result && typeof result.catch === "function") {
              result.catch((err) => {
                console.error("[browse] onDisconnect rejected:", err);
                process.exit(exitCode);
              });
            }
          } catch (err) {
            console.error("[browse] onDisconnect threw:", err);
            process.exit(exitCode);
          }
        })();
      });
    }
    this.dialogAutoAccept = false;
    this.isHeaded = true;
    this.consecutiveFailures = 0;
  }
  async close() {
    if (this.browser || this.connectionMode === "headed" && this.context) {
      if (this.connectionMode === "headed") {
        this.intentionalDisconnect = true;
        if (this.browser)
          this.browser.removeAllListeners("disconnected");
        await Promise.race([
          this.context ? this.context.close() : Promise.resolve(),
          new Promise((resolve4) => setTimeout(resolve4, 5000))
        ]).catch(() => {});
      } else {
        this.browser.removeAllListeners("disconnected");
        await Promise.race([
          this.browser.close(),
          new Promise((resolve4) => setTimeout(resolve4, 5000))
        ]).catch(() => {});
      }
      this.browser = null;
    }
  }
  async isHealthy() {
    if (!this.browser || !this.browser.isConnected())
      return false;
    try {
      const page = this.pages.get(this.activeTabId);
      if (!page)
        return true;
      await Promise.race([
        page.evaluate("1"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000))
      ]);
      return true;
    } catch {
      return false;
    }
  }
  async newTab(url, clientId) {
    if (!this.context)
      throw new Error("Browser not launched");
    let normalizedUrl;
    if (url) {
      normalizedUrl = await validateNavigationUrl(url);
    }
    const page = await this.context.newPage();
    const id = this.nextTabId++;
    this.pages.set(id, page);
    this.tabSessions.set(id, new TabSession(page));
    this.activeTabId = id;
    if (clientId) {
      this.tabOwnership.set(id, clientId);
    }
    this.wirePageEvents(page);
    if (normalizedUrl) {
      await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    }
    return id;
  }
  async closeTab(id) {
    const tabId = id ?? this.activeTabId;
    const page = this.pages.get(tabId);
    if (!page)
      throw new Error(`Tab ${tabId} not found`);
    await page.close();
    this.pages.delete(tabId);
    this.tabSessions.delete(tabId);
    this.tabOwnership.delete(tabId);
    if (tabId === this.activeTabId) {
      const remaining = [...this.pages.keys()];
      if (remaining.length > 0) {
        this.activeTabId = remaining[remaining.length - 1];
      } else {
        await this.newTab();
      }
    }
  }
  switchTab(id, opts) {
    if (!this.tabSessions.has(id))
      throw new Error(`Tab ${id} not found`);
    this.activeTabId = id;
    if (opts?.bringToFront !== false) {
      const page = this.pages.get(id);
      if (page)
        page.bringToFront().catch(() => {});
    }
  }
  syncActiveTabByUrl(activeUrl) {
    if (!activeUrl || this.pages.size <= 1)
      return;
    let fuzzyId = null;
    let activeOriginPath = "";
    try {
      const u = new URL(activeUrl);
      activeOriginPath = u.origin + u.pathname;
    } catch (err) {
      if (!(err instanceof TypeError))
        throw err;
    }
    for (const [id, page] of this.pages) {
      try {
        const pageUrl = page.url();
        if (pageUrl === activeUrl && id !== this.activeTabId) {
          this.activeTabId = id;
          return;
        }
        if (activeOriginPath && fuzzyId === null && id !== this.activeTabId) {
          try {
            const pu = new URL(pageUrl);
            if (pu.origin + pu.pathname === activeOriginPath) {
              fuzzyId = id;
            }
          } catch (err) {
            if (!(err instanceof TypeError))
              throw err;
          }
        }
      } catch {}
    }
    if (fuzzyId !== null) {
      this.activeTabId = fuzzyId;
    }
  }
  getActiveTabId() {
    return this.activeTabId;
  }
  getTabCount() {
    return this.pages.size;
  }
  getTabOwner(tabId) {
    return this.tabOwnership.get(tabId) || null;
  }
  checkTabAccess(tabId, clientId, options = {}) {
    if (clientId === "root")
      return true;
    if (options.ownOnly) {
      const owner = this.tabOwnership.get(tabId);
      return owner === clientId;
    }
    return true;
  }
  transferTab(tabId, toClientId) {
    if (!this.pages.has(tabId))
      throw new Error(`Tab ${tabId} not found`);
    this.tabOwnership.set(tabId, toClientId);
  }
  async getTabListWithTitles() {
    const tabs = [];
    for (const [id, page] of this.pages) {
      tabs.push({
        id,
        url: page.url(),
        title: await page.title().catch(() => ""),
        active: id === this.activeTabId
      });
    }
    return tabs;
  }
  getActiveSession() {
    const session = this.tabSessions.get(this.activeTabId);
    if (!session)
      throw new Error('No active page. Use "browse goto <url>" first.');
    return session;
  }
  getSession(tabId) {
    const session = this.tabSessions.get(tabId);
    if (!session)
      throw new Error(`Tab ${tabId} not found`);
    return session;
  }
  getPageForTab(tabId) {
    return this.pages.get(tabId) ?? null;
  }
  tabLocks = new Map;
  globalCdpLockTail = Promise.resolve();
  async acquireTabLock(tabId, timeoutMs) {
    const existing = this.tabLocks.get(tabId) ?? Promise.resolve();
    const tail = Promise.all([existing, this.globalCdpLockTail]).then(() => {
      return;
    });
    let release;
    const next = new Promise((resolve4) => {
      release = resolve4;
    });
    this.tabLocks.set(tabId, tail.then(() => next));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`CDPMutexAcquireTimeout: tab ${tabId} lock not acquired within ${timeoutMs}ms.
Cause: a prior CDP or browser-scoped operation has held the lock too long.
` + "Action: retry; if this repeats, the prior operation may be hung \u2014 file a bug.")), timeoutMs));
    try {
      await Promise.race([tail, timeoutPromise]);
    } catch (e) {
      release();
      throw e;
    }
    return release;
  }
  async acquireGlobalCdpLock(timeoutMs) {
    const allTabTails = Array.from(this.tabLocks.values());
    const priorGlobal = this.globalCdpLockTail;
    const allPrior = Promise.all([priorGlobal, ...allTabTails]).then(() => {
      return;
    });
    let release;
    const next = new Promise((resolve4) => {
      release = resolve4;
    });
    this.globalCdpLockTail = allPrior.then(() => next);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`CDPMutexAcquireTimeout: global CDP lock not acquired within ${timeoutMs}ms.
Cause: in-flight tab operations have not completed.
` + "Action: retry; if this repeats, file a bug \u2014 a tab op may be hung.")), timeoutMs));
    try {
      await Promise.race([allPrior, timeoutPromise]);
    } catch (e) {
      release();
      throw e;
    }
    return release;
  }
  getPage() {
    return this.getActiveSession().page;
  }
  getCurrentUrl() {
    try {
      return this.getPage().url();
    } catch {
      return "about:blank";
    }
  }
  async getMemorySnapshot(structures) {
    const bunMem = process.memoryUsage();
    const notes = [];
    const tabs = [];
    for (const [id, page] of this.pages) {
      try {
        const url = (() => {
          try {
            return page.url();
          } catch {
            return "";
          }
        })();
        const title = await page.title().catch(() => "");
        const metrics = await withCdpSession(page, async (session) => {
          await session.send("Performance.enable").catch(() => {
            return;
          });
          const result = await session.send("Performance.getMetrics");
          return result.metrics ?? [];
        });
        const mm = {};
        for (const m of metrics)
          mm[m.name] = m.value;
        tabs.push({
          id,
          url,
          title,
          jsHeapUsed: mm.JSHeapUsedSize ?? 0,
          jsHeapTotal: mm.JSHeapTotalSize ?? 0,
          documents: mm.Documents ?? 0,
          nodes: mm.Nodes ?? 0,
          listeners: mm.JSEventListeners ?? 0
        });
      } catch {}
    }
    let processes = null;
    const browser = this.browser ?? (this.context ? this.context.browser() : null);
    if (browser) {
      try {
        const maybeFactory = browser.newBrowserCDPSession;
        if (typeof maybeFactory === "function") {
          const browserSession = await maybeFactory.call(browser);
          try {
            const info = await browserSession.send("SystemInfo.getProcessInfo");
            processes = (info.processInfo ?? []).map((p) => ({
              id: p.id,
              type: p.type,
              cpuTime: p.cpuTime
            }));
            notes.push("Per-Chromium-process RSS not collected \u2014 SystemInfo.getProcessInfo exposes PID+type+CPU only. " + 'See follow-up TODO "native/GPU memory breakdown" for the deferred fix.');
          } finally {
            await browserSession.detach().catch(() => {
              return;
            });
          }
        } else {
          notes.push("Playwright build does not expose newBrowserCDPSession; per-process info skipped.");
        }
      } catch (err) {
        notes.push(`CDP browser session unavailable: ${err?.message ?? String(err)}`);
      }
    } else {
      notes.push("Browser handle unavailable (server connection mode); per-process info skipped.");
    }
    return {
      bunServer: {
        rss: bunMem.rss,
        heapUsed: bunMem.heapUsed,
        heapTotal: bunMem.heapTotal,
        external: bunMem.external
      },
      tabs,
      processes,
      structures,
      capturedAt: Date.now(),
      notes
    };
  }
  setRefMap(refs) {
    this.getActiveSession().setRefMap(refs);
  }
  clearRefs() {
    this.getActiveSession().clearRefs();
  }
  async resolveRef(selector) {
    return this.getActiveSession().resolveRef(selector);
  }
  getRefRole(selector) {
    return this.getActiveSession().getRefRole(selector);
  }
  getRefCount() {
    return this.getActiveSession().getRefCount();
  }
  setLastSnapshot(text) {
    this.getActiveSession().setLastSnapshot(text);
  }
  getLastSnapshot() {
    return this.getActiveSession().getLastSnapshot();
  }
  setDialogAutoAccept(accept) {
    this.dialogAutoAccept = accept;
  }
  getDialogAutoAccept() {
    return this.dialogAutoAccept;
  }
  setDialogPromptText(text) {
    this.dialogPromptText = text;
  }
  getDialogPromptText() {
    return this.dialogPromptText;
  }
  trackCookieImportDomains(domains) {
    for (const d of domains)
      this.cookieImportedDomains.add(d);
  }
  getCookieImportedDomains() {
    return this.cookieImportedDomains;
  }
  hasCookieImports() {
    return this.cookieImportedDomains.size > 0;
  }
  async setViewport(width, height) {
    this.currentViewport = { width, height };
    await this.getPage().setViewportSize({ width, height });
  }
  async setExtraHeader(name, value) {
    this.extraHeaders[name] = value;
    if (this.context) {
      await this.context.setExtraHTTPHeaders(this.extraHeaders);
    }
  }
  setUserAgent(ua) {
    this.customUserAgent = ua;
  }
  getUserAgent() {
    return this.customUserAgent;
  }
  async closeAllPages() {
    for (const page of this.pages.values()) {
      await page.close().catch(() => {});
    }
    this.pages.clear();
    this.tabSessions.clear();
  }
  setFrame(frame) {
    this.getActiveSession().setFrame(frame);
  }
  getFrame() {
    return this.getActiveSession().getFrame();
  }
  getActiveFrameOrPage() {
    return this.getActiveSession().getActiveFrameOrPage();
  }
  async saveState() {
    if (!this.context)
      throw new Error("Browser not launched");
    const cookies = await this.context.cookies();
    const pages = [];
    for (const [id, page] of this.pages) {
      const url = page.url();
      let storage = null;
      try {
        storage = await page.evaluate(() => ({
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage }
        }));
      } catch {}
      const session = this.tabSessions.get(id);
      const loaded = session?.getLoadedHtml();
      const owner = this.tabOwnership.get(id);
      pages.push({
        url: url === "about:blank" ? "" : url,
        isActive: id === this.activeTabId,
        storage,
        loadedHtml: loaded?.html,
        loadedHtmlWaitUntil: loaded?.waitUntil,
        owner
      });
    }
    return { cookies, pages };
  }
  async restoreState(state) {
    if (!this.context)
      throw new Error("Browser not launched");
    if (state.cookies.length > 0) {
      await this.context.addCookies(state.cookies);
    }
    this.tabOwnership.clear();
    let activeId = null;
    for (const saved of state.pages) {
      const page = await this.context.newPage();
      const id = this.nextTabId++;
      this.pages.set(id, page);
      const newSession = new TabSession(page);
      this.tabSessions.set(id, newSession);
      this.wirePageEvents(page);
      if (saved.owner) {
        this.tabOwnership.set(id, saved.owner);
      }
      if (saved.loadedHtml) {
        try {
          await newSession.setTabContent(saved.loadedHtml, { waitUntil: saved.loadedHtmlWaitUntil });
        } catch (err) {
          console.warn(`[browse] Failed to replay loadedHtml for tab ${id}: ${err.message}`);
        }
      } else if (saved.url) {
        let normalizedUrl;
        try {
          normalizedUrl = await validateNavigationUrl(saved.url);
        } catch (err) {
          console.warn(`[browse] Skipping invalid URL in state file: ${saved.url} \u2014 ${err.message}`);
          continue;
        }
        await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      }
      if (saved.storage) {
        try {
          await page.evaluate((s) => {
            if (s.localStorage) {
              for (const [k, v] of Object.entries(s.localStorage)) {
                localStorage.setItem(k, v);
              }
            }
            if (s.sessionStorage) {
              for (const [k, v] of Object.entries(s.sessionStorage)) {
                sessionStorage.setItem(k, v);
              }
            }
          }, saved.storage);
        } catch {}
      }
      if (saved.isActive)
        activeId = id;
    }
    if (this.pages.size === 0) {
      await this.newTab();
    } else {
      this.activeTabId = activeId ?? [...this.pages.keys()][0];
    }
    this.clearRefs();
  }
  async recreateContext() {
    if (this.connectionMode === "headed") {
      throw new Error("Cannot recreate context in headed mode. Use disconnect first.");
    }
    if (!this.browser || !this.context) {
      throw new Error("Browser not launched");
    }
    try {
      const state = await this.saveState();
      for (const page of this.pages.values()) {
        await page.close().catch(() => {});
      }
      this.pages.clear();
      this.tabSessions.clear();
      await this.context.close().catch(() => {});
      const contextOptions = {
        viewport: { width: this.currentViewport.width, height: this.currentViewport.height },
        deviceScaleFactor: this.deviceScaleFactor
      };
      if (this.customUserAgent) {
        contextOptions.userAgent = this.customUserAgent;
      }
      this.context = await this.browser.newContext(contextOptions);
      const { applyStealth: applyStealth2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
      await applyStealth2(this.context);
      if (Object.keys(this.extraHeaders).length > 0) {
        await this.context.setExtraHTTPHeaders(this.extraHeaders);
      }
      await this.restoreState(state);
      return null;
    } catch (err) {
      try {
        this.pages.clear();
        this.tabSessions.clear();
        if (this.context)
          await this.context.close().catch(() => {});
        const contextOptions = {
          viewport: { width: this.currentViewport.width, height: this.currentViewport.height },
          deviceScaleFactor: this.deviceScaleFactor
        };
        if (this.customUserAgent) {
          contextOptions.userAgent = this.customUserAgent;
        }
        this.context = await this.browser.newContext(contextOptions);
        const { applyStealth: applyStealth2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
        await applyStealth2(this.context);
        await this.newTab();
        this.clearRefs();
      } catch {}
      return `Context recreation failed: ${err instanceof Error ? err.message : String(err)}. Browser reset to blank tab.`;
    }
  }
  async setDeviceScaleFactor(scale, width, height) {
    if (!Number.isFinite(scale)) {
      throw new Error(`viewport --scale: value must be a finite number, got ${scale}`);
    }
    if (scale < 1 || scale > 3) {
      throw new Error(`viewport --scale: value must be between 1 and 3 (sriflow policy cap), got ${scale}`);
    }
    if (this.connectionMode === "headed") {
      throw new Error("viewport --scale is not supported in headed mode \u2014 scale is controlled by the real browser window.");
    }
    const prevScale = this.deviceScaleFactor;
    const prevViewport = { ...this.currentViewport };
    this.deviceScaleFactor = scale;
    this.currentViewport = { width, height };
    const err = await this.recreateContext();
    if (err !== null) {
      this.deviceScaleFactor = prevScale;
      this.currentViewport = prevViewport;
      const rollbackErr = await this.recreateContext();
      if (rollbackErr !== null) {
        return `${err} (rollback also encountered: ${rollbackErr})`;
      }
      return err;
    }
    return null;
  }
  getDeviceScaleFactor() {
    return this.deviceScaleFactor;
  }
  getCurrentViewport() {
    return { ...this.currentViewport };
  }
  async handoff(message) {
    if (this.connectionMode === "headed" || this.isHeaded) {
      return `HANDOFF: Already in headed mode at ${this.getCurrentUrl()}`;
    }
    if (!this.browser || !this.context) {
      throw new Error("Browser not launched");
    }
    const state = await this.saveState();
    const currentUrl = this.getCurrentUrl();
    let newContext;
    try {
      const fs5 = __require("fs");
      const path5 = __require("path");
      const extensionPath = this.findExtensionPath();
      const { STEALTH_LAUNCH_ARGS: STEALTH_LAUNCH_ARGS2, buildGStackLaunchArgs: buildGStackLaunchArgs2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
      const launchArgs = ["--hide-crash-restore-bubble", ...STEALTH_LAUNCH_ARGS2, ...buildGStackLaunchArgs2()];
      if (extensionPath) {
        launchArgs.push(`--disable-extensions-except=${extensionPath}`);
        launchArgs.push(`--load-extension=${extensionPath}`);
        console.log(`[browse] Handoff: loading extension from ${extensionPath}`);
      } else {
        console.log("[browse] Handoff: extension not found \u2014 headed mode without side panel");
      }
      const userDataDir = path5.join(process.env.HOME || "/tmp", ".gstack", "chromium-profile");
      fs5.mkdirSync(userDataDir, { recursive: true });
      const { STEALTH_IGNORE_DEFAULT_ARGS: STEALTH_IGNORE_DEFAULT_ARGS2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
      newContext = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        chromiumSandbox: shouldEnableChromiumSandbox(),
        args: launchArgs,
        viewport: null,
        ...this.proxyConfig ? { proxy: this.proxyConfig } : {},
        ignoreDefaultArgs: STEALTH_IGNORE_DEFAULT_ARGS2,
        timeout: 15000
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return `ERROR: Cannot open headed browser \u2014 ${msg}. Headless browser still running.`;
    }
    try {
      const oldBrowser = this.browser;
      this.context = newContext;
      this.browser = newContext.browser();
      this.pages.clear();
      this.tabSessions.clear();
      this.connectionMode = "headed";
      const { applyStealth: applyStealth2 } = await Promise.resolve().then(() => (init_stealth(), exports_stealth));
      await applyStealth2(newContext);
      if (Object.keys(this.extraHeaders).length > 0) {
        await newContext.setExtraHTTPHeaders(this.extraHeaders);
      }
      if (this.browser) {
        const browserRef = this.browser;
        this.browser.on("disconnected", () => {
          if (this.intentionalDisconnect)
            return;
          handleChromiumDisconnect(browserRef);
        });
      }
      await this.restoreState(state);
      this.isHeaded = true;
      this.dialogAutoAccept = false;
      oldBrowser.removeAllListeners("disconnected");
      oldBrowser.close().catch(() => {});
      return [
        `HANDOFF: Browser opened at ${currentUrl}`,
        `MESSAGE: ${message}`,
        `STATUS: Waiting for user. Run 'resume' when done.`
      ].join(`
`);
    } catch (err) {
      await newContext.close().catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      return `ERROR: Handoff failed during state restore \u2014 ${msg}. Headless browser still running.`;
    }
  }
  resume() {
    try {
      const session = this.getActiveSession();
      session.clearRefs();
      session.setFrame(null);
    } catch {}
    this.resetFailures();
  }
  getIsHeaded() {
    return this.isHeaded;
  }
  incrementFailures() {
    this.consecutiveFailures++;
  }
  resetFailures() {
    this.consecutiveFailures = 0;
  }
  getFailureHint() {
    if (this.consecutiveFailures >= 3 && !this.isHeaded) {
      return `HINT: ${this.consecutiveFailures} consecutive failures. Consider using 'handoff' to let the user help.`;
    }
    return null;
  }
  wirePageEvents(page) {
    page.on("close", () => {
      for (const [id, p] of this.pages) {
        if (p === page) {
          this.pages.delete(id);
          this.tabSessions.delete(id);
          console.log(`[browse] Tab closed (id=${id}, remaining=${this.pages.size})`);
          if (this.activeTabId === id) {
            const remaining = [...this.pages.keys()];
            this.activeTabId = remaining.length > 0 ? remaining[remaining.length - 1] : 0;
          }
          break;
        }
      }
      this.recheckTabGuardrailsOnClose();
    });
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        for (const session of this.tabSessions.values()) {
          if (session.page === page) {
            session.onMainFrameNavigated();
            break;
          }
        }
      }
    });
    page.on("dialog", async (dialog) => {
      const entry = {
        timestamp: Date.now(),
        type: dialog.type(),
        message: dialog.message(),
        defaultValue: dialog.defaultValue() || undefined,
        action: this.dialogAutoAccept ? "accepted" : "dismissed",
        response: this.dialogAutoAccept ? this.dialogPromptText ?? undefined : undefined
      };
      addDialogEntry(entry);
      try {
        if (this.dialogAutoAccept) {
          await dialog.accept(this.dialogPromptText ?? undefined);
        } else {
          await dialog.dismiss();
        }
      } catch {}
    });
    page.on("console", (msg) => {
      addConsoleEntry({
        timestamp: Date.now(),
        level: msg.type(),
        text: msg.text()
      });
    });
    page.on("request", (req) => {
      addNetworkEntry({
        timestamp: Date.now(),
        method: req.method(),
        url: req.url()
      });
    });
    page.on("response", (res) => {
      const url = res.url();
      const status = res.status();
      for (let i = networkBuffer.length - 1;i >= 0; i--) {
        const entry = networkBuffer.get(i);
        if (entry && entry.url === url && !entry.status) {
          networkBuffer.set(i, { ...entry, status, duration: Date.now() - entry.timestamp });
          break;
        }
      }
    });
    page.on("requestfinished", async (req) => {
      try {
        const sizes = await req.sizes().catch(() => null);
        if (!sizes)
          return;
        const url = req.url();
        const size = sizes.responseBodySize ?? 0;
        for (let i = networkBuffer.length - 1;i >= 0; i--) {
          const entry = networkBuffer.get(i);
          if (entry && entry.url === url && !entry.size) {
            networkBuffer.set(i, { ...entry, size });
            break;
          }
        }
      } catch {}
    });
  }
}
var __dirname = "/home/otwos/Projects/sriflow/my-stack/browse/src";
var init_browser_manager = __esm(() => {
  init_file_permissions();
  init_buffers();
  init_activity();
  init_url_validation();
  init_config();
  init_cdp_bridge();
});

// browse/src/cdp-inspector.ts
async function getOrCreateSession(page) {
  let session = cdpSessions.get(page);
  if (session) {
    try {
      await session.send("DOM.getDocument", { depth: 0 });
      return session;
    } catch (err) {
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("detached"))
        throw err;
      cdpSessions.delete(page);
      initializedPages.delete(page);
    }
  }
  session = await getOrCreateCdpSession(page, cdpSessions);
  if (!initializedPages.has(page)) {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    initializedPages.add(page);
    page.once("close", () => initializedPages.delete(page));
  }
  page.once("framenavigated", () => {
    try {
      session.detach().catch(() => {});
    } catch (err) {
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("detached"))
        throw err;
    }
    cdpSessions.delete(page);
    initializedPages.delete(page);
  });
  return session;
}
function pushModification(mod) {
  modificationHistory.push(mod);
  modHistoryTotalPushed++;
  while (modificationHistory.length > MOD_HISTORY_CAP) {
    modificationHistory.shift();
  }
}
function computeSpecificity(selector) {
  let a = 0, b = 0, c = 0;
  let cleaned = selector;
  const ids = cleaned.match(/#[a-zA-Z_-][\w-]*/g);
  if (ids)
    a += ids.length;
  const classes = cleaned.match(/\.[a-zA-Z_-][\w-]*/g);
  if (classes)
    b += classes.length;
  const attrs = cleaned.match(/\[[^\]]+\]/g);
  if (attrs)
    b += attrs.length;
  const pseudoClasses = cleaned.match(/(?<!:):[a-zA-Z][\w-]*/g);
  if (pseudoClasses)
    b += pseudoClasses.length;
  const types = cleaned.match(/(?:^|[\s+~>])([a-zA-Z][\w-]*)/g);
  if (types)
    c += types.length;
  const pseudoElements = cleaned.match(/::[a-zA-Z][\w-]*/g);
  if (pseudoElements)
    c += pseudoElements.length;
  return { a, b, c };
}
function compareSpecificity(s1, s2) {
  if (s1.a !== s2.a)
    return s1.a - s2.a;
  if (s1.b !== s2.b)
    return s1.b - s2.b;
  return s1.c - s2.c;
}
async function inspectElement(page, selector, options) {
  const session = await getOrCreateSession(page);
  const { root } = await session.send("DOM.getDocument", { depth: 0 });
  let nodeId;
  try {
    const result = await session.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector
    });
    nodeId = result.nodeId;
    if (!nodeId)
      throw new Error(`Element not found: ${selector}`);
  } catch (err) {
    throw new Error(`Element not found: ${selector} \u2014 ${err.message}`);
  }
  const { node } = await session.send("DOM.describeNode", { nodeId, depth: 0 });
  const tagName = (node.localName || node.nodeName || "").toLowerCase();
  const attrPairs = node.attributes || [];
  const attributes = {};
  for (let i = 0;i < attrPairs.length; i += 2) {
    attributes[attrPairs[i]] = attrPairs[i + 1];
  }
  const id = attributes.id || null;
  const classes = attributes.class ? attributes.class.split(/\s+/).filter(Boolean) : [];
  let boxModel = {
    content: { x: 0, y: 0, width: 0, height: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  };
  try {
    const boxData = await session.send("DOM.getBoxModel", { nodeId });
    const model = boxData.model;
    const content = model.content;
    const padding = model.padding;
    const border = model.border;
    const margin = model.margin;
    const contentX = content[0];
    const contentY = content[1];
    const contentWidth = content[2] - content[0];
    const contentHeight = content[5] - content[1];
    boxModel = {
      content: { x: contentX, y: contentY, width: contentWidth, height: contentHeight },
      padding: {
        top: content[1] - padding[1],
        right: padding[2] - content[2],
        bottom: padding[5] - content[5],
        left: content[0] - padding[0]
      },
      border: {
        top: padding[1] - border[1],
        right: border[2] - padding[2],
        bottom: border[5] - padding[5],
        left: padding[0] - border[0]
      },
      margin: {
        top: border[1] - margin[1],
        right: margin[2] - border[2],
        bottom: margin[5] - border[5],
        left: border[0] - margin[0]
      }
    };
  } catch (err) {
    if (!err?.message?.includes("box model") && !err?.message?.includes("Could not compute"))
      throw err;
  }
  const matchedData = await session.send("CSS.getMatchedStylesForNode", { nodeId });
  const computedData = await session.send("CSS.getComputedStyleForNode", { nodeId });
  const computedStyles = {};
  for (const entry of computedData.computedStyle) {
    if (KEY_CSS_SET.has(entry.name)) {
      computedStyles[entry.name] = entry.value;
    }
  }
  const inlineData = await session.send("CSS.getInlineStylesForNode", { nodeId });
  const inlineStyles = {};
  if (inlineData.inlineStyle?.cssProperties) {
    for (const prop of inlineData.inlineStyle.cssProperties) {
      if (prop.name && prop.value && !prop.disabled) {
        inlineStyles[prop.name] = prop.value;
      }
    }
  }
  const matchedRules = [];
  const seenProperties = new Map;
  if (matchedData.matchedCSSRules) {
    for (const match of matchedData.matchedCSSRules) {
      const rule = match.rule;
      const isUA = rule.origin === "user-agent";
      if (isUA && !options?.includeUA)
        continue;
      let selectorText = "";
      if (rule.selectorList?.selectors) {
        const matchingIdx = match.matchingSelectors?.[0] ?? 0;
        selectorText = rule.selectorList.selectors[matchingIdx]?.text || rule.selectorList.text || "";
      }
      let source = "inline";
      let sourceLine = 0;
      let sourceColumn = 0;
      let styleSheetId;
      let range;
      if (rule.styleSheetId) {
        styleSheetId = rule.styleSheetId;
        source = rule.origin === "regular" ? rule.styleSheetId || "stylesheet" : rule.origin;
      }
      if (rule.style?.range) {
        range = rule.style.range;
        sourceLine = rule.style.range.startLine || 0;
        sourceColumn = rule.style.range.startColumn || 0;
      }
      let media;
      if (match.rule?.media) {
        const mediaList = match.rule.media;
        if (Array.isArray(mediaList) && mediaList.length > 0) {
          media = mediaList.map((m) => m.text).filter(Boolean).join(", ");
        }
      }
      const specificity = computeSpecificity(selectorText);
      const properties = [];
      if (rule.style?.cssProperties) {
        for (const prop of rule.style.cssProperties) {
          if (!prop.name || prop.disabled)
            continue;
          if (prop.name.startsWith("-") && !KEY_CSS_SET.has(prop.name))
            continue;
          properties.push({
            name: prop.name,
            value: prop.value || "",
            important: prop.important || (prop.value?.includes("!important") ?? false),
            overridden: false
          });
        }
      }
      matchedRules.push({
        selector: selectorText,
        properties,
        source,
        sourceLine,
        sourceColumn,
        specificity,
        media,
        userAgent: isUA,
        styleSheetId,
        range
      });
    }
  }
  matchedRules.sort((a, b) => -compareSpecificity(a.specificity, b.specificity));
  for (let i = 0;i < matchedRules.length; i++) {
    for (const prop of matchedRules[i].properties) {
      const key = prop.name;
      if (!seenProperties.has(key)) {
        seenProperties.set(key, i);
      } else {
        const earlierIdx = seenProperties.get(key);
        const earlierRule = matchedRules[earlierIdx];
        const earlierProp = earlierRule.properties.find((p) => p.name === key);
        if (prop.important && earlierProp && !earlierProp.important) {
          if (earlierProp)
            earlierProp.overridden = true;
          seenProperties.set(key, i);
        } else {
          prop.overridden = true;
        }
      }
    }
  }
  const pseudoElements = [];
  if (matchedData.pseudoElements) {
    for (const pseudo of matchedData.pseudoElements) {
      const pseudoType = pseudo.pseudoType || "unknown";
      const rules = [];
      if (pseudo.matches) {
        for (const match of pseudo.matches) {
          const rule = match.rule;
          const sel = rule.selectorList?.text || "";
          const props = (rule.style?.cssProperties || []).filter((p) => p.name && !p.disabled).map((p) => `${p.name}: ${p.value}`).join("; ");
          if (props) {
            rules.push({ selector: sel, properties: props });
          }
        }
      }
      if (rules.length > 0) {
        pseudoElements.push({ pseudo: `::${pseudoType}`, rules });
      }
    }
  }
  return {
    selector,
    tagName,
    id,
    classes,
    attributes,
    boxModel,
    computedStyles,
    matchedRules,
    inlineStyles,
    pseudoElements
  };
}
async function modifyStyle(page, selector, property, value) {
  if (!/^[a-zA-Z-]+$/.test(property)) {
    throw new Error(`Invalid CSS property name: ${property}. Only letters and hyphens allowed.`);
  }
  const DANGEROUS_CSS = /url\s*\(|expression\s*\(|@import|javascript:|data:/i;
  if (DANGEROUS_CSS.test(value)) {
    throw new Error("CSS value rejected: contains potentially dangerous pattern.");
  }
  let oldValue = "";
  let source = "inline";
  let sourceLine = 0;
  let method = "inline";
  try {
    const session = await getOrCreateSession(page);
    const result = await inspectElement(page, selector);
    oldValue = result.computedStyles[property] || "";
    let targetRule = null;
    for (const rule of result.matchedRules) {
      if (rule.userAgent)
        continue;
      const hasProp = rule.properties.some((p) => p.name === property);
      if (hasProp && rule.styleSheetId && rule.range) {
        targetRule = rule;
        break;
      }
    }
    if (targetRule?.styleSheetId && targetRule.range) {
      const range = targetRule.range;
      const styleText = await session.send("CSS.getStyleSheetText", {
        styleSheetId: targetRule.styleSheetId
      });
      const currentProps = targetRule.properties;
      const newPropsText = currentProps.map((p) => {
        if (p.name === property) {
          return `${p.name}: ${value}`;
        }
        return `${p.name}: ${p.value}`;
      }).join("; ");
      try {
        await session.send("CSS.setStyleTexts", {
          edits: [{
            styleSheetId: targetRule.styleSheetId,
            range,
            text: newPropsText
          }]
        });
        method = "setStyleTexts";
        source = `${targetRule.source}:${targetRule.sourceLine}`;
        sourceLine = targetRule.sourceLine;
      } catch (err) {
        if (!err?.message?.includes("style") && !err?.message?.includes("range") && !err?.message?.includes("closed") && !err?.message?.includes("Target"))
          throw err;
      }
    }
    if (method === "inline") {
      await page.evaluate(([sel, prop, val]) => {
        const el = document.querySelector(sel);
        if (!el)
          throw new Error(`Element not found: ${sel}`);
        el.style.setProperty(prop, val);
      }, [selector, property, value]);
    }
  } catch (err) {
    await page.evaluate(([sel, prop, val]) => {
      const el = document.querySelector(sel);
      if (!el)
        throw new Error(`Element not found: ${sel}`);
      el.style.setProperty(prop, val);
    }, [selector, property, value]);
  }
  const modification = {
    selector,
    property,
    oldValue,
    newValue: value,
    source,
    sourceLine,
    timestamp: Date.now(),
    method
  };
  pushModification(modification);
  return modification;
}
async function undoModification(page, index) {
  const idx = index ?? modificationHistory.length - 1;
  if (idx < 0 || idx >= modificationHistory.length) {
    const evictedNote = modHistoryTotalPushed > MOD_HISTORY_CAP ? ` (most recent ${MOD_HISTORY_CAP} only \u2014 ${modHistoryTotalPushed - MOD_HISTORY_CAP} earlier entries evicted at the cap)` : "";
    throw new Error(`No modification at index ${idx}. History has ${modificationHistory.length} entries${evictedNote}.`);
  }
  const mod = modificationHistory[idx];
  if (mod.method === "setStyleTexts") {
    try {
      await modifyStyle(page, mod.selector, mod.property, mod.oldValue);
      modificationHistory.pop();
    } catch (err) {
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("style") && !err?.message?.includes("not found") && !err?.message?.includes("Element"))
        throw err;
      await page.evaluate(([sel, prop, val]) => {
        const el = document.querySelector(sel);
        if (!el)
          return;
        if (val) {
          el.style.setProperty(prop, val);
        } else {
          el.style.removeProperty(prop);
        }
      }, [mod.selector, mod.property, mod.oldValue]);
    }
  } else {
    await page.evaluate(([sel, prop, val]) => {
      const el = document.querySelector(sel);
      if (!el)
        return;
      if (val) {
        el.style.setProperty(prop, val);
      } else {
        el.style.removeProperty(prop);
      }
    }, [mod.selector, mod.property, mod.oldValue]);
  }
  modificationHistory.splice(idx, 1);
}
function getModificationHistory() {
  return [...modificationHistory];
}
function getModificationHistoryStats() {
  return {
    current: modificationHistory.length,
    cap: MOD_HISTORY_CAP,
    evicted: Math.max(0, modHistoryTotalPushed - MOD_HISTORY_CAP)
  };
}
async function resetModifications(page) {
  for (let i = modificationHistory.length - 1;i >= 0; i--) {
    const mod = modificationHistory[i];
    try {
      await page.evaluate(([sel, prop, val]) => {
        const el = document.querySelector(sel);
        if (!el)
          return;
        if (val) {
          el.style.setProperty(prop, val);
        } else {
          el.style.removeProperty(prop);
        }
      }, [mod.selector, mod.property, mod.oldValue]);
    } catch (err) {
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("Execution context"))
        throw err;
    }
  }
  modificationHistory.length = 0;
  modHistoryTotalPushed = 0;
}
function formatInspectorResult(result, options) {
  const lines = [];
  const classStr = result.classes.length > 0 ? ` class="${result.classes.join(" ")}"` : "";
  const idStr = result.id ? ` id="${result.id}"` : "";
  lines.push(`Element: <${result.tagName}${idStr}${classStr}>`);
  lines.push(`Selector: ${result.selector}`);
  const w = Math.round(result.boxModel.content.width + result.boxModel.padding.left + result.boxModel.padding.right);
  const h = Math.round(result.boxModel.content.height + result.boxModel.padding.top + result.boxModel.padding.bottom);
  lines.push(`Dimensions: ${w} x ${h}`);
  lines.push("");
  lines.push("Box Model:");
  const bm = result.boxModel;
  lines.push(`  margin:  ${Math.round(bm.margin.top)}px  ${Math.round(bm.margin.right)}px  ${Math.round(bm.margin.bottom)}px  ${Math.round(bm.margin.left)}px`);
  lines.push(`  padding: ${Math.round(bm.padding.top)}px  ${Math.round(bm.padding.right)}px  ${Math.round(bm.padding.bottom)}px  ${Math.round(bm.padding.left)}px`);
  lines.push(`  border:  ${Math.round(bm.border.top)}px  ${Math.round(bm.border.right)}px  ${Math.round(bm.border.bottom)}px  ${Math.round(bm.border.left)}px`);
  lines.push(`  content: ${Math.round(bm.content.width)} x ${Math.round(bm.content.height)}`);
  lines.push("");
  const displayRules = options?.includeUA ? result.matchedRules : result.matchedRules.filter((r) => !r.userAgent);
  lines.push(`Matched Rules (${displayRules.length}):`);
  if (displayRules.length === 0) {
    lines.push("  (none)");
  } else {
    for (const rule of displayRules) {
      const propsStr = rule.properties.filter((p) => !p.overridden).map((p) => `${p.name}: ${p.value}${p.important ? " !important" : ""}`).join("; ");
      if (!propsStr)
        continue;
      const spec = `[${rule.specificity.a},${rule.specificity.b},${rule.specificity.c}]`;
      lines.push(`  ${rule.selector} { ${propsStr} }`);
      lines.push(`    -> ${rule.source}:${rule.sourceLine} ${spec}${rule.media ? ` @media ${rule.media}` : ""}`);
    }
  }
  lines.push("");
  lines.push("Inline Styles:");
  const inlineEntries = Object.entries(result.inlineStyles);
  if (inlineEntries.length === 0) {
    lines.push("  (none)");
  } else {
    const inlineStr = inlineEntries.map(([k, v]) => `${k}: ${v}`).join("; ");
    lines.push(`  ${inlineStr}`);
  }
  lines.push("");
  lines.push("Computed (key):");
  const cs = result.computedStyles;
  const computedPairs = [];
  for (const prop of KEY_CSS_PROPERTIES) {
    if (cs[prop] !== undefined) {
      computedPairs.push(`${prop}: ${cs[prop]}`);
    }
  }
  for (let i = 0;i < computedPairs.length; i += 3) {
    const chunk = computedPairs.slice(i, i + 3);
    lines.push(`  ${chunk.join(" | ")}`);
  }
  if (result.pseudoElements.length > 0) {
    lines.push("");
    lines.push("Pseudo-elements:");
    for (const pseudo of result.pseudoElements) {
      for (const rule of pseudo.rules) {
        lines.push(`  ${pseudo.pseudo} ${rule.selector} { ${rule.properties} }`);
      }
    }
  }
  return lines.join(`
`);
}
function detachSession(page) {
  if (page) {
    const session = cdpSessions.get(page);
    if (session) {
      try {
        session.detach().catch(() => {});
      } catch (err) {
        if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("detached"))
          throw err;
      }
      cdpSessions.delete(page);
      initializedPages.delete(page);
    }
  }
}
var KEY_CSS_PROPERTIES, KEY_CSS_SET, cdpSessions, initializedPages, MOD_HISTORY_CAP = 200, modificationHistory, modHistoryTotalPushed = 0;
var init_cdp_inspector = __esm(() => {
  init_cdp_bridge();
  KEY_CSS_PROPERTIES = [
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "float",
    "clear",
    "z-index",
    "overflow",
    "overflow-x",
    "overflow-y",
    "width",
    "height",
    "min-width",
    "max-width",
    "min-height",
    "max-height",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "border-style",
    "border-color",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "color",
    "background-color",
    "background-image",
    "opacity",
    "box-shadow",
    "border-radius",
    "transform",
    "transition",
    "flex-direction",
    "flex-wrap",
    "justify-content",
    "align-items",
    "gap",
    "grid-template-columns",
    "grid-template-rows",
    "text-align",
    "text-decoration",
    "visibility",
    "cursor",
    "pointer-events"
  ];
  KEY_CSS_SET = new Set(KEY_CSS_PROPERTIES);
  cdpSessions = new WeakMap;
  initializedPages = new WeakSet;
  modificationHistory = [];
});

// browse/src/sanitize.ts
function stripLoneSurrogates(s) {
  return s.replace(LONE_SURROGATE_HIGH, "\uFFFD").replace(LONE_SURROGATE_LOW, "\uFFFD");
}
function stripLoneSurrogateEscapes(s) {
  return s.replace(LONE_SURROGATE_HIGH_ESCAPE, "\\uFFFD").replace(LONE_SURROGATE_LOW_ESCAPE, "\\uFFFD");
}
function sanitizeBody(body, isJson) {
  return isJson ? stripLoneSurrogateEscapes(stripLoneSurrogates(body)) : stripLoneSurrogates(body);
}
var LONE_SURROGATE_HIGH, LONE_SURROGATE_LOW, LONE_SURROGATE_HIGH_ESCAPE, LONE_SURROGATE_LOW_ESCAPE;
var init_sanitize = __esm(() => {
  LONE_SURROGATE_HIGH = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g;
  LONE_SURROGATE_LOW = /(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
  LONE_SURROGATE_HIGH_ESCAPE = /\\u[Dd][89ABab][0-9A-Fa-f]{2}(?!\\u[Dd][C-Fc-f][0-9A-Fa-f]{2})/g;
  LONE_SURROGATE_LOW_ESCAPE = /(?<!\\u[Dd][89ABab][0-9A-Fa-f]{2})\\u[Dd][C-Fc-f][0-9A-Fa-f]{2}/g;
});

// browse/src/network-capture.ts
var exports_network_capture = {};
__export(exports_network_capture, {
  stopCapture: () => stopCapture,
  startCapture: () => startCapture,
  isCaptureActive: () => isCaptureActive,
  getCaptureListener: () => getCaptureListener,
  getCaptureBuffer: () => getCaptureBuffer,
  exportCapture: () => exportCapture,
  clearCapture: () => clearCapture,
  SizeCappedBuffer: () => SizeCappedBuffer
});
import * as fs5 from "fs";

class SizeCappedBuffer {
  entries = [];
  totalSize = 0;
  maxSize;
  constructor(maxSize = MAX_BUFFER_SIZE) {
    this.maxSize = maxSize;
  }
  push(entry) {
    while (this.entries.length > 0 && this.totalSize + entry.size > this.maxSize) {
      const evicted = this.entries.shift();
      this.totalSize -= evicted.size;
    }
    this.entries.push(entry);
    this.totalSize += entry.size;
  }
  toArray() {
    return [...this.entries];
  }
  get length() {
    return this.entries.length;
  }
  get byteSize() {
    return this.totalSize;
  }
  clear() {
    this.entries = [];
    this.totalSize = 0;
  }
  exportToFile(filePath) {
    const lines = this.entries.map((e) => JSON.stringify(e));
    fs5.writeFileSync(filePath, lines.join(`
`) + `
`);
    return this.entries.length;
  }
  summary() {
    if (this.entries.length === 0)
      return "No captured responses.";
    const lines = this.entries.map((e, i) => `  [${i + 1}] ${e.status} ${e.url.slice(0, 100)} (${Math.round(e.size / 1024)}KB${e.bodyTruncated ? ", truncated" : ""})`);
    return `${this.entries.length} responses (${Math.round(this.totalSize / 1024)}KB total):
${lines.join(`
`)}`;
  }
}
function isCaptureActive() {
  return captureActive;
}
function getCaptureBuffer() {
  return captureBuffer;
}
function createResponseListener(filter) {
  return async (response) => {
    const url = response.url();
    if (filter && !filter.test(url))
      return;
    const status = response.status();
    if (status === 204 || status === 301 || status === 302 || status === 304)
      return;
    const contentType = response.headers()["content-type"] || "";
    let body = "";
    let bodySize = 0;
    let truncated = false;
    try {
      const rawBody = await response.body();
      bodySize = rawBody.length;
      if (bodySize > MAX_ENTRY_SIZE) {
        truncated = true;
        body = "";
      } else if (contentType.includes("json") || contentType.includes("text") || contentType.includes("xml") || contentType.includes("html")) {
        body = rawBody.toString("utf-8");
      } else {
        body = rawBody.toString("base64");
      }
    } catch {
      body = "";
      truncated = true;
    }
    const entry = {
      url,
      status,
      headers: response.headers(),
      body,
      contentType,
      timestamp: Date.now(),
      size: bodySize,
      bodyTruncated: truncated
    };
    captureBuffer.push(entry);
  };
}
function startCapture(filterPattern) {
  captureFilter = filterPattern ? new RegExp(filterPattern) : null;
  captureActive = true;
  captureListener = createResponseListener(captureFilter);
  return { filter: filterPattern || null };
}
function getCaptureListener() {
  return captureListener;
}
function stopCapture() {
  captureActive = false;
  captureListener = null;
  return {
    count: captureBuffer.length,
    sizeKB: Math.round(captureBuffer.byteSize / 1024)
  };
}
function clearCapture() {
  captureBuffer.clear();
}
function exportCapture(filePath) {
  return captureBuffer.exportToFile(filePath);
}
var MAX_BUFFER_SIZE, MAX_ENTRY_SIZE, captureBuffer, captureActive = false, captureFilter = null, captureListener = null;
var init_network_capture = __esm(() => {
  MAX_BUFFER_SIZE = 50 * 1024 * 1024;
  MAX_ENTRY_SIZE = 5 * 1024 * 1024;
  captureBuffer = new SizeCappedBuffer;
});

// browse/src/media-extract.ts
var exports_media_extract = {};
__export(exports_media_extract, {
  extractMedia: () => extractMedia
});
async function extractMedia(target, options) {
  const result = await target.evaluate(({ scopeSelector, filter }) => {
    const root = scopeSelector ? document.querySelector(scopeSelector) || document : document;
    const images = [];
    const videos = [];
    const audio = [];
    const backgroundImages = [];
    if (!filter || filter === "images") {
      const imgs = root.querySelectorAll("img");
      imgs.forEach((img, i) => {
        const rect = img.getBoundingClientRect();
        images.push({
          index: i,
          src: img.src || "",
          srcset: img.srcset || "",
          currentSrc: img.currentSrc || "",
          alt: img.alt || "",
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          loading: img.loading || "",
          dataSrc: img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original") || "",
          visible: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
        });
      });
    }
    if (!filter || filter === "videos") {
      const vids = root.querySelectorAll("video");
      vids.forEach((vid, i) => {
        const sources = Array.from(vid.querySelectorAll("source")).map((s) => ({
          src: s.src || "",
          type: s.type || ""
        }));
        const isHLS = sources.some((s) => s.type.includes("mpegURL") || s.src.includes(".m3u8"));
        const isDASH = sources.some((s) => s.type.includes("dash") || s.src.includes(".mpd"));
        videos.push({
          index: i,
          src: vid.src || "",
          currentSrc: vid.currentSrc || "",
          poster: vid.poster || "",
          width: vid.videoWidth || vid.width,
          height: vid.videoHeight || vid.height,
          duration: isFinite(vid.duration) ? vid.duration : 0,
          type: sources[0]?.type || "",
          sources,
          isHLS,
          isDASH
        });
      });
    }
    if (!filter || filter === "audio") {
      const auds = root.querySelectorAll("audio");
      auds.forEach((aud, i) => {
        const source = aud.querySelector("source");
        audio.push({
          index: i,
          src: aud.src || source?.src || "",
          currentSrc: aud.currentSrc || "",
          duration: isFinite(aud.duration) ? aud.duration : 0,
          type: source?.type || ""
        });
      });
    }
    if (!filter || filter === "images") {
      const allElements = root.querySelectorAll("*");
      let bgCount = 0;
      for (let i = 0;i < allElements.length && bgCount < 500; i++) {
        const el = allElements[i];
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== "none") {
          const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("data:")) {
            backgroundImages.push({
              index: bgCount,
              url: urlMatch[1],
              selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""),
              element: el.tagName.toLowerCase()
            });
            bgCount++;
          }
        }
      }
    }
    return { images, videos, audio, backgroundImages };
  }, { scopeSelector: options?.selector || null, filter: options?.filter || null });
  return {
    ...result,
    total: result.images.length + result.videos.length + result.audio.length + result.backgroundImages.length
  };
}

// browse/src/read-commands.ts
var exports_read_commands = {};
__export(exports_read_commands, {
  writeEvalResult: () => writeEvalResult,
  validateReadPath: () => validateReadPath,
  resultToString: () => resultToString,
  parseOutArgs: () => parseOutArgs,
  hasOutArg: () => hasOutArg,
  handleReadCommand: () => handleReadCommand,
  getCleanText: () => getCleanText,
  SENSITIVE_COOKIE_VALUE: () => SENSITIVE_COOKIE_VALUE,
  SENSITIVE_COOKIE_NAME: () => SENSITIVE_COOKIE_NAME
});
import * as fs6 from "fs";
import * as path5 from "path";
function hasAwait(code) {
  const stripped = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  return /\bawait\b/.test(stripped);
}
function needsBlockWrapper(code) {
  const trimmed = code.trim();
  if (trimmed.split(`
`).length > 1)
    return true;
  if (/\b(const|let|var|function|class|return|throw|if|for|while|switch|try)\b/.test(trimmed))
    return true;
  if (trimmed.includes(";"))
    return true;
  return false;
}
function wrapForEvaluate(code) {
  if (!hasAwait(code))
    return code;
  const trimmed = code.trim();
  return needsBlockWrapper(trimmed) ? `(async()=>{
${code}
})()` : `(async()=>(${trimmed}))()`;
}
function parseOutArgs(args) {
  let outPath;
  let raw = false;
  const rest = [];
  for (let i = 0;i < args.length; i++) {
    const a = args[i];
    if (a === "--out") {
      if (outPath !== undefined)
        throw new Error("--out specified more than once");
      const val = args[i + 1];
      if (val === undefined || val.startsWith("--"))
        throw new Error("--out requires a file path");
      outPath = val;
      i++;
    } else if (a.startsWith("--out=")) {
      if (outPath !== undefined)
        throw new Error("--out specified more than once");
      const val = a.slice("--out=".length);
      if (val === "")
        throw new Error("--out requires a file path");
      outPath = val;
    } else if (a === "--raw") {
      raw = true;
    } else if (a.startsWith("--raw=")) {
      const v = a.slice("--raw=".length).toLowerCase();
      if (v !== "true" && v !== "false")
        throw new Error("--raw must be true or false");
      raw = v === "true";
    } else {
      rest.push(a);
    }
  }
  return { outPath, raw, rest };
}
function hasOutArg(args) {
  return args.some((a) => a === "--out" || a.startsWith("--out="));
}
function resultToString(result) {
  return typeof result === "object" ? JSON.stringify(result, null, 2) : String(result ?? "");
}
function writeEvalResult(outPath, str, opts) {
  validateOutputPath(outPath);
  fs6.mkdirSync(path5.dirname(path5.resolve(outPath)), { recursive: true });
  if (!opts.raw && str.startsWith("data:")) {
    const comma = str.indexOf(",");
    if (comma !== -1) {
      const header = str.slice("data:".length, comma);
      const tokens = header.split(";").map((t) => t.trim().toLowerCase());
      if (tokens.includes("base64")) {
        const payload = str.slice(comma + 1).replace(/\s+/g, "");
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) {
          throw new Error("--out: malformed base64 in data URL (decode would corrupt output)");
        }
        const buf2 = Buffer.from(payload, "base64");
        fs6.writeFileSync(outPath, buf2);
        return buf2.length;
      }
    }
  }
  const buf = Buffer.from(stripLoneSurrogates(str), "utf-8");
  fs6.writeFileSync(outPath, buf);
  return buf.length;
}
async function getCleanText(page) {
  const raw = await page.evaluate(() => {
    const body = document.body;
    if (!body)
      return "";
    const clone = body.cloneNode(true);
    clone.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove());
    return clone.innerText.split(`
`).map((line) => line.trim()).filter((line) => line.length > 0).join(`
`);
  });
  return stripLoneSurrogates(raw);
}
function assertJsOriginAllowed(bm, pageUrl) {
  if (!bm.hasCookieImports())
    return;
  let hostname;
  try {
    hostname = new URL(pageUrl).hostname;
  } catch {
    return;
  }
  const importedDomains = bm.getCookieImportedDomains();
  const allowed = [...importedDomains].some((domain) => {
    const normalized = domain.startsWith(".") ? domain : "." + domain;
    return hostname === domain.replace(/^\./, "") || hostname.endsWith(normalized);
  });
  if (!allowed) {
    throw new Error(`JS execution blocked: current page (${hostname}) does not match any cookie-imported domain. ` + `Imported cookies for: ${[...importedDomains].join(", ")}. ` + `This prevents cross-origin cookie exfiltration. Navigate to an imported domain or run without imported cookies.`);
  }
}
async function handleReadCommand(command, args, session, bm) {
  const page = session.getPage();
  const target = session.getActiveFrameOrPage();
  switch (command) {
    case "text": {
      return getCleanText(target);
    }
    case "html": {
      const selector = args[0];
      if (selector) {
        const resolved = await session.resolveRef(selector);
        if ("locator" in resolved) {
          return stripLoneSurrogates(await resolved.locator.innerHTML({ timeout: 5000 }));
        }
        return stripLoneSurrogates(await target.locator(resolved.selector).innerHTML({ timeout: 5000 }));
      }
      const doctype = await target.evaluate(() => {
        const dt = document.doctype;
        return dt ? `<!DOCTYPE ${dt.name}>` : "";
      });
      const html = await target.evaluate(() => document.documentElement.outerHTML);
      return stripLoneSurrogates(doctype ? `${doctype}
${html}` : html);
    }
    case "links": {
      const links = await target.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({
        text: a.textContent?.trim().slice(0, 120) || "",
        href: a.href
      })).filter((l) => l.text && l.href));
      return links.map((l) => `${l.text} \u2192 ${l.href}`).join(`
`);
    }
    case "forms": {
      const forms = await target.evaluate(() => {
        return [...document.querySelectorAll("form")].map((form, i) => {
          const fields = [...form.querySelectorAll("input, select, textarea")].map((el) => {
            const input = el;
            return {
              tag: el.tagName.toLowerCase(),
              type: input.type || undefined,
              name: input.name || undefined,
              id: input.id || undefined,
              placeholder: input.placeholder || undefined,
              required: input.required || undefined,
              value: input.type === "password" || input.name && /(^|[_.-])(token|secret|key|password|credential|auth|jwt|session|csrf|sid)($|[_.-])|api.?key/i.test(input.name) || input.id && /(^|[_.-])(token|secret|key|password|credential|auth|jwt|session|csrf|sid)($|[_.-])|api.?key/i.test(input.id) ? "[redacted]" : input.value || undefined,
              options: el.tagName === "SELECT" ? [...el.options].map((o) => ({ value: o.value, text: o.text })) : undefined
            };
          });
          return {
            index: i,
            action: form.action || undefined,
            method: form.method || "get",
            id: form.id || undefined,
            fields
          };
        });
      });
      return JSON.stringify(forms, null, 2);
    }
    case "accessibility": {
      const snapshot = await target.locator("body").ariaSnapshot();
      return stripLoneSurrogates(snapshot);
    }
    case "js": {
      const { outPath, raw, rest } = parseOutArgs(args);
      const expr = rest[0];
      if (!expr)
        throw new Error("Usage: browse js <expression> [--out <file>] [--raw]");
      if (bm)
        assertJsOriginAllowed(bm, page.url());
      const wrapped = wrapForEvaluate(expr);
      const result = await target.evaluate(wrapped);
      const str = resultToString(result);
      if (outPath) {
        const n = writeEvalResult(outPath, str, { raw });
        return `JS result written: ${outPath} (${n} bytes)`;
      }
      return str;
    }
    case "eval": {
      const { outPath, raw, rest } = parseOutArgs(args);
      const filePath = rest[0];
      if (!filePath)
        throw new Error("Usage: browse eval <js-file> [--out <file>] [--raw]");
      if (bm)
        assertJsOriginAllowed(bm, page.url());
      validateReadPath(filePath);
      if (!fs6.existsSync(filePath))
        throw new Error(`File not found: ${filePath}`);
      const code = fs6.readFileSync(filePath, "utf-8");
      const wrapped = wrapForEvaluate(code);
      const result = await target.evaluate(wrapped);
      const str = resultToString(result);
      if (outPath) {
        const n = writeEvalResult(outPath, str, { raw });
        return `Eval result written: ${outPath} (${n} bytes)`;
      }
      return str;
    }
    case "css": {
      const [selector, property] = args;
      if (!selector || !property)
        throw new Error("Usage: browse css <selector> <property>");
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        const value2 = await resolved.locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
        return value2;
      }
      const value = await target.evaluate(([sel, prop]) => {
        const el = document.querySelector(sel);
        if (!el)
          return `Element not found: ${sel}`;
        return getComputedStyle(el).getPropertyValue(prop);
      }, [resolved.selector, property]);
      return value;
    }
    case "attrs": {
      const selector = args[0];
      if (!selector)
        throw new Error("Usage: browse attrs <selector>");
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        const attrs2 = await resolved.locator.evaluate((el) => {
          const result = {};
          for (const attr of el.attributes) {
            result[attr.name] = attr.value;
          }
          return result;
        });
        return JSON.stringify(attrs2, null, 2);
      }
      const attrs = await target.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el)
          return `Element not found: ${sel}`;
        const result = {};
        for (const attr of el.attributes) {
          result[attr.name] = attr.value;
        }
        return result;
      }, resolved.selector);
      return typeof attrs === "string" ? attrs : JSON.stringify(attrs, null, 2);
    }
    case "console": {
      if (args[0] === "--clear") {
        consoleBuffer.clear();
        return "Console buffer cleared.";
      }
      const entries = args[0] === "--errors" ? consoleBuffer.toArray().filter((e) => e.level === "error" || e.level === "warning") : consoleBuffer.toArray();
      if (entries.length === 0)
        return args[0] === "--errors" ? "(no console errors)" : "(no console messages)";
      return entries.map((e) => `[${new Date(e.timestamp).toISOString()}] [${e.level}] ${e.text}`).join(`
`);
    }
    case "network": {
      if (args[0] === "--clear") {
        networkBuffer.clear();
        return "Network buffer cleared.";
      }
      if (args[0] === "--capture") {
        const {
          startCapture: startCapture2,
          stopCapture: stopCapture2,
          getCaptureListener: getCaptureListener2,
          isCaptureActive: isCaptureActive2
        } = await Promise.resolve().then(() => (init_network_capture(), exports_network_capture));
        if (args[1] === "stop") {
          const page3 = bm.getPage();
          const listener2 = getCaptureListener2();
          if (listener2)
            page3.removeListener("response", listener2);
          const result = stopCapture2();
          return `Network capture stopped. ${result.count} responses captured (${result.sizeKB}KB).`;
        }
        if (isCaptureActive2())
          return "Capture already active. Use --capture stop first.";
        const filterIdx = args.indexOf("--filter");
        const filterPattern = filterIdx >= 0 ? args[filterIdx + 1] : undefined;
        const info = startCapture2(filterPattern);
        const page2 = bm.getPage();
        const listener = getCaptureListener2();
        if (listener)
          page2.on("response", listener);
        return `Network capture started${info.filter ? ` (filter: ${info.filter})` : ""}. Use --capture stop to stop.`;
      }
      if (args[0] === "--export") {
        const { exportCapture: exportCapture2 } = await Promise.resolve().then(() => (init_network_capture(), exports_network_capture));
        const { validateOutputPath: vop } = await Promise.resolve().then(() => (init_path_security(), exports_path_security));
        const exportPath = args[1];
        if (!exportPath)
          throw new Error("Usage: network --export <path>");
        vop(exportPath);
        const count = exportCapture2(exportPath);
        return `Exported ${count} captured responses to ${exportPath}`;
      }
      if (args[0] === "--bodies") {
        const { getCaptureBuffer: getCaptureBuffer2 } = await Promise.resolve().then(() => (init_network_capture(), exports_network_capture));
        return getCaptureBuffer2().summary();
      }
      if (networkBuffer.length === 0)
        return "(no network requests)";
      return networkBuffer.toArray().map((e) => `${e.method} ${e.url} \u2192 ${e.status || "pending"} (${e.duration || "?"}ms, ${e.size || "?"}B)`).join(`
`);
    }
    case "dialog": {
      if (args[0] === "--clear") {
        dialogBuffer.clear();
        return "Dialog buffer cleared.";
      }
      if (dialogBuffer.length === 0)
        return "(no dialogs captured)";
      return dialogBuffer.toArray().map((e) => `[${new Date(e.timestamp).toISOString()}] [${e.type}] "${e.message}" \u2192 ${e.action}${e.response ? ` "${e.response}"` : ""}`).join(`
`);
    }
    case "is": {
      const property = args[0];
      const selector = args[1];
      if (!property || !selector)
        throw new Error(`Usage: browse is <property> <selector>
Properties: visible, hidden, enabled, disabled, checked, editable, focused`);
      const resolved = await session.resolveRef(selector);
      let locator;
      if ("locator" in resolved) {
        locator = resolved.locator;
      } else {
        locator = target.locator(resolved.selector);
      }
      switch (property) {
        case "visible":
          return String(await locator.isVisible());
        case "hidden":
          return String(await locator.isHidden());
        case "enabled":
          return String(await locator.isEnabled());
        case "disabled":
          return String(await locator.isDisabled());
        case "checked":
          return String(await locator.isChecked());
        case "editable":
          return String(await locator.isEditable());
        case "focused": {
          const isFocused = await locator.evaluate((el) => el === document.activeElement);
          return String(isFocused);
        }
        default:
          throw new Error(`Unknown property: ${property}. Use: visible, hidden, enabled, disabled, checked, editable, focused`);
      }
    }
    case "cookies": {
      const cookies = await page.context().cookies();
      const redacted = cookies.map((c) => {
        if (SENSITIVE_COOKIE_NAME.test(c.name) || SENSITIVE_COOKIE_VALUE.test(c.value)) {
          return { ...c, value: `[REDACTED \u2014 ${c.value.length} chars]` };
        }
        return c;
      });
      return JSON.stringify(redacted, null, 2);
    }
    case "storage": {
      if (args[0] === "set" && args[1]) {
        const key = args[1];
        const value = args[2] || "";
        await target.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
        return `Set localStorage["${key}"]`;
      }
      const storage = await target.evaluate(() => ({
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      }));
      const SENSITIVE_KEY = /(^|[_.-])(token|secret|key|password|credential|auth|jwt|session|csrf)($|[_.-])|api.?key/i;
      const SENSITIVE_VALUE = /^(eyJ|sk-|sk_live_|sk_test_|pk_live_|pk_test_|rk_live_|sk-ant-|ghp_|gho_|github_pat_|xox[bpsa]-|AKIA[A-Z0-9]{16}|AIza|SG\.|Bearer\s|sbp_)/;
      const redacted = JSON.parse(JSON.stringify(storage));
      for (const storeType of ["localStorage", "sessionStorage"]) {
        const store = redacted[storeType];
        if (!store)
          continue;
        for (const [key, value] of Object.entries(store)) {
          if (typeof value !== "string")
            continue;
          if (SENSITIVE_KEY.test(key) || SENSITIVE_VALUE.test(value)) {
            store[key] = `[REDACTED \u2014 ${value.length} chars]`;
          }
        }
      }
      return JSON.stringify(redacted, null, 2);
    }
    case "perf": {
      const timings = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        if (!nav)
          return "No navigation timing data available.";
        return {
          dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
          tcp: Math.round(nav.connectEnd - nav.connectStart),
          ssl: Math.round(nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          download: Math.round(nav.responseEnd - nav.responseStart),
          domParse: Math.round(nav.domInteractive - nav.responseEnd),
          domReady: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: Math.round(nav.loadEventEnd - nav.startTime),
          total: Math.round(nav.loadEventEnd - nav.startTime)
        };
      });
      if (typeof timings === "string")
        return timings;
      return Object.entries(timings).map(([k, v]) => `${k.padEnd(12)} ${v}ms`).join(`
`);
    }
    case "inspect": {
      let includeUA = false;
      let showHistory = false;
      let selector;
      for (const arg of args) {
        if (arg === "--all") {
          includeUA = true;
        } else if (arg === "--history") {
          showHistory = true;
        } else if (!selector) {
          selector = arg;
        }
      }
      if (showHistory) {
        const history = getModificationHistory();
        if (history.length === 0)
          return "(no style modifications)";
        return history.map((m, i) => `[${i}] ${m.selector} { ${m.property}: ${m.oldValue} \u2192 ${m.newValue} } (${m.source}, ${m.method})`).join(`
`);
      }
      if (!selector) {
        const stored = bm._inspectorData;
        const storedTs = bm._inspectorTimestamp;
        if (stored) {
          const stale = storedTs && Date.now() - storedTs > 60000;
          let output = formatInspectorResult(stored, { includeUA });
          if (stale)
            output = `\u26A0 Data may be stale (>60s old)

` + output;
          return output;
        }
        throw new Error(`Usage: browse inspect [selector] [--all] [--history]
Or pick an element in the Chrome sidebar first.`);
      }
      const result = await inspectElement(page, selector, { includeUA });
      bm._inspectorData = result;
      bm._inspectorTimestamp = Date.now();
      return formatInspectorResult(result, { includeUA });
    }
    case "media": {
      const { extractMedia: extractMedia2 } = await Promise.resolve().then(() => exports_media_extract);
      const target2 = bm.getActiveFrameOrPage();
      const filter = args.includes("--images") ? "images" : args.includes("--videos") ? "videos" : args.includes("--audio") ? "audio" : undefined;
      const selectorArg = args.find((a) => !a.startsWith("--"));
      const result = await extractMedia2(target2, { selector: selectorArg, filter });
      return JSON.stringify(result, null, 2);
    }
    case "data": {
      const target2 = bm.getActiveFrameOrPage();
      const wantJsonLd = args.includes("--jsonld") || args.length === 0;
      const wantOg = args.includes("--og") || args.length === 0;
      const wantTwitter = args.includes("--twitter") || args.length === 0;
      const wantMeta = args.includes("--meta") || args.length === 0;
      const result = await target2.evaluate(({ wantJsonLd: wantJsonLd2, wantOg: wantOg2, wantTwitter: wantTwitter2, wantMeta: wantMeta2 }) => {
        const data = {};
        if (wantJsonLd2) {
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          const jsonLd = [];
          scripts.forEach((s) => {
            try {
              jsonLd.push(JSON.parse(s.textContent || ""));
            } catch {}
          });
          data.jsonLd = jsonLd;
        }
        if (wantOg2) {
          const og = {};
          document.querySelectorAll('meta[property^="og:"]').forEach((m) => {
            const prop = m.getAttribute("property")?.replace("og:", "") || "";
            og[prop] = m.getAttribute("content") || "";
          });
          data.openGraph = og;
        }
        if (wantTwitter2) {
          const tw = {};
          document.querySelectorAll('meta[name^="twitter:"]').forEach((m) => {
            const name = m.getAttribute("name")?.replace("twitter:", "") || "";
            tw[name] = m.getAttribute("content") || "";
          });
          data.twitterCards = tw;
        }
        if (wantMeta2) {
          const meta = {};
          const canonical = document.querySelector('link[rel="canonical"]');
          if (canonical)
            meta.canonical = canonical.getAttribute("href") || "";
          const desc = document.querySelector('meta[name="description"]');
          if (desc)
            meta.description = desc.getAttribute("content") || "";
          const keywords = document.querySelector('meta[name="keywords"]');
          if (keywords)
            meta.keywords = keywords.getAttribute("content") || "";
          const author = document.querySelector('meta[name="author"]');
          if (author)
            meta.author = author.getAttribute("content") || "";
          const title = document.querySelector("title");
          if (title)
            meta.title = title.textContent || "";
          data.meta = meta;
        }
        return data;
      }, { wantJsonLd, wantOg, wantTwitter, wantMeta });
      return JSON.stringify(result, null, 2);
    }
    default:
      throw new Error(`Unknown read command: ${command}`);
  }
}
var SENSITIVE_COOKIE_NAME, SENSITIVE_COOKIE_VALUE;
var init_read_commands = __esm(() => {
  init_buffers();
  init_cdp_inspector();
  init_path_security();
  init_sanitize();
  init_path_security();
  SENSITIVE_COOKIE_NAME = /(^|[_.-])(token|secret|key|password|credential|auth|jwt|session|csrf|sid)($|[_.-])|api.?key/i;
  SENSITIVE_COOKIE_VALUE = /^(eyJ|sk-|sk_live_|sk_test_|pk_live_|pk_test_|rk_live_|sk-ant-|ghp_|gho_|github_pat_|xox[bpsa]-|AKIA[A-Z0-9]{16}|AIza|SG\.|Bearer\s|sbp_)/;
});

// browse/src/screenshot-size-guard.ts
import { writeFileSync as writeFileSync4, readFileSync as readFileSync3 } from "fs";
async function guardScreenshotBuffer(input) {
  return {
    buffer: input,
    result: { resized: false, width: 0, height: 0, originalWidth: 0, originalHeight: 0 }
  };
}
async function guardScreenshotPath(filePath) {
  const input = readFileSync3(filePath);
  const { buffer, result } = await guardScreenshotBuffer(input);
  if (result.resized) {
    writeFileSync4(filePath, buffer);
  }
  return result;
}
var init_screenshot_size_guard = () => {};

// browse/src/write-commands.ts
var exports_write_commands = {};
__export(exports_write_commands, {
  handleWriteCommand: () => handleWriteCommand
});
import * as fs7 from "fs";
import * as path6 from "path";
async function handleWriteCommand(command, args, session, bm) {
  const page = session.getPage();
  const target = session.getActiveFrameOrPage();
  const inFrame = session.getFrame() !== null;
  switch (command) {
    case "goto": {
      if (inFrame)
        throw new Error("Cannot use goto inside a frame. Run 'frame main' first.");
      const url = args[0];
      if (!url)
        throw new Error("Usage: browse goto <url>");
      session.clearLoadedHtml();
      const normalizedUrl = await validateNavigationUrl(url);
      const response = await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      const status = response?.status() || "unknown";
      return `Navigated to ${normalizedUrl} (${status})`;
    }
    case "back": {
      if (inFrame)
        throw new Error("Cannot use back inside a frame. Run 'frame main' first.");
      session.clearLoadedHtml();
      await page.goBack({ waitUntil: "domcontentloaded", timeout: 15000 });
      return `Back \u2192 ${page.url()}`;
    }
    case "forward": {
      if (inFrame)
        throw new Error("Cannot use forward inside a frame. Run 'frame main' first.");
      session.clearLoadedHtml();
      await page.goForward({ waitUntil: "domcontentloaded", timeout: 15000 });
      return `Forward \u2192 ${page.url()}`;
    }
    case "reload": {
      if (inFrame)
        throw new Error("Cannot use reload inside a frame. Run 'frame main' first.");
      session.clearLoadedHtml();
      await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
      return `Reloaded ${page.url()}`;
    }
    case "load-html": {
      if (inFrame)
        throw new Error("Cannot use load-html inside a frame. Run 'frame main' first.");
      let fromFilePayload = null;
      let filePath;
      let waitUntil = "domcontentloaded";
      for (let i = 0;i < args.length; i++) {
        if (args[i] === "--from-file") {
          const payloadPath = args[++i];
          if (!payloadPath)
            throw new Error("load-html: --from-file requires a path");
          try {
            validateReadPath(path6.resolve(payloadPath));
          } catch {
            throw new Error(`load-html: --from-file ${payloadPath} must be under ${SAFE_DIRECTORIES.join(" or ")} (security policy). Copy the payload into the project tree or /tmp first.`);
          }
          const raw = fs7.readFileSync(payloadPath, "utf8");
          let json;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            throw new Error(`load-html: --from-file JSON parse failed: ${e.message}`);
          }
          if (typeof json.html !== "string") {
            throw new Error('load-html: --from-file JSON must have a "html" string field');
          }
          if (json.waitUntil && json.waitUntil !== "load" && json.waitUntil !== "domcontentloaded" && json.waitUntil !== "networkidle") {
            throw new Error(`load-html: --from-file waitUntil '${json.waitUntil}' invalid`);
          }
          fromFilePayload = { html: json.html, waitUntil: json.waitUntil };
        } else if (args[i] === "--wait-until") {
          const val = args[++i];
          if (val !== "load" && val !== "domcontentloaded" && val !== "networkidle") {
            throw new Error(`Invalid --wait-until '${val}'. Must be one of: load, domcontentloaded, networkidle.`);
          }
          waitUntil = val;
        } else if (args[i].startsWith("--")) {
          throw new Error(`Unknown flag: ${args[i]}`);
        } else if (!filePath) {
          filePath = args[i];
        }
      }
      if (fromFilePayload) {
        const MAX_BYTES2 = parseInt(process.env.SRIFLOW_BROWSE_MAX_HTML_BYTES || "", 10) || 50 * 1024 * 1024;
        if (Buffer.byteLength(fromFilePayload.html, "utf8") > MAX_BYTES2) {
          throw new Error(`load-html: --from-file html too large (> ${MAX_BYTES2} bytes). ` + "Raise with SRIFLOW_BROWSE_MAX_HTML_BYTES=<N>.");
        }
        const peek2 = fromFilePayload.html.trimStart();
        if (!/^<[a-zA-Z!?]/.test(peek2)) {
          throw new Error("load-html: --from-file html does not start with a valid markup opener");
        }
        const finalWaitUntil = fromFilePayload.waitUntil ?? waitUntil;
        await session.setTabContent(fromFilePayload.html, { waitUntil: finalWaitUntil });
        return `Loaded HTML: (inline from --from-file, ${fromFilePayload.html.length} chars)`;
      }
      if (!filePath)
        throw new Error("Usage: browse load-html <file> [--wait-until load|domcontentloaded|networkidle] [--tab-id <N>]  |  load-html --from-file <payload.json> [--tab-id <N>]");
      const ALLOWED_EXT = [".html", ".htm", ".xhtml", ".svg"];
      const ext = path6.extname(filePath).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        throw new Error(`load-html: file does not appear to be HTML. Expected .html/.htm/.xhtml/.svg, got ${ext || "(no extension)"}. Rename the file if it's really HTML.`);
      }
      const absolutePath = path6.resolve(filePath);
      try {
        validateReadPath(absolutePath);
      } catch (e) {
        throw new Error(`load-html: ${absolutePath} must be under ${SAFE_DIRECTORIES.join(" or ")} (security policy). Copy the file into the project tree or /tmp first.`);
      }
      let stat;
      try {
        stat = await fs7.promises.stat(absolutePath);
      } catch (e) {
        if (e.code === "ENOENT") {
          throw new Error(`load-html: file not found at ${absolutePath}. Check spelling or copy the file under ${process.cwd()} or ${TEMP_DIR}.`);
        }
        throw e;
      }
      if (stat.isDirectory()) {
        throw new Error(`load-html: ${absolutePath} is a directory, not a file. Pass a .html file.`);
      }
      if (!stat.isFile()) {
        throw new Error(`load-html: ${absolutePath} is not a regular file.`);
      }
      const MAX_BYTES = parseInt(process.env.SRIFLOW_BROWSE_MAX_HTML_BYTES || "", 10) || 50 * 1024 * 1024;
      if (stat.size > MAX_BYTES) {
        throw new Error(`load-html: file too large (${stat.size} bytes > ${MAX_BYTES} cap). Raise with SRIFLOW_BROWSE_MAX_HTML_BYTES=<N> or split the HTML.`);
      }
      const buf = await fs7.promises.readFile(absolutePath);
      let peek = buf.slice(0, 200);
      if (peek[0] === 239 && peek[1] === 187 && peek[2] === 191) {
        peek = peek.slice(3);
      }
      const peekStr = peek.toString("utf8").trimStart();
      const looksLikeMarkup = /^<[a-zA-Z!?]/.test(peekStr);
      if (!looksLikeMarkup) {
        const hexDump = Array.from(buf.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join(" ");
        throw new Error(`load-html: ${absolutePath} has ${ext} extension but content does not look like HTML. First bytes: ${hexDump}`);
      }
      const html = buf.toString("utf8");
      await session.setTabContent(html, { waitUntil });
      return `Loaded HTML: ${absolutePath} (${stat.size} bytes)`;
    }
    case "click": {
      const selector = args[0];
      if (!selector)
        throw new Error("Usage: browse click <selector>");
      const role = session.getRefRole(selector);
      if (role === "option") {
        const resolved2 = await session.resolveRef(selector);
        if ("locator" in resolved2) {
          const optionInfo = await resolved2.locator.evaluate((el) => {
            if (el.tagName !== "OPTION")
              return null;
            const option = el;
            const select = option.closest("select");
            if (!select)
              return null;
            return { value: option.value, text: option.text };
          });
          if (optionInfo) {
            await resolved2.locator.locator("xpath=ancestor::select").selectOption(optionInfo.value, { timeout: 5000 });
            return `Selected "${optionInfo.text}" (auto-routed from click on <option>) \u2192 now at ${page.url()}`;
          }
        }
      }
      const resolved = await session.resolveRef(selector);
      try {
        if ("locator" in resolved) {
          await resolved.locator.click({ timeout: 5000 });
        } else {
          await target.locator(resolved.selector).click({ timeout: 5000 });
        }
      } catch (err) {
        const isOption = "locator" in resolved ? await resolved.locator.evaluate((el) => el.tagName === "OPTION").catch(() => false) : await target.locator(resolved.selector).evaluate((el) => el.tagName === "OPTION").catch(() => false);
        if (isOption) {
          throw new Error(`Cannot click <option> elements. Use 'browse select <parent-select> <value>' instead of 'click' for dropdown options.`);
        }
        throw err;
      }
      await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
      return `Clicked ${selector} \u2192 now at ${page.url()}`;
    }
    case "fill": {
      const [selector, ...valueParts] = args;
      const value = valueParts.join(" ");
      if (!selector || !value)
        throw new Error("Usage: browse fill <selector> <value>");
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        await resolved.locator.fill(value, { timeout: 5000 });
      } else {
        await target.locator(resolved.selector).fill(value, { timeout: 5000 });
      }
      await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
      return `Filled ${selector}`;
    }
    case "select": {
      const [selector, ...valueParts] = args;
      const value = valueParts.join(" ");
      if (!selector || !value)
        throw new Error("Usage: browse select <selector> <value>");
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        await resolved.locator.selectOption(value, { timeout: 5000 });
      } else {
        await target.locator(resolved.selector).selectOption(value, { timeout: 5000 });
      }
      await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
      return `Selected "${value}" in ${selector}`;
    }
    case "hover": {
      const selector = args[0];
      if (!selector)
        throw new Error("Usage: browse hover <selector>");
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        await resolved.locator.hover({ timeout: 5000 });
      } else {
        await target.locator(resolved.selector).hover({ timeout: 5000 });
      }
      return `Hovered ${selector}`;
    }
    case "type": {
      const text = args.join(" ");
      if (!text)
        throw new Error("Usage: browse type <text>");
      await page.keyboard.type(text);
      return `Typed ${text.length} characters`;
    }
    case "press": {
      const key = args[0];
      if (!key)
        throw new Error("Usage: browse press <key> (e.g., Enter, Tab, Escape)");
      await page.keyboard.press(key);
      return `Pressed ${key}`;
    }
    case "scroll": {
      const timesIdx = args.indexOf("--times");
      const times = timesIdx >= 0 ? parseInt(args[timesIdx + 1], 10) || 1 : 0;
      const waitIdx = args.indexOf("--wait");
      const waitMs = waitIdx >= 0 ? parseInt(args[waitIdx + 1], 10) || 1000 : 1000;
      const selector = args.find((a) => !a.startsWith("--") && args.indexOf(a) !== timesIdx + 1 && args.indexOf(a) !== waitIdx + 1);
      if (times > 0) {
        for (let i = 0;i < times; i++) {
          if (selector) {
            const resolved = await bm.resolveRef(selector);
            if ("locator" in resolved) {
              await resolved.locator.scrollIntoViewIfNeeded({ timeout: 5000 });
            } else {
              await target.locator(resolved.selector).scrollIntoViewIfNeeded({ timeout: 5000 });
            }
          } else {
            await target.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          }
          if (i < times - 1)
            await new Promise((r) => setTimeout(r, waitMs));
        }
        return `Scrolled ${times} times${selector ? ` (${selector})` : ""} with ${waitMs}ms delay`;
      }
      if (selector) {
        const resolved = await session.resolveRef(selector);
        if ("locator" in resolved) {
          await resolved.locator.scrollIntoViewIfNeeded({ timeout: 5000 });
        } else {
          await target.locator(resolved.selector).scrollIntoViewIfNeeded({ timeout: 5000 });
        }
        return `Scrolled ${selector} into view`;
      }
      await target.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      return "Scrolled to bottom";
    }
    case "wait": {
      const selector = args[0];
      if (!selector)
        throw new Error("Usage: browse wait <selector|--networkidle|--load|--domcontentloaded>");
      if (selector === "--networkidle") {
        const MAX_WAIT_MS2 = 300000;
        const MIN_WAIT_MS2 = 1000;
        const timeout2 = Math.min(Math.max(args[1] ? parseInt(args[1], 10) || MIN_WAIT_MS2 : 15000, MIN_WAIT_MS2), MAX_WAIT_MS2);
        await page.waitForLoadState("networkidle", { timeout: timeout2 });
        return "Network idle";
      }
      if (selector === "--load") {
        await page.waitForLoadState("load");
        return "Page loaded";
      }
      if (selector === "--domcontentloaded") {
        await page.waitForLoadState("domcontentloaded");
        return "DOM content loaded";
      }
      const MAX_WAIT_MS = 300000;
      const MIN_WAIT_MS = 1000;
      const timeout = Math.min(Math.max(args[1] ? parseInt(args[1], 10) || MIN_WAIT_MS : 15000, MIN_WAIT_MS), MAX_WAIT_MS);
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        await resolved.locator.waitFor({ state: "visible", timeout });
      } else {
        await target.locator(resolved.selector).waitFor({ state: "visible", timeout });
      }
      return `Element ${selector} appeared`;
    }
    case "viewport": {
      let sizeArg;
      let scaleArg;
      for (let i = 0;i < args.length; i++) {
        if (args[i] === "--scale") {
          const val = args[++i];
          if (val === undefined || val === "") {
            throw new Error("viewport --scale: missing value. Usage: viewport [WxH] --scale <n>");
          }
          const parsed = Number(val);
          if (!Number.isFinite(parsed)) {
            throw new Error(`viewport --scale: value '${val}' is not a finite number.`);
          }
          scaleArg = parsed;
        } else if (args[i].startsWith("--")) {
          throw new Error(`Unknown viewport flag: ${args[i]}`);
        } else if (sizeArg === undefined) {
          sizeArg = args[i];
        } else {
          throw new Error(`Unexpected positional arg: ${args[i]}. Usage: viewport [WxH] [--scale <n>]`);
        }
      }
      if (sizeArg === undefined && scaleArg === undefined) {
        throw new Error("Usage: browse viewport [<WxH>] [--scale <n>]  (e.g. 375x812, or --scale 2 to keep current size)");
      }
      let w, h;
      if (sizeArg) {
        if (!sizeArg.includes("x"))
          throw new Error("Usage: browse viewport [<WxH>] [--scale <n>] (e.g., 375x812)");
        const [rawW, rawH] = sizeArg.split("x").map(Number);
        w = Math.min(Math.max(Math.round(rawW) || 1280, 1), 16384);
        h = Math.min(Math.max(Math.round(rawH) || 720, 1), 16384);
      } else {
        const current = bm.getCurrentViewport();
        w = current.width;
        h = current.height;
      }
      if (scaleArg !== undefined) {
        const err = await bm.setDeviceScaleFactor(scaleArg, w, h);
        if (err)
          return `Viewport partially set: ${err}`;
        return `Viewport set to ${w}x${h} @ ${scaleArg}x (context recreated; refs and load-html content replayed)`;
      }
      await bm.setViewport(w, h);
      return `Viewport set to ${w}x${h}`;
    }
    case "cookie": {
      const cookieStr = args[0];
      if (!cookieStr || !cookieStr.includes("="))
        throw new Error("Usage: browse cookie <name>=<value>");
      const eq = cookieStr.indexOf("=");
      const name = cookieStr.slice(0, eq);
      const value = cookieStr.slice(eq + 1);
      const url = new URL(page.url());
      await page.context().addCookies([{
        name,
        value,
        domain: url.hostname,
        path: "/"
      }]);
      return `Cookie set: ${name}=****`;
    }
    case "header": {
      const headerStr = args[0];
      if (!headerStr || !headerStr.includes(":"))
        throw new Error("Usage: browse header <name>:<value>");
      const sep2 = headerStr.indexOf(":");
      const name = headerStr.slice(0, sep2).trim();
      const value = headerStr.slice(sep2 + 1).trim();
      await bm.setExtraHeader(name, value);
      const sensitiveHeaders = ["authorization", "cookie", "set-cookie", "x-api-key", "x-auth-token"];
      const redactedValue = sensitiveHeaders.includes(name.toLowerCase()) ? "****" : value;
      return `Header set: ${name}: ${redactedValue}`;
    }
    case "useragent": {
      const ua = args.join(" ");
      if (!ua)
        throw new Error("Usage: browse useragent <string>");
      bm.setUserAgent(ua);
      const error = await bm.recreateContext();
      if (error) {
        return `User agent set to "${ua}" but: ${error}`;
      }
      return `User agent set: ${ua}`;
    }
    case "upload": {
      const [selector, ...filePaths] = args;
      if (!selector || filePaths.length === 0)
        throw new Error("Usage: browse upload <selector> <file1> [file2...]");
      for (const fp of filePaths) {
        if (!fs7.existsSync(fp))
          throw new Error(`File not found: ${fp}`);
        if (path6.isAbsolute(fp)) {
          let resolvedFp;
          try {
            resolvedFp = fs7.realpathSync(path6.resolve(fp));
          } catch (err) {
            if (err?.code !== "ENOENT")
              throw err;
            resolvedFp = path6.resolve(fp);
          }
          if (!SAFE_DIRECTORIES.some((dir) => isPathWithin(resolvedFp, dir))) {
            throw new Error(`Path must be within: ${SAFE_DIRECTORIES.join(", ")}`);
          }
        }
        if (path6.normalize(fp).includes("..")) {
          throw new Error("Path traversal sequences (..) are not allowed");
        }
      }
      const resolved = await session.resolveRef(selector);
      if ("locator" in resolved) {
        await resolved.locator.setInputFiles(filePaths);
      } else {
        await target.locator(resolved.selector).setInputFiles(filePaths);
      }
      const fileInfo = filePaths.map((fp) => {
        const stat = fs7.statSync(fp);
        return `${path6.basename(fp)} (${stat.size}B)`;
      }).join(", ");
      return `Uploaded: ${fileInfo}`;
    }
    case "dialog-accept": {
      const text = args.length > 0 ? args.join(" ") : null;
      bm.setDialogAutoAccept(true);
      bm.setDialogPromptText(text);
      return text ? `Dialogs will be accepted with text: "${text}"` : "Dialogs will be accepted";
    }
    case "dialog-dismiss": {
      bm.setDialogAutoAccept(false);
      bm.setDialogPromptText(null);
      return "Dialogs will be dismissed";
    }
    case "style": {
      if (args[0] === "--undo") {
        const idx = args[1] ? parseInt(args[1], 10) : undefined;
        await undoModification(page, idx);
        return idx !== undefined ? `Reverted modification #${idx}` : "Reverted last modification";
      }
      const [selector, property, ...valueParts] = args;
      const value = valueParts.join(" ");
      if (!selector || !property || !value) {
        throw new Error("Usage: browse style <sel> <prop> <value> | style --undo [N]");
      }
      if (!/^[a-zA-Z-]+$/.test(property)) {
        throw new Error(`Invalid CSS property name: ${property}. Only letters and hyphens allowed.`);
      }
      const DANGEROUS_CSS = /url\s*\(|expression\s*\(|@import|javascript:|data:/i;
      if (DANGEROUS_CSS.test(value)) {
        throw new Error("CSS value rejected: contains potentially dangerous pattern.");
      }
      const mod = await modifyStyle(page, selector, property, value);
      return `Style modified: ${selector} { ${property}: ${mod.oldValue || "(none)"} \u2192 ${value} } (${mod.method})`;
    }
    case "cleanup": {
      let doAds = false, doCookies = false, doSticky = false, doSocial = false;
      let doOverlays = false, doClutter = false;
      let doAll = false;
      if (args.length === 0) {
        doAll = true;
      }
      for (const arg of args) {
        switch (arg) {
          case "--ads":
            doAds = true;
            break;
          case "--cookies":
            doCookies = true;
            break;
          case "--sticky":
            doSticky = true;
            break;
          case "--social":
            doSocial = true;
            break;
          case "--overlays":
            doOverlays = true;
            break;
          case "--clutter":
            doClutter = true;
            break;
          case "--all":
            doAll = true;
            break;
          default:
            throw new Error(`Unknown cleanup flag: ${arg}. Use: --ads, --cookies, --sticky, --social, --overlays, --clutter, --all`);
        }
      }
      if (doAll) {
        doAds = doCookies = doSticky = doSocial = doOverlays = doClutter = true;
      }
      const removed = [];
      const selectors = [];
      if (doAds)
        selectors.push(...CLEANUP_SELECTORS.ads);
      if (doCookies)
        selectors.push(...CLEANUP_SELECTORS.cookies);
      if (doSocial)
        selectors.push(...CLEANUP_SELECTORS.social);
      if (doOverlays)
        selectors.push(...CLEANUP_SELECTORS.overlays);
      if (doClutter)
        selectors.push(...CLEANUP_SELECTORS.clutter);
      if (selectors.length > 0) {
        const count = await page.evaluate((sels) => {
          let removed2 = 0;
          for (const sel of sels) {
            try {
              const els = document.querySelectorAll(sel);
              els.forEach((el) => {
                el.style.setProperty("display", "none", "important");
                removed2++;
              });
            } catch (err) {
              if (!(err instanceof DOMException))
                throw err;
            }
          }
          return removed2;
        }, selectors);
        if (count > 0) {
          if (doAds)
            removed.push("ads");
          if (doCookies)
            removed.push("cookie banners");
          if (doSocial)
            removed.push("social widgets");
          if (doOverlays)
            removed.push("overlays/popups");
          if (doClutter)
            removed.push("clutter");
        }
      }
      if (doSticky) {
        const stickyCount = await page.evaluate(() => {
          let removed2 = 0;
          const stickyEls = [];
          const allElements = document.querySelectorAll("*");
          const viewportWidth = window.innerWidth;
          for (const el of allElements) {
            const style = getComputedStyle(el);
            if (style.position === "fixed" || style.position === "sticky") {
              const rect = el.getBoundingClientRect();
              stickyEls.push({ el, top: rect.top, width: rect.width, height: rect.height });
            }
          }
          stickyEls.sort((a, b) => a.top - b.top);
          let preservedTopNav = false;
          for (const { el, top, width, height } of stickyEls) {
            const tag = el.tagName.toLowerCase();
            if (tag === "nav" || tag === "header")
              continue;
            if (el.getAttribute("role") === "navigation")
              continue;
            if (el.id === "sriflow-ctrl")
              continue;
            if (!preservedTopNav && top <= 50 && width > viewportWidth * 0.8 && height < 120) {
              preservedTopNav = true;
              continue;
            }
            el.style.setProperty("display", "none", "important");
            removed2++;
          }
          return removed2;
        });
        if (stickyCount > 0)
          removed.push(`${stickyCount} sticky/fixed elements`);
      }
      const scrollFixed = await page.evaluate(() => {
        let fixed = 0;
        for (const el of [document.body, document.documentElement]) {
          if (!el)
            continue;
          const style = getComputedStyle(el);
          if (style.overflow === "hidden" || style.overflowY === "hidden") {
            el.style.setProperty("overflow", "auto", "important");
            el.style.setProperty("overflow-y", "auto", "important");
            fixed++;
          }
          if (style.position === "fixed" && (el === document.body || el === document.documentElement)) {
            el.style.setProperty("position", "static", "important");
            fixed++;
          }
        }
        const blurred = document.querySelectorAll('[style*="blur"], [style*="filter"]');
        blurred.forEach((el) => {
          const s = el.style;
          if (s.filter?.includes("blur") || s.webkitFilter?.includes("blur")) {
            s.setProperty("filter", "none", "important");
            s.setProperty("-webkit-filter", "none", "important");
            fixed++;
          }
        });
        const truncated = document.querySelectorAll('[class*="truncat"], [class*="preview"], [class*="teaser"]');
        truncated.forEach((el) => {
          const s = getComputedStyle(el);
          if (s.maxHeight && s.maxHeight !== "none" && parseInt(s.maxHeight) < 500) {
            el.style.setProperty("max-height", "none", "important");
            el.style.setProperty("overflow", "visible", "important");
            fixed++;
          }
        });
        return fixed;
      });
      if (scrollFixed > 0)
        removed.push("scroll unlocked");
      const adLabelCount = await page.evaluate(() => {
        let removed2 = 0;
        const adTextPatterns = [
          /^advertisement$/i,
          /^sponsored$/i,
          /^promoted$/i,
          /article continues/i,
          /continues below/i,
          /^ad$/i,
          /^paid content$/i,
          /^partner content$/i
        ];
        const candidates = document.querySelectorAll("div, span, p, figcaption, label");
        for (const el of candidates) {
          const text = (el.textContent || "").trim();
          if (text.length > 50)
            continue;
          if (adTextPatterns.some((p) => p.test(text))) {
            const parent = el.parentElement;
            if (parent && (parent.textContent || "").trim().length < 80) {
              parent.style.setProperty("display", "none", "important");
            } else {
              el.style.setProperty("display", "none", "important");
            }
            removed2++;
          }
        }
        return removed2;
      });
      if (adLabelCount > 0)
        removed.push(`${adLabelCount} ad labels`);
      const collapsedCount = await page.evaluate(() => {
        let collapsed = 0;
        const candidates = document.querySelectorAll('div[class*="ad"], div[id*="ad"], aside[class*="ad"], div[class*="sidebar"], ' + 'div[class*="rail"], div[class*="right-col"], div[class*="widget"]');
        for (const el of candidates) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 50 && rect.width > 0) {
            const text = (el.textContent || "").trim();
            const images = el.querySelectorAll('img:not([src*="logo"]):not([src*="icon"])');
            const links = el.querySelectorAll("a");
            if (text.length < 20 && images.length === 0 && links.length < 2) {
              el.style.setProperty("display", "none", "important");
              collapsed++;
            }
          }
        }
        return collapsed;
      });
      if (collapsedCount > 0)
        removed.push(`${collapsedCount} empty placeholders`);
      if (removed.length === 0)
        return "No clutter elements found to remove.";
      return `Cleaned up: ${removed.join(", ")}`;
    }
    case "prettyscreenshot": {
      let scrollTo;
      let doCleanup = false;
      const hideSelectors = [];
      let viewportWidth;
      let outputPath;
      for (let i = 0;i < args.length; i++) {
        if (args[i] === "--scroll-to" && i + 1 < args.length) {
          scrollTo = args[++i];
        } else if (args[i] === "--cleanup") {
          doCleanup = true;
        } else if (args[i] === "--hide" && i + 1 < args.length) {
          i++;
          while (i < args.length && !args[i].startsWith("--")) {
            hideSelectors.push(args[i]);
            i++;
          }
          i--;
        } else if (args[i] === "--width" && i + 1 < args.length) {
          viewportWidth = parseInt(args[++i], 10);
          if (isNaN(viewportWidth))
            throw new Error("--width must be a number");
        } else if (!args[i].startsWith("--")) {
          outputPath = args[i];
        } else {
          throw new Error(`Unknown prettyscreenshot flag: ${args[i]}`);
        }
      }
      if (!outputPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        outputPath = `${TEMP_DIR}/browse-pretty-${timestamp}.png`;
      }
      validateOutputPath(outputPath);
      const originalViewport = page.viewportSize();
      if (viewportWidth && originalViewport) {
        await page.setViewportSize({ width: viewportWidth, height: originalViewport.height });
      }
      if (doCleanup) {
        const allSelectors = [
          ...CLEANUP_SELECTORS.ads,
          ...CLEANUP_SELECTORS.cookies,
          ...CLEANUP_SELECTORS.social
        ];
        await page.evaluate((sels) => {
          for (const sel of sels) {
            try {
              document.querySelectorAll(sel).forEach((el) => {
                el.style.display = "none";
              });
            } catch (err) {
              if (!(err instanceof DOMException))
                throw err;
            }
          }
          for (const el of document.querySelectorAll("*")) {
            const style = getComputedStyle(el);
            if (style.position === "fixed" || style.position === "sticky") {
              const tag = el.tagName.toLowerCase();
              if (tag === "nav" || tag === "header")
                continue;
              if (el.getAttribute("role") === "navigation")
                continue;
              el.style.display = "none";
            }
          }
        }, allSelectors);
      }
      if (hideSelectors.length > 0) {
        await page.evaluate((sels) => {
          for (const sel of sels) {
            try {
              document.querySelectorAll(sel).forEach((el) => {
                el.style.display = "none";
              });
            } catch (err) {
              if (!(err instanceof DOMException))
                throw err;
            }
          }
        }, hideSelectors);
      }
      if (scrollTo) {
        const scrolled = await page.evaluate((target2) => {
          let el = document.querySelector(target2);
          if (el) {
            el.scrollIntoView({ behavior: "instant", block: "center" });
            return true;
          }
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent?.includes(target2)) {
              const parent = node.parentElement;
              if (parent) {
                parent.scrollIntoView({ behavior: "instant", block: "center" });
                return true;
              }
            }
          }
          return false;
        }, scrollTo);
        if (!scrolled) {
          if (viewportWidth && originalViewport) {
            await page.setViewportSize(originalViewport);
          }
          throw new Error(`Could not find element or text to scroll to: ${scrollTo}`);
        }
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: outputPath, fullPage: !scrollTo });
      if (!scrollTo)
        await guardScreenshotPath(outputPath);
      if (viewportWidth && originalViewport) {
        await page.setViewportSize(originalViewport);
      }
      const parts = ["Screenshot saved"];
      if (doCleanup)
        parts.push("(cleaned)");
      if (scrollTo)
        parts.push(`(scrolled to: ${scrollTo})`);
      parts.push(`: ${outputPath}`);
      return parts.join(" ");
    }
    case "download": {
      if (args.length === 0)
        throw new Error("Usage: download <url|@ref> [path] [--base64] [--navigate]");
      const isBase64 = args.includes("--base64");
      const useNavigate = args.includes("--navigate");
      const filteredArgs = args.filter((a) => a !== "--base64" && a !== "--navigate");
      let url = filteredArgs[0];
      const outputPath = filteredArgs[1];
      if (url.startsWith("@")) {
        const resolved = await bm.resolveRef(url);
        if (!("locator" in resolved))
          throw new Error(`Expected @ref, got CSS selector: ${url}`);
        const locator = resolved.locator;
        const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());
        if (tagName === "img") {
          url = await locator.evaluate((el) => {
            const img = el;
            return img.currentSrc || img.src || img.getAttribute("data-src") || "";
          });
        } else if (tagName === "video") {
          url = await locator.evaluate((el) => el.currentSrc || el.src || "");
        } else if (tagName === "audio") {
          url = await locator.evaluate((el) => el.currentSrc || el.src || "");
        } else {
          url = await locator.evaluate((el) => el.getAttribute("src") || "");
        }
        if (!url)
          throw new Error(`Could not extract URL from ${filteredArgs[0]} (${tagName})`);
      }
      if (url.includes(".m3u8") || url.includes(".mpd")) {
        throw new Error("This is an HLS/DASH stream. Use yt-dlp or ffmpeg for adaptive stream downloads.");
      }
      const page2 = bm.getPage();
      let contentType = "application/octet-stream";
      let buffer;
      if (url.startsWith("blob:")) {
        const dataUrl = await page2.evaluate(async (blobUrl) => {
          try {
            const resp = await fetch(blobUrl);
            const blob = await resp.blob();
            if (blob.size > 100 * 1024 * 1024)
              return "ERROR:TOO_LARGE";
            return new Promise((resolve6, reject) => {
              const reader = new FileReader;
              reader.onloadend = () => resolve6(reader.result);
              reader.onerror = () => reject("Failed to read blob");
              reader.readAsDataURL(blob);
            });
          } catch (err) {
            return `ERROR:EXPIRED:${err?.message || "unknown"}`;
          }
        }, url);
        if (dataUrl === "ERROR:TOO_LARGE")
          throw new Error("Blob too large (>100MB). Use a different approach.");
        if (dataUrl.startsWith("ERROR:EXPIRED"))
          throw new Error(`Blob URL expired or inaccessible: ${dataUrl.slice("ERROR:EXPIRED:".length)}`);
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match)
          throw new Error("Failed to decode blob data");
        contentType = match[1];
        buffer = Buffer.from(match[2], "base64");
      } else if (useNavigate) {
        await validateNavigationUrl(url);
        const downloadPromise = page2.waitForEvent("download", { timeout: 60000 });
        page2.goto(url, { waitUntil: "commit", timeout: 30000 }).catch(() => {});
        const download = await downloadPromise;
        const failure = await download.failure();
        if (failure) {
          throw new Error(`Download failed: ${failure}`);
        }
        const tempPath = path6.join(TEMP_DIR, `browse-nav-download-${Date.now()}`);
        await download.saveAs(tempPath);
        buffer = fs7.readFileSync(tempPath);
        const suggested = download.suggestedFilename();
        if (suggested) {
          const extMatch = suggested.match(/\.([a-z0-9]+)$/i);
          if (extMatch) {
            const extLower = extMatch[1].toLowerCase();
            const mimeMap = {
              epub: "application/epub+zip",
              pdf: "application/pdf",
              zip: "application/zip",
              gz: "application/gzip",
              mp3: "audio/mpeg",
              mp4: "video/mp4",
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              png: "image/png",
              txt: "text/plain",
              html: "text/html",
              json: "application/json"
            };
            contentType = mimeMap[extLower] || "application/octet-stream";
          }
        }
        if (outputPath || isBase64) {
          try {
            fs7.unlinkSync(tempPath);
          } catch {}
        } else {
          const ext2 = contentType.split(";")[0].includes("/") ? mimeToExt(contentType.split(";")[0].trim()) : ".bin";
          const finalPath = path6.join(TEMP_DIR, `browse-download-${Date.now()}${ext2}`);
          fs7.renameSync(tempPath, finalPath);
          const sizeKB2 = Math.round(buffer.length / 1024);
          return `Downloaded: ${finalPath} (${sizeKB2}KB, ${contentType.split(";")[0].trim()})${suggested ? ` [${suggested}]` : ""}`;
        }
        if (buffer.length > 200 * 1024 * 1024) {
          throw new Error("File too large (>200MB).");
        }
      } else {
        await validateNavigationUrl(url);
        const response = await page2.request.fetch(url, { timeout: 30000 });
        const status = response.status();
        if (status >= 400) {
          throw new Error(`Download failed: HTTP ${status} ${response.statusText()}`);
        }
        contentType = response.headers()["content-type"] || "application/octet-stream";
        buffer = Buffer.from(await response.body());
        if (buffer.length > 200 * 1024 * 1024) {
          throw new Error("File too large (>200MB).");
        }
      }
      if (isBase64) {
        if (buffer.length > 10 * 1024 * 1024) {
          throw new Error("File too large for --base64 (>10MB). Use disk download + GET /file instead.");
        }
        const mimeType = contentType.split(";")[0].trim();
        return `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
      const ext = contentType.split(";")[0].includes("/") ? mimeToExt(contentType.split(";")[0].trim()) : ".bin";
      const destPath = outputPath || path6.join(TEMP_DIR, `browse-download-${Date.now()}${ext}`);
      validateOutputPath(destPath);
      fs7.writeFileSync(destPath, buffer);
      const sizeKB = Math.round(buffer.length / 1024);
      return `Downloaded: ${destPath} (${sizeKB}KB, ${contentType.split(";")[0].trim()})`;
    }
    case "scrape": {
      if (args.length === 0)
        throw new Error("Usage: scrape <images|videos|media> [--selector sel] [--dir path] [--limit N]");
      const mediaType = args[0];
      if (!["images", "videos", "media"].includes(mediaType)) {
        throw new Error(`Invalid type: ${mediaType}. Use: images, videos, or media`);
      }
      const selectorIdx = args.indexOf("--selector");
      const selector = selectorIdx >= 0 ? args[selectorIdx + 1] : undefined;
      const dirIdx = args.indexOf("--dir");
      const dir = dirIdx >= 0 ? args[dirIdx + 1] : path6.join(TEMP_DIR, `browse-scrape-${Date.now()}`);
      const limitIdx = args.indexOf("--limit");
      const limit = Math.min(limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) || 50 : 50, 200);
      validateOutputPath(dir);
      fs7.mkdirSync(dir, { recursive: true });
      const { extractMedia: extractMedia2 } = await Promise.resolve().then(() => exports_media_extract);
      const target2 = bm.getActiveFrameOrPage();
      const filter = mediaType === "images" ? "images" : mediaType === "videos" ? "videos" : undefined;
      const mediaResult = await extractMedia2(target2, { selector, filter });
      const urls = [];
      const seen = new Set;
      for (const img of mediaResult.images) {
        const url = img.currentSrc || img.src || img.dataSrc;
        if (url && !seen.has(url) && !url.startsWith("data:")) {
          seen.add(url);
          urls.push({ url, type: "image" });
        }
      }
      for (const vid of mediaResult.videos) {
        const url = vid.currentSrc || vid.src;
        if (url && !seen.has(url) && !url.startsWith("blob:") && !vid.isHLS && !vid.isDASH) {
          seen.add(url);
          urls.push({ url, type: "video" });
        }
      }
      for (const bg of mediaResult.backgroundImages) {
        if (bg.url && !seen.has(bg.url)) {
          seen.add(bg.url);
          urls.push({ url: bg.url, type: "image" });
        }
      }
      const toDownload = urls.slice(0, limit);
      const page2 = bm.getPage();
      const manifest = {
        url: page2.url(),
        scraped_at: new Date().toISOString(),
        files: [],
        total_size: 0,
        succeeded: 0,
        failed: 0
      };
      const lines = [];
      for (let i = 0;i < toDownload.length; i++) {
        const { url, type } = toDownload[i];
        try {
          await validateNavigationUrl(url);
          const response = await page2.request.fetch(url, { timeout: 30000 });
          if (response.status() >= 400)
            throw new Error(`HTTP ${response.status()}`);
          const ct = response.headers()["content-type"] || "application/octet-stream";
          const ext = mimeToExt(ct.split(";")[0].trim());
          const filename = `${type}-${String(i + 1).padStart(3, "0")}${ext}`;
          const filePath = path6.join(dir, filename);
          const body = Buffer.from(await response.body());
          try {
            fs7.writeFileSync(filePath, body);
          } catch (writeErr) {
            throw new Error(`Disk write failed: ${writeErr.message}`);
          }
          manifest.files.push({ path: filename, src: url, size: body.length, type: ct.split(";")[0].trim() });
          manifest.total_size += body.length;
          manifest.succeeded++;
          lines.push(`  [${i + 1}/${toDownload.length}] ${filename} (${Math.round(body.length / 1024)}KB)`);
        } catch (err) {
          manifest.files.push({ path: null, src: url, size: 0, type: "", error: err.message });
          manifest.failed++;
          lines.push(`  [${i + 1}/${toDownload.length}] FAILED: ${err.message}`);
        }
        if (i < toDownload.length - 1)
          await new Promise((r) => setTimeout(r, 100));
      }
      fs7.writeFileSync(path6.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
      return `Scraped ${toDownload.length} items to ${dir}/
${lines.join(`
`)}

Summary: ${manifest.succeeded} succeeded, ${manifest.failed} failed, ${Math.round(manifest.total_size / 1024)}KB total`;
    }
    case "archive": {
      const page2 = bm.getPage();
      const outputPath = args[0] || path6.join(TEMP_DIR, `browse-archive-${Date.now()}.mhtml`);
      validateOutputPath(outputPath);
      try {
        const data = await withCdpSession(page2, async (cdp) => {
          const result = await cdp.send("Page.captureSnapshot", { format: "mhtml" });
          return result.data;
        });
        fs7.writeFileSync(outputPath, data);
        return `Archive saved: ${outputPath} (${Math.round(data.length / 1024)}KB, MHTML)`;
      } catch (err) {
        throw new Error(`MHTML archive requires Chromium CDP. Use 'text' or 'html' for raw page content. (${err.message})`);
      }
    }
    default:
      throw new Error(`Unknown write command: ${command}`);
  }
}
function mimeToExt(mime) {
  const map = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg",
    "application/pdf": ".pdf",
    "application/json": ".json",
    "text/html": ".html",
    "text/plain": ".txt"
  };
  return map[mime] || ".bin";
}
var CLEANUP_SELECTORS;
var init_write_commands = __esm(() => {
  init_url_validation();
  init_path_security();
  init_screenshot_size_guard();
  init_platform();
  init_path_security();
  init_cdp_inspector();
  init_cdp_bridge();
  CLEANUP_SELECTORS = {
    ads: [
      "ins.adsbygoogle",
      '[id^="google_ads"]',
      '[id^="div-gpt-ad"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      "[data-google-query-id]",
      ".google-auto-placed",
      '[class*="ad-banner"]',
      '[class*="ad-wrapper"]',
      '[class*="ad-container"]',
      '[class*="ad-slot"]',
      '[class*="ad-unit"]',
      '[class*="ad-zone"]',
      '[class*="ad-placement"]',
      '[class*="ad-holder"]',
      '[class*="ad-block"]',
      '[class*="adbox"]',
      '[class*="adunit"]',
      '[class*="adwrap"]',
      '[id*="ad-banner"]',
      '[id*="ad-wrapper"]',
      '[id*="ad-container"]',
      '[id*="ad-slot"]',
      '[id*="ad_banner"]',
      '[id*="ad_container"]',
      "[data-ad]",
      "[data-ad-slot]",
      "[data-ad-unit]",
      "[data-adunit]",
      '[class*="sponsored"]',
      '[class*="Sponsored"]',
      ".ad",
      ".ads",
      ".advert",
      ".advertisement",
      "#ad",
      "#ads",
      "#advert",
      "#advertisement",
      'iframe[src*="amazon-adsystem"]',
      'iframe[src*="outbrain"]',
      'iframe[src*="taboola"]',
      'iframe[src*="criteo"]',
      'iframe[src*="adsafeprotected"]',
      'iframe[src*="moatads"]',
      '[class*="promoted"]',
      '[class*="Promoted"]',
      '[data-testid*="promo"]',
      '[class*="native-ad"]',
      'aside[class*="ad"]',
      'section[class*="ad-"]'
    ],
    cookies: [
      '[class*="cookie-consent"]',
      '[class*="cookie-banner"]',
      '[class*="cookie-notice"]',
      '[id*="cookie-consent"]',
      '[id*="cookie-banner"]',
      '[id*="cookie-notice"]',
      '[class*="consent-banner"]',
      '[class*="consent-modal"]',
      '[class*="consent-wall"]',
      '[class*="gdpr"]',
      '[id*="gdpr"]',
      '[class*="GDPR"]',
      '[class*="CookieConsent"]',
      '[id*="CookieConsent"]',
      "#onetrust-consent-sdk",
      ".onetrust-pc-dark-filter",
      "#onetrust-banner-sdk",
      "#CybotCookiebotDialog",
      "#CybotCookiebotDialogBodyUnderlay",
      "#truste-consent-track",
      ".truste_overlay",
      ".truste_box_overlay",
      ".qc-cmp2-container",
      "#qc-cmp2-main",
      '[class*="cc-banner"]',
      '[class*="cc-window"]',
      '[class*="cc-overlay"]',
      '[class*="privacy-banner"]',
      '[class*="privacy-notice"]',
      '[id*="privacy-banner"]',
      '[id*="privacy-notice"]',
      '[class*="accept-cookies"]',
      '[id*="accept-cookies"]'
    ],
    overlays: [
      '[class*="paywall"]',
      '[class*="Paywall"]',
      '[id*="paywall"]',
      '[class*="subscribe-wall"]',
      '[class*="subscription-wall"]',
      '[class*="meter-wall"]',
      '[class*="regwall"]',
      '[class*="reg-wall"]',
      '[class*="newsletter-popup"]',
      '[class*="newsletter-modal"]',
      '[class*="signup-modal"]',
      '[class*="signup-popup"]',
      '[class*="email-capture"]',
      '[class*="lead-capture"]',
      '[class*="popup-modal"]',
      '[class*="modal-overlay"]',
      '[class*="interstitial"]',
      '[id*="interstitial"]',
      '[class*="push-notification"]',
      '[class*="notification-prompt"]',
      '[class*="web-push"]',
      '[class*="survey-"]',
      '[class*="feedback-modal"]',
      '[id*="survey-"]',
      '[class*="nps-"]',
      '[class*="app-banner"]',
      '[class*="smart-banner"]',
      '[class*="app-download"]',
      '[id*="branch-banner"]',
      ".smartbanner",
      '[class*="promo-banner"]',
      '[class*="cross-promo"]',
      '[class*="partner-promo"]',
      '[class*="preferred-source"]',
      '[class*="google-promo"]'
    ],
    clutter: [
      '[class*="audio-player"]',
      '[class*="podcast-player"]',
      '[class*="listen-widget"]',
      '[class*="everlit"]',
      '[class*="Everlit"]',
      "audio",
      '[class*="puzzle"]',
      '[class*="daily-game"]',
      '[class*="games-widget"]',
      '[class*="crossword-promo"]',
      '[class*="mini-game"]',
      'aside [class*="most-popular"]',
      'aside [class*="trending"]',
      'aside [class*="most-read"]',
      'aside [class*="recommended"]',
      '[class*="related-articles"]',
      '[class*="more-stories"]',
      '[class*="recirculation"]',
      '[class*="taboola"]',
      '[class*="outbrain"]',
      '[class*="nativo"]',
      "[data-tb-region]"
    ],
    sticky: [],
    social: [
      '[class*="social-share"]',
      '[class*="share-buttons"]',
      '[class*="share-bar"]',
      '[class*="social-widget"]',
      '[class*="social-icons"]',
      '[class*="share-tools"]',
      'iframe[src*="facebook.com/plugins"]',
      'iframe[src*="platform.twitter"]',
      '[class*="fb-like"]',
      '[class*="tweet-button"]',
      '[class*="addthis"]',
      '[class*="sharethis"]',
      '[class*="follow-us"]',
      '[class*="social-follow"]'
    ]
  };
});

// browse/src/content-security.ts
import { randomBytes } from "crypto";
function ensureMarker() {
  if (!sessionMarker) {
    sessionMarker = randomBytes(3).toString("base64").slice(0, 4);
  }
  return sessionMarker;
}
function datamarkContent(content) {
  const marker = ensureMarker();
  const zwsp = "\u200B";
  const taggedMarker = marker.split("").map((c) => zwsp + c).join("");
  let count = 0;
  return content.replace(/(\. )/g, (match) => {
    count++;
    if (count % 3 === 0) {
      return match + taggedMarker;
    }
    return match;
  });
}
async function markHiddenElements(page) {
  return page.evaluate((ariaPatterns) => {
    const found = [];
    const elements = document.querySelectorAll("body *");
    for (const el of elements) {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim() || "";
        if (!text)
          continue;
        let isHidden = false;
        let reason = "";
        if (parseFloat(style.opacity) < 0.1) {
          isHidden = true;
          reason = "opacity < 0.1";
        } else if (parseFloat(style.fontSize) < 1) {
          isHidden = true;
          reason = "font-size < 1px";
        } else if (style.position === "absolute" || style.position === "fixed") {
          const rect = el.getBoundingClientRect();
          if (rect.right < -100 || rect.bottom < -100 || rect.left > window.innerWidth + 100 || rect.top > window.innerHeight + 100) {
            isHidden = true;
            reason = "off-screen";
          }
        } else if (style.color === style.backgroundColor && text.length > 10) {
          isHidden = true;
          reason = "same fg/bg color";
        } else if (style.clipPath === "inset(100%)" || style.clip === "rect(0px, 0px, 0px, 0px)") {
          isHidden = true;
          reason = "clip hiding";
        } else if (style.visibility === "hidden") {
          isHidden = true;
          reason = "visibility hidden";
        }
        if (isHidden) {
          el.setAttribute("data-sriflow-hidden", "true");
          found.push(`[${el.tagName.toLowerCase()}] ${reason}: "${text.slice(0, 60)}..."`);
        }
        const ariaLabel = el.getAttribute("aria-label") || "";
        const ariaLabelledBy = el.getAttribute("aria-labelledby");
        let labelText = ariaLabel;
        if (ariaLabelledBy) {
          const labelEl = document.getElementById(ariaLabelledBy);
          if (labelEl)
            labelText += " " + (labelEl.textContent || "");
        }
        if (labelText) {
          for (const pattern of ariaPatterns) {
            if (new RegExp(pattern, "i").test(labelText)) {
              el.setAttribute("data-sriflow-hidden", "true");
              found.push(`[${el.tagName.toLowerCase()}] ARIA injection: "${labelText.slice(0, 60)}..."`);
              break;
            }
          }
        }
      }
    }
    return found;
  }, ARIA_INJECTION_PATTERNS.map((p) => p.source));
}
async function getCleanTextWithStripping(page) {
  const raw = await page.evaluate(() => {
    const body = document.body;
    if (!body)
      return "";
    const clone = body.cloneNode(true);
    clone.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove());
    clone.querySelectorAll("[data-sriflow-hidden]").forEach((el) => el.remove());
    return clone.innerText.split(`
`).map((line) => line.trim()).filter((line) => line.length > 0).join(`
`);
  });
  return stripLoneSurrogates(raw);
}
async function cleanupHiddenMarkers(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-sriflow-hidden]").forEach((el) => {
      el.removeAttribute("data-sriflow-hidden");
    });
  });
}
function escapeEnvelopeSentinels(content) {
  const zwsp = "\u200B";
  return content.replace(/\u2550\u2550\u2550 BEGIN UNTRUSTED WEB CONTENT \u2550\u2550\u2550/g, `\u2550\u2550\u2550 BEGIN UNTRUSTED WEB C${zwsp}ONTENT \u2550\u2550\u2550`).replace(/\u2550\u2550\u2550 END UNTRUSTED WEB CONTENT \u2550\u2550\u2550/g, `\u2550\u2550\u2550 END UNTRUSTED WEB C${zwsp}ONTENT \u2550\u2550\u2550`);
}
function wrapUntrustedPageContent(content, command, filterWarnings) {
  const safeContent = escapeEnvelopeSentinels(content);
  const parts = [];
  if (filterWarnings && filterWarnings.length > 0) {
    parts.push(`\u26A0 CONTENT WARNINGS: ${filterWarnings.join("; ")}`);
  }
  parts.push(ENVELOPE_BEGIN);
  parts.push(safeContent);
  parts.push(ENVELOPE_END);
  return parts.join(`
`);
}
function registerContentFilter(filter) {
  registeredFilters.push(filter);
}
function getFilterMode() {
  const mode = process.env.BROWSE_CONTENT_FILTER?.toLowerCase();
  if (mode === "off" || mode === "block")
    return mode;
  return "warn";
}
function runContentFilters(content, url, command) {
  const mode = getFilterMode();
  if (mode === "off") {
    return { safe: true, warnings: [] };
  }
  const allWarnings = [];
  let blocked = false;
  for (const filter of registeredFilters) {
    const result = filter(content, url, command);
    if (!result.safe) {
      allWarnings.push(...result.warnings);
      if (mode === "block") {
        blocked = true;
      }
    }
  }
  if (blocked && allWarnings.length > 0) {
    return {
      safe: false,
      warnings: allWarnings,
      blocked: true,
      message: `Content blocked: ${allWarnings.join("; ")}`
    };
  }
  return {
    safe: allWarnings.length === 0,
    warnings: allWarnings
  };
}
function urlBlocklistFilter(content, url, _command) {
  const warnings = [];
  for (const domain of BLOCKLIST_DOMAINS) {
    if (url.includes(domain)) {
      warnings.push(`Page URL matches blocklisted domain: ${domain}`);
    }
  }
  const urlPattern = /https?:\/\/[^\s"'<>]+/g;
  const contentUrls = content.match(urlPattern) || [];
  for (const contentUrl of contentUrls) {
    for (const domain of BLOCKLIST_DOMAINS) {
      if (contentUrl.includes(domain)) {
        warnings.push(`Content contains blocklisted URL: ${contentUrl.slice(0, 100)}`);
        break;
      }
    }
  }
  return { safe: warnings.length === 0, warnings };
}
var sessionMarker = null, ARIA_INJECTION_PATTERNS, ENVELOPE_BEGIN = "\u2550\u2550\u2550 BEGIN UNTRUSTED WEB CONTENT \u2550\u2550\u2550", ENVELOPE_END = "\u2550\u2550\u2550 END UNTRUSTED WEB CONTENT \u2550\u2550\u2550", registeredFilters, BLOCKLIST_DOMAINS;
var init_content_security = __esm(() => {
  init_sanitize();
  ARIA_INJECTION_PATTERNS = [
    /ignore\s+(previous|above|all)\s+instructions?/i,
    /you\s+are\s+(now|a)\s+/i,
    /system\s*:\s*/i,
    /\bdo\s+not\s+(follow|obey|listen)/i,
    /\bexecute\s+(the\s+)?following/i,
    /\bforget\s+(everything|all|your)/i,
    /\bnew\s+instructions?\s*:/i
  ];
  registeredFilters = [];
  BLOCKLIST_DOMAINS = [
    "requestbin.com",
    "pipedream.com",
    "webhook.site",
    "hookbin.com",
    "requestcatcher.com",
    "burpcollaborator.net",
    "interact.sh",
    "canarytokens.com",
    "ngrok.io",
    "ngrok-free.app"
  ];
  registerContentFilter(urlBlocklistFilter);
});

// browse/src/snapshot.ts
import * as Diff from "diff";
function parseSnapshotArgs(args) {
  const opts = {};
  for (let i = 0;i < args.length; i++) {
    const flag = SNAPSHOT_FLAGS.find((f) => f.short === args[i] || f.long === args[i]);
    if (!flag)
      throw new Error(`Unknown snapshot flag: ${args[i]}`);
    if (flag.takesValue) {
      const value = args[++i];
      if (!value)
        throw new Error(`Usage: snapshot ${flag.short} <value>`);
      if (flag.optionKey === "depth") {
        opts[flag.optionKey] = parseInt(value, 10);
        if (isNaN(opts.depth))
          throw new Error("Usage: snapshot -d <number>");
      } else {
        opts[flag.optionKey] = value;
      }
    } else {
      opts[flag.optionKey] = true;
    }
  }
  return opts;
}
function parseLine(line) {
  const match = line.match(/^(\s*)-\s+(\w+)(?:\s+"([^"]*)")?(?:\s+(\[.*?\]))?\s*(?::\s*(.*))?$/);
  if (!match) {
    return null;
  }
  return {
    indent: match[1].length,
    role: match[2],
    name: match[3] ?? null,
    props: match[4] || "",
    children: match[5]?.trim() || "",
    rawLine: line
  };
}
async function handleSnapshot(args, session, securityOpts) {
  const opts = parseSnapshotArgs(args);
  const page = session.getPage();
  const target = session.getActiveFrameOrPage();
  const inFrame = session.getFrame() !== null;
  let rootLocator;
  if (opts.selector) {
    rootLocator = target.locator(opts.selector);
    const count = await rootLocator.count();
    if (count === 0)
      throw new Error(`Selector not found: ${opts.selector}`);
  } else {
    rootLocator = target.locator("body");
  }
  const ariaText = await rootLocator.ariaSnapshot();
  if (!ariaText || ariaText.trim().length === 0) {
    session.setRefMap(new Map);
    return "(no accessible elements found)";
  }
  const lines = ariaText.split(`
`);
  const refMap = new Map;
  const output = [];
  let refCounter = 1;
  const roleNameCounts = new Map;
  const roleNameSeen = new Map;
  for (const line of lines) {
    const node = parseLine(line);
    if (!node)
      continue;
    const key = `${node.role}:${node.name || ""}`;
    roleNameCounts.set(key, (roleNameCounts.get(key) || 0) + 1);
  }
  for (const line of lines) {
    const node = parseLine(line);
    if (!node)
      continue;
    const depth = Math.floor(node.indent / 2);
    const isInteractive = INTERACTIVE_ROLES.has(node.role);
    if (opts.depth !== undefined && depth > opts.depth)
      continue;
    if (opts.interactive && !isInteractive) {
      const key2 = `${node.role}:${node.name || ""}`;
      roleNameSeen.set(key2, (roleNameSeen.get(key2) || 0) + 1);
      continue;
    }
    if (opts.compact && !isInteractive && !node.name && !node.children)
      continue;
    const ref = `e${refCounter++}`;
    const indent = "  ".repeat(depth);
    const key = `${node.role}:${node.name || ""}`;
    const seenIndex = roleNameSeen.get(key) || 0;
    roleNameSeen.set(key, seenIndex + 1);
    const totalCount = roleNameCounts.get(key) || 1;
    let locator;
    if (opts.selector) {
      locator = target.locator(opts.selector).getByRole(node.role, {
        name: node.name || undefined
      });
    } else {
      locator = target.getByRole(node.role, {
        name: node.name || undefined
      });
    }
    if (totalCount > 1) {
      locator = locator.nth(seenIndex);
    }
    refMap.set(ref, { locator, role: node.role, name: node.name || "" });
    let outputLine = `${indent}@${ref} [${node.role}]`;
    if (node.name)
      outputLine += ` "${node.name}"`;
    if (node.props)
      outputLine += ` ${node.props}`;
    if (node.children)
      outputLine += `: ${node.children}`;
    output.push(outputLine);
  }
  if (opts.interactive && !opts.cursorInteractive) {
    opts.cursorInteractive = true;
  }
  if (opts.cursorInteractive) {
    try {
      const cursorElements = await target.evaluate(() => {
        const STANDARD_INTERACTIVE = new Set([
          "A",
          "BUTTON",
          "INPUT",
          "SELECT",
          "TEXTAREA",
          "SUMMARY",
          "DETAILS"
        ]);
        const results = [];
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
          if (STANDARD_INTERACTIVE.has(el.tagName))
            continue;
          if (!el.offsetParent && el.tagName !== "BODY")
            continue;
          const style = getComputedStyle(el);
          const hasCursorPointer = style.cursor === "pointer";
          const hasOnclick = el.hasAttribute("onclick");
          const hasTabindex = el.hasAttribute("tabindex") && parseInt(el.getAttribute("tabindex"), 10) >= 0;
          const hasRole = el.hasAttribute("role");
          const isInFloating = (() => {
            let parent = el;
            while (parent && parent !== document.documentElement) {
              const pStyle = getComputedStyle(parent);
              const isFloating = (pStyle.position === "fixed" || pStyle.position === "absolute") && parseInt(pStyle.zIndex || "0", 10) >= 10;
              const hasPortalAttr = parent.hasAttribute("data-floating-ui-portal") || parent.hasAttribute("data-radix-popper-content-wrapper") || parent.hasAttribute("data-radix-portal") || parent.hasAttribute("data-popper-placement") || parent.getAttribute("role") === "listbox" || parent.getAttribute("role") === "menu";
              if (isFloating || hasPortalAttr)
                return true;
              parent = parent.parentElement;
            }
            return false;
          })();
          if (!hasCursorPointer && !hasOnclick && !hasTabindex) {
            if (isInFloating && hasRole) {
              const role = el.getAttribute("role");
              if (role !== "option" && role !== "menuitem" && role !== "menuitemcheckbox" && role !== "menuitemradio")
                continue;
            } else {
              continue;
            }
          }
          if (hasRole && !isInFloating)
            continue;
          const parts = [];
          let current = el;
          while (current && current !== document.documentElement) {
            const parent = current.parentElement;
            if (!parent)
              break;
            const siblings = [...parent.children];
            const index = siblings.indexOf(current) + 1;
            parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
            current = parent;
          }
          const selector = parts.join(" > ");
          const text = el.innerText?.trim().slice(0, 80) || el.tagName.toLowerCase();
          const reasons = [];
          if (isInFloating)
            reasons.push("popover-child");
          if (hasCursorPointer)
            reasons.push("cursor:pointer");
          if (hasOnclick)
            reasons.push("onclick");
          if (hasTabindex)
            reasons.push(`tabindex=${el.getAttribute("tabindex")}`);
          if (hasRole)
            reasons.push(`role=${el.getAttribute("role")}`);
          results.push({ selector, text, reason: reasons.join(", ") });
        }
        return results;
      });
      if (cursorElements.length > 0) {
        output.push("");
        output.push("\u2500\u2500 cursor-interactive (not in ARIA tree) \u2500\u2500");
        let cRefCounter = 1;
        for (const elem of cursorElements) {
          const ref = `c${cRefCounter++}`;
          const locator = target.locator(elem.selector);
          refMap.set(ref, { locator, role: "cursor-interactive", name: elem.text });
          output.push(`@${ref} [${elem.reason}] "${elem.text}"`);
        }
      }
    } catch (err) {
      if (!err?.message?.includes("Execution context") && !err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("Content Security"))
        throw err;
      output.push("");
      output.push("(cursor scan failed \u2014 CSP restriction)");
    }
  }
  session.setRefMap(refMap);
  if (output.length === 0) {
    return "(no interactive elements found)";
  }
  const snapshotText = output.join(`
`);
  if (opts.annotate) {
    const screenshotPath = opts.outputPath || `${TEMP_DIR}/browse-annotated.png`;
    {
      const nodePath = __require("path");
      const nodeFs = __require("fs");
      const absolute = nodePath.resolve(screenshotPath);
      const safeDirs = [TEMP_DIR, process.cwd()].map((d) => {
        try {
          return nodeFs.realpathSync(d);
        } catch (err) {
          if (err?.code !== "ENOENT")
            throw err;
          return d;
        }
      });
      let realPath;
      try {
        realPath = nodeFs.realpathSync(absolute);
      } catch (err) {
        if (err.code === "ENOENT") {
          try {
            const dir = nodeFs.realpathSync(nodePath.dirname(absolute));
            realPath = nodePath.join(dir, nodePath.basename(absolute));
          } catch (err2) {
            if (err2?.code !== "ENOENT")
              throw err2;
            realPath = absolute;
          }
        } else {
          throw new Error(`Cannot resolve real path: ${screenshotPath} (${err.code})`);
        }
      }
      if (!safeDirs.some((dir) => isPathWithin(realPath, dir))) {
        throw new Error(`Path must be within: ${safeDirs.join(", ")}`);
      }
    }
    try {
      const boxes = [];
      for (const [ref, entry] of refMap) {
        try {
          const box = await entry.locator.boundingBox({ timeout: 1000 });
          if (box) {
            boxes.push({ ref: `@${ref}`, box });
          }
        } catch (err) {
          if (!err?.message?.includes("Timeout") && !err?.message?.includes("timeout") && !err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("Execution context"))
            throw err;
        }
      }
      await page.evaluate((boxes2) => {
        for (const { ref, box } of boxes2) {
          const overlay = document.createElement("div");
          overlay.className = "__browse_annotation__";
          overlay.style.cssText = `
            position: absolute; top: ${box.y}px; left: ${box.x}px;
            width: ${box.width}px; height: ${box.height}px;
            border: 2px solid red; background: rgba(255,0,0,0.1);
            pointer-events: none; z-index: 99999;
            font-size: 10px; color: red; font-weight: bold;
          `;
          const label = document.createElement("span");
          label.textContent = ref;
          label.style.cssText = "position: absolute; top: -14px; left: 0; background: red; color: white; padding: 0 3px; font-size: 10px;";
          overlay.appendChild(label);
          document.body.appendChild(overlay);
        }
      }, boxes);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await guardScreenshotPath(screenshotPath);
      await page.evaluate(() => {
        document.querySelectorAll(".__browse_annotation__").forEach((el) => el.remove());
      });
      output.push("");
      output.push(`[annotated screenshot: ${screenshotPath}]`);
    } catch (err) {
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("Execution context") && !err?.message?.includes("screenshot"))
        throw err;
      try {
        await page.evaluate(() => {
          document.querySelectorAll(".__browse_annotation__").forEach((el) => el.remove());
        });
      } catch (err2) {
        if (!err2?.message?.includes("closed") && !err2?.message?.includes("Target") && !err2?.message?.includes("Execution context"))
          throw err2;
      }
    }
  }
  if (opts.heatmap) {
    const heatmapPath = opts.outputPath || `${TEMP_DIR}/browse-heatmap.png`;
    {
      const nodePath = __require("path");
      const nodeFs = __require("fs");
      const absolute = nodePath.resolve(heatmapPath);
      const safeDirs = [TEMP_DIR, process.cwd()].map((d) => {
        try {
          return nodeFs.realpathSync(d);
        } catch (err) {
          if (err?.code !== "ENOENT")
            throw err;
          return d;
        }
      });
      let realPath;
      try {
        realPath = nodeFs.realpathSync(absolute);
      } catch (err) {
        if (err.code === "ENOENT") {
          try {
            const dir = nodeFs.realpathSync(nodePath.dirname(absolute));
            realPath = nodePath.join(dir, nodePath.basename(absolute));
          } catch (err2) {
            if (err2?.code !== "ENOENT")
              throw err2;
            realPath = absolute;
          }
        } else {
          throw new Error(`Cannot resolve real path: ${heatmapPath} (${err.code})`);
        }
      }
      if (!safeDirs.some((dir) => isPathWithin(realPath, dir))) {
        throw new Error(`Path must be within: ${safeDirs.join(", ")}`);
      }
    }
    const VALID_COLORS = new Set(["green", "yellow", "red", "blue", "orange", "gray"]);
    const COLOR_MAP = {
      green: { border: "#00b400", bg: "rgba(0,180,0,0.15)" },
      yellow: { border: "#ffb400", bg: "rgba(255,180,0,0.15)" },
      red: { border: "#ff0000", bg: "rgba(255,0,0,0.15)" },
      blue: { border: "#0066ff", bg: "rgba(0,102,255,0.15)" },
      orange: { border: "#ff6600", bg: "rgba(255,102,0,0.15)" },
      gray: { border: "#888888", bg: "rgba(136,136,136,0.15)" }
    };
    let colorAssignments;
    try {
      const parsed = JSON.parse(opts.heatmap);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("not an object");
      }
      colorAssignments = parsed;
    } catch {
      throw new Error(`Invalid heatmap JSON. Expected object: '{"@e1":"green","@e3":"red"}'`);
    }
    for (const [ref, color] of Object.entries(colorAssignments)) {
      if (!VALID_COLORS.has(color)) {
        throw new Error(`Invalid heatmap color "${color}" for ${ref}. Valid: ${[...VALID_COLORS].join(", ")}`);
      }
    }
    try {
      const boxes = [];
      for (const [refKey, color] of Object.entries(colorAssignments)) {
        const cleanRef = refKey.startsWith("@") ? refKey.slice(1) : refKey;
        const entry = refMap.get(cleanRef);
        if (!entry)
          continue;
        try {
          const box = await entry.locator.boundingBox({ timeout: 1000 });
          if (box) {
            const colors = COLOR_MAP[color] || COLOR_MAP.gray;
            boxes.push({ ref: `@${cleanRef}`, box, color: JSON.stringify(colors) });
          }
        } catch {}
      }
      await page.evaluate((boxes2) => {
        for (const { ref, box, color } of boxes2) {
          const colors = JSON.parse(color);
          const overlay = document.createElement("div");
          overlay.className = "__browse_heatmap__";
          overlay.style.cssText = `
            position: absolute; top: ${box.y}px; left: ${box.x}px;
            width: ${box.width}px; height: ${box.height}px;
            border: 2px solid ${colors.border}; background: ${colors.bg};
            pointer-events: none; z-index: 99999;
            font-size: 10px; color: ${colors.border}; font-weight: bold;
          `;
          const label = document.createElement("span");
          label.textContent = ref;
          label.style.cssText = `position: absolute; top: -14px; left: 0; background: ${colors.border}; color: white; padding: 0 3px; font-size: 10px;`;
          overlay.appendChild(label);
          document.body.appendChild(overlay);
        }
      }, boxes);
      await page.screenshot({ path: heatmapPath, fullPage: true });
      await guardScreenshotPath(heatmapPath);
      await page.evaluate(() => {
        document.querySelectorAll(".__browse_heatmap__").forEach((el) => el.remove());
      });
      output.push("");
      output.push(`[heatmap screenshot: ${heatmapPath}]`);
    } catch (err) {
      try {
        await page.evaluate(() => {
          document.querySelectorAll(".__browse_heatmap__").forEach((el) => el.remove());
        });
      } catch {}
      if (!err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("Execution context") && !err?.message?.includes("screenshot"))
        throw err;
    }
  }
  if (opts.diff) {
    const lastSnapshot = session.getLastSnapshot();
    if (!lastSnapshot) {
      session.setLastSnapshot(snapshotText);
      return snapshotText + `

(no previous snapshot to diff against \u2014 this snapshot stored as baseline)`;
    }
    const changes = Diff.diffLines(lastSnapshot, snapshotText);
    const diffOutput = ["--- previous snapshot", "+++ current snapshot", ""];
    for (const part of changes) {
      const prefix = part.added ? "+" : part.removed ? "-" : " ";
      const diffLines2 = part.value.split(`
`).filter((l) => l.length > 0);
      for (const line of diffLines2) {
        diffOutput.push(`${prefix} ${line}`);
      }
    }
    session.setLastSnapshot(snapshotText);
    return stripLoneSurrogates(diffOutput.join(`
`));
  }
  session.setLastSnapshot(snapshotText);
  if (inFrame) {
    const frameUrl = session.getFrame()?.url() ?? "unknown";
    output.unshift(`[Context: iframe src="${frameUrl}"]`);
  }
  if (securityOpts?.splitForScoped) {
    const trustedRefs = [];
    const untrustedLines = [];
    for (const line of output) {
      const refMatch = line.match(/^(\s*)@(e\d+|c\d+)\s+\[([^\]]+)\]\s*(.*)/);
      if (refMatch) {
        const [, indent, ref, role, rest] = refMatch;
        const nameMatch = rest.match(/^"(.+?)"/);
        let truncName = nameMatch ? nameMatch[1] : rest.trim();
        if (truncName.length > 50)
          truncName = truncName.slice(0, 47) + "...";
        trustedRefs.push(`${indent}@${ref} [${role}] "${truncName}"`);
      }
      untrustedLines.push(line);
    }
    const parts = [];
    if (trustedRefs.length > 0) {
      parts.push("INTERACTIVE ELEMENTS (trusted \u2014 use these @refs for click/fill):");
      parts.push(...trustedRefs);
      parts.push("");
    }
    const safeUntrusted = untrustedLines.map(escapeEnvelopeSentinels);
    parts.push("\u2550\u2550\u2550 BEGIN UNTRUSTED WEB CONTENT \u2550\u2550\u2550");
    parts.push(...safeUntrusted);
    parts.push("\u2550\u2550\u2550 END UNTRUSTED WEB CONTENT \u2550\u2550\u2550");
    return stripLoneSurrogates(parts.join(`
`));
  }
  return stripLoneSurrogates(output.join(`
`));
}
var INTERACTIVE_ROLES, SNAPSHOT_FLAGS;
var init_snapshot = __esm(() => {
  init_platform();
  init_content_security();
  init_sanitize();
  init_screenshot_size_guard();
  INTERACTIVE_ROLES = new Set([
    "button",
    "link",
    "textbox",
    "checkbox",
    "radio",
    "combobox",
    "listbox",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "searchbox",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "treeitem"
  ]);
  SNAPSHOT_FLAGS = [
    { short: "-i", long: "--interactive", description: "Interactive elements only (buttons, links, inputs) with @e refs. Also auto-enables cursor-interactive scan (-C) to capture dropdowns and popovers.", optionKey: "interactive" },
    { short: "-c", long: "--compact", description: "Compact (no empty structural nodes)", optionKey: "compact" },
    { short: "-d", long: "--depth", description: "Limit tree depth (0 = root only, default: unlimited)", takesValue: true, valueHint: "<N>", optionKey: "depth" },
    { short: "-s", long: "--selector", description: "Scope to CSS selector", takesValue: true, valueHint: "<sel>", optionKey: "selector" },
    { short: "-D", long: "--diff", description: "Unified diff against previous snapshot (first call stores baseline)", optionKey: "diff" },
    { short: "-a", long: "--annotate", description: "Annotated screenshot with red overlay boxes and ref labels", optionKey: "annotate" },
    { short: "-o", long: "--output", description: "Output path for annotated screenshot (default: <temp>/browse-annotated.png)", takesValue: true, valueHint: "<path>", optionKey: "outputPath" },
    { short: "-C", long: "--cursor-interactive", description: "Cursor-interactive elements (@c refs \u2014 divs with pointer, onclick). Auto-enabled when -i is used.", optionKey: "cursorInteractive" },
    { short: "-H", long: "--heatmap", description: `Color-coded overlay screenshot from JSON map: '{"@e1":"green","@e3":"red"}'. Valid colors: green, yellow, red, blue, orange, gray.`, takesValue: true, valueHint: "<json>", optionKey: "heatmap" }
  ];
});

// browse/src/commands.ts
function wrapUntrustedContent(result, url) {
  const safeUrl = url.replace(/[\n\r]/g, "").slice(0, 200);
  const safeResult = result.replace(/--- (BEGIN|END) UNTRUSTED EXTERNAL CONTENT/g, "--- $1 UNTRUSTED EXTERNAL C\u200BONTENT");
  return `--- BEGIN UNTRUSTED EXTERNAL CONTENT (source: ${safeUrl}) ---
${safeResult}
--- END UNTRUSTED EXTERNAL CONTENT ---`;
}
function canonicalizeCommand(cmd) {
  return COMMAND_ALIASES[cmd] ?? cmd;
}
function levenshtein(a, b) {
  if (a === b)
    return 0;
  if (a.length === 0)
    return b.length;
  if (b.length === 0)
    return a.length;
  const m = [];
  for (let i = 0;i <= a.length; i++)
    m.push([i, ...Array(b.length).fill(0)]);
  for (let j = 0;j <= b.length; j++)
    m[0][j] = j;
  for (let i = 1;i <= a.length; i++) {
    for (let j = 1;j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
    }
  }
  return m[a.length][b.length];
}
function buildUnknownCommandError(command, commandSet, aliasMap = COMMAND_ALIASES, newInVersion = NEW_IN_VERSION) {
  let msg = `Unknown command: '${command}'.`;
  if (command.length >= 4) {
    let best;
    let bestDist = 3;
    const candidates = [...commandSet, ...Object.keys(aliasMap)].sort();
    for (const cand of candidates) {
      const d = levenshtein(command, cand);
      if (d <= 2 && d < bestDist) {
        best = cand;
        bestDist = d;
      }
    }
    if (best)
      msg += ` Did you mean '${best}'?`;
  }
  if (newInVersion[command]) {
    msg += ` This command was added in browse v${newInVersion[command]}. Upgrade: cd ~/.claude/skills/sriflow && git pull && bun run build.`;
  }
  return msg;
}
var READ_COMMANDS, WRITE_COMMANDS, META_COMMANDS, ALL_COMMANDS, PAGE_CONTENT_COMMANDS, DOM_CONTENT_COMMANDS, COMMAND_DESCRIPTIONS, allCmds, descKeys, COMMAND_ALIASES, NEW_IN_VERSION;
var init_commands = __esm(() => {
  READ_COMMANDS = new Set([
    "text",
    "html",
    "links",
    "forms",
    "accessibility",
    "js",
    "eval",
    "css",
    "attrs",
    "console",
    "network",
    "cookies",
    "storage",
    "perf",
    "dialog",
    "is",
    "inspect",
    "media",
    "data"
  ]);
  WRITE_COMMANDS = new Set([
    "goto",
    "back",
    "forward",
    "reload",
    "load-html",
    "click",
    "fill",
    "select",
    "hover",
    "type",
    "press",
    "scroll",
    "wait",
    "viewport",
    "cookie",
    "header",
    "useragent",
    "upload",
    "dialog-accept",
    "dialog-dismiss",
    "style",
    "cleanup",
    "prettyscreenshot",
    "download",
    "scrape",
    "archive"
  ]);
  META_COMMANDS = new Set([
    "tabs",
    "tab",
    "tab-each",
    "newtab",
    "closetab",
    "status",
    "stop",
    "restart",
    "screenshot",
    "pdf",
    "responsive",
    "chain",
    "diff",
    "url",
    "snapshot",
    "handoff",
    "resume",
    "connect",
    "disconnect",
    "focus",
    "state",
    "frame",
    "ux-audit",
    "cdp",
    "memory"
  ]);
  ALL_COMMANDS = new Set([...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS]);
  PAGE_CONTENT_COMMANDS = new Set([
    "text",
    "html",
    "links",
    "forms",
    "accessibility",
    "attrs",
    "console",
    "dialog",
    "media",
    "data",
    "ux-audit",
    "snapshot"
  ]);
  DOM_CONTENT_COMMANDS = new Set([
    "text",
    "html",
    "links",
    "forms",
    "accessibility",
    "attrs",
    "media",
    "data",
    "ux-audit"
  ]);
  COMMAND_DESCRIPTIONS = {
    memory: { category: "Server", description: "Snapshot Bun heap + per-tab JS heap + Chromium process tree + bounded buffer sizes. JSON output with --json.", usage: "memory [--json]" },
    goto: { category: "Navigation", description: "Navigate to URL (http://, https://, or file:// scoped to cwd/TEMP_DIR)", usage: "goto <url>" },
    "load-html": { category: "Navigation", description: 'Load HTML via setContent. Accepts a file path under safe-dirs (validated), OR --from-file <payload.json> with {"html":"...","waitUntil":"..."} for large inline HTML (Windows argv safe).', usage: "load-html <file> [--wait-until load|domcontentloaded|networkidle] [--tab-id <N>]  |  load-html --from-file <payload.json> [--tab-id <N>]" },
    back: { category: "Navigation", description: "History back" },
    forward: { category: "Navigation", description: "History forward" },
    reload: { category: "Navigation", description: "Reload page" },
    url: { category: "Navigation", description: "Print current URL" },
    text: { category: "Reading", description: "Cleaned page text" },
    html: { category: "Reading", description: "innerHTML of selector (throws if not found), or full page HTML if no selector given", usage: "html [selector]" },
    links: { category: "Reading", description: 'All links as "text \u2192 href"' },
    forms: { category: "Reading", description: "Form fields as JSON" },
    accessibility: { category: "Reading", description: "Full ARIA tree" },
    media: { category: "Reading", description: "All media elements (images, videos, audio) with URLs, dimensions, types", usage: "media [--images|--videos|--audio] [selector]" },
    data: { category: "Reading", description: "Structured data: JSON-LD, Open Graph, Twitter Cards, meta tags", usage: "data [--jsonld|--og|--meta|--twitter]" },
    js: { category: "Inspection", description: "Run inline JavaScript expression in the page context and return result as string. Same JS sandbox as eval; the only difference is js takes an inline expr while eval reads from a file. With --out <file>, the result is written to disk instead of returned (a base64 data URL is decoded to raw bytes unless --raw is given) \u2014 ideal for rasterizing local renders to PNG without serializing megabytes back through the CLI. --out makes the invocation a WRITE (needs write scope, never allowed over the tunnel).", usage: "js <expr> [--out <file>] [--raw]" },
    eval: { category: "Inspection", description: "Run JavaScript from a file in the page context and return result as string. Path must resolve under /tmp or cwd (no traversal). Use eval for multi-line scripts; use js for one-liners. With --out <file>, the result is written to disk (base64 data URL decoded to bytes unless --raw); --out makes the invocation a WRITE (needs write scope, never allowed over the tunnel).", usage: "eval <file> [--out <file>] [--raw]" },
    css: { category: "Inspection", description: "Computed CSS value", usage: "css <sel> <prop>" },
    attrs: { category: "Inspection", description: "Element attributes as JSON", usage: "attrs <sel|@ref>" },
    is: { category: "Inspection", description: "State check on element. Valid <prop> values: visible, hidden, enabled, disabled, checked, editable, focused (case-sensitive). <sel> accepts a CSS selector OR an @ref token from a prior snapshot (e.g. @e3, @c1) \u2014 refs are interchangeable with selectors anywhere a selector is expected.", usage: "is <prop> <sel|@ref>" },
    console: { category: "Inspection", description: "Console messages (--errors filters to error/warning)", usage: "console [--clear|--errors]" },
    network: { category: "Inspection", description: "Network requests", usage: "network [--clear]" },
    dialog: { category: "Inspection", description: "Dialog messages", usage: "dialog [--clear]" },
    cookies: { category: "Inspection", description: "All cookies as JSON" },
    storage: { category: "Inspection", description: 'Read both localStorage and sessionStorage as JSON. With "set <key> <value>", write to localStorage only (sessionStorage is read-only via this command \u2014 set it with `js sessionStorage.setItem(...)`).', usage: "storage  |  storage set <key> <value>" },
    perf: { category: "Inspection", description: "Page load timings" },
    click: { category: "Interaction", description: "Click element", usage: "click <sel>" },
    fill: { category: "Interaction", description: "Fill input", usage: "fill <sel> <val>" },
    select: { category: "Interaction", description: "Select dropdown option by value, label, or visible text", usage: "select <sel> <val>" },
    hover: { category: "Interaction", description: "Hover element", usage: "hover <sel>" },
    type: { category: "Interaction", description: "Type into focused element", usage: "type <text>" },
    press: { category: "Interaction", description: "Press a Playwright keyboard key against the focused element. Names are case-sensitive: Enter, Tab, Escape, ArrowUp/Down/Left/Right, Backspace, Delete, Home, End, PageUp, PageDown. Modifiers combine with +: Shift+Enter, Control+A, Meta+K. Single printable chars (a, A, 1) work too. Full key list: https://playwright.dev/docs/api/class-keyboard#keyboard-press", usage: "press <key>" },
    scroll: { category: "Interaction", description: "With a selector, smooth-scrolls the element into view. Without a selector, jumps to page bottom. No --by/--to amount option; for pixel-precise scrolling use `js window.scrollTo(0, N)`.", usage: "scroll [sel|@ref]" },
    wait: { category: "Interaction", description: "Wait for element, network idle, or page load (timeout: 15s)", usage: "wait <sel|--networkidle|--load>" },
    upload: { category: "Interaction", description: "Upload file(s)", usage: "upload <sel> <file> [file2...]" },
    viewport: { category: "Interaction", description: "Set viewport size and optional deviceScaleFactor (1-3, for retina screenshots). --scale requires a context rebuild.", usage: "viewport [<WxH>] [--scale <n>]" },
    cookie: { category: "Interaction", description: "Set cookie on current page domain", usage: "cookie <name>=<value>" },
    header: { category: "Interaction", description: "Set custom request header (colon-separated, sensitive values auto-redacted)", usage: "header <name>:<value>" },
    useragent: { category: "Interaction", description: "Set user agent", usage: "useragent <string>" },
    "dialog-accept": { category: "Interaction", description: "Auto-accept next alert/confirm/prompt. Optional text is sent as the prompt response", usage: "dialog-accept [text]" },
    "dialog-dismiss": { category: "Interaction", description: "Auto-dismiss next dialog" },
    download: { category: "Extraction", description: "Download URL or media element to disk using browser cookies. Use --navigate for URLs that trigger browser downloads (CDN redirects, Content-Disposition, anti-bot protected sites)", usage: "download <url|@ref> [path] [--base64] [--navigate]" },
    scrape: { category: "Extraction", description: "Bulk download all media from page. Writes manifest.json", usage: "scrape <images|videos|media> [--selector sel] [--dir path] [--limit N]" },
    archive: { category: "Extraction", description: "Save complete page as MHTML via CDP", usage: "archive [path]" },
    screenshot: { category: "Visual", description: "Save screenshot. --selector targets a specific element (explicit flag form). Positional selectors starting with ./#/@/[ still work.", usage: "screenshot [--selector <css>] [--viewport] [--clip x,y,w,h] [--base64] [selector|@ref] [path]" },
    pdf: { category: "Visual", description: "Save the current page as PDF. Supports page layout (--format, --width, --height, --margins, --margin-*), structure (--toc waits for Paged.js), branding (--header-template, --footer-template, --page-numbers), accessibility (--tagged, --outline), and --from-file <payload.json> for large payloads. Use --tab-id <N> to target a specific tab.", usage: "pdf [path] [--format letter|a4|legal] [--width <dim> --height <dim>] [--margins <dim>] [--margin-top <dim> --margin-right <dim> --margin-bottom <dim> --margin-left <dim>] [--header-template <html>] [--footer-template <html>] [--page-numbers] [--tagged] [--outline] [--print-background] [--prefer-css-page-size] [--toc] [--tab-id <N>]  |  pdf --from-file <payload.json> [--tab-id <N>]" },
    responsive: { category: "Visual", description: "Screenshots at mobile (375x812), tablet (768x1024), desktop (1280x720). Saves as {prefix}-mobile.png etc.", usage: "responsive [prefix]" },
    diff: { category: "Visual", description: "Text diff between pages", usage: "diff <url1> <url2>" },
    tabs: { category: "Tabs", description: "List open tabs" },
    tab: { category: "Tabs", description: "Switch to tab", usage: "tab <id>" },
    newtab: { category: "Tabs", description: 'Open new tab. With --json, returns {"tabId":N,"url":...} for programmatic use (make-pdf).', usage: "newtab [url] [--json]" },
    closetab: { category: "Tabs", description: "Close tab", usage: "closetab [id]" },
    "tab-each": { category: "Tabs", description: "Run a command on every open tab. Returns JSON with per-tab results.", usage: "tab-each <command> [args...]" },
    status: { category: "Server", description: "Health check" },
    stop: { category: "Server", description: "Shutdown server" },
    restart: { category: "Server", description: "Restart server" },
    snapshot: { category: "Snapshot", description: "Accessibility tree with @e refs for element selection. Flags: -i interactive only, -c compact, -d N depth limit, -s sel scope, -D diff vs previous, -a annotated screenshot, -o path output, -C cursor-interactive @c refs", usage: "snapshot [flags]" },
    chain: { category: "Meta", description: 'Run a sequence of commands from JSON on stdin. One JSON array of arrays, each inner array is [cmd, ...args]. Output is one JSON result per command. Pipe a JSON array (e.g. `[["goto","https://example.com"],["text","h1"]]`) to `$B chain` and it runs the goto then the text command in order. Stops at the first error.', usage: "chain  (JSON via stdin)" },
    handoff: { category: "Server", description: "Open visible Chrome at current page for user takeover", usage: "handoff [message]" },
    resume: { category: "Server", description: "Re-snapshot after user takeover, return control to AI", usage: "resume" },
    connect: { category: "Server", description: "Launch headed Chromium with Chrome extension", usage: "connect" },
    disconnect: { category: "Server", description: "Disconnect headed browser, return to headless mode" },
    focus: { category: "Server", description: "Bring headed browser window to foreground (macOS)", usage: "focus [@ref]" },
    state: { category: "Server", description: "Save/load browser state (cookies + URLs)", usage: "state save|load <name>" },
    frame: { category: "Meta", description: "Switch to iframe context (or main to return)", usage: "frame <sel|@ref|--name n|--url pattern|main>" },
    inspect: { category: "Inspection", description: "Deep CSS inspection via CDP \u2014 full rule cascade, box model, computed styles", usage: "inspect [selector] [--all] [--history]" },
    style: { category: "Interaction", description: "Modify CSS property on element (with undo support)", usage: "style <sel> <prop> <value> | style --undo [N]" },
    cleanup: { category: "Interaction", description: "Remove page clutter (ads, cookie banners, sticky elements, social widgets)", usage: "cleanup [--ads] [--cookies] [--sticky] [--social] [--all]" },
    prettyscreenshot: { category: "Visual", description: "Clean screenshot with optional cleanup, scroll positioning, and element hiding", usage: "prettyscreenshot [--scroll-to sel|text] [--cleanup] [--hide sel...] [--width px] [path]" },
    "ux-audit": { category: "Inspection", description: "Extract page structure for UX behavioral analysis \u2014 site ID, nav, headings, text blocks, interactive elements. Returns JSON for agent interpretation.", usage: "ux-audit" },
    cdp: { category: "Inspection", description: "Raw Chrome DevTools Protocol method dispatch. Deny-default: only methods enumerated in `browse/src/cdp-allowlist.ts` (CDP_ALLOWLIST const) are reachable; any other method 403s. Each allowlist entry declares scope (tab vs browser) and output (trusted vs untrusted) \u2014 untrusted methods (data-exfil-shaped, e.g. Network.getResponseBody) get UNTRUSTED-envelope wrapped output. To discover allowed methods: read `browse/src/cdp-allowlist.ts`. Example: `$B cdp Page.getLayoutMetrics`.", usage: "cdp <Domain.method> [json-params]" }
  };
  allCmds = new Set([...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS]);
  descKeys = new Set(Object.keys(COMMAND_DESCRIPTIONS));
  for (const cmd of allCmds) {
    if (!descKeys.has(cmd))
      throw new Error(`COMMAND_DESCRIPTIONS missing entry for: ${cmd}`);
  }
  for (const key of descKeys) {
    if (!allCmds.has(key))
      throw new Error(`COMMAND_DESCRIPTIONS has unknown command: ${key}`);
  }
  COMMAND_ALIASES = {
    setcontent: "load-html",
    "set-content": "load-html",
    setContent: "load-html"
  };
  NEW_IN_VERSION = {
    "load-html": "0.19.0.0"
  };
});

// browse/src/cdp-commands.ts
var exports_cdp_commands = {};
__export(exports_cdp_commands, {
  handleCdpCommand: () => handleCdpCommand
});
function parseQualified(name) {
  const idx = name.indexOf(".");
  if (idx <= 0 || idx === name.length - 1) {
    throw new Error(`Usage: $B cdp <Domain.method> [json-params]
` + `Cause: '${name}' is not in Domain.method format.
` + "Action: e.g. $B cdp Accessibility.getFullAXTree {}");
  }
  return { domain: name.slice(0, idx), method: name.slice(idx + 1) };
}
async function handleCdpCommand(args, bm) {
  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    return [
      "$B cdp \u2014 raw CDP method dispatch (deny-default escape hatch)",
      "",
      "Usage: $B cdp <Domain.method> [json-params]",
      "",
      "Allowed methods are listed in browse/src/cdp-allowlist.ts. To add one,",
      "open a PR with a one-line justification and the (scope, output) tags.",
      "Examples:",
      "  $B cdp Accessibility.getFullAXTree {}",
      "  $B cdp Performance.getMetrics {}",
      `  $B cdp DOM.describeNode '{"backendNodeId":42,"depth":3}'`
    ].join(`
`);
  }
  const qualified = args[0];
  const { domain, method } = parseQualified(qualified);
  let params = {};
  if (args[1]) {
    try {
      params = JSON.parse(args[1]) ?? {};
    } catch (e) {
      throw new Error(`Cannot parse params as JSON: ${e.message}
` + `Cause: argument '${args[1]}' is not valid JSON.
` + `Action: pass a JSON object literal, e.g. '{"backendNodeId":42}'.`);
    }
  }
  const tabId = bm.getActiveTabId();
  const { raw, entry } = await dispatchCdpCall({ domain, method, params, tabId, bm });
  const json = JSON.stringify(raw, null, 2);
  if (entry.output === "untrusted") {
    return wrapUntrustedContent(json, `cdp:${qualified}`);
  }
  return json;
}
var init_cdp_commands = __esm(() => {
  init_cdp_bridge();
  init_commands();
});

// browse/src/memory-snapshot.ts
function formatBytes(n) {
  if (n < 1024)
    return `${n} B`;
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024)
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// browse/src/memory-command.ts
var exports_memory_command = {};
__export(exports_memory_command, {
  handleMemoryCommand: () => handleMemoryCommand,
  buildMemorySnapshotJson: () => buildMemorySnapshotJson
});
function collectStructureStats() {
  return {
    modificationHistory: getModificationHistoryStats(),
    activitySubscribers: getSubscriberCount(),
    inspectorSubscribers: getInspectorSubscriberCount(),
    consoleBufferLen: consoleBuffer.length,
    networkBufferLen: networkBuffer.length,
    dialogBufferLen: dialogBuffer.length,
    captureBufferBytes: getCaptureBuffer().byteSize
  };
}
function formatSnapshotText(s) {
  const lines = [];
  lines.push(`Bun server:        RSS: ${formatBytes(s.bunServer.rss)}  ` + `heap: ${formatBytes(s.bunServer.heapUsed)} / ${formatBytes(s.bunServer.heapTotal)}  ` + `external: ${formatBytes(s.bunServer.external)}`);
  if (s.processes && s.processes.length > 0) {
    const byType = {};
    for (const p of s.processes)
      byType[p.type] = (byType[p.type] ?? 0) + 1;
    const typeSummary = Object.entries(byType).map(([t, n]) => `${t}=${n}`).join(" ");
    lines.push(`Chromium processes: ${s.processes.length} total  (${typeSummary})`);
  } else if (s.processes === null) {
    lines.push("Chromium processes: (unavailable \u2014 see notes)");
  } else {
    lines.push("Chromium processes: 0");
  }
  if (s.tabs.length > 0) {
    const sorted = [...s.tabs].sort((a, b) => b.jsHeapUsed - a.jsHeapUsed);
    const shown = sorted.slice(0, 10);
    lines.push(`Renderers:         ${s.tabs.length} tabs (top by JS heap):`);
    for (const t of shown) {
      const urlShort = t.url.length > 80 ? t.url.slice(0, 77) + "..." : t.url;
      lines.push(`  [${formatBytes(t.jsHeapUsed).padStart(8)} JS, ` + `${String(t.nodes).padStart(6)} nodes, ` + `${String(t.listeners).padStart(5)} listeners] ` + `tab #${t.id} \u2014 ${urlShort}`);
    }
    if (sorted.length > shown.length) {
      lines.push(`  ...and ${sorted.length - shown.length} more`);
    }
  } else {
    lines.push("Renderers:         (no tabs tracked)");
  }
  lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  lines.push("In-memory structures (Bun side):");
  const m = s.structures.modificationHistory;
  lines.push(`  modificationHistory:    ${m.current} / ${m.cap} entries` + (m.evicted > 0 ? `  (${m.evicted} evicted since reset)` : ""));
  lines.push(`  inspectorSubscribers:   ${s.structures.inspectorSubscribers}`);
  lines.push(`  activitySubscribers:    ${s.structures.activitySubscribers}`);
  lines.push(`  consoleBuffer:          ${s.structures.consoleBufferLen} entries`);
  lines.push(`  networkBuffer:          ${s.structures.networkBufferLen} entries`);
  lines.push(`  dialogBuffer:           ${s.structures.dialogBufferLen} entries`);
  lines.push(`  captureBuffer:          ${formatBytes(s.structures.captureBufferBytes)}`);
  if (s.notes.length > 0) {
    lines.push("");
    lines.push("Notes:");
    for (const n of s.notes)
      lines.push(`  - ${n}`);
  }
  return lines.join(`
`);
}
async function handleMemoryCommand(args, bm) {
  const jsonMode = args.includes("--json");
  const structures = collectStructureStats();
  const snapshot = await bm.getMemorySnapshot(structures);
  if (jsonMode)
    return JSON.stringify(snapshot);
  return formatSnapshotText(snapshot);
}
async function buildMemorySnapshotJson(bm) {
  const structures = collectStructureStats();
  return bm.getMemorySnapshot(structures);
}
var init_memory_command = __esm(() => {
  init_cdp_inspector();
  init_activity();
  init_server();
  init_buffers();
  init_network_capture();
});

// browse/src/meta-commands.ts
import * as Diff2 from "diff";
import * as fs8 from "fs";
import * as path7 from "path";
function tokenizePipeSegment(segment) {
  const tokens = [];
  let current = "";
  let inQuote = false;
  for (let i = 0;i < segment.length; i++) {
    const ch = segment[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === " " && !inQuote) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current)
    tokens.push(current);
  return tokens;
}
function parsePdfArgs(args) {
  for (let i = 0;i < args.length; i++) {
    if (args[i] === "--from-file") {
      const payloadPath = args[++i];
      if (!payloadPath)
        throw new Error("pdf: --from-file requires a path");
      return parsePdfFromFile(payloadPath);
    }
  }
  const result = {
    output: `${TEMP_DIR}/browse-page.pdf`
  };
  let margins;
  const positional = [];
  for (let i = 0;i < args.length; i++) {
    const a = args[i];
    if (a === "--format") {
      result.format = requireValue(args, ++i, "format");
    } else if (a === "--page-size") {
      result.format = requireValue(args, ++i, "page-size");
    } else if (a === "--width") {
      result.width = requireValue(args, ++i, "width");
    } else if (a === "--height") {
      result.height = requireValue(args, ++i, "height");
    } else if (a === "--margins") {
      margins = requireValue(args, ++i, "margins");
    } else if (a === "--margin-top") {
      result.marginTop = requireValue(args, ++i, "margin-top");
    } else if (a === "--margin-right") {
      result.marginRight = requireValue(args, ++i, "margin-right");
    } else if (a === "--margin-bottom") {
      result.marginBottom = requireValue(args, ++i, "margin-bottom");
    } else if (a === "--margin-left") {
      result.marginLeft = requireValue(args, ++i, "margin-left");
    } else if (a === "--header-template") {
      result.headerTemplate = requireValue(args, ++i, "header-template");
    } else if (a === "--footer-template") {
      result.footerTemplate = requireValue(args, ++i, "footer-template");
    } else if (a === "--page-numbers") {
      result.pageNumbers = true;
    } else if (a === "--tagged") {
      result.tagged = true;
    } else if (a === "--outline") {
      result.outline = true;
    } else if (a === "--print-background") {
      result.printBackground = true;
    } else if (a === "--prefer-css-page-size") {
      result.preferCSSPageSize = true;
    } else if (a === "--toc") {
      result.toc = true;
    } else if (a.startsWith("--")) {
      throw new Error(`Unknown pdf flag: ${a}`);
    } else {
      positional.push(a);
    }
  }
  if (positional.length > 0)
    result.output = positional[0];
  if (margins !== undefined) {
    if (result.marginTop || result.marginRight || result.marginBottom || result.marginLeft) {
      throw new Error("pdf: --margins is mutex with --margin-top/--margin-right/--margin-bottom/--margin-left");
    }
    result.marginTop = result.marginRight = result.marginBottom = result.marginLeft = margins;
  }
  if (result.format && (result.width || result.height)) {
    throw new Error("pdf: --format is mutex with --width/--height");
  }
  if (result.pageNumbers && result.footerTemplate) {
    throw new Error("pdf: --page-numbers is mutex with --footer-template (page-numbers writes the footer itself)");
  }
  return result;
}
function parsePdfFromFile(payloadPath) {
  try {
    validateReadPath(path7.resolve(payloadPath));
  } catch {
    throw new Error(`pdf: --from-file ${payloadPath} must be under ${SAFE_DIRECTORIES.join(" or ")} (security policy). Copy the payload into the project tree or /tmp first.`);
  }
  const raw = fs8.readFileSync(payloadPath, "utf8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`pdf: --from-file ${payloadPath} is not valid JSON (${msg}).`);
  }
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`pdf: --from-file ${payloadPath} must be a JSON object, got ${Array.isArray(json) ? "array" : typeof json}.`);
  }
  const out = {
    output: json.output || `${TEMP_DIR}/browse-page.pdf`,
    format: json.format,
    width: json.width,
    height: json.height,
    marginTop: json.marginTop,
    marginRight: json.marginRight,
    marginBottom: json.marginBottom,
    marginLeft: json.marginLeft,
    headerTemplate: json.headerTemplate,
    footerTemplate: json.footerTemplate,
    pageNumbers: json.pageNumbers === true,
    tagged: json.tagged === true,
    outline: json.outline === true,
    printBackground: json.printBackground === true,
    preferCSSPageSize: json.preferCSSPageSize === true,
    toc: json.toc === true
  };
  return out;
}
function requireValue(args, i, flag) {
  const v = args[i];
  if (v === undefined || v.startsWith("--")) {
    throw new Error(`pdf: --${flag} requires a value`);
  }
  return v;
}
function buildPdfOptions(parsed) {
  const opts = {};
  if (parsed.format) {
    opts.format = parsed.format.charAt(0).toUpperCase() + parsed.format.slice(1).toLowerCase();
  } else if (parsed.width && parsed.height) {
    opts.width = parsed.width;
    opts.height = parsed.height;
  } else {
    opts.format = "Letter";
  }
  const margin = {};
  if (parsed.marginTop)
    margin.top = parsed.marginTop;
  if (parsed.marginRight)
    margin.right = parsed.marginRight;
  if (parsed.marginBottom)
    margin.bottom = parsed.marginBottom;
  if (parsed.marginLeft)
    margin.left = parsed.marginLeft;
  if (Object.keys(margin).length > 0)
    opts.margin = margin;
  const displayHeaderFooter = !!parsed.headerTemplate || !!parsed.footerTemplate || parsed.pageNumbers === true;
  if (displayHeaderFooter) {
    opts.displayHeaderFooter = true;
    if (parsed.headerTemplate !== undefined)
      opts.headerTemplate = parsed.headerTemplate;
    else if (parsed.pageNumbers || parsed.footerTemplate)
      opts.headerTemplate = "<div></div>";
    if (parsed.pageNumbers) {
      opts.footerTemplate = [
        '<div style="font-size:9pt; font-family:Helvetica,Arial,sans-serif; color:#666; ',
        'width:100%; text-align:center;">',
        '<span class="pageNumber"></span> of <span class="totalPages"></span>',
        "</div>"
      ].join("");
    } else if (parsed.footerTemplate !== undefined) {
      opts.footerTemplate = parsed.footerTemplate;
    } else {
      opts.footerTemplate = "<div></div>";
    }
  }
  if (parsed.tagged === true)
    opts.tagged = true;
  if (parsed.outline === true)
    opts.outline = true;
  if (parsed.printBackground === true)
    opts.printBackground = true;
  if (parsed.preferCSSPageSize === true)
    opts.preferCSSPageSize = true;
  return opts;
}
async function handleMetaCommand(command, args, bm, shutdown, tokenInfo, opts) {
  const session = bm.getActiveSession();
  switch (command) {
    case "tabs": {
      const tabs = await bm.getTabListWithTitles();
      return tabs.map((t) => `${t.active ? "\u2192 " : "  "}[${t.id}] ${t.title || "(untitled)"} \u2014 ${t.url}`).join(`
`);
    }
    case "tab": {
      const id = parseInt(args[0], 10);
      if (isNaN(id))
        throw new Error("Usage: browse tab <id>");
      bm.switchTab(id);
      return `Switched to tab ${id}`;
    }
    case "newtab": {
      let url;
      let jsonMode = false;
      for (const a of args) {
        if (a === "--json") {
          jsonMode = true;
        } else if (!url) {
          url = a;
        }
      }
      const id = await bm.newTab(url);
      if (jsonMode) {
        return JSON.stringify({ tabId: id, url: url ?? null });
      }
      return `Opened tab ${id}${url ? ` \u2192 ${url}` : ""}`;
    }
    case "closetab": {
      const id = args[0] ? parseInt(args[0], 10) : undefined;
      await bm.closeTab(id);
      return `Closed tab${id ? ` ${id}` : ""}`;
    }
    case "tab-each": {
      if (args.length === 0) {
        throw new Error(`Usage: browse tab-each <command> [args...]
` + "Example: browse tab-each snapshot -i");
      }
      const innerRaw = args[0];
      const innerName = canonicalizeCommand(innerRaw);
      const innerArgs = args.slice(1);
      const tabs = await bm.getTabListWithTitles();
      const originalActive = tabs.find((t) => t.active)?.id ?? bm.getActiveTabId();
      const executeCmd = opts?.executeCommand;
      const results = [];
      try {
        for (const tab of tabs) {
          if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
            results.push({
              tabId: tab.id,
              url: tab.url,
              title: tab.title || "",
              status: 0,
              output: "skipped: internal page"
            });
            continue;
          }
          bm.switchTab(tab.id, { bringToFront: false });
          let status = 0;
          let output = "";
          if (executeCmd) {
            const r = await executeCmd({ command: innerName, args: innerArgs, tabId: tab.id }, tokenInfo);
            status = r.status;
            output = r.result;
            if (status !== 200) {
              try {
                output = JSON.parse(output).error || output;
              } catch (err) {
                if (!(err instanceof SyntaxError))
                  throw err;
              }
            }
          } else {
            status = 500;
            output = "tab-each requires the browse server (no executeCommand context)";
          }
          results.push({
            tabId: tab.id,
            url: tab.url,
            title: tab.title || "",
            status,
            output
          });
        }
      } finally {
        try {
          bm.switchTab(originalActive, { bringToFront: false });
        } catch {}
      }
      return JSON.stringify({
        command: innerName,
        args: innerArgs,
        total: results.length,
        results
      }, null, 2);
    }
    case "status": {
      const page = bm.getPage();
      const tabs = bm.getTabCount();
      const mode = bm.getConnectionMode();
      return [
        `Status: healthy`,
        `Mode: ${mode}`,
        `URL: ${page.url()}`,
        `Tabs: ${tabs}`,
        `PID: ${process.pid}`
      ].join(`
`);
    }
    case "url": {
      return bm.getCurrentUrl();
    }
    case "stop": {
      await shutdown();
      return "Server stopped";
    }
    case "restart": {
      console.log("[browse] Restart requested. Exiting for CLI to restart.");
      await shutdown();
      return "Restarting...";
    }
    case "screenshot": {
      const page = bm.getPage();
      let outputPath = `${TEMP_DIR}/browse-screenshot.png`;
      let clipRect;
      let targetSelector;
      let viewportOnly = false;
      let base64Mode = false;
      const remaining = [];
      let flagSelector;
      for (let i = 0;i < args.length; i++) {
        if (args[i] === "--viewport") {
          viewportOnly = true;
        } else if (args[i] === "--base64") {
          base64Mode = true;
        } else if (args[i] === "--selector") {
          flagSelector = args[++i];
          if (!flagSelector)
            throw new Error("Usage: screenshot --selector <css> [path]");
        } else if (args[i] === "--clip") {
          const coords = args[++i];
          if (!coords)
            throw new Error("Usage: screenshot --clip x,y,w,h [path]");
          const parts = coords.split(",").map(Number);
          if (parts.length !== 4 || parts.some(isNaN))
            throw new Error("Usage: screenshot --clip x,y,width,height \u2014 all must be numbers");
          clipRect = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
        } else if (args[i].startsWith("--")) {
          throw new Error(`Unknown screenshot flag: ${args[i]}`);
        } else {
          remaining.push(args[i]);
        }
      }
      for (const arg of remaining) {
        const isFilePath = arg.includes("/") && /\.(png|jpe?g|webp|pdf)$/i.test(arg);
        if (isFilePath) {
          outputPath = arg;
        } else if (arg.startsWith("@e") || arg.startsWith("@c") || arg.startsWith(".") || arg.startsWith("#") || arg.includes("[")) {
          targetSelector = arg;
        } else {
          outputPath = arg;
        }
      }
      if (flagSelector !== undefined) {
        if (targetSelector !== undefined) {
          throw new Error("--selector conflicts with positional selector \u2014 choose one");
        }
        targetSelector = flagSelector;
      }
      validateOutputPath(outputPath);
      if (clipRect && targetSelector) {
        throw new Error("Cannot use --clip with a selector/ref \u2014 choose one");
      }
      if (viewportOnly && clipRect) {
        throw new Error("Cannot use --viewport with --clip \u2014 choose one");
      }
      if (base64Mode) {
        let buffer;
        if (targetSelector) {
          const resolved = await bm.resolveRef(targetSelector);
          const locator = "locator" in resolved ? resolved.locator : page.locator(resolved.selector);
          buffer = await locator.screenshot({ timeout: 5000 });
        } else if (clipRect) {
          buffer = await page.screenshot({ clip: clipRect });
        } else {
          buffer = await page.screenshot({ fullPage: !viewportOnly });
          ({ buffer } = await guardScreenshotBuffer(buffer));
        }
        if (buffer.length > 10 * 1024 * 1024) {
          throw new Error("Screenshot too large for --base64 (>10MB). Use disk path instead.");
        }
        return `data:image/png;base64,${buffer.toString("base64")}`;
      }
      if (targetSelector) {
        const resolved = await bm.resolveRef(targetSelector);
        const locator = "locator" in resolved ? resolved.locator : page.locator(resolved.selector);
        await locator.screenshot({ path: outputPath, timeout: 5000 });
        return `Screenshot saved (element): ${outputPath}`;
      }
      if (clipRect) {
        await page.screenshot({ path: outputPath, clip: clipRect });
        return `Screenshot saved (clip ${clipRect.x},${clipRect.y},${clipRect.width},${clipRect.height}): ${outputPath}`;
      }
      await page.screenshot({ path: outputPath, fullPage: !viewportOnly });
      if (!viewportOnly)
        await guardScreenshotPath(outputPath);
      return `Screenshot saved${viewportOnly ? " (viewport)" : ""}: ${outputPath}`;
    }
    case "pdf": {
      const page = bm.getPage();
      const parsed = parsePdfArgs(args);
      validateOutputPath(parsed.output);
      if (parsed.toc) {
        const deadline = Date.now() + 3000;
        let ready = false;
        while (Date.now() < deadline) {
          try {
            ready = await page.evaluate("!!window.__pagedjsAfterFired");
          } catch {}
          if (ready)
            break;
          await new Promise((r) => setTimeout(r, 150));
        }
      }
      const opts2 = buildPdfOptions(parsed);
      opts2.path = parsed.output;
      await page.pdf(opts2);
      return `PDF saved: ${parsed.output}`;
    }
    case "responsive": {
      const page = bm.getPage();
      const prefix = args[0] || `${TEMP_DIR}/browse-responsive`;
      validateOutputPath(prefix);
      const viewports = [
        { name: "mobile", width: 375, height: 812 },
        { name: "tablet", width: 768, height: 1024 },
        { name: "desktop", width: 1280, height: 720 }
      ];
      const originalViewport = page.viewportSize();
      const results = [];
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const screenshotPath = `${prefix}-${vp.name}.png`;
        validateOutputPath(screenshotPath);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        await guardScreenshotPath(screenshotPath);
        results.push(`${vp.name} (${vp.width}x${vp.height}): ${screenshotPath}`);
      }
      if (originalViewport) {
        await page.setViewportSize(originalViewport);
      }
      return results.join(`
`);
    }
    case "chain": {
      const jsonStr = args[0];
      if (!jsonStr)
        throw new Error(`Usage: echo '[["goto","url"],["text"]]' | browse chain
` + "   or: browse chain 'goto url | click @e5 | snapshot -ic'");
      let rawCommands;
      try {
        rawCommands = JSON.parse(jsonStr);
        if (!Array.isArray(rawCommands))
          throw new Error("not array");
      } catch (err) {
        if (!(err instanceof SyntaxError) && err?.message !== "not array")
          throw err;
        rawCommands = jsonStr.split(" | ").filter((seg) => seg.trim().length > 0).map((seg) => tokenizePipeSegment(seg.trim()));
      }
      const commands = rawCommands.map((cmd) => {
        const [rawName, ...cmdArgs] = cmd;
        const name = canonicalizeCommand(rawName);
        return { rawName, name, args: cmdArgs };
      });
      const executeCmd = opts?.executeCommand;
      const results = [];
      let lastWasWrite = false;
      if (executeCmd) {
        for (const c of commands) {
          const cr = await executeCmd({ command: c.name, args: c.args }, tokenInfo);
          const label = c.rawName === c.name ? c.name : `${c.rawName}\u2192${c.name}`;
          if (cr.status === 200) {
            results.push(`[${label}] ${cr.result}`);
          } else {
            let errMsg = cr.result;
            try {
              errMsg = JSON.parse(cr.result).error || cr.result;
            } catch (err) {
              if (!(err instanceof SyntaxError))
                throw err;
            }
            results.push(`[${label}] ERROR: ${errMsg}`);
          }
          lastWasWrite = WRITE_COMMANDS.has(c.name);
        }
      } else {
        const { handleReadCommand: handleReadCommand2 } = await Promise.resolve().then(() => (init_read_commands(), exports_read_commands));
        const { handleWriteCommand: handleWriteCommand2 } = await Promise.resolve().then(() => (init_write_commands(), exports_write_commands));
        for (const c of commands) {
          const name = c.name;
          const cmdArgs = c.args;
          const label = c.rawName === name ? name : `${c.rawName}\u2192${name}`;
          try {
            let result;
            if (WRITE_COMMANDS.has(name)) {
              if (bm.isWatching()) {
                result = "BLOCKED: write commands disabled in watch mode";
              } else {
                result = await handleWriteCommand2(name, cmdArgs, session, bm);
              }
              lastWasWrite = true;
            } else if (READ_COMMANDS.has(name)) {
              result = await handleReadCommand2(name, cmdArgs, session);
              if (PAGE_CONTENT_COMMANDS.has(name)) {
                result = wrapUntrustedContent(result, bm.getCurrentUrl());
              }
              lastWasWrite = false;
            } else if (META_COMMANDS.has(name)) {
              result = await handleMetaCommand(name, cmdArgs, bm, shutdown, tokenInfo, opts);
              lastWasWrite = false;
            } else {
              throw new Error(`Unknown command: ${c.rawName}`);
            }
            results.push(`[${label}] ${result}`);
          } catch (err) {
            results.push(`[${label}] ERROR: ${err.message}`);
          }
        }
      }
      if (lastWasWrite) {
        await bm.getPage().waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});
      }
      return results.join(`

`);
    }
    case "diff": {
      const [url1, url2] = args;
      if (!url1 || !url2)
        throw new Error("Usage: browse diff <url1> <url2>");
      const page = bm.getPage();
      const normalizedUrl1 = await validateNavigationUrl(url1);
      await page.goto(normalizedUrl1, { waitUntil: "domcontentloaded", timeout: 15000 });
      const text1 = await getCleanText(page);
      const normalizedUrl2 = await validateNavigationUrl(url2);
      await page.goto(normalizedUrl2, { waitUntil: "domcontentloaded", timeout: 15000 });
      const text2 = await getCleanText(page);
      const changes = Diff2.diffLines(text1, text2);
      const output = [`--- ${url1}`, `+++ ${url2}`, ""];
      for (const part of changes) {
        const prefix = part.added ? "+" : part.removed ? "-" : " ";
        const lines = part.value.split(`
`).filter((l) => l.length > 0);
        for (const line of lines) {
          output.push(`${prefix} ${line}`);
        }
      }
      return wrapUntrustedContent(output.join(`
`), `diff: ${url1} vs ${url2}`);
    }
    case "snapshot": {
      const isScoped = tokenInfo && tokenInfo.clientId !== "root";
      const snapshotResult = await handleSnapshot(args, session, {
        splitForScoped: !!isScoped
      });
      if (isScoped) {
        return snapshotResult;
      }
      return wrapUntrustedContent(snapshotResult, bm.getCurrentUrl());
    }
    case "handoff": {
      const message = args.join(" ") || "User takeover requested";
      return await bm.handoff(message);
    }
    case "resume": {
      bm.resume();
      const isScoped2 = tokenInfo && tokenInfo.clientId !== "root";
      const snapshot = await handleSnapshot(["-i"], session, { splitForScoped: !!isScoped2 });
      if (isScoped2) {
        return `RESUMED
${snapshot}`;
      }
      return `RESUMED
${wrapUntrustedContent(snapshot, bm.getCurrentUrl())}`;
    }
    case "connect": {
      if (bm.getConnectionMode() === "headed") {
        return "Already in headed mode with extension.";
      }
      return "The connect command must be run from the CLI (not sent to a running server). Run: $B connect";
    }
    case "disconnect": {
      if (bm.getConnectionMode() !== "headed") {
        return "Not in headed mode \u2014 nothing to disconnect.";
      }
      console.log("[browse] Disconnecting headed browser. Restarting in headless mode.");
      await shutdown();
      return "Disconnected. Server will restart in headless mode on next command.";
    }
    case "focus": {
      if (bm.getConnectionMode() !== "headed") {
        return "focus requires headed mode. Run `$B connect` first.";
      }
      try {
        const { execSync } = await import("child_process");
        const appNames = ["Comet", "Google Chrome", "Arc", "Brave Browser", "Microsoft Edge"];
        let activated = false;
        for (const appName of appNames) {
          try {
            execSync(`osascript -e 'tell application "${appName}" to activate'`, { stdio: "pipe", timeout: 3000 });
            activated = true;
            break;
          } catch (err) {
            if (err?.status === undefined && !err?.message?.includes("Command failed"))
              throw err;
          }
        }
        if (!activated) {
          return "Could not bring browser to foreground. macOS only.";
        }
        if (args.length > 0 && args[0].startsWith("@")) {
          try {
            const resolved = await bm.resolveRef(args[0]);
            if ("locator" in resolved) {
              await resolved.locator.scrollIntoViewIfNeeded({ timeout: 5000 });
              return `Browser activated. Scrolled ${args[0]} into view.`;
            }
          } catch (err) {
            if (!err?.message?.includes("not found") && !err?.message?.includes("closed") && !err?.message?.includes("Target") && !err?.message?.includes("timeout"))
              throw err;
          }
        }
        return "Browser window activated.";
      } catch (err) {
        return `focus failed: ${err.message}. macOS only.`;
      }
    }
    case "watch": {
      if (args[0] === "stop") {
        if (!bm.isWatching())
          return "Not currently watching.";
        const result = bm.stopWatch();
        const durationSec = Math.round(result.duration / 1000);
        const lastSnapshot = result.snapshots.length > 0 ? wrapUntrustedContent(result.snapshots[result.snapshots.length - 1], bm.getCurrentUrl()) : "(none)";
        return [
          `WATCH STOPPED (${durationSec}s, ${result.snapshots.length} snapshots)`,
          "",
          "Last snapshot:",
          lastSnapshot
        ].join(`
`);
      }
      if (bm.isWatching())
        return "Already watching. Run `$B watch stop` to stop.";
      if (bm.getConnectionMode() !== "headed") {
        return "watch requires headed mode. Run `$B connect` first.";
      }
      bm.startWatch();
      return "WATCHING \u2014 observing user browsing. Periodic snapshots every 5s.\nRun `$B watch stop` to stop and get summary.";
    }
    case "inbox": {
      const { execSync } = await import("child_process");
      let gitRoot;
      try {
        gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
      } catch (err) {
        if (err?.status === undefined && !err?.message?.includes("Command failed"))
          throw err;
        return "Not in a git repository \u2014 cannot locate inbox.";
      }
      const inboxDir = path7.join(gitRoot, ".context", "sidebar-inbox");
      if (!fs8.existsSync(inboxDir))
        return "Inbox empty.";
      const files = fs8.readdirSync(inboxDir).filter((f) => f.endsWith(".json") && !f.startsWith(".")).sort().reverse();
      if (files.length === 0)
        return "Inbox empty.";
      const messages = [];
      for (const file of files) {
        try {
          const data = JSON.parse(fs8.readFileSync(path7.join(inboxDir, file), "utf-8"));
          messages.push({
            timestamp: data.timestamp || "",
            url: data.page?.url || "unknown",
            userMessage: data.userMessage || ""
          });
        } catch (err) {
          if (!(err instanceof SyntaxError) && err?.code !== "ENOENT" && err?.code !== "EACCES")
            throw err;
        }
      }
      if (messages.length === 0)
        return "Inbox empty.";
      const lines = [];
      lines.push(`SIDEBAR INBOX (${messages.length} message${messages.length === 1 ? "" : "s"})`);
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      for (const msg of messages) {
        const ts = msg.timestamp ? `[${msg.timestamp}]` : "[unknown]";
        lines.push(`${ts} ${wrapUntrustedContent(msg.url, "inbox-url")}`);
        lines.push(`  "${wrapUntrustedContent(msg.userMessage, "inbox-message")}"`);
        lines.push("");
      }
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      if (args.includes("--clear")) {
        for (const file of files) {
          try {
            fs8.unlinkSync(path7.join(inboxDir, file));
          } catch (err) {
            if (err?.code !== "ENOENT")
              throw err;
          }
        }
        lines.push(`Cleared ${files.length} message${files.length === 1 ? "" : "s"}.`);
      }
      return lines.join(`
`);
    }
    case "state": {
      const [action, name] = args;
      if (!action || !name)
        throw new Error("Usage: state save|load <name>");
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        throw new Error("State name must be alphanumeric (a-z, 0-9, _, -)");
      }
      const config = resolveConfig();
      const stateDir = path7.join(config.stateDir, "browse-states");
      mkdirSecure(stateDir);
      const statePath = path7.join(stateDir, `${name}.json`);
      if (action === "save") {
        const state = await bm.saveState();
        const saveData = {
          version: 1,
          savedAt: new Date().toISOString(),
          cookies: state.cookies,
          pages: state.pages.map((p) => ({ url: p.url, isActive: p.isActive }))
        };
        writeSecureFile(statePath, JSON.stringify(saveData, null, 2));
        return `State saved: ${statePath} (${state.cookies.length} cookies, ${state.pages.length} pages)
\u26A0\uFE0F  Cookies stored in plaintext. Delete when no longer needed.`;
      }
      if (action === "load") {
        if (!fs8.existsSync(statePath))
          throw new Error(`State not found: ${statePath}`);
        const data = JSON.parse(fs8.readFileSync(statePath, "utf-8"));
        if (!Array.isArray(data.cookies) || !Array.isArray(data.pages)) {
          throw new Error("Invalid state file: expected cookies and pages arrays");
        }
        const validatedCookies = data.cookies.filter((c) => {
          if (typeof c !== "object" || !c)
            return false;
          if (typeof c.name !== "string" || typeof c.value !== "string")
            return false;
          if (typeof c.domain !== "string" || !c.domain)
            return false;
          const d = c.domain.startsWith(".") ? c.domain.slice(1) : c.domain;
          if (d === "localhost" || d.endsWith(".internal") || d === "169.254.169.254")
            return false;
          return true;
        });
        if (validatedCookies.length < data.cookies.length) {
          console.warn(`[browse] Filtered ${data.cookies.length - validatedCookies.length} invalid cookies from state file`);
        }
        if (data.savedAt) {
          const ageMs = Date.now() - new Date(data.savedAt).getTime();
          const SEVEN_DAYS = 604800000;
          if (ageMs > SEVEN_DAYS) {
            console.warn(`[browse] Warning: State file is ${Math.round(ageMs / 86400000)} days old. Consider re-saving.`);
          }
        }
        bm.setFrame(null);
        await bm.closeAllPages();
        await bm.restoreState({
          cookies: validatedCookies,
          pages: data.pages.map((p) => ({
            url: typeof p.url === "string" ? p.url : "",
            isActive: Boolean(p.isActive),
            storage: null
          }))
        });
        return `State loaded: ${data.cookies.length} cookies, ${data.pages.length} pages`;
      }
      throw new Error("Usage: state save|load <name>");
    }
    case "frame": {
      const target = args[0];
      if (!target)
        throw new Error("Usage: frame <selector|@ref|--name name|--url pattern|main>");
      if (target === "main") {
        bm.setFrame(null);
        bm.clearRefs();
        return "Switched to main frame";
      }
      const page = bm.getPage();
      let frame = null;
      if (target === "--name") {
        if (!args[1])
          throw new Error("Usage: frame --name <name>");
        frame = page.frame({ name: args[1] });
      } else if (target === "--url") {
        if (!args[1])
          throw new Error("Usage: frame --url <pattern>");
        frame = page.frame({ url: new RegExp(escapeRegExp(args[1])) });
      } else {
        const resolved = await bm.resolveRef(target);
        const locator = "locator" in resolved ? resolved.locator : page.locator(resolved.selector);
        const elementHandle = await locator.elementHandle({ timeout: 5000 });
        frame = await elementHandle?.contentFrame() ?? null;
        await elementHandle?.dispose();
      }
      if (!frame)
        throw new Error(`Frame not found: ${target}`);
      bm.setFrame(frame);
      bm.clearRefs();
      return `Switched to frame: ${frame.url()}`;
    }
    case "ux-audit": {
      const page = bm.getPage();
      const data = await page.evaluate(() => {
        const HEADING_CAP = 50;
        const INTERACTIVE_CAP = 200;
        const TEXT_BLOCK_CAP = 50;
        const logoEl = document.querySelector('[class*="logo"], [id*="logo"], header img, [aria-label*="home"], a[href="/"]');
        const siteId = logoEl ? {
          found: true,
          text: (logoEl.textContent || "").trim().slice(0, 100),
          tag: logoEl.tagName,
          alt: logoEl.alt || null
        } : { found: false, text: null, tag: null, alt: null };
        const h1 = document.querySelector("h1");
        const pageName = h1 ? {
          found: true,
          text: h1.textContent?.trim().slice(0, 200) || ""
        } : { found: false, text: null };
        const navEls = document.querySelectorAll('nav, [role="navigation"]');
        const navItems = [];
        navEls.forEach((nav, i) => {
          if (i >= 5)
            return;
          const links = nav.querySelectorAll("a");
          navItems.push({
            text: (nav.getAttribute("aria-label") || `nav-${i}`).slice(0, 50),
            links: links.length
          });
        });
        const activeNavItems = document.querySelectorAll('nav [aria-current], nav .active, nav .current, [role="navigation"] [aria-current], [role="navigation"] .active, [role="navigation"] .current');
        const youAreHere = Array.from(activeNavItems).slice(0, 5).map((el) => ({
          text: (el.textContent || "").trim().slice(0, 50),
          tag: el.tagName
        }));
        const searchEl = document.querySelector('input[type="search"], [role="search"], input[name*="search"], input[placeholder*="search" i], input[aria-label*="search" i]');
        const search = { found: !!searchEl };
        const breadcrumbEl = document.querySelector('[aria-label*="breadcrumb" i], .breadcrumb, .breadcrumbs, [class*="breadcrumb"]');
        const breadcrumbs = breadcrumbEl ? {
          found: true,
          items: Array.from(breadcrumbEl.querySelectorAll("a, span, li")).slice(0, 10).map((el) => (el.textContent || "").trim().slice(0, 30))
        } : { found: false, items: [] };
        const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).slice(0, HEADING_CAP).map((h) => ({
          tag: h.tagName,
          text: (h.textContent || "").trim().slice(0, 80),
          size: getComputedStyle(h).fontSize
        }));
        const interactiveEls = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex]')).slice(0, INTERACTIVE_CAP);
        const interactive = interactiveEls.map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: (el.textContent || el.placeholder || "").trim().slice(0, 50),
            type: el.type || null,
            role: el.getAttribute("role"),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            visible: rect.width > 0 && rect.height > 0
          };
        }).filter((el) => el.visible);
        const textBlocks = Array.from(document.querySelectorAll('p, [class*="description"], [class*="intro"], [class*="welcome"], [class*="hero"] p, main p')).slice(0, TEXT_BLOCK_CAP).map((el) => ({
          text: (el.textContent || "").trim().slice(0, 200),
          wordCount: (el.textContent || "").trim().split(/\s+/).filter(Boolean).length
        }));
        const bodyText = (document.body?.textContent || "").trim();
        const totalWords = bodyText.split(/\s+/).filter(Boolean).length;
        return {
          url: window.location.href,
          title: document.title,
          siteId,
          pageName,
          navigation: navItems,
          youAreHere,
          search,
          breadcrumbs,
          headings,
          interactive,
          textBlocks,
          totalWords
        };
      });
      return JSON.stringify(data, null, 2);
    }
    case "cdp": {
      const { handleCdpCommand: handleCdpCommand2 } = await Promise.resolve().then(() => (init_cdp_commands(), exports_cdp_commands));
      return await handleCdpCommand2(args, bm);
    }
    case "memory": {
      const { handleMemoryCommand: handleMemoryCommand2 } = await Promise.resolve().then(() => (init_memory_command(), exports_memory_command));
      return await handleMemoryCommand2(args, bm);
    }
    default:
      throw new Error(`Unknown meta command: ${command}`);
  }
}
var init_meta_commands = __esm(() => {
  init_snapshot();
  init_read_commands();
  init_commands();
  init_url_validation();
  init_path_security();
  init_screenshot_size_guard();
  init_path_security();
  init_file_permissions();
  init_platform();
  init_config();
});

// browse/src/security.ts
import * as fs9 from "fs";
import * as path8 from "path";
import * as os5 from "os";
function readSessionState() {
  try {
    if (!fs9.existsSync(STATE_FILE))
      return null;
    return JSON.parse(fs9.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}
function getStatus() {
  const state = readSessionState();
  const layers = state?.classifierStatus ?? {
    testsavant: "off",
    transcript: "off"
  };
  const canary = state?.canary ? "ok" : "off";
  let status;
  if (layers.testsavant === "ok" && layers.transcript === "ok" && canary === "ok") {
    status = "protected";
  } else if (layers.testsavant === "off" && canary === "off") {
    status = "inactive";
  } else {
    status = "degraded";
  }
  return {
    status,
    layers: { ...layers, canary },
    lastUpdated: state?.lastUpdated ?? new Date().toISOString()
  };
}
var SECURITY_DIR, ATTEMPTS_LOG, SALT_FILE, MAX_LOG_BYTES, STATE_FILE, DECISIONS_DIR;
var init_security = __esm(() => {
  init_file_permissions();
  SECURITY_DIR = path8.join(os5.homedir(), ".sriflow", "security");
  ATTEMPTS_LOG = path8.join(SECURITY_DIR, "attempts.jsonl");
  SALT_FILE = path8.join(SECURITY_DIR, "device-salt");
  MAX_LOG_BYTES = 10 * 1024 * 1024;
  STATE_FILE = path8.join(SECURITY_DIR, "session-state.json");
  DECISIONS_DIR = path8.join(SECURITY_DIR, "decisions");
});

// browse/src/sse-helpers.ts
function sanitizeReplacer(_key, value) {
  return typeof value === "string" ? stripLoneSurrogates(value) : value;
}
function createSseEndpoint(req, config) {
  const heartbeatMs = config.heartbeatMs ?? 15000;
  const encoder = new TextEncoder;
  const stream = new ReadableStream({
    start(controller) {
      let cleanedUp = false;
      let heartbeat = null;
      let unsubscribe = null;
      const cleanup = () => {
        if (cleanedUp)
          return;
        cleanedUp = true;
        if (heartbeat !== null) {
          clearInterval(heartbeat);
          heartbeat = null;
        }
        if (unsubscribe !== null) {
          unsubscribe();
          unsubscribe = null;
        }
        try {
          controller.close();
        } catch {}
      };
      const send = (event, data) => {
        if (cleanedUp)
          return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}
data: ${JSON.stringify(data, sanitizeReplacer)}

`));
        } catch {
          cleanup();
        }
      };
      if (config.initialReplay) {
        try {
          config.initialReplay(send);
        } catch {
          cleanup();
          return;
        }
        if (cleanedUp)
          return;
      }
      unsubscribe = config.subscribe((entry) => {
        send(config.liveEventName, entry);
      });
      heartbeat = setInterval(() => {
        if (cleanedUp)
          return;
        try {
          controller.enqueue(encoder.encode(`: heartbeat

`));
        } catch {
          cleanup();
        }
      }, heartbeatMs);
      req.signal.addEventListener("abort", cleanup);
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
var init_sse_helpers = __esm(() => {
  init_sanitize();
});

// browse/src/server.ts
import * as fs10 from "fs";
import * as net from "net";
import * as path9 from "path";
import * as crypto from "crypto";
function sanitizeLoneSurrogates(str) {
  return str.replace(/[\uD800-\uDFFF]/g, (match, offset) => {
    const code = match.charCodeAt(0);
    if (code >= 55296 && code <= 56319) {
      const next = str.charCodeAt(offset + 1);
      if (next >= 56320 && next <= 57343)
        return match;
    }
    if (code >= 56320 && code <= 57343) {
      const prev = str.charCodeAt(offset - 1);
      if (prev >= 55296 && prev <= 56319)
        return match;
    }
    return "\uFFFD";
  });
}
function sanitizeReplacer2(_key, value) {
  return typeof value === "string" ? sanitizeLoneSurrogates(value) : value;
}
function sanitizeAuthToken(raw) {
  if (!raw)
    return null;
  const stripped = raw.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, "");
  if (stripped.length < 16)
    return null;
  return stripped;
}
function resolveConfigFromEnv() {
  return {
    authToken: sanitizeAuthToken(process.env.AUTH_TOKEN) || crypto.randomUUID(),
    browsePort: parseInt(process.env.BROWSE_PORT || "0", 10),
    idleTimeoutMs: parseInt(process.env.BROWSE_IDLE_TIMEOUT || "1800000", 10),
    config: resolveConfig()
  };
}
function getTokenInfo(_req) {
  return { clientId: "root", scopes: ["*"], token: "" };
}
function generateHelpText() {
  const groups = new Map;
  for (const [cmd, meta] of Object.entries(COMMAND_DESCRIPTIONS)) {
    const display = meta.usage || cmd;
    const list = groups.get(meta.category) || [];
    list.push(display);
    groups.set(meta.category, list);
  }
  const categoryOrder = [
    "Navigation",
    "Reading",
    "Interaction",
    "Inspection",
    "Visual",
    "Snapshot",
    "Meta",
    "Tabs",
    "Server"
  ];
  const lines = ["sriflow browse \u2014 headless browser for AI agents", "", "Commands:"];
  for (const cat of categoryOrder) {
    const cmds = groups.get(cat);
    if (!cmds)
      continue;
    lines.push(`  ${(cat + ":").padEnd(15)}${cmds.join(", ")}`);
  }
  lines.push("");
  lines.push("Snapshot flags:");
  const flagPairs = [];
  for (const flag of SNAPSHOT_FLAGS) {
    const label = flag.valueHint ? `${flag.short} ${flag.valueHint}` : flag.short;
    flagPairs.push(`${label}  ${flag.long}`);
  }
  for (let i = 0;i < flagPairs.length; i += 2) {
    const left = flagPairs[i].padEnd(28);
    const right = flagPairs[i + 1] || "";
    lines.push(`  ${left}${right}`);
  }
  return lines.join(`
`);
}
function tmpStatePath() {
  return `${config.stateFile}.tmp.${process.pid}.${crypto.randomBytes(4).toString("hex")}`;
}
async function flushBuffers() {
  if (flushInProgress)
    return;
  flushInProgress = true;
  try {
    const newConsoleCount = consoleBuffer.totalAdded - lastConsoleFlushed;
    if (newConsoleCount > 0) {
      const entries = consoleBuffer.last(Math.min(newConsoleCount, consoleBuffer.length));
      const lines = entries.map((e) => `[${new Date(e.timestamp).toISOString()}] [${e.level}] ${e.text}`).join(`
`) + `
`;
      fs10.appendFileSync(CONSOLE_LOG_PATH, lines);
      lastConsoleFlushed = consoleBuffer.totalAdded;
    }
    const newNetworkCount = networkBuffer.totalAdded - lastNetworkFlushed;
    if (newNetworkCount > 0) {
      const entries = networkBuffer.last(Math.min(newNetworkCount, networkBuffer.length));
      const lines = entries.map((e) => `[${new Date(e.timestamp).toISOString()}] ${e.method} ${e.url} \u2192 ${e.status || "pending"} (${e.duration || "?"}ms, ${e.size || "?"}B)`).join(`
`) + `
`;
      fs10.appendFileSync(NETWORK_LOG_PATH, lines);
      lastNetworkFlushed = networkBuffer.totalAdded;
    }
    const newDialogCount = dialogBuffer.totalAdded - lastDialogFlushed;
    if (newDialogCount > 0) {
      const entries = dialogBuffer.last(Math.min(newDialogCount, dialogBuffer.length));
      const lines = entries.map((e) => `[${new Date(e.timestamp).toISOString()}] [${e.type}] "${e.message}" \u2192 ${e.action}${e.response ? ` "${e.response}"` : ""}`).join(`
`) + `
`;
      fs10.appendFileSync(DIALOG_LOG_PATH, lines);
      lastDialogFlushed = dialogBuffer.totalAdded;
    }
  } catch (err) {
    console.error("[browse] Buffer flush failed:", err.message);
  } finally {
    flushInProgress = false;
  }
}
function resetIdleTimer() {
  lastActivity = Date.now();
}
function idleCheckTick() {
  if (activeBrowserManager.getConnectionMode() === "headed")
    return;
  if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
    console.log(`[browse] Idle for ${IDLE_TIMEOUT_MS / 1000}s, shutting down`);
    activeShutdown?.();
  }
}
function isWriteInvocation(command, args) {
  return WRITE_COMMANDS.has(command) || hasOutArg(args);
}
function getInspectorSubscriberCount() {
  return inspectorSubscribers.size;
}
function emitInspectorEvent(event) {
  for (const notify of inspectorSubscribers) {
    queueMicrotask(() => {
      try {
        notify(event);
      } catch (err) {
        console.error("[browse] Inspector event subscriber threw:", err.message);
      }
    });
  }
}
function normalizePortError(err) {
  const maybeNodeError = err;
  return {
    available: false,
    code: maybeNodeError?.code,
    message: maybeNodeError?.message || String(err)
  };
}
function isOccupiedPort(result) {
  return result.code === "EADDRINUSE";
}
function formatPortFailureDetail(attempt) {
  const { code, message } = attempt.result;
  return code ? `${attempt.port} (${code}: ${message})` : `${attempt.port} (${message})`;
}
function formatExplicitPortUnavailableError(port, result) {
  if (isOccupiedPort(result)) {
    return new Error(`[browse] Port ${port} (from BROWSE_PORT env) is in use`);
  }
  const detail = result.code ? `${result.code}: ${result.message}` : result.message;
  return new Error(`[browse] Cannot bind BROWSE_PORT=${port} on 127.0.0.1 (${detail}). ` + `This usually means localhost port binding is blocked by the current sandbox or OS permissions, ` + `not that the port is occupied. Allow localhost binding, or run browse from an unrestricted terminal.`);
}
function formatRandomPortUnavailableError(attempts) {
  const blockingAttempts = attempts.filter((attempt) => !isOccupiedPort(attempt.result));
  if (blockingAttempts.length > 0) {
    const last = blockingAttempts[blockingAttempts.length - 1];
    return new Error(`[browse] Cannot bind localhost ports after ${attempts.length} attempts in range ` + `${RANDOM_PORT_MIN}-${RANDOM_PORT_MAX}. Last error: ${formatPortFailureDetail(last)}. ` + `This usually means the current sandbox or OS permissions are blocking localhost port binding, ` + `not that every sampled port is occupied. Allow localhost binding, set BROWSE_PORT to an approved ` + `port, or run browse from an unrestricted terminal.`);
  }
  return new Error(`[browse] No available port after ${RANDOM_PORT_RETRIES} attempts in range ` + `${RANDOM_PORT_MIN}-${RANDOM_PORT_MAX}; every sampled port was already in use`);
}
function checkPortAvailable(port, hostname = "127.0.0.1") {
  return new Promise((resolve9) => {
    const srv = net.createServer();
    let settled = false;
    const finish = (result) => {
      if (settled)
        return;
      settled = true;
      resolve9(result);
    };
    srv.once("error", (err) => finish(normalizePortError(err)));
    try {
      srv.listen(port, hostname, () => {
        srv.close(() => finish({ available: true }));
      });
    } catch (err) {
      finish(normalizePortError(err));
    }
  });
}
async function findPort() {
  if (BROWSE_PORT) {
    const result = await checkPortAvailable(BROWSE_PORT);
    if (result.available) {
      return BROWSE_PORT;
    }
    throw formatExplicitPortUnavailableError(BROWSE_PORT, result);
  }
  const attempts = [];
  for (let attempt = 0;attempt < RANDOM_PORT_RETRIES; attempt++) {
    const port = RANDOM_PORT_MIN + Math.floor(Math.random() * (RANDOM_PORT_MAX - RANDOM_PORT_MIN));
    const result = await checkPortAvailable(port);
    if (result.available) {
      return port;
    }
    attempts.push({ port, result });
  }
  throw formatRandomPortUnavailableError(attempts);
}
function wrapError(err) {
  const msg = err.message || String(err);
  if (err.name === "TimeoutError" || msg.includes("Timeout") || msg.includes("timeout")) {
    if (msg.includes("locator.click") || msg.includes("locator.fill") || msg.includes("locator.hover")) {
      return `Element not found or not interactable within timeout. Check your selector or run 'snapshot' for fresh refs.`;
    }
    if (msg.includes("page.goto") || msg.includes("Navigation")) {
      return `Page navigation timed out. The URL may be unreachable or the page may be loading slowly.`;
    }
    return `Operation timed out: ${msg.split(`
`)[0]}`;
  }
  if (msg.includes("resolved to") && msg.includes("elements")) {
    return `Selector matched multiple elements. Be more specific or use @refs from 'snapshot'.`;
  }
  return msg;
}
async function handleCommandInternalImpl(body, tokenInfo, opts) {
  const { args = [], tabId } = body;
  const rawCommand = body.command;
  if (!rawCommand) {
    return { status: 400, result: JSON.stringify({ error: 'Missing "command" field' }), json: true };
  }
  const command = canonicalizeCommand(rawCommand);
  const isAliased = command !== rawCommand;
  if (command === "chain" && (opts?.chainDepth ?? 0) > 0) {
    return { status: 400, result: JSON.stringify({ error: "Nested chain commands are not allowed" }), json: true };
  }
  let savedTabId = null;
  if (tabId !== undefined && tabId !== null) {
    savedTabId = browserManager.getActiveTabId();
    try {
      browserManager.switchTab(tabId, { bringToFront: false });
    } catch (err) {
      console.warn("[browse] Failed to pin tab", tabId, ":", err.message);
    }
  }
  if (command !== "newtab" && tokenInfo && tokenInfo.clientId !== "root" && tokenInfo.tabPolicy === "own-only") {
    const targetTab = tabId ?? browserManager.getActiveTabId();
    if (!browserManager.checkTabAccess(targetTab, tokenInfo.clientId, { isWrite: isWriteInvocation(command, args), ownOnly: true })) {
      return {
        status: 403,
        json: true,
        result: JSON.stringify({
          error: "Tab not owned by your agent. Use newtab to create your own tab.",
          hint: `Tab ${targetTab} is owned by ${browserManager.getTabOwner(targetTab) || "root"}. Your agent: ${tokenInfo.clientId}.`
        })
      };
    }
  }
  if (command === "newtab" && tokenInfo && tokenInfo.clientId !== "root") {
    const newId = await browserManager.newTab(args[0] || undefined, tokenInfo.clientId);
    return {
      status: 200,
      json: true,
      result: JSON.stringify({
        tabId: newId,
        owner: tokenInfo.clientId,
        hint: 'Include "tabId": ' + newId + " in subsequent commands to target this tab."
      })
    };
  }
  if (browserManager.isWatching() && isWriteInvocation(command, args)) {
    return {
      status: 400,
      json: true,
      result: JSON.stringify({ error: "Cannot run mutation commands while watching. Run `$B watch stop` first." })
    };
  }
  const startTime = Date.now();
  if (!opts?.skipActivity) {
    emitActivity({
      type: "command_start",
      command,
      args,
      url: browserManager.getCurrentUrl(),
      tabs: browserManager.getTabCount(),
      mode: browserManager.getConnectionMode(),
      clientId: tokenInfo?.clientId
    });
  }
  try {
    let result;
    const session = browserManager.getActiveSession();
    let hiddenContentWarnings = [];
    if (READ_COMMANDS.has(command)) {
      const isScoped = tokenInfo && tokenInfo.clientId !== "root";
      if (isScoped && DOM_CONTENT_COMMANDS.has(command)) {
        const page = session.getPage();
        try {
          const strippedDescs = await markHiddenElements(page);
          if (strippedDescs.length > 0) {
            console.warn(`[browse] Content security: ${strippedDescs.length} hidden elements flagged on ${command} for ${tokenInfo.clientId}`);
            hiddenContentWarnings = strippedDescs.slice(0, 8).map((d) => `hidden content: ${d.slice(0, 120)}`);
            if (strippedDescs.length > 8) {
              hiddenContentWarnings.push(`hidden content: +${strippedDescs.length - 8} more flagged elements`);
            }
          }
          if (command === "text") {
            const target = session.getActiveFrameOrPage();
            result = await getCleanTextWithStripping(target);
          } else {
            result = await handleReadCommand(command, args, session, browserManager);
          }
        } finally {
          await cleanupHiddenMarkers(page);
        }
      } else {
        result = await handleReadCommand(command, args, session, browserManager);
      }
    } else if (WRITE_COMMANDS.has(command)) {
      result = await handleWriteCommand(command, args, session, browserManager);
    } else if (META_COMMANDS.has(command)) {
      const chainDepth = opts?.chainDepth ?? 0;
      const shutdownFn = () => activeShutdown ? activeShutdown() : Promise.resolve();
      result = await handleMetaCommand(command, args, browserManager, shutdownFn, tokenInfo, {
        chainDepth,
        daemonPort: LOCAL_LISTEN_PORT,
        executeCommand: (body2, ti) => handleCommandInternal(body2, ti, {
          skipRateCheck: true,
          skipActivity: true,
          chainDepth: chainDepth + 1
        })
      });
      if (command === "watch" && args[0] !== "stop" && browserManager.isWatching()) {
        const watchInterval = setInterval(async () => {
          if (!browserManager.isWatching()) {
            clearInterval(watchInterval);
            return;
          }
          try {
            const snapshot = await handleSnapshot(["-i"], browserManager.getActiveSession());
            browserManager.addWatchSnapshot(snapshot);
          } catch {}
        }, 5000);
        browserManager.watchInterval = watchInterval;
      }
    } else if (command === "help") {
      const helpText = generateHelpText();
      return { status: 200, result: helpText };
    } else {
      return {
        status: 400,
        json: true,
        result: JSON.stringify({
          error: buildUnknownCommandError(rawCommand, ALL_COMMANDS),
          hint: `Available commands: ${[...READ_COMMANDS, ...WRITE_COMMANDS, ...META_COMMANDS].sort().join(", ")}`
        })
      };
    }
    if (PAGE_CONTENT_COMMANDS.has(command) && command !== "chain") {
      const isScoped = tokenInfo && tokenInfo.clientId !== "root";
      if (isScoped) {
        const filterResult = runContentFilters(result, browserManager.getCurrentUrl(), command);
        if (filterResult.blocked) {
          return { status: 403, json: true, result: JSON.stringify({ error: filterResult.message }) };
        }
        if (command === "text") {
          result = datamarkContent(result);
        }
        const combinedWarnings = [...filterResult.warnings, ...hiddenContentWarnings];
        result = wrapUntrustedPageContent(result, command, combinedWarnings.length > 0 ? combinedWarnings : undefined);
      } else {
        result = wrapUntrustedContent(result, browserManager.getCurrentUrl());
      }
    }
    const successDuration = Date.now() - startTime;
    if (!opts?.skipActivity) {
      emitActivity({
        type: "command_end",
        command,
        args,
        url: browserManager.getCurrentUrl(),
        duration: successDuration,
        status: "ok",
        result,
        tabs: browserManager.getTabCount(),
        mode: browserManager.getConnectionMode(),
        clientId: tokenInfo?.clientId
      });
    }
    browserManager.resetFailures();
    if (savedTabId !== null) {
      try {
        browserManager.switchTab(savedTabId, { bringToFront: false });
      } catch (restoreErr) {
        console.warn("[browse] Failed to restore tab after command:", restoreErr.message);
      }
    }
    return { status: 200, result };
  } catch (err) {
    if (savedTabId !== null) {
      try {
        browserManager.switchTab(savedTabId, { bringToFront: false });
      } catch (restoreErr) {
        console.warn("[browse] Failed to restore tab after error:", restoreErr.message);
      }
    }
    const errorDuration = Date.now() - startTime;
    if (!opts?.skipActivity) {
      emitActivity({
        type: "command_end",
        command,
        args,
        url: browserManager.getCurrentUrl(),
        duration: errorDuration,
        status: "error",
        error: err.message,
        tabs: browserManager.getTabCount(),
        mode: browserManager.getConnectionMode(),
        clientId: tokenInfo?.clientId
      });
    }
    browserManager.incrementFailures();
    let errorMsg = wrapError(err);
    const hint = browserManager.getFailureHint();
    if (hint)
      errorMsg += `
` + hint;
    return { status: 500, result: JSON.stringify({ error: errorMsg }), json: true };
  }
}
async function handleCommandInternal(body, tokenInfo, opts) {
  const cr = await handleCommandInternalImpl(body, tokenInfo, opts);
  return { ...cr, result: sanitizeLoneSurrogates(cr.result) };
}
function buildCommandResponse(cr) {
  const contentType = cr.json ? "application/json" : "text/plain";
  const safeBody = typeof cr.result === "string" ? sanitizeBody(cr.result, !!cr.json) : cr.result;
  return new Response(safeBody, {
    status: cr.status,
    headers: { "Content-Type": contentType, ...cr.headers }
  });
}
async function handleCommand(body, tokenInfo) {
  const cr = await handleCommandInternal(body, tokenInfo);
  return buildCommandResponse(cr);
}
function emergencyCleanup() {
  if (isShuttingDown)
    return;
  isShuttingDown = true;
  try {
    if (fs10.existsSync(config.stateFile)) {
      const raw = fs10.readFileSync(config.stateFile, "utf-8");
      const state = JSON.parse(raw);
      if (state.xvfbPid && state.xvfbStartTime) {
        try {
          const { cleanupXvfb } = (()=>{throw new Error("Cannot require module "+"./xvfb");})();
          cleanupXvfb({
            pid: state.xvfbPid,
            startTime: state.xvfbStartTime,
            display: state.xvfbDisplay || ":99"
          });
        } catch {}
      }
    }
  } catch {}
  cleanSingletonLocks(resolveChromiumProfile());
  safeUnlinkQuiet(config.stateFile);
}
function buildFetchHandler(cfg) {
  if (!cfg.authToken || cfg.authToken.length < 16) {
    throw new Error("buildFetchHandler: cfg.authToken must be a non-empty string >= 16 chars");
  }
  if (!cfg.browserManager) {
    throw new Error("buildFetchHandler: cfg.browserManager is required");
  }
  ensureStateDir(cfg.config);
  const { authToken, browserManager: cfgBrowserManager, startTime, beforeRoute, browsePort } = cfg;
  function validateAuth(_req) {
    return true;
  }
  async function shutdown(exitCode = 0) {
    if (isShuttingDown)
      return;
    isShuttingDown = true;
    console.log("[browse] Shutting down...");
    try {
      detachSession();
    } catch (err) {
      console.warn("[browse] Failed to detach CDP session:", err.message);
    }
    inspectorSubscribers.clear();
    if (cfgBrowserManager.isWatching())
      cfgBrowserManager.stopWatch();
    clearInterval(flushInterval);
    clearInterval(idleCheckInterval);
    await flushBuffers();
    await cfgBrowserManager.close();
    cleanSingletonLocks(resolveChromiumProfile());
    safeUnlinkQuiet(config.stateFile);
    process.exit(exitCode);
  }
  async function stopListeners(local, tunnel) {
    try {
      if (local?.stop)
        local.stop(true);
    } catch (err) {
      console.warn("[browse] local listener stop failed:", err?.message || err);
    }
    try {
      if (tunnel?.stop)
        tunnel.stop(true);
    } catch (err) {
      console.warn("[browse] tunnel listener stop failed:", err?.message || err);
    }
  }
  activeShutdown = shutdown;
  activeBrowserManager = cfgBrowserManager;
  const callerOnDisconnect = cfgBrowserManager.onDisconnect;
  cfgBrowserManager.onDisconnect = async (code) => {
    if (callerOnDisconnect) {
      try {
        await callerOnDisconnect(code);
      } catch (err) {
        console.warn("[browse] caller onDisconnect threw:", err?.message ?? err);
      }
    }
    await activeShutdown?.(code ?? 2);
  };
  const browserManager2 = cfgBrowserManager;
  const makeFetchHandler = (surface) => async (req) => {
    const url = new URL(req.url);
    if (beforeRoute) {
      const overlayResp = await beforeRoute(req, surface, null);
      if (overlayResp)
        return overlayResp;
    }
    if (url.pathname === "/connect" && req.method === "GET") {
      return new Response(JSON.stringify({ alive: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/welcome") {
      const welcomePath = (() => {
        const rawSlug = process.env.SRIFLOW_SLUG || "unknown";
        const slug = /^[a-z0-9_-]+$/.test(rawSlug) ? rawSlug : "unknown";
        const homeDir = process.env.HOME || process.env.USERPROFILE || "/tmp";
        const projectWelcome = `${homeDir}/.sriflow/projects/${slug}/designs/welcome-page-20260331/finalized.html`;
        if (fs10.existsSync(projectWelcome))
          return projectWelcome;
        const rawSkillRoot = process.env.SRIFLOW_SKILL_ROOT || `${homeDir}/.claude/skills/sriflow`;
        if (rawSkillRoot.includes(".."))
          return null;
        const builtinWelcome = `${rawSkillRoot}/browse/src/welcome.html`;
        if (fs10.existsSync(builtinWelcome))
          return builtinWelcome;
        return null;
      })();
      if (welcomePath) {
        try {
          const html = __require("fs").readFileSync(welcomePath, "utf-8");
          return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
        } catch (err) {
          console.error("[browse] Failed to read welcome page:", welcomePath, err.message);
        }
      }
      return new Response(`<!DOCTYPE html><html><head><title>SriFlow Browser</title>
          <style>body{background:#111;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
          .msg{text-align:center;opacity:.7;}.gold{color:#f5a623;font-size:2em;margin-bottom:12px;}</style></head>
          <body><div class="msg"><div class="gold">\u25C8</div><p>SriFlow Browser ready.</p><p style="font-size:.85em">Waiting for commands from Claude Code.</p></div></body></html>`, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/health") {
      const healthy = await browserManager2.isHealthy();
      return new Response(JSON.stringify({
        status: healthy ? "healthy" : "unhealthy",
        mode: browserManager2.getConnectionMode(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        tabs: browserManager2.getTabCount(),
        ...browserManager2.getConnectionMode() === "headed" || req.headers.get("origin")?.startsWith("chrome-extension://") ? { token: authToken } : {},
        chatEnabled: false,
        security: getStatus()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/refs") {
      if (!validateAuth(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const refs = browserManager2.getRefMap();
      return new Response(JSON.stringify({
        refs,
        url: browserManager2.getCurrentUrl(),
        mode: browserManager2.getConnectionMode()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/activity/stream") {
      const cookieToken = extractSseCookie(req);
      if (!validateAuth(req) && !validateSseSessionToken(cookieToken)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const afterId = parseInt(url.searchParams.get("after") || "0", 10);
      return createSseEndpoint(req, {
        initialReplay: (send) => {
          const { entries, gap, gapFrom, availableFrom } = getActivityAfter(afterId);
          if (gap)
            send("gap", { gapFrom, availableFrom });
          for (const entry of entries)
            send("activity", entry);
        },
        subscribe,
        liveEventName: "activity"
      });
    }
    if (url.pathname === "/activity/history") {
      if (!validateAuth(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const limit = parseInt(url.searchParams.get("limit") || "50", 10);
      const { entries, totalAdded } = getActivityHistory(limit);
      return new Response(JSON.stringify({ entries, totalAdded, subscribers: getSubscriberCount() }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/batch" && req.method === "POST") {
      const tokenInfo = getTokenInfo(req);
      if (!tokenInfo) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      resetIdleTimer();
      const body = await req.json();
      const { commands } = body;
      if (!Array.isArray(commands) || commands.length === 0) {
        return new Response(JSON.stringify({ error: '"commands" must be a non-empty array' }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (commands.length > 50) {
        return new Response(JSON.stringify({ error: "Max 50 commands per batch" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const startTime2 = Date.now();
      emitActivity({
        type: "command_start",
        command: "batch",
        args: [`${commands.length} commands`],
        url: browserManager2.getCurrentUrl(),
        tabs: browserManager2.getTabCount(),
        mode: browserManager2.getConnectionMode(),
        clientId: tokenInfo?.clientId
      });
      const results = [];
      for (let i = 0;i < commands.length; i++) {
        const cmd = commands[i];
        if (!cmd || typeof cmd.command !== "string") {
          results.push({ index: i, status: 400, result: JSON.stringify({ error: 'Missing "command" field' }), command: "" });
          continue;
        }
        if (cmd.command === "batch") {
          results.push({ index: i, status: 400, result: JSON.stringify({ error: "Nested batch commands are not allowed" }), command: "batch" });
          continue;
        }
        const cr = await handleCommandInternal({ command: cmd.command, args: cmd.args, tabId: cmd.tabId }, tokenInfo, { skipRateCheck: true, skipActivity: true });
        const safeResult = typeof cr.result === "string" ? sanitizeBody(cr.result, !!cr.json) : cr.result;
        results.push({
          index: i,
          status: cr.status,
          result: safeResult,
          command: cmd.command,
          tabId: cmd.tabId
        });
      }
      const duration = Date.now() - startTime2;
      emitActivity({
        type: "command_end",
        command: "batch",
        args: [`${commands.length} commands`],
        url: browserManager2.getCurrentUrl(),
        duration,
        status: "ok",
        result: `${results.filter((r) => r.status === 200).length}/${commands.length} succeeded`,
        tabs: browserManager2.getTabCount(),
        mode: browserManager2.getConnectionMode(),
        clientId: tokenInfo?.clientId
      });
      const batchBody = stripLoneSurrogateEscapes(JSON.stringify({
        results,
        duration,
        total: commands.length,
        succeeded: results.filter((r) => r.status === 200).length,
        failed: results.filter((r) => r.status !== 200).length
      }));
      return new Response(batchBody, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/file" && req.method === "GET") {
      const tokenInfo = getTokenInfo(req);
      if (!tokenInfo) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const filePath = url.searchParams.get("path");
      if (!filePath) {
        return new Response(JSON.stringify({ error: 'Missing "path" query parameter' }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        validateTempPath(filePath);
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!fs10.existsSync(filePath)) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const stat = fs10.statSync(filePath);
      if (stat.size > 200 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "File too large (max 200MB)" }), {
          status: 413,
          headers: { "Content-Type": "application/json" }
        });
      }
      const ext = path9.extname(filePath).toLowerCase();
      const MIME_MAP = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".avif": "image/avif",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".pdf": "application/pdf",
        ".json": "application/json",
        ".html": "text/html",
        ".txt": "text/plain",
        ".mhtml": "message/rfc822"
      };
      const contentType = MIME_MAP[ext] || "application/octet-stream";
      resetIdleTimer();
      return new Response(Bun.file(filePath), {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(stat.size),
          "Content-Disposition": `inline; filename="${path9.basename(filePath)}"`,
          "Cache-Control": "no-cache"
        }
      });
    }
    if (url.pathname === "/command" && req.method === "POST") {
      const tokenInfo = getTokenInfo(req);
      if (!tokenInfo) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      resetIdleTimer();
      const body = await req.json();
      return handleCommand(body, tokenInfo);
    }
    if (!validateAuth(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/inspector/pick" && req.method === "POST") {
      const body = await req.json();
      const { selector, activeTabUrl } = body;
      if (!selector) {
        return new Response(JSON.stringify({ error: "Missing selector" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const page = browserManager2.getPage();
        const result = await inspectElement(page, selector);
        inspectorData = result;
        inspectorTimestamp = Date.now();
        browserManager2._inspectorData = result;
        browserManager2._inspectorTimestamp = inspectorTimestamp;
        emitInspectorEvent({ type: "pick", selector, timestamp: inspectorTimestamp });
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/inspector" && req.method === "GET") {
      if (!inspectorData) {
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const stale = inspectorTimestamp > 0 && Date.now() - inspectorTimestamp > 60000;
      return new Response(JSON.stringify({ data: inspectorData, timestamp: inspectorTimestamp, stale }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/inspector/apply" && req.method === "POST") {
      const body = await req.json();
      const { selector, property, value } = body;
      if (!selector || !property || value === undefined) {
        return new Response(JSON.stringify({ error: "Missing selector, property, or value" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const page = browserManager2.getPage();
        const mod = await modifyStyle(page, selector, property, value);
        emitInspectorEvent({ type: "apply", modification: mod, timestamp: Date.now() });
        return new Response(JSON.stringify(mod), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/inspector/reset" && req.method === "POST") {
      try {
        const page = browserManager2.getPage();
        await resetModifications(page);
        emitInspectorEvent({ type: "reset", timestamp: Date.now() });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (url.pathname === "/inspector/history" && req.method === "GET") {
      return new Response(JSON.stringify({ history: getModificationHistory() }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/memory" && req.method === "GET") {
      const cookieToken = extractSseCookie(req);
      if (!validateAuth(req) && !validateSseSessionToken(cookieToken)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { buildMemorySnapshotJson: buildMemorySnapshotJson2 } = await Promise.resolve().then(() => (init_memory_command(), exports_memory_command));
      const snapshot = await buildMemorySnapshotJson2(cfgBrowserManager);
      return new Response(JSON.stringify(snapshot, sanitizeReplacer2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/inspector/events" && req.method === "GET") {
      const cookieToken = extractSseCookie(req);
      if (!validateAuth(req) && !validateSseSessionToken(cookieToken)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      return createSseEndpoint(req, {
        initialReplay: inspectorData ? (send) => send("state", { data: inspectorData, timestamp: inspectorTimestamp }) : undefined,
        subscribe: (notify) => {
          inspectorSubscribers.add(notify);
          return () => inspectorSubscribers.delete(notify);
        },
        liveEventName: "inspector"
      });
    }
    return new Response("Not found", { status: 404 });
  };
  return {
    fetchLocal: makeFetchHandler("local"),
    shutdown,
    stopListeners
  };
}
async function start() {
  safeUnlink(CONSOLE_LOG_PATH);
  safeUnlink(NETWORK_LOG_PATH);
  safeUnlink(DIALOG_LOG_PATH);
  const port = await findPort();
  LOCAL_LISTEN_PORT = port;
  const envCfg = resolveConfigFromEnv();
  const skipBrowser = process.env.BROWSE_HEADLESS_SKIP === "1";
  if (!skipBrowser) {
    const headed = process.env.BROWSE_HEADED === "1";
    if (headed) {
      await browserManager.launchHeaded(envCfg.authToken);
      console.log(`[browse] Launched headed Chromium with extension`);
    } else {
      await browserManager.launch();
    }
  }
  const startTime = Date.now();
  const handle = buildFetchHandler({
    ...envCfg,
    browsePort: port,
    browserManager,
    startTime
  });
  const server = Bun.serve({
    port,
    hostname: "127.0.0.1",
    fetch: handle.fetchLocal
  });
  const state = {
    pid: process.pid,
    port,
    token: envCfg.authToken,
    startedAt: new Date().toISOString(),
    serverPath: path9.resolve(import.meta.dir, "server.ts"),
    binaryVersion: readVersionHash() || undefined,
    mode: browserManager.getConnectionMode()
  };
  const tmpFile = tmpStatePath();
  fs10.writeFileSync(tmpFile, JSON.stringify(state, null, 2), { mode: 384 });
  fs10.renameSync(tmpFile, config.stateFile);
  browserManager.serverPort = port;
  if (browserManager.getConnectionMode() === "headed") {
    try {
      const currentUrl = browserManager.getCurrentUrl();
      if (currentUrl === "about:blank" || currentUrl === "") {
        const page = browserManager.getPage();
        page.goto(`http://127.0.0.1:${port}/welcome`, { timeout: 3000 }).catch((err) => {
          console.warn("[browse] Failed to navigate to welcome page:", err.message);
        });
      }
    } catch (err) {
      console.warn("[browse] Welcome page navigation setup failed:", err.message);
    }
  }
  try {
    const stateDir = path9.join(config.stateDir, "browse-states");
    if (fs10.existsSync(stateDir)) {
      const SEVEN_DAYS = 604800000;
      for (const file of fs10.readdirSync(stateDir)) {
        const filePath = path9.join(stateDir, file);
        const stat = fs10.statSync(filePath);
        if (Date.now() - stat.mtimeMs > SEVEN_DAYS) {
          fs10.unlinkSync(filePath);
          console.log(`[browse] Deleted stale state file: ${file}`);
        }
      }
    }
  } catch (err) {
    console.warn("[browse] Failed to clean stale state files:", err.message);
  }
  console.log(`[browse] Server running on http://127.0.0.1:${port} (PID: ${process.pid})`);
  console.log(`[browse] State file: ${config.stateFile}`);
  console.log(`[browse] Idle timeout: ${IDLE_TIMEOUT_MS / 1000}s`);
}
var config, activeShutdown = null, BROWSE_PORT, IDLE_TIMEOUT_MS, LOCAL_LISTEN_PORT = 0, CONSOLE_LOG_PATH, NETWORK_LOG_PATH, DIALOG_LOG_PATH, lastConsoleFlushed = 0, lastNetworkFlushed = 0, lastDialogFlushed = 0, flushInProgress = false, flushInterval, lastActivity, idleCheckInterval, __testInternals__, BROWSE_PARENT_PID, IS_HEADED_WATCHDOG, inspectorData = null, inspectorTimestamp = 0, inspectorSubscribers, browserManager, activeBrowserManager, isShuttingDown = false, RANDOM_PORT_MIN = 1e4, RANDOM_PORT_MAX = 60000, RANDOM_PORT_RETRIES = 5;
var init_server = __esm(() => {
  init_browser_manager();
  init_read_commands();
  init_write_commands();
  init_meta_commands();
  init_commands();
  init_content_security();
  init_security();
  init_file_permissions();
  init_snapshot();
  init_path_security();
  init_config();
  init_activity();
  init_sse_helpers();
  init_cdp_inspector();
  init_error_handling();
  init_sanitize();
  init_buffers();
  init_commands();
  config = resolveConfig();
  ensureStateDir(config);
  BROWSE_PORT = parseInt(process.env.BROWSE_PORT || "0", 10);
  IDLE_TIMEOUT_MS = parseInt(process.env.BROWSE_IDLE_TIMEOUT || "1800000", 10);
  CONSOLE_LOG_PATH = config.consoleLog;
  NETWORK_LOG_PATH = config.networkLog;
  DIALOG_LOG_PATH = config.dialogLog;
  flushInterval = setInterval(flushBuffers, 1000);
  lastActivity = Date.now();
  idleCheckInterval = setInterval(idleCheckTick, 60000);
  __testInternals__ = {
    idleCheckTick,
    setLastActivity: (t) => {
      lastActivity = t;
    },
    formatExplicitPortUnavailableError,
    formatRandomPortUnavailableError,
    resetShutdownState: () => {
      isShuttingDown = false;
    }
  };
  BROWSE_PARENT_PID = parseInt(process.env.BROWSE_PARENT_PID || "0", 10);
  IS_HEADED_WATCHDOG = process.env.BROWSE_HEADED === "1";
  if (BROWSE_PARENT_PID > 0 && !IS_HEADED_WATCHDOG) {
    let parentGone = false;
    setInterval(() => {
      try {
        process.kill(BROWSE_PARENT_PID, 0);
      } catch {
        const headed = activeBrowserManager.getConnectionMode() === "headed";
        if (headed) {
          console.log(`[browse] Parent process ${BROWSE_PARENT_PID} exited in ${headed ? "headed" : "tunnel"} mode, shutting down`);
          activeShutdown?.();
        } else if (!parentGone) {
          parentGone = true;
          console.log(`[browse] Parent process ${BROWSE_PARENT_PID} exited (server stays alive, idle timeout will clean up)`);
        }
      }
    }, 15000);
  } else if (IS_HEADED_WATCHDOG) {
    console.log("[browse] Parent-process watchdog disabled (headed mode)");
  } else if (BROWSE_PARENT_PID === 0) {
    console.log("[browse] Parent-process watchdog disabled (BROWSE_PARENT_PID=0)");
  }
  inspectorSubscribers = new Set;
  browserManager = new BrowserManager;
  activeBrowserManager = browserManager;
  browserManager.onDisconnect = (code) => activeShutdown?.(code ?? 2);
  if (import.meta.main) {
    process.on("SIGINT", () => activeShutdown?.());
    process.on("SIGTERM", () => {
      const headed = activeBrowserManager.getConnectionMode() === "headed";
      if (headed) {
        console.log(`[browse] Received SIGTERM in headed mode, shutting down`);
        activeShutdown?.();
      } else {
        console.log("[browse] Received SIGTERM (ignoring \u2014 use /stop or Ctrl+C for intentional shutdown)");
      }
    });
    if (process.platform === "win32") {
      process.on("exit", () => {
        safeUnlinkQuiet(config.stateFile);
      });
    }
  }
  if (import.meta.main) {
    process.on("uncaughtException", (err) => {
      console.error("[browse] FATAL uncaught exception:", err.message);
      emergencyCleanup();
      process.exit(1);
    });
    process.on("unhandledRejection", (err) => {
      console.error("[browse] FATAL unhandled rejection:", err?.message || err);
      emergencyCleanup();
      process.exit(1);
    });
  }
  if (import.meta.main) {
    start().catch((err) => {
      console.error(`[browse] Failed to start: ${err.message}`);
      try {
        const errorLogPath = path9.join(config.stateDir, "browse-startup-error.log");
        mkdirSecure(config.stateDir);
        writeSecureFile(errorLogPath, `${new Date().toISOString()} ${err.message}
${err.stack || ""}
`);
      } catch {}
      process.exit(1);
    });
  }
});
init_server();

export {
  start,
  resolveConfigFromEnv,
  networkBuffer,
  getInspectorSubscriberCount,
  dialogBuffer,
  consoleBuffer,
  buildFetchHandler,
  buildCommandResponse,
  addNetworkEntry,
  addDialogEntry,
  addConsoleEntry,
  __testInternals__,
  WRITE_COMMANDS,
  READ_COMMANDS,
  META_COMMANDS
};

//# debugId=679D60BD9CC6F01064756E2164756E21
