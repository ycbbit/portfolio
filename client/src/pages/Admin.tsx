import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  login,
  logout,
  getToken,
  updateSite,
  updateProfile,
  createProject,
  updateProject,
  deleteProject,
  updateSkills,
} from "@/lib/api";
import { fetchSite, fetchProfile, fetchProjects, fetchSkills } from "@/data/loader";
import type { SiteConfig, Profile, Project, SkillCategory } from "@shared/types";
import { Trash2, Plus, Pencil, LogOut, Save } from "lucide-react";

// ---------------------------------------------------------------------------
// Default data shapes
// ---------------------------------------------------------------------------

const defaultSite: SiteConfig = {
  name: "",
  title: "",
  tagline: "",
  description: "",
  navItems: [],
  socialLinks: {},
  footerLinks: [],
};

const defaultProfile: Profile = {
  name: "",
  role: "",
  heroTagline: "",
  heroDescription: "",
  aboutParagraphs: [""],
  stats: [],
  avatar: "",
};

// ---------------------------------------------------------------------------
// Login Screen
// ---------------------------------------------------------------------------

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login(pw);
      toast.success("Login successful");
      onLogin();
    } catch {
      toast.error("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading || !pw}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Site Config Tab
// ---------------------------------------------------------------------------

function SiteConfigTab({ data, onSaved }: { data: SiteConfig | null; onSaved: () => void }) {
  const [form, setForm] = useState<SiteConfig>(defaultSite);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(JSON.parse(JSON.stringify(data)));
  }, [data]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSite(form);
      toast.success("Site config saved");
      onSaved();
    } catch (e) {
      toast.error(String(e));
    }
    setSaving(false);
  }

  function updateNavItems(text: string) {
    const items = text
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((s) => s.trim());
        return { label: label || "", href: href || "#" };
      });
    setForm({ ...form, navItems: items });
  }

  function updateFooterLinks(text: string) {
    const links = text
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((s) => s.trim());
        return { label: label || "", href: href || "#" };
      });
    setForm({ ...form, footerLinks: links });
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Site Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tagline</label>
          <Input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Navigation Items (one per line: Label | href)
          </label>
          <Textarea
            rows={4}
            value={form.navItems.map((n) => `${n.label} | ${n.href}`).join("\n")}
            onChange={(e) => updateNavItems(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">GitHub URL</label>
            <Input
              value={form.socialLinks.github || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, github: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input
              value={form.socialLinks.linkedin || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, linkedin: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.socialLinks.email || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, email: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">
            Footer Links (one per line: Label | href)
          </label>
          <Textarea
            rows={3}
            value={form.footerLinks.map((l) => `${l.label} | ${l.href}`).join("\n")}
            onChange={(e) => updateFooterLinks(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving..." : "Save Site Config"}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab({ data, onSaved }: { data: Profile | null; onSaved: () => void }) {
  const [form, setForm] = useState<Profile>(defaultProfile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(JSON.parse(JSON.stringify(data)));
  }, [data]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success("Profile saved");
      onSaved();
    } catch (e) {
      toast.error(String(e));
    }
    setSaving(false);
  }

  function updateParagraphs(text: string) {
    setForm({ ...form, aboutParagraphs: text.split("\n").filter((l) => l.trim()) });
  }

  function updateStats(text: string) {
    const stats = text
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [value, label] = line.split("|").map((s) => s.trim());
        return { value: value || "", label: label || "" };
      });
    setForm({ ...form, stats });
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Hero Tagline</label>
          <Input
            value={form.heroTagline}
            onChange={(e) => setForm({ ...form, heroTagline: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Hero Description</label>
          <Textarea
            value={form.heroDescription}
            onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Avatar URL (optional)</label>
          <Input
            value={form.avatar || ""}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            About Paragraphs (one per line)
          </label>
          <Textarea
            rows={4}
            value={form.aboutParagraphs.join("\n")}
            onChange={(e) => updateParagraphs(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Stats (one per line: Value | Label)
          </label>
          <Textarea
            rows={3}
            value={form.stats.map((s) => `${s.value} | ${s.label}`).join("\n")}
            onChange={(e) => updateStats(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projects Tab
// ---------------------------------------------------------------------------

function ProjectsTab({ data, onSaved }: { data: Project[] | null; onSaved: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (data) setProjects(JSON.parse(JSON.stringify(data)));
  }, [data]);

  async function handleSave(project: Project) {
    try {
      if (editing && projects.find((p) => p.id === editing.id)) {
        await updateProject(project.id, project);
        setProjects(projects.map((p) => (p.id === project.id ? project : p)));
        toast.success("Project updated");
      } else {
        await createProject(project);
        setProjects([...projects, project]);
        toast.success("Project created");
      }
      setDialogOpen(false);
      setEditing(null);
      onSaved();
    } catch (e) {
      toast.error(String(e));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
      onSaved();
    } catch (e) {
      toast.error(String(e));
    }
  }

  function openNew() {
    setEditing({
      id: "project-" + Date.now(),
      title: "",
      description: "",
      tags: [],
      gradient: "from-accent/20 to-secondary/20",
      links: {},
    });
    setDialogOpen(true);
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Button onClick={openNew}>
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>

      <div className="space-y-3">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="flex gap-1 mt-1">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing({ ...p });
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProjectDialog
        open={dialogOpen}
        project={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

function ProjectDialog({
  open,
  project,
  onClose,
  onSave,
}: {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const [form, setForm] = useState<Project>({
    id: "",
    title: "",
    description: "",
    tags: [],
    gradient: "from-accent/20 to-secondary/20",
    links: {},
  });

  useEffect(() => {
    if (project) setForm(JSON.parse(JSON.stringify(project)));
  }, [project]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project && project.title ? "Edit Project" : "New Project"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">ID (slug)</label>
            <Input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={!!project?.id}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Live URL</label>
              <Input
                value={form.links.live || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    links: { ...form.links, live: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">GitHub URL</label>
              <Input
                value={form.links.github || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    links: { ...form.links, github: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Skills Tab
// ---------------------------------------------------------------------------

function SkillsTab({
  data,
  onSaved,
}: {
  data: SkillCategory[] | null;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setCategories(JSON.parse(JSON.stringify(data)));
  }, [data]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSkills(categories);
      toast.success("Skills saved");
      onSaved();
    } catch (e) {
      toast.error(String(e));
    }
    setSaving(false);
  }

  function addCategory() {
    setCategories([
      ...categories,
      { name: "New Category", slug: "new-category", skills: [] },
    ]);
  }

  function removeCategory(idx: number) {
    setCategories(categories.filter((_, i) => i !== idx));
  }

  function updateCategory(idx: number, cat: SkillCategory) {
    setCategories(categories.map((c, i) => (i === idx ? cat : c)));
  }

  function addSkill(catIdx: number) {
    setCategories(
      categories.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              skills: [
                ...c.skills,
                { name: "", description: "", icon: "💡" },
              ],
            }
          : c,
      ),
    );
  }

  function removeSkill(catIdx: number, skillIdx: number) {
    setCategories(
      categories.map((c, i) =>
        i === catIdx
          ? { ...c, skills: c.skills.filter((_, si) => si !== skillIdx) }
          : c,
      ),
    );
  }

  function updateSkill(
    catIdx: number,
    skillIdx: number,
    skill: { name: string; description: string; icon: string },
  ) {
    setCategories(
      categories.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              skills: c.skills.map((s, si) => (si === skillIdx ? skill : s)),
            }
          : c,
      ),
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {categories.map((cat, catIdx) => (
        <Card key={catIdx}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex gap-2 items-center flex-1">
              <Input
                className="font-semibold max-w-xs"
                value={cat.name}
                onChange={(e) =>
                  updateCategory(catIdx, { ...cat, name: e.target.value })
                }
              />
              <Input
                className="max-w-xs text-sm"
                value={cat.slug}
                placeholder="slug"
                onChange={(e) =>
                  updateCategory(catIdx, { ...cat, slug: e.target.value })
                }
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCategory(catIdx)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {cat.skills.map((skill, skillIdx) => (
              <div key={skillIdx} className="flex gap-2 items-start">
                <Input
                  className="w-16 text-center text-xl"
                  value={skill.icon}
                  onChange={(e) =>
                    updateSkill(catIdx, skillIdx, {
                      ...skill,
                      icon: e.target.value,
                    })
                  }
                />
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(e) =>
                      updateSkill(catIdx, skillIdx, {
                        ...skill,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={skill.description}
                    onChange={(e) =>
                      updateSkill(catIdx, skillIdx, {
                        ...skill,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(catIdx, skillIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSkill(catIdx)}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Skill
            </Button>
          </CardContent>
        </Card>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={addCategory}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Skills"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Admin Page
// ---------------------------------------------------------------------------

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(!!getToken());
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [skills, setSkills] = useState<SkillCategory[] | null>(null);
  const [tab, setTab] = useState("site");

  async function loadData() {
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
    } catch (e) {
      toast.error("Failed to load data: " + String(e));
    }
  }

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-bold text-lg">Site Admin</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              setAuthenticated(false);
            }}
          >
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="site">Site Config</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle>Site Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <SiteConfigTab data={site} onSaved={loadData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileTab data={profile} onSaved={loadData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectsTab data={projects} onSaved={loadData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillsTab data={skills} onSaved={loadData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
