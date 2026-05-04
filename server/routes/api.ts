import type { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "..", "shared", "data");

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

const PASSWORD_FILE = path.join(DATA_DIR, ".admin-password");

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
  } catch { /* file doesn't exist yet */ }
  _password =
    "admin-" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6);
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  fs.writeFileSync(PASSWORD_FILE, _password, "utf-8");
  console.log(`\n  🔑 Admin password: ${_password}\n`);
  return _password;
}

function checkAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return false;
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return token === ensurePassword();
}

// ---------------------------------------------------------------------------
// File I/O helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateFields(data: unknown, requiredFields: string[]): void {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: expected an object");
  }
  const obj = data as Record<string, unknown>;
  for (const field of requiredFields) {
    if (obj[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

export function registerApiRoutes(router: Router) {
  const PREFIX = "/api";

  // -----------------------------------------------------------------------
  // Auth check
  // -----------------------------------------------------------------------
  router.post(`${PREFIX}/auth`, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    const pw = typeof body?.password === "string" ? body.password : "";
    if (pw === ensurePassword()) {
      res.json({ token: pw });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // -----------------------------------------------------------------------
  // Site Config
  // -----------------------------------------------------------------------
  router.get(`${PREFIX}/site`, (_req, res) => {
    try {
      res.json(readJson("site.json"));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.put(`${PREFIX}/site`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = req.body;
      validateFields(data, ["name", "navItems", "socialLinks"]);
      writeJson("site.json", data);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  // -----------------------------------------------------------------------
  // Profile
  // -----------------------------------------------------------------------
  router.get(`${PREFIX}/profile`, (_req, res) => {
    try {
      res.json(readJson("profile.json"));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.put(`${PREFIX}/profile`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = req.body;
      validateFields(data, ["heroTagline", "aboutParagraphs"]);
      writeJson("profile.json", data);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  // -----------------------------------------------------------------------
  // Projects (full CRUD)
  // -----------------------------------------------------------------------
  router.get(`${PREFIX}/projects`, (_req, res) => {
    try {
      res.json(readJson("projects.json"));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.post(`${PREFIX}/projects`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = req.body;
      validateFields(data, ["id", "title"]);
      const projects = readJson<any[]>("projects.json");
      projects.push(data);
      writeJson("projects.json", projects);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  router.put(`${PREFIX}/projects/:id`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const { id } = req.params;
      const data = req.body;
      const projects = readJson<any[]>("projects.json");
      const idx = projects.findIndex((p: any) => p.id === id);
      if (idx === -1) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      projects[idx] = { ...projects[idx], ...data, id };
      writeJson("projects.json", projects);
      res.json({ success: true, data: projects[idx] });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  router.delete(`${PREFIX}/projects/:id`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const { id } = req.params;
      const projects = readJson<any[]>("projects.json");
      const filtered = projects.filter((p: any) => p.id !== id);
      if (filtered.length === projects.length) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      writeJson("projects.json", filtered);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  // -----------------------------------------------------------------------
  // Skills
  // -----------------------------------------------------------------------
  router.get(`${PREFIX}/skills`, (_req, res) => {
    try {
      res.json(readJson("skills.json"));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.put(`${PREFIX}/skills`, (req, res) => {
    if (!checkAuth(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const data = req.body;
      if (!Array.isArray(data)) throw new Error("Skills data must be an array");
      writeJson("skills.json", data);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });
}
