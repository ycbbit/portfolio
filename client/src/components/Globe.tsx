import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { CONTINENTS } from "@/data/continents";
import type { Path } from "@/data/continents";

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------
const PALETTE = {
  light: {
    oceanFill: "oklch(0.72 0.06 240 / 0.12)",
    oceanDot:  "oklch(0.55 0.06 245 / 0.32)",
    landFill:  "oklch(0.60 0.22 30 / 0.72)",
    landStroke:"oklch(0.52 0.22 30 / 0.80)",
    landDot:   "oklch(0.60 0.22 30 / 0.50)",
    grid:       "oklch(0.55 0.03 230 / 0.08)",
    equator:    "oklch(0.50 0.03 230 / 0.22)",
    boundary:   "oklch(0.50 0.03 230 / 0.18)",
    tropic:     "oklch(0.50 0.03 230 / 0.13)",
    pole:       "oklch(0.50 0.03 240 / 0.65)",
    glow:       "oklch(0.62 0.21 27.4 / 0.05)",
    rim:        "oklch(0.55 0.03 230 / 0.14)",
    shade:      "oklch(0.25 0.01 260 / 0.06)",
    labelText: "oklch(0.25 0.01 260 / 0.90)",
    labelOcean:"oklch(0.35 0.06 245 / 0.82)",
    labelShadow:"rgba(255,255,255,0.65)",
  },
  dark: {
    oceanFill: "oklch(0.38 0.05 245 / 0.14)",
    oceanDot:  "oklch(0.45 0.05 245 / 0.38)",
    landFill:  "oklch(0.70 0.19 30 / 0.75)",
    landStroke:"oklch(0.65 0.19 30 / 0.82)",
    landDot:   "oklch(0.70 0.19 30 / 0.52)",
    grid:       "oklch(0.50 0.03 230 / 0.08)",
    equator:    "oklch(0.52 0.03 230 / 0.25)",
    boundary:   "oklch(0.52 0.03 230 / 0.20)",
    tropic:     "oklch(0.52 0.03 230 / 0.14)",
    pole:       "oklch(0.55 0.03 240 / 0.70)",
    glow:       "oklch(0.72 0.18 27.4 / 0.05)",
    rim:        "oklch(0.50 0.03 230 / 0.18)",
    shade:      "oklch(0.10 0.01 260 / 0.10)",
    labelText: "oklch(0.90 0.01 260 / 0.92)",
    labelOcean:"oklch(0.68 0.05 240 / 0.82)",
    labelShadow:"rgba(0,0,0,0.55)",
  },
};

const AXIAL_TILT = 0.4091; // 23.44°

// ---------------------------------------------------------------------------
// 3D math helpers
// ---------------------------------------------------------------------------
function geoTo3D(lon: number, lat: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const th  = (lon * Math.PI) / 180;
  return [
    Math.cos(phi) * Math.cos(th),
    Math.sin(phi),
    Math.cos(phi) * Math.sin(th),
  ];
}

function rotX(x: number, y: number, z: number, a: number): [number, number, number] {
  return [
    x,
    y * Math.cos(a) - z * Math.sin(a),
    y * Math.sin(a) + z * Math.cos(a),
  ];
}

function rotY(x: number, y: number, z: number, a: number): [number, number, number] {
  return [
    x * Math.cos(a) + z * Math.sin(a),
    y,
    -x * Math.sin(a) + z * Math.cos(a),
  ];
}

interface Pt { x: number; y: number; z: number }

function project(lon: number, lat: number, cx: number, cy: number, r: number, angle: number): Pt {
  let [x, y, z] = geoTo3D(lon, lat);
  [x, y, z] = rotX(x, y, z, AXIAL_TILT);
  [x, y, z] = rotY(x, y, z, angle);
  return { x: cx + x * r, y: cy - y * r, z };
}

// ---------------------------------------------------------------------------
// Label data
// ---------------------------------------------------------------------------
interface Label {
  name: string;
  lon: number;
  lat: number;
  type: "continent" | "ocean";
}

/** Average of the largest path for a continent. */
function centroid(paths: Path[]): [number, number] {
  let best = paths[0];
  for (const p of paths) if (p.length > best.length) best = p;
  let slon = 0, slat = 0;
  for (const [lon, lat] of best) { slon += lon; slat += lat; }
  return [slon / best.length, slat / best.length];
}

