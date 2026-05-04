import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Code2,
  Palette,
  Zap,
  Target,
  Search,
  Globe,
  ShoppingCart,
  Users,
  Layout,
  Briefcase,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchSite, fetchProfile, fetchProjects, fetchSkills } from "@/data/loader";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import type { SiteConfig, Profile, Project, SkillCategory } from "@shared/types";
import GuestbookWidget from "@/components/Guestbook";
import Timeline from "@/components/Timeline";
import Globe3D from "@/components/Globe";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const once = { once: true, margin: "-80px" };

// ---------------------------------------------------------------------------
// useActiveSection hook
// ---------------------------------------------------------------------------

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 },
    );

    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const sectionIds = ["hero", "about", "skills", "work", "guestbook"];
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, p, pr, sk] = await Promise.all([
          fetchSite(),
          fetchProfile(),
          fetchProjects(),
          fetchSkills(),
        ]);
        setSite(s);
        setProfile(p);
        setProjects(pr);
        setSkills(sk);
        if (s) document.title = s.title || s.name || "Portfolio";
      } catch {}
    })();
  }, []);

  const socialIcons: Record<string, React.ComponentType<any>> = {
    github: Github,
    linkedin: Linkedin,
    email: Mail,
  };

  const skillIconMap: Record<string, React.ComponentType<any>> = {
    code2: Code2,
    palette: Palette,
    zap: Zap,
    target: Target,
    search: Search,
    trello: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="4" height="16" x="3" y="4" rx="1" />
        <rect width="4" height="11" x="10" y="9" rx="1" />
        <rect width="4" height="6" x="17" y="14" rx="1" />
      </svg>
    ),
    monitor: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  };

  const projectIconMap: Record<string, React.ComponentType<any>> = {
    globe: Globe,
    "shopping-cart": ShoppingCart,
    users: Users,
    layout: Layout,
  };

  const navItems = site?.navItems || [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Guestbook", href: "#guestbook" },
  ];

  // -----------------------------------------------------------------------
  // Navbar
  // -----------------------------------------------------------------------
  const NavBar = (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="text-xl font-bold text-accent hover:opacity-80 transition-opacity">
          {site?.name || "Portfolio"}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 text-sm rounded-full transition-colors ${
                  isActive
                    ? "text-accent font-medium"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 bg-accent/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}

          {/* Dark mode toggle */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="ml-2 w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-muted"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-12">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-base transition-colors ${
                      activeSection === item.href.replace("#", "")
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );

  // -----------------------------------------------------------------------
  // Hero
  // -----------------------------------------------------------------------
  const Hero = (
    <motion.section
      id="hero"
      initial="hidden"
      whileInView="visible"
      viewport={once}
      variants={fadeUp}
      className="relative pt-32 pb-24 overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(var(--accent)/0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, hsl(var(--secondary)/0.18) 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="container relative z-10">
        <div className="flex items-center gap-8">
          <div className="max-w-2xl flex-1">
            <p className="text-lg font-medium text-accent mb-2">
              Hi, I&rsquo;m {profile?.name || site?.name || "Portfolio"}
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
              {profile?.heroTagline || "Crafting digital experiences with care"}
            </h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-xl leading-relaxed">
              {profile?.heroDescription || ""}
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full group" asChild>
                <a href="#guestbook">
                  Get in touch
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-border hover:bg-muted" asChild>
                <a href="#work">View my work</a>
              </Button>
            </div>
          </div>

          {/* 3D Globe — desktop only */}
          <div className="hidden lg:flex shrink-0 items-center justify-center" style={{ width: 360, height: 360 }}>
            <Globe3D size={340} />
          </div>
        </div>
      </div>
    </motion.section>
  );

  // -----------------------------------------------------------------------
  // About
  // -----------------------------------------------------------------------
  const About = (
    <motion.section
      id="about"
      initial="hidden"
      whileInView="visible"
      viewport={once}
      variants={fadeUp}
      className="py-24 bg-card/30"
    >
      <div className="container">
        <div className="grid md:grid-cols-5 gap-10 items-center">
          {/* Text column */}
          <div className="md:col-span-3">
            <h2 className="text-4xl font-bold mb-6">About me</h2>
            {(profile?.aboutParagraphs || []).map((p, i) => (
              <p key={i} className="text-foreground/70 mb-4 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Visual column — avatar + stats */}
          <div className="md:col-span-2 flex flex-col items-center gap-6">
            {/* Avatar */}
            <div className="relative w-44 h-44 group">
              {/* Pulse ring */}
              <div className="absolute -inset-4 rounded-2xl bg-accent/8 animate-pulse" style={{ animationDuration: "3s" }} />
              {/* Glass ring */}
              <div className="absolute -inset-2 rounded-2xl border border-accent/15 bg-accent/3 backdrop-blur-sm" />
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="relative w-full h-full object-cover rounded-2xl shadow-lg" />
              ) : (
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent/35 via-accent/15 to-secondary/25 flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10">
                  <span className="text-5xl font-bold bg-gradient-to-br from-accent to-accent/70 bg-clip-text text-transparent select-none">
                    {(profile?.name || site?.name || "P")[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + role */}
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {profile?.name || site?.name || "Portfolio"}
              </p>
              {profile?.role && (
                <p className="text-sm text-foreground/50 mt-0.5">{profile.role}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-2 w-full max-w-xs">
              {(profile?.stats || []).map((stat, i) => {
                const icons = [Briefcase, FolderGit2];
                const StatIcon = icons[i] || Sparkles;
                return (
                  <div key={i} className="organic-card p-4 flex-1 text-center">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 mb-2">
                      <StatIcon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-[11px] text-foreground/50 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {profile?.timeline && profile.timeline.length > 0 && (
          <div className="mt-16">
            <Timeline entries={profile.timeline} />
          </div>
        )}
      </div>
    </motion.section>
  );

  // -----------------------------------------------------------------------
  // Skills
  // -----------------------------------------------------------------------
  const Skills = skills.length > 0 && (
    <motion.section
      id="skills"
      initial="hidden"
      whileInView="visible"
      viewport={once}
      variants={stagger}
      className="py-24 bg-muted/30"
    >
      <div className="container">
        <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-12">
          Skills & expertise
        </motion.h2>
        {skills.map((category) => (
          <div key={category.slug} className="mb-10 last:mb-0">
            <motion.h3 variants={fadeUp} className="text-lg font-semibold mb-5 text-foreground/50 uppercase tracking-wider">
              {category.name}
            </motion.h3>
            <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
              {category.skills.map((skill) => {
                const IconComp = skillIconMap[skill.icon];
                return (
                  <motion.div
                    key={skill.name}
                    variants={cardVariant}
                    whileHover={{ y: -4 }}
                    className="organic-card p-6 hover:shadow-lg"
                  >
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 mb-4">
                      {IconComp ? (
                        <IconComp className="h-5 w-5 text-accent" />
                      ) : (
                        <span className="text-xl">{skill.icon}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold mb-2">{skill.name}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{skill.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.section>
  );

  // -----------------------------------------------------------------------
  // Work
  // -----------------------------------------------------------------------
  const Work = (
    <motion.section
      id="work"
      initial="hidden"
      whileInView="visible"
      viewport={once}
      variants={stagger}
      className="py-24"
    >
      <div className="container">
        <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-12">
          Featured work
        </motion.h2>
        <motion.div variants={stagger} className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariant}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedProject(project)}
              className="organic-card p-8 group cursor-pointer hover:shadow-lg transition-all"
            >
              <div
                className={`mb-4 w-full h-48 rounded-2xl bg-gradient-to-br ${project.gradient || "from-accent/20 to-secondary/20"} flex items-center justify-center`}
              >
                {(() => {
                  const PIcon = project.icon ? projectIconMap[project.icon] : null;
                  return PIcon ? (
                    <PIcon className="h-14 w-14 text-foreground/20 group-hover:text-foreground/30 transition-colors" />
                  ) : (
                    <div className="text-6xl text-foreground/20 group-hover:text-foreground/30 transition-colors">→</div>
                  );
                })()}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <p className="text-foreground/70 mb-4 text-sm">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-foreground/70">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Project detail dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  className={`w-full h-40 rounded-2xl bg-gradient-to-br ${selectedProject.gradient || "from-accent/20 to-secondary/20"} flex items-center justify-center`}
                >
                  {(() => {
                    const PIcon = selectedProject.icon ? projectIconMap[selectedProject.icon] : null;
                    return PIcon ? (
                      <PIcon className="h-12 w-12 text-foreground/20" />
                    ) : null;
                  })()}
                </div>
                <p className="text-foreground/70">{selectedProject.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-muted text-foreground/70">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  {selectedProject.links?.live && (
                    <Button size="sm" asChild>
                      <a href={selectedProject.links.live} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" /> Live Site
                      </a>
                    </Button>
                  )}
                  {selectedProject.links?.github && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedProject.links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-1 h-4 w-4" /> Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.section>
  );

  // -----------------------------------------------------------------------
  // Guestbook
  // -----------------------------------------------------------------------
  const Guestbook = (
    <motion.section
      id="guestbook"
      initial="hidden"
      whileInView="visible"
      viewport={once}
      variants={fadeUp}
      className="py-24 bg-muted/20"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {site?.guestbook?.enabled ? (
            <GuestbookWidget config={site.guestbook} />
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-foreground/40">
                Guestbook coming soon — check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );

  // -----------------------------------------------------------------------
  // Footer
  // -----------------------------------------------------------------------
  const Footer = (
    <footer className="py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          {/* Small social row */}
          <div className="flex gap-4">
            {site?.socialLinks && Object.entries(site.socialLinks)
              .filter(([, v]) => v && v !== "#")
              .map(([key, value]) => {
                const Icon = socialIcons[key];
                if (!Icon) return null;
                const href = key === "email" ? `mailto:${value}` : value;
                return (
                  <a
                    key={key}
                    href={href as string}
                    target={key === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                    aria-label={key}
                  >
                    <Icon className="h-4 w-4 text-foreground/40 hover:text-foreground/70 transition-colors" />
                  </a>
                );
              })}
          </div>
          <p className="text-xs text-foreground/40">
            &copy; {new Date().getFullYear()} {site?.name || "Portfolio"}
          </p>
        </div>
      </div>
    </footer>
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background text-foreground">
      {NavBar}
      {Hero}
      {About}
      {Skills}
      {Work}
      {Guestbook}
      {Footer}
    </div>
  );
}
