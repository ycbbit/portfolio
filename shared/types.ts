// =============================================================================
// Portfolio Site Data Types
// Used by both client and server for type-safe data management
// =============================================================================

// -----------------------------------------------------------------------------
// Site Configuration
// -----------------------------------------------------------------------------
export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  email?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

// -----------------------------------------------------------------------------
// Guestbook
// -----------------------------------------------------------------------------
export interface GuestbookConfig {
  enabled: boolean;
  repo: string;
  issueNumber: number;
  token: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  tagline: string;
  description: string;
  navItems: NavItem[];
  socialLinks: SocialLinks;
  footerLinks: FooterLink[];
  guestbook?: GuestbookConfig;
}

// -----------------------------------------------------------------------------
// Profile / Personal Information
// -----------------------------------------------------------------------------
export interface ProfileStat {
  value: string;
  label: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  organization?: string;
  description: string;
  type: "work" | "project" | "education";
  tags?: string[];
}

export interface Profile {
  name: string;
  role: string;
  heroTagline: string;
  heroDescription: string;
  aboutParagraphs: string[];
  stats: ProfileStat[];
  avatar?: string;
  timeline?: TimelineEntry[];
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------
export interface ProjectLinks {
  live?: string;
  github?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  icon?: string;
  links: ProjectLinks;
}

// -----------------------------------------------------------------------------
// Skills
// -----------------------------------------------------------------------------
export interface Skill {
  name: string;
  description: string;
  icon: string;
}

export interface SkillCategory {
  name: string;
  slug: string;
  skills: Skill[];
}
