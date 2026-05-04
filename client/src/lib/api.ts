import type { SiteConfig, Profile, Project, SkillCategory } from "@shared/types";

const BASE = "/api";

let authToken: string | null = localStorage.getItem("admin_token");

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.removeItem("admin_token");
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE}${url}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function login(password: string): Promise<string> {
  const data = await request<{ token: string }>("/auth", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data.token;
}

export function logout(): void {
  setToken(null);
}

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------
export function fetchSite(): Promise<SiteConfig> {
  return request<SiteConfig>("/site");
}

export function updateSite(data: SiteConfig): Promise<{ success: boolean }> {
  return request("/site", { method: "PUT", body: JSON.stringify(data) });
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export function fetchProfile(): Promise<Profile> {
  return request<Profile>("/profile");
}

export function updateProfile(data: Profile): Promise<{ success: boolean }> {
  return request("/profile", { method: "PUT", body: JSON.stringify(data) });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export function fetchProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export function createProject(data: Project): Promise<{ success: boolean }> {
  return request("/projects", { method: "POST", body: JSON.stringify(data) });
}

export function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<{ success: boolean; data: Project }> {
  return request(`/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string): Promise<{ success: boolean }> {
  return request(`/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export function fetchSkills(): Promise<SkillCategory[]> {
  return request<SkillCategory[]>("/skills");
}

export function updateSkills(
  data: SkillCategory[],
): Promise<{ success: boolean }> {
  return request("/skills", { method: "PUT", body: JSON.stringify(data) });
}