function makeLabels(): Label[] {
  const na = centroid(CONTINENTS["north-america"]);
  const sa = centroid(CONTINENTS["south-america"]);
  const af = centroid(CONTINENTS["africa"]);
  const oc = centroid(CONTINENTS["oceania"]);

  return [
    // Continents
    { name: "North America", lon: na[0], lat: na[1], type: "continent" as const },
    { name: "South America", lon: sa[0], lat: sa[1], type: "continent" as const },
    { name: "Europe",        lon: 10,  lat: 52,  type: "continent" as const },
    { name: "Asia",          lon: 90,  lat: 52,  type: "continent" as const },
    { name: "Africa",        lon: af[0], lat: af[1], type: "continent" as const },
    { name: "Oceania",       lon: oc[0], lat: oc[1], type: "continent" as const },
    // Oceans (7)
    { name: "North Pacific",  lon: -155, lat: 28,  type: "ocean" as const },
    { name: "South Pacific",  lon: -135, lat: -30, type: "ocean" as const },
    { name: "North Atlantic", lon: -38,  lat: 30,  type: "ocean" as const },
    { name: "South Atlantic", lon: -22,  lat: -28, type: "ocean" as const },
    { name: "Indian Ocean",   lon: 72,   lat: -16, type: "ocean" as const },
    { name: "Arctic Ocean",   lon: 0,    lat: 84,  type: "ocean" as const },
    { name: "Southern Ocean", lon: 0,    lat: -72, type: "ocean" as const },
  ];
}

const LABELS: Label[] = makeLabels();

// ---------------------------------------------------------------------------
// Label rendering helpers
// ---------------------------------------------------------------------------

