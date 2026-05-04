import type { SiteConfig, Profile, Project, SkillCategory } from "@shared/types";

const isProd = import.meta.env.PROD;

// In production: load JSON files at build time via import.meta.glob
// In development: fetch from /api/* (admin page edits take effect immediately)

const dataModules = isProd
  ? (import.meta.glob("../../../shared/data/*.json", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>)
  : null;

function getProdData<T>(filename: string): T | null {
  if (!dataModules) return null;
  const key = `../../../shared/data/${filename}`;
  const raw = dataModules[key];
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function fetchSite(): Promise<SiteConfig> {
  if (isProd) {
    const data = getProdData<SiteConfig>("site.json");
    if (data) return data;
  }
  const res = await fetch("/api/site");
  return res.json();
}

export async function fetchProfile(): Promise<Profile> {
  if (isProd) {
    const data = getProdData<Profile>("profile.json");
    if (data) return data;
  }
  const res = await fetch("/api/profile");
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  if (isProd) {
    const data = getProdData<Project[]>("projects.json");
    if (data) return data;
  }
  const res = await fetch("/api/projects");
  return res.json();
}

export async function fetchSkills(): Promise<SkillCategory[]> {
  if (isProd) {
    const data = getProdData<SkillCategory[]>("skills.json");
    if (data) return data;
  }
  const res = await fetch("/api/skills");
  return res.json();
}
