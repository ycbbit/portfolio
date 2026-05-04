/**
 * Connect-compatible API middleware for Vite dev server.
 * Handles /api/* routes without Express dependency.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "shared", "data");
const PASSWORD_FILE = path.join(DATA_DIR, ".admin-password");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _password: string | null = null;

function ensurePassword(): string {
  if (_password) return _password;
  if (process.env.ADMIN_PASSWORD) {
    _password = process.env.ADMIN_PASSWORD;
    return _password;
  }
  try {
    _password = fs.readFileSync(PASSWORD_FILE, "utf-8").trim();
    if (_password) return _password;
  } catch {}
  _password =
    "admin-" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6);
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  fs.writeFileSync(PASSWORD_FILE, _password, "utf-8");
  console.log(`\n  🔑 Admin password: ${_password}\n`);
  return _password;
}

function checkAuth(req: IncomingMessage): boolean {
  const auth = req.headers["authorization"];
  if (!auth) return false;
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === ensurePassword();
}

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson(filename: string, data: unknown): void {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

function parseBody(req: IncomingMessage = undefined as unknown as IncomingMessage): Promise<unknown> {
  if (!req) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Simple URL router
// ---------------------------------------------------------------------------

type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>,
) => Promise<void>;

type Route = {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
};

const routes: Route[] = [];

function addRoute(method: string, pattern: RegExp, paramNames: string[], handler: Handler) {
  routes.push({ method, pattern, paramNames, handler });
}

// Auth check
addRoute("POST", /^\/api\/auth$/, [], async (req, res) => {
  const body = (await parseBody(req)) as Record<string, unknown> | null;
  const pw = typeof body?.password === "string" ? body.password : "";
  if (pw === ensurePassword()) {
    sendJson(res, 200, { token: pw });
  } else {
    sendJson(res, 401, { error: "Invalid password" });
  }
});

// Site
addRoute("GET", /^\/api\/site$/, [], async (_req, res) => {
  try { sendJson(res, 200, readJson("site.json")); }
  catch (e) { sendJson(res, 500, { error: String(e) }); }
});

addRoute("PUT", /^\/api\/site$/, [], async (req, res) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const data = await parseBody(req);
    writeJson("site.json", data);
    sendJson(res, 200, { success: true, data });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

// Profile
addRoute("GET", /^\/api\/profile$/, [], async (_req, res) => {
  try { sendJson(res, 200, readJson("profile.json")); }
  catch (e) { sendJson(res, 500, { error: String(e) }); }
});

addRoute("PUT", /^\/api\/profile$/, [], async (req, res) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const data = await parseBody(req);
    writeJson("profile.json", data);
    sendJson(res, 200, { success: true, data });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

// Projects
addRoute("GET", /^\/api\/projects$/, [], async (_req, res) => {
  try { sendJson(res, 200, readJson("projects.json")); }
  catch (e) { sendJson(res, 500, { error: String(e) }); }
});

addRoute("POST", /^\/api\/projects$/, [], async (req, res) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const data = await parseBody();
    const projects = readJson<any[]>("projects.json");
    projects.push(data);
    writeJson("projects.json", projects);
    sendJson(res, 200, { success: true, data });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

addRoute("PUT", /^\/api\/projects\/([^/]+)$/, ["id"], async (req, res, params) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const data = await parseBody();
    const projects = readJson<any[]>("projects.json");
    const idx = projects.findIndex((p: any) => p.id === params.id);
    if (idx === -1) { sendJson(res, 404, { error: "Project not found" }); return; }
    projects[idx] = { ...projects[idx], ...(data as Record<string, unknown>), id: params.id };
    writeJson("projects.json", projects);
    sendJson(res, 200, { success: true, data: projects[idx] });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

addRoute("DELETE", /^\/api\/projects\/([^/]+)$/, ["id"], async (req, res, params) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const projects = readJson<any[]>("projects.json");
    const filtered = projects.filter((p: any) => p.id !== params.id);
    if (filtered.length === projects.length) {
      sendJson(res, 404, { error: "Project not found" }); return;
    }
    writeJson("projects.json", filtered);
    sendJson(res, 200, { success: true });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

// Skills
addRoute("GET", /^\/api\/skills$/, [], async (_req, res) => {
  try { sendJson(res, 200, readJson("skills.json")); }
  catch (e) { sendJson(res, 500, { error: String(e) }); }
});

addRoute("PUT", /^\/api\/skills$/, [], async (req, res) => {
  if (!checkAuth(req)) { sendJson(res, 401, { error: "Unauthorized" }); return; }
  try {
    const data = await parseBody(req);
    if (!Array.isArray(data)) throw new Error("Skills data must be an array");
    writeJson("skills.json", data);
    sendJson(res, 200, { success: true, data });
  } catch (e) { sendJson(res, 400, { error: String(e) }); }
});

// ---------------------------------------------------------------------------
// Export connect-compatible middleware
// ---------------------------------------------------------------------------

export function devApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  const url = req.url || "";
  const method = req.method || "GET";

  // Only handle /api/* routes
  if (!url.startsWith("/api")) {
    next();
    return;
  }

  // Match against registered routes
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = url.match(route.pattern);
    if (!match) continue;

    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });

    route.handler(req, res, params).catch((e) => {
      console.error("API error:", e);
      sendJson(res, 500, { error: String(e) });
    });
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}