/** Wrap a label into two lines if it contains a space and the globe is small. */
function wrapLabel(name: string): string[] {
  const parts = name.split(" ");
  if (parts.length <= 2) return [name]; // keep "North America" on one line for simplicity
  // For longer names, split into two roughly equal halves
  const mid = Math.ceil(parts.length / 2);
  return [
    parts.slice(0, mid).join(" "),
    parts.slice(mid).join(" "),
  ];
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  labels: Label[],
  angle: number,
  cx: number, cy: number, r: number,
  C: typeof PALETTE.light,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const label of labels) {
    const pt = project(label.lon, label.lat, cx, cy, r, angle);
    if (pt.z <= 0.02) continue; // back face or edge-on

    const sz = (pt.z + 1) / 2; // 0→1, but z starts at 0.02 so sz starts ~0.51
    const alpha = 0.35 + 0.60 * sz;

    const isContinent = label.type === "continent";
    const fontSize = isContinent
      ? 11 + sz * 3
      : 9.5 + sz * 2.5;

    // Shadow for readability on varied backgrounds
    ctx.shadowColor = C.labelShadow;
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = isContinent ? C.labelText : C.labelOcean;
    ctx.globalAlpha = alpha;
    ctx.font = `${isContinent ? "600" : "500"} ${fontSize}px Outfit, system-ui, sans-serif`;

    const lines = wrapLabel(label.name);
    const lineHeight = fontSize * 1.25;
    const startY = pt.y - ((lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      // Skip second line if it would render behind the globe
      const linePt = project(label.lon, label.lat + (i - 0.5) * (fontSize / r * 5), cx, cy, r, angle);
      if (linePt.z <= 0) continue;
      ctx.fillText(lines[i], pt.x, startY + i * lineHeight);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Globe({ size = 340 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [paused, setPaused] = useState(false);
  const angleRef = useRef(0);

  const projectContinents = useCallback(
    (angle: number, cx: number, cy: number, r: number) => {
      const result: { path: Pt[]; avgZ: number }[] = [];
      for (const paths of Object.values(CONTINENTS)) {
        for (const path of paths) {
          const proj = path.map(([lon, lat]) => project(lon, lat, cx, cy, r, angle));
          const avgZ = proj.reduce((s, p) => s + p.z, 0) / proj.length;
          result.push({ path: proj, avgZ });
        }
      }
      result.sort((a, b) => a.avgZ - b.avgZ);
      return result;
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = size;
    canvas.width = w * dpr;
    canvas.height = w * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${w}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = w / 2;
    const r = w * 0.40;

    // Ocean dot grid
    const oceanDots: [number, number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 8) {
      for (let lon = -176; lon < 180; lon += 12) {
        oceanDots.push(geoTo3D(lon, lat));
      }
    }

    // Land dot grid
    const landDots: [number, number, number][] = [];
    for (let lat = -70; lat <= 70; lat += 4) {
      for (let lon = -176; lon < 180; lon += 5) {
        landDots.push(geoTo3D(lon, lat));
      }
    }

    const draw = () => {
      if (!paused) angleRef.current += 0.0035;
      const angle = angleRef.current;
      const C = PALETTE[theme === "dark" ? "dark" : "light"];

      ctx.clearRect(0, 0, w, w);

      // --- ocean background disc ---
      ctx.fillStyle = C.oceanFill;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // --- ocean dots ---
      for (const [ox, oy, oz] of oceanDots) {
        let [tx, ty, tz] = rotX(ox, oy, oz, AXIAL_TILT);
        [tx, ty, tz] = rotY(tx, ty, tz, angle);
        if (tz <= 0) continue;
        const sz = (tz + 1) / 2;
        ctx.fillStyle = C.oceanDot;
        ctx.globalAlpha = 0.12 + 0.55 * sz;
        ctx.beginPath();
        ctx.arc(cx + tx * r, cy - ty * r, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- land fill ---
      const allLandPaths = projectContinents(angle, cx, cy, r);
      for (const { path } of allLandPaths) {
        if (path.length < 3) continue;
        ctx.fillStyle = C.landFill;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = C.landStroke;
        ctx.lineWidth = 1.1;
        ctx.lineJoin = "round";
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      // --- 3D shading hemisphere ---
      const shadeGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      shadeGrad.addColorStop(0, C.shade);
      shadeGrad.addColorStop(0.45, "transparent");
      shadeGrad.addColorStop(0.65, "transparent");
      shadeGrad.addColorStop(1, C.shade);
      ctx.fillStyle = shadeGrad;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // --- land texture dots ---
      for (const [lx, ly, lz] of landDots) {
        let [tx, ty, tz] = rotX(lx, ly, lz, AXIAL_TILT);
        [tx, ty, tz] = rotY(tx, ty, tz, angle);
        if (tz <= 0) continue;
        const sz = (tz + 1) / 2;
        ctx.fillStyle = C.landDot;
        ctx.globalAlpha = 0.08 + 0.45 * sz;
        ctx.beginPath();
        ctx.arc(cx + tx * r, cy + ty * r, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- latitude grid (skip equator, drawn separately) ---
      for (let lat = -60; lat <= 60; lat += 30) {
        if (lat === 0) continue;
        const phi = (lat * Math.PI) / 180;
        const rr = Math.cos(phi) * r;
        const yy = cy - Math.sin(phi) * r;
        ctx.strokeStyle = C.grid;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.ellipse(cx, yy, rr, rr * 0.20, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- longitude grid ---
      for (let lng = 0; lng < 360; lng += 45) {
        const th = (lng * Math.PI) / 180;
        const visible = Math.cos(th + angle) > -0.12;
        if (!visible) continue;
        ctx.strokeStyle = C.grid;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) {
          const phi = (i / 50) * Math.PI;
          const sy = Math.cos(phi);
          const sx = Math.sin(phi) * Math.cos(th + angle);
          if (i === 0) ctx.moveTo(cx + sx * r, cy - sy * r);
          else ctx.lineTo(cx + sx * r, cy - sy * r);
        }
        ctx.stroke();
      }

      // --- equator (bold, properly projected great circle) ---
      ctx.strokeStyle = C.equator;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([]);
      ctx.beginPath();
      let eqDrawing = false;
      for (let i = 0; i <= 140; i++) {
        const lon = (i / 140) * Math.PI * 2 - Math.PI;
        const pt = project(lon, 0, cx, cy, r, angle);
        if (pt.z > 0.01) {
          if (!eqDrawing) { ctx.moveTo(pt.x, pt.y); eqDrawing = true; }
          else ctx.lineTo(pt.x, pt.y);
        } else {
          eqDrawing = false;
        }
      }
      ctx.stroke();

      // --- ocean boundary meridians (dashed) ---
      // 20°E = Atlantic/Indian, 68°W = Atlantic/Pacific, 147°E = Indian/Pacific
      const oceanBounds = [20, -68, 147];
      ctx.strokeStyle = C.boundary;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([5, 7]);
      for (const lng of oceanBounds) {
        const th = (lng * Math.PI) / 180;
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i <= 60; i++) {
          const phi = (i / 60) * Math.PI;
          const sy = Math.cos(phi);
          const sx = Math.sin(phi) * Math.cos(th + angle);
          const sz = Math.sin(phi) * Math.sin(th + angle);
          if (sz > 0.01) {
            if (!drawing) { ctx.moveTo(cx + sx * r, cy - sy * r); drawing = true; }
            else ctx.lineTo(cx + sx * r, cy - sy * r);
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // --- Arctic Circle (66.5°N) + Southern Ocean (60°S) ---
      ctx.strokeStyle = C.tropic;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      for (const lat of [66.5, -60]) {
        const phi = (lat * Math.PI) / 180;
        const rr = Math.cos(phi) * r;
        const yy = cy - Math.sin(phi) * r;
        ctx.beginPath();
        ctx.ellipse(cx, yy, rr, rr * 0.20, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // --- North & South pole markers ---
      for (const lat of [90, -90]) {
        const pt = project(0, lat, cx, cy, r, angle);
        if (pt.z <= 0) continue;
        ctx.fillStyle = C.pole;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // --- continent & ocean labels ---
      drawLabels(ctx, LABELS, angle, cx, cy, r, C);

      // --- outer glow ---
      const glow = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.16);
      glow.addColorStop(0, "transparent");
      glow.addColorStop(1, C.glow);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // --- rim ---
      ctx.strokeStyle = C.rim;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      rafRef = requestAnimationFrame(draw);
    };

    let rafRef = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef);
  }, [theme, size, paused, projectContinents]);

  return (
    <canvas
      ref={canvasRef}
      className="block select-none cursor-pointer"
      aria-hidden="true"
      onClick={() => setPaused((p) => !p)}
      onMouseLeave={() => setPaused(false)}
      title="Click to pause — move mouse away to resume"
    />
  );
}
