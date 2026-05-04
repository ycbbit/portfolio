import { motion } from "framer-motion";
import { Briefcase, FolderGit2, GraduationCap } from "lucide-react";
import type { TimelineEntry } from "@shared/types";

interface TimelineProps {
  entries: TimelineEntry[];
}

const typeConfig: Record<
  string,
  { icon: typeof Briefcase; color: string; label: string }
> = {
  work:   { icon: Briefcase,     color: "#38bdf8", label: "Work" },
  project:{ icon: FolderGit2,    color: "#34d399", label: "Project" },
  education:{ icon: GraduationCap, color: "#fbbf24", label: "Education" },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const AXIS_H = 80; // connector + dot + year

export default function Timeline({ entries }: TimelineProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="mt-4">
      {/* Heading */}
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px flex-1 bg-border" />
        <h3 className="text-lg font-medium text-foreground/60 tracking-wide select-none">
          Experience Timeline
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Scrollable timeline */}
      <div className="overflow-x-auto">
        <div className="relative min-w-max" style={{ paddingBottom: 16 }}>
          {/* Horizontal axis line */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: AXIS_H / 2,
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, hsl(var(--border)) 6%, hsl(var(--border)) 94%, transparent 100%)",
            }}
          />

          {/* Entry columns */}
          <div className="relative flex items-end gap-14 px-10">
            {entries.map((entry, i) => {
              const cfg = typeConfig[entry.type] || typeConfig.work;
              const Icon = cfg.icon;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center shrink-0"
                  style={{ width: 256 }}
                >
                  {/* Card */}
                  <motion.div
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={cardVariant}
                    className="w-full rounded-2xl border border-border/40 bg-card/70 hover:border-border hover:shadow-sm transition-all duration-300"
                    style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
                  >
                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start gap-3 mb-3">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                          style={{ backgroundColor: `${cfg.color}18` }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <h4 className="font-semibold text-sm text-foreground leading-snug">
                            {entry.title}
                          </h4>
                          {entry.organization && (
                            <p className="text-xs text-foreground/40 mt-0.5">
                              {entry.organization}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-foreground/55 leading-relaxed mb-3">
                        {entry.description}
                      </p>

                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-foreground/45 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Axis zone: connector → dot → year */}
                  <div
                    className="flex flex-col items-center shrink-0"
                    style={{ height: AXIS_H }}
                  >
                    <div className="w-px flex-1 bg-border/60" style={{ minHeight: 6 }} />
                    <div
                      className="relative z-10 w-3 h-3 rounded-full ring-[3px] ring-background shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span className="mt-1.5 text-[11px] font-semibold text-foreground/40 tracking-widest uppercase shrink-0 select-none">
                      {entry.year}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-8">
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <Icon className="h-3.5 w-3.5 text-foreground/35" />
              <span className="text-xs text-foreground/45 font-medium">{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
