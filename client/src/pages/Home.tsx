import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Github, Linkedin, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Personal Website - Warm Minimalism Design
 * Design Philosophy: Organic shapes, generous whitespace, warm color palette
 * Color Palette: Cream (#FFFBF5), Warm Brown (#3D2817), Terracotta (#C85A3A), Sage Green (#A8B5A0)
 * Typography: Outfit font family, warm and approachable
 * Interactions: Smooth transitions, gentle hover effects, soft animations
 */

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="text-xl font-bold text-accent">Portfolio</div>
          <div className="flex gap-6 items-center">
            <a href="#about" className="text-sm hover:text-accent transition-colors">
              About
            </a>
            <a href="#work" className="text-sm hover:text-accent transition-colors">
              Work
            </a>
            <a href="#contact" className="text-sm hover:text-accent transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Hero Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663622555566/Z5kGWqYdCCqh5gmWfKMFfC/hero-gradient-WjSGzXeQUxpZk6ybRXRKJp.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-background/40 z-0" />

        <div className="container relative z-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-block">
              <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
                <p className="text-sm text-accent font-medium">Welcome to my portfolio</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
              Crafting digital experiences with care
            </h1>

            <p className="text-lg text-foreground/80 mb-8 max-w-xl leading-relaxed">
              I design and build beautiful, functional websites and applications. Let's create something meaningful together.
            </p>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full group"
              >
                Get in touch
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-border hover:bg-muted"
              >
                View my work
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About me</h2>
              <p className="text-foreground/70 mb-4 leading-relaxed">
                With a passion for clean design and thoughtful development, I create digital products that users love. My approach combines aesthetic excellence with functional simplicity.
              </p>
              <p className="text-foreground/70 mb-6 leading-relaxed">
                Whether it's a personal website, a web application, or a complete brand identity, I bring dedication to every project.
              </p>
              <div className="flex gap-4">
                <div className="organic-card p-6 flex-1">
                  <div className="text-2xl font-bold text-accent mb-2">5+</div>
                  <p className="text-sm text-foreground/60">Years of experience</p>
                </div>
                <div className="organic-card p-6 flex-1">
                  <div className="text-2xl font-bold text-accent mb-2">50+</div>
                  <p className="text-sm text-foreground/60">Projects completed</p>
                </div>
              </div>
            </div>

            {/* Decorative Blob */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663622555566/Z5kGWqYdCCqh5gmWfKMFfC/accent-blob-TdVX6MXGkAZFTHd4EBJiVK.webp"
                  alt="Decorative blob"
                  className="w-full h-full object-contain animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Skills & expertise</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Frontend Development",
                description: "React, TypeScript, Tailwind CSS, and modern web technologies",
                icon: "🎨",
              },
              {
                title: "UI/UX Design",
                description: "Thoughtful design systems and user-centered interfaces",
                icon: "✨",
              },
              {
                title: "Web Performance",
                description: "Optimized, fast-loading websites with excellent user experience",
                icon: "⚡",
              },
            ].map((skill, idx) => (
              <div key={idx} className="organic-card p-8 hover:shadow-lg">
                <div className="text-4xl mb-4">{skill.icon}</div>
                <h3 className="text-xl font-bold mb-3">{skill.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Featured work</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Project Alpha",
                description: "A modern web application built with React and TypeScript",
                tags: ["React", "TypeScript", "Tailwind"],
              },
              {
                title: "Project Beta",
                description: "E-commerce platform with seamless user experience",
                tags: ["Next.js", "Stripe", "PostgreSQL"],
              },
              {
                title: "Project Gamma",
                description: "Real-time collaboration tool for creative teams",
                tags: ["React", "WebSocket", "Node.js"],
              },
              {
                title: "Project Delta",
                description: "Personal branding and portfolio website",
                tags: ["Design", "Frontend", "SEO"],
              },
            ].map((project, idx) => (
              <div
                key={idx}
                className="organic-card p-8 group cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="mb-4 w-full h-48 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-6xl opacity-30">→</div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-foreground/70 mb-4 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Let's work together</h2>
            <p className="text-foreground/70 mb-12 text-lg leading-relaxed">
              Have a project in mind? I'd love to hear about it. Get in touch and let's create something amazing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send me an email
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                Schedule a call
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6">
              {[
                { icon: Github, label: "GitHub", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Mail, label: "Email", href: "mailto:hello@example.com" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-12 h-12 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-foreground/60">
              © 2024 My Portfolio. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-foreground/60 hover:text-accent transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-accent transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-accent transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
