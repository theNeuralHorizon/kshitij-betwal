"use client"

import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react"
import { PORTFOLIO, type Project } from "./data"

// Lazy-loaded visuals (hero robot + contact earth)
const Spline = lazy(() => import("@splinetool/react-spline"))
const RotatingEarth = lazy(() => import("../ui/wireframe-dotted-globe"))

// ── Typography constants ──
const DISPLAY = '"Space Grotesk", "Inter Tight", system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const SERIF = '"Instrument Serif", serif'

// ── Hooks ──
function useInView<T extends HTMLElement = HTMLElement>(
  // Trigger as soon as any part of the element enters the viewport
  // (with a small bottom margin so it fires just before reaching the edge).
  // This works even when the element is taller than the viewport (e.g. the
  // 10-card project grid on mobile, where threshold 0.15 would never be met).
  options: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -10% 0px" }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      options
    )
    io.observe(el)
    return (): void => io.disconnect()
  }, [])
  return [ref, inView]
}

function useClock(tz: string = "Asia/Kolkata"): string {
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return (): void => clearInterval(id)
  }, [])
  return now.toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

// ── One-time animation CSS injection ──
function injectAnimCss(): void {
  if (typeof document === "undefined") return
  if (document.getElementById("cine-anim-css")) return
  const s = document.createElement("style")
  s.id = "cine-anim-css"
  s.textContent = `
    .cine-reveal { opacity: 0; transform: translateY(42px) scale(.985); filter: blur(6px); transition: opacity 1.1s cubic-bezier(.16,.84,.24,1), transform 1.1s cubic-bezier(.16,.84,.24,1), filter .9s ease-out; will-change: opacity, transform, filter; }
    .cine-reveal.in { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    .cine-reveal.slide-left { transform: translateX(-42px) scale(.985); }
    .cine-reveal.slide-left.in { transform: translateX(0) scale(1); }
    .cine-reveal.scale-up { transform: scale(.94); }
    .cine-reveal.scale-up.in { transform: scale(1); }
    .cine-stagger > * { opacity: 0; transform: translateY(32px); transition: opacity .85s cubic-bezier(.16,.84,.24,1), transform .85s cubic-bezier(.16,.84,.24,1); }
    .cine-stagger.in > * { opacity: 1; transform: translateY(0); }
    .cine-stagger.in > *:nth-child(1){ transition-delay:.00s } .cine-stagger.in > *:nth-child(2){ transition-delay:.08s }
    .cine-stagger.in > *:nth-child(3){ transition-delay:.16s } .cine-stagger.in > *:nth-child(4){ transition-delay:.24s }
    .cine-stagger.in > *:nth-child(5){ transition-delay:.32s } .cine-stagger.in > *:nth-child(6){ transition-delay:.40s }
    .cine-stagger.in > *:nth-child(7){ transition-delay:.48s } .cine-stagger.in > *:nth-child(n+8){ transition-delay:.56s }
    @keyframes cine-marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
    @keyframes cine-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cine-fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cine-sweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes cine-pulse { 0%,100%{opacity:.3;transform:scaleY(.7)} 50%{opacity:1;transform:scaleY(1)} }
    .cine-hero-eyebrow { animation: cine-fadeIn .9s ease-out both; }
    .cine-hero-h1 { animation: cine-fadeUp 1.1s cubic-bezier(.2,.7,.2,1) .15s both; }
    .cine-hero-meta { animation: cine-fadeUp 1s cubic-bezier(.2,.7,.2,1) .45s both; }
    .cine-hero-sweep { display: inline-block; transform-origin: left; animation: cine-sweep .9s cubic-bezier(.2,.7,.2,1) .6s both; }
    html { scroll-behavior: smooth; }

    /* ── Responsive (mobile-first overrides) ── */
    @media (max-width: 900px) {
      .cine-section { padding: 80px 24px !important; }
      .cine-hero { padding: 96px 24px 80px !important; min-height: auto !important; }
      .cine-hero-robot { display: none !important; }
      .cine-hero-stack { max-width: 100% !important; }
      .cine-nav { padding: 14px 20px !important; gap: 8px !important; }
      .cine-nav-links { display: none !important; }
      .cine-nav-clock { display: none !important; }
      .cine-grid-2, .cine-grid-2-equal { grid-template-columns: 1fr !important; gap: 28px !important; }
      .cine-grid-2-narrow { grid-template-columns: 1fr !important; gap: 24px !important; }
      .cine-grid-projects { grid-template-columns: 1fr !important; gap: 20px !important; }
      .cine-work-row { grid-template-columns: 36px 1fr !important; row-gap: 4px !important; }
      .cine-work-row > :nth-child(3), .cine-work-row > :nth-child(4) {
        grid-column: 2 / 3 !important;
        text-align: left !important;
      }
      .cine-stats { grid-template-columns: 1fr 1fr !important; }
      .cine-stats > div:nth-child(odd) { border-right: 1px solid var(--cine-line, rgba(244,241,236,0.12)) !important; }
      .cine-stats > div:last-child { grid-column: 1 / -1; border-right: none !important; }
      .cine-stack-stage { padding: 24px 20px 20px !important; }
      .cine-stack-stage-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
      .cine-stack-logo { width: 140px !important; height: 140px !important; margin: 0 auto !important; }
      .cine-stack-meta { text-align: center; }
      .cine-stack-meta > div:first-child { justify-content: center; }
      .cine-marquee-text { font-size: 18px !important; }
      .cine-calendar-grid { grid-template-columns: 1fr !important; }
      .cine-calendar-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--cine-line, rgba(244,241,236,0.12)) !important; }
      .cine-earth-wrap { min-height: 320px !important; }
      .cine-earth-inner { max-width: 360px !important; }
      .cine-contact-bypass { grid-template-columns: 1fr !important; gap: 24px !important; }
      .cine-footer { grid-template-columns: 1fr !important; padding: 20px 24px !important; gap: 8px !important; text-align: left !important; }
      .cine-footer > * { text-align: left !important; }
      .cine-hero-h1 { font-size: clamp(36px, 11vw, 64px) !important; }
      .cine-hero-meta-row { grid-template-columns: 1fr 1fr !important; gap: 18px 24px !important; }
    }
    @media (max-width: 480px) {
      .cine-section { padding: 64px 20px !important; }
      .cine-hero { padding: 80px 20px 60px !important; }
      .cine-stats { grid-template-columns: 1fr !important; }
      .cine-stats > div { border-right: none !important; border-bottom: 1px solid var(--cine-line, rgba(244,241,236,0.12)) !important; }
      .cine-stats > div:last-child { border-bottom: none !important; }
      .cine-hero-meta-row { grid-template-columns: 1fr !important; gap: 14px !important; }
    }

    /* Don't run heavy hover transforms on touch devices */
    @media (hover: none) {
      .cine-card-hover:hover { transform: none !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      .cine-reveal, .cine-stagger > * { transition: none !important; opacity: 1 !important; transform: none !important; }
      html { scroll-behavior: auto; }
    }
  `
  document.head.appendChild(s)
}

// ── Reveal + Stagger wrappers ──
interface RevealProps {
  children: React.ReactNode
  variant?: string
  delay?: number
  style?: React.CSSProperties
  className?: string
}

function Reveal({ children, variant = "", delay = 0, style, className }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`cine-reveal ${variant} ${inView ? "in" : ""} ${className || ""}`}
      style={{ ...style, transitionDelay: inView ? `${delay}s` : "0s" }}
    >
      {children}
    </div>
  )
}

interface StaggerProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

function Stagger({ children, style, className }: StaggerProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`cine-stagger ${inView ? "in" : ""} ${className || ""}`}
      style={style}
    >
      {children}
    </div>
  )
}

// ── Section kicker ──
interface SectionKickerProps {
  n: string
  label: string
  sub?: string
  accent: string
  muted: string
}

function SectionKicker({ n, label, sub, accent, muted }: SectionKickerProps) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: accent, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>
        ── {n} / {label}
      </div>
      <h2 style={{
        fontFamily: DISPLAY, fontSize: "clamp(40px, 6vw, 80px)",
        fontWeight: 400, letterSpacing: "-0.03em",
        lineHeight: 0.98, margin: 0,
      }}>{label}</h2>
      {sub && (
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12, color: muted, letterSpacing: "0.06em" }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Hero ──
interface HeroProps {
  accent: string
  muted: string
  fg: string
}

function CineHeroStack({ accent, muted, fg }: HeroProps) {
  return (
    <div style={{ position: "relative", maxWidth: 880 }}>
      <div className="cine-hero-eyebrow" style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <span className="cine-hero-sweep" style={{ display: "inline-block", width: 36, height: 1, background: muted }} />
        Builder Resident · Zeoxia · Open to 2026 roles
      </div>
      <h1 className="cine-hero-h1" style={{
        fontSize: "clamp(40px, 9vw, 120px)",
        fontWeight: 500, letterSpacing: "-0.035em",
        lineHeight: 0.96, margin: "0 0 22px",
        color: fg,
      }}>
        Kshitij Betwal
      </h1>
      <p className="cine-hero-meta" style={{
        fontFamily: DISPLAY,
        fontSize: "clamp(17px, 2.4vw, 28px)",
        fontWeight: 300,
        color: muted,
        margin: "0 0 44px",
        letterSpacing: "-0.01em",
        lineHeight: 1.4,
      }}>
        I build <span style={{ fontFamily: SERIF, fontStyle: "italic", color: accent, fontWeight: 400 }}>scalable</span> software.
      </p>
      <div className="cine-hero-meta cine-hero-meta-row" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, auto))", gap: "28px 36px",
        fontFamily: MONO, fontSize: 10.5, color: muted, textTransform: "uppercase", letterSpacing: "0.14em",
        justifyContent: "start",
      }}>
        <div>Role<br /><span style={{ color: fg, fontSize: 12.5, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY, fontWeight: 400 }}>Builder Resident · Zeoxia</span></div>
        <div>Based<br /><span style={{ color: fg, fontSize: 12.5, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY, fontWeight: 400 }}>Bengaluru, IN</span></div>
        <div>Focus<br /><span style={{ color: fg, fontSize: 12.5, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY, fontWeight: 400 }}>AI Systems · Backend</span></div>
        <div>Studying<br /><span style={{ color: fg, fontSize: 12.5, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY, fontWeight: 400 }}>B.Tech CS (AI), MIT</span></div>
      </div>
    </div>
  )
}

// ── Tech stack slideshow ──
interface StackItem {
  name: string
  slug: string
  category: string
  tag: string
  count: string
  blurb: string
  accent: string
}

const STACK: StackItem[] = [
  { name: "Python",        slug: "python/python-original",                                    category: "LANGUAGE",   tag: "Primary language",      count: "5+ projects",         blurb: "ML pipelines, FastAPI services, data work, research scripts, the default for almost everything.", accent: "#3776AB" },
  { name: "FastAPI",       slug: "fastapi/fastapi-original",                                   category: "FRAMEWORK",  tag: "Async Python backend",  count: "4 projects",           blurb: "Microservices for Predictive Maintenance, QuantForge, ClaimRail, and IncidentEnv. Async-first, OpenAPI out of the box.", accent: "#009688" },
  { name: "React",         slug: "react/react-original",                                       category: "FRAMEWORK",  tag: "UI library",             count: "Live dashboards",      blurb: "The Predictive Maintenance client and most product UIs. React 18 + Vite on Vercel.",              accent: "#61DAFB" },
  { name: "TypeScript",    slug: "typescript/typescript-original",                             category: "LANGUAGE",   tag: "Typed JS",               count: "Web + mobile",         blurb: "Every frontend, plus the on-device MLP in FakeCallShield running in pure TS at ~20ms.",          accent: "#3178C6" },
  { name: "PyTorch",       slug: "pytorch/pytorch-original",                                   category: "ML",         tag: "Deep learning",          count: "skam + hacks",         blurb: "LSTM autoencoders for telemetry anomaly detection and the Meta × HF OpenEnv hackathon work.",   accent: "#EE4C2C" },
  { name: "scikit-learn",  slug: "scikitlearn/scikitlearn-original",                           category: "ML",         tag: "Classical ML",           count: "In production",        blurb: "Random Forest + Isolation Forest serving live predictions on the Predictive Maintenance API.",   accent: "#F7931E" },
  { name: "Docker",        slug: "docker/docker-original",                                     category: "INFRA",      tag: "Containers",             count: "Every service",        blurb: "Reproducible builds from laptop to Render to k3d. Multi-stage images, slim runtimes.",           accent: "#2496ED" },
  { name: "Kubernetes",    slug: "kubernetes/kubernetes-plain",                                category: "INFRA",      tag: "Orchestration",          count: "skam + QuantForge",    blurb: "Six Go microservices on k3d with pod-kill operators, HPA, and closed-loop recovery.",           accent: "#326CE5" },
  { name: "PostgreSQL",    slug: "postgresql/postgresql-original",                             category: "DATABASE",   tag: "SQL · Relational",       count: "Analytics + apps",     blurb: "Transactional stores, JSONB payloads, DAX-fed Power BI pipelines, pgvector on Sentinel.",       accent: "#4169E1" },
  { name: "Go",            slug: "go/go-original-wordmark",                                    category: "LANGUAGE",   tag: "Systems",                count: "µservice layer",       blurb: "Chaos-engineering microservices in skam and performance-critical paths in Sentinel.",           accent: "#00ADD8" },
  { name: "AWS",           slug: "amazonwebservices/amazonwebservices-original-wordmark",      category: "CLOUD",      tag: "EC2 · Cognito",          count: "Auth + compute",       blurb: "OAuth via Cognito, compute on EC2, and the production plumbing for live projects.",             accent: "#FF9900" },
  { name: "Tailwind CSS",  slug: "tailwindcss/tailwindcss-original",                           category: "STYLING",    tag: "Utility-first",          count: "Every UI",             blurb: "The styling layer across every web surface I ship, designed in tokens, not stylesheets.",      accent: "#38BDF8" },
  { name: "Node.js",       slug: "nodejs/nodejs-original",                                     category: "RUNTIME",    tag: "Server JS",              count: "Tooling + APIs",       blurb: "Build tooling, MCP servers, and small backends where the JS ecosystem pays off.",              accent: "#339933" },
  { name: "NumPy",         slug: "numpy/numpy-original",                                       category: "ML",         tag: "Array computing",        count: "QuantForge core",      blurb: "Vectorized math under the quant stack, options pricing, optimizers, risk analytics.",          accent: "#4D77CF" },
  { name: "Git",           slug: "git/git-original",                                           category: "TOOLS",      tag: "Version control",        count: "Daily driver",         blurb: "Feature branches, worktrees, a lot of rebases. This portfolio lives in one.",                   accent: "#F05032" },
]

interface CineStackProps {
  fg: string
  muted: string
  line: string
  accent: string
  cardBg: string
  panelBg: string
}

function CineStackSlideshow({ fg, muted, line, accent, cardBg, panelBg }: CineStackProps) {
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const DURATION = 3800
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)
  const stageRef = useRef<HTMLDivElement>(null)

  const n = STACK.length
  const cur = STACK[idx]

  useEffect(() => {
    const loop = (t: number) => {
      if (!lastRef.current) lastRef.current = t
      const dt = t - lastRef.current
      lastRef.current = t
      if (playing) {
        setProgress((p) => {
          const np = p + dt
          if (np >= DURATION) {
            setIdx((i) => (i + 1) % n)
            return 0
          }
          return np
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastRef.current = 0
    }
  }, [playing, n])

  const goTo = (i: number) => {
    setIdx(((i % n) + n) % n)
    setProgress(0)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = stageRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      if ((document.activeElement as HTMLElement)?.tagName === "INPUT") return
      if (e.key === "ArrowLeft") goTo(idx - 1)
      if (e.key === "ArrowRight") goTo(idx + 1)
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [idx, n])

  return (
    <div
      ref={stageRef}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      style={{
        position: "relative",
        border: `1px solid ${line}`,
        borderRadius: 12,
        background: panelBg,
        overflow: "hidden",
        marginTop: 60,
        maxWidth: 1440,
      }}
    >
      {/* Stage */}
      <div className="cine-stack-stage cine-stack-stage-grid" style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 48,
        alignItems: "center",
        padding: "32px 48px 28px",
      }}>
        {/* Logo column */}
        <div className="cine-stack-logo" style={{ position: "relative", aspectRatio: "1 / 1", width: 200 }}>
          <div style={{
            position: "absolute", inset: "14%",
            borderRadius: "50%",
            filter: "blur(50px)",
            opacity: 0.4,
            background: cur.accent,
            transition: "background-color .8s ease",
            zIndex: 0,
          }} />
          {STACK.map((s, i) => (
            <img
              key={s.slug}
              src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${s.slug}.svg`}
              alt={`${s.name} logo`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              width={140}
              height={140}
              style={{
                position: "absolute",
                inset: 0,
                margin: "auto",
                width: "62%",
                height: "62%",
                objectFit: "contain",
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? "scale(1) rotate(0deg)" : "scale(.88) rotate(-4deg)",
                transition: "opacity .55s ease, transform .6s cubic-bezier(.2,.9,.3,1)",
                filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.55))",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>

        {/* Meta column */}
        <div className="cine-stack-meta" style={{ minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em",
            marginBottom: 14,
          }}>
            <span style={{ color: accent }}>
              {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <span style={{
              padding: "2px 10px",
              background: `${accent}1a`,
              border: `1px solid ${accent}44`,
              color: accent,
              borderRadius: 999,
              fontSize: 10,
            }}>
              {cur.category}
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap",
            marginBottom: 8,
          }}>
            <h3 style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              margin: 0,
              color: fg,
            }}>
              {cur.name}
            </h3>
            <span style={{
              fontFamily: MONO, fontSize: 12, color: muted,
              textTransform: "uppercase", letterSpacing: "0.14em",
            }}>
              · {cur.tag}
            </span>
          </div>

          <p style={{
            fontSize: 15, lineHeight: 1.6, color: muted,
            maxWidth: "min(780px, 100%)", margin: "8px 0 18px",
          }}>
            {cur.blurb}
          </p>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "8px 14px",
            background: cardBg,
            border: `1px solid ${line}`,
            borderRadius: 999,
            fontFamily: MONO, fontSize: 11, color: muted,
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: cur.accent,
              boxShadow: `0 0 10px ${cur.accent}`,
            }} />
            {cur.count}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
            <button
              onClick={() => goTo(idx - 1)}
              aria-label="Previous tech"
              style={{
                width: 42, height: 42, display: "grid", placeItems: "center",
                background: cardBg, border: `1px solid ${line}`, borderRadius: 8,
                color: muted, cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; (e.currentTarget as HTMLButtonElement).style.borderColor = accent }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = muted; (e.currentTarget as HTMLButtonElement).style.borderColor = line }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              style={{
                width: 42, height: 42, display: "grid", placeItems: "center",
                background: cardBg, border: `1px solid ${line}`, borderRadius: 8,
                color: muted, cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; (e.currentTarget as HTMLButtonElement).style.borderColor = accent }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = muted; (e.currentTarget as HTMLButtonElement).style.borderColor = line }}
            >
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button
              onClick={() => goTo(idx + 1)}
              aria-label="Next tech"
              style={{
                width: 42, height: 42, display: "grid", placeItems: "center",
                background: cardBg, border: `1px solid ${line}`, borderRadius: 8,
                color: muted, cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; (e.currentTarget as HTMLButtonElement).style.borderColor = accent }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = muted; (e.currentTarget as HTMLButtonElement).style.borderColor = line }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{
        display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6,
        padding: "6px 24px 24px",
      }}>
        {STACK.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === idx ? 36 : 22,
              height: 4,
              borderRadius: 2,
              background: i === idx ? accent : "rgba(255,255,255,0.12)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all .3s cubic-bezier(.2,.7,.2,1)",
            }}
          />
        ))}
      </div>

      {/* Progress */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: 2, background: "rgba(255,255,255,0.04)",
      }}>
        <div style={{
          height: "100%",
          width: `${Math.min(100, (progress / DURATION) * 100)}%`,
          background: `linear-gradient(90deg, ${accent}, ${cur.accent})`,
          transition: "width .08s linear",
        }} />
      </div>
    </div>
  )
}

// ── Project card ──
interface CineCardProps {
  p: Project
  i: number
  fg: string
  muted: string
  line: string
  accent: string
  cardBg: string
}

function CineCard({ p, i, fg, muted, line, accent, cardBg }: CineCardProps) {
  const [hover, setHover] = useState(false)
  const href = p.live || (p.repo ? `https://github.com/${p.repo}` : undefined)

  const content = (
    <>
      <div style={{
        height: 160, position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${p.accent}33 0%, ${p.accent}08 60%, transparent 100%)`,
        borderBottom: `1px solid ${line}`,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle at ${20 + i * 15}% 50%, ${p.accent}66 0%, transparent 50%)`,
          opacity: hover ? 1 : 0.7, transition: "opacity .3s",
        }} />
        <div style={{
          position: "absolute", top: 16, left: 20,
          fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.14em",
        }}>
          № {String(i + 1).padStart(2, "0")} / {p.year} · {p.kind}
        </div>
        <div style={{
          position: "absolute", bottom: 16, right: 20,
          fontFamily: DISPLAY, fontSize: 28, fontWeight: 500, color: p.accent,
          letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"',
        }}>{p.metric}</div>
      </div>
      <div style={{ padding: "24px 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontSize: 30, fontWeight: 500, margin: "0 0 8px",
          letterSpacing: "-0.02em", lineHeight: 1.1,
          color: hover ? accent : fg, transition: "color .2s",
        }}>{p.title}</h3>
        <div style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          {p.role} · {p.status}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: muted, margin: "0 0 16px", flex: 1 }}>
          {p.blurb}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.tags.map((t) => (
            <span key={t} style={{
              fontFamily: MONO, fontSize: 10, padding: "3px 8px",
              border: `1px solid ${line}`, borderRadius: 999,
              color: muted, letterSpacing: "0.06em",
            }}>{t}</span>
          ))}
        </div>
      </div>
    </>
  )

  const sharedStyle: React.CSSProperties = {
    position: "relative", background: cardBg,
    border: `1px solid ${hover ? accent : line}`,
    borderRadius: 8, overflow: "hidden", cursor: href ? "pointer" : "default",
    transition: "border-color .3s, transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .3s",
    transform: hover ? "translateY(-6px)" : "translateY(0)",
    boxShadow: hover ? `0 24px 60px -20px ${p.accent}55, 0 0 0 1px ${accent}44` : "0 0 0 0 transparent",
    minHeight: 340, display: "flex", flexDirection: "column",
    textDecoration: "none", color: "inherit",
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={sharedStyle}
      >
        {content}
      </a>
    )
  }
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sharedStyle}
    >
      {content}
    </div>
  )
}

// ── Booking calendar ──
interface CalendarProps {
  fg: string
  muted: string
  line: string
  accent: string
  cardBg: string
  email: string
}

type BookingType = "intro" | "deep" | "advisory"

function Calendar({ fg, muted, line, accent, cardBg, email }: CalendarProps) {
  const today = new Date()
  const [view, setView] = useState<{ y: number; m: number }>({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<{ y: number; m: number; d: number } | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [type, setType] = useState<BookingType>("intro")
  const [confirmed, setConfirmed] = useState(false)
  const [name, setName] = useState("")
  const [visitorEmail, setVisitorEmail] = useState("")
  const [what, setWhat] = useState("")

  const monthName = new Date(view.y, view.m, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
  const first = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  const isAvail = (y: number, m: number, d: number): boolean => {
    const dt = new Date(y, m, d)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (dt < t) return false
    const dow = dt.getDay()
    if (dow === 0 || dow === 6) return false
    if ((d + m) % 7 === 3) return false
    return true
  }

  const times = ["09:30", "10:30", "11:30", "14:00", "15:00", "16:00"]
  const types: Array<{ id: BookingType; label: string; min: number }> = [
    { id: "intro", label: "Intro call", min: 30 },
    { id: "deep", label: "Deep dive", min: 60 },
    { id: "advisory", label: "Advisory", min: 45 },
  ]
  const selectedType = types.find((t) => t.id === type)!

  const cells: Array<number | null> = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const nav = (delta: number): void => {
    setView((v) => {
      const m = v.m + delta
      const y = v.y + Math.floor(m / 12)
      return { y, m: ((m % 12) + 12) % 12 }
    })
    setSelected(null)
    setTime(null)
  }

  const selectedDay = selected
    ? new Date(selected.y, selected.m, selected.d).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      })
    : null

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail.trim())
  const canConfirm = Boolean(selected && time && name.trim() && what.trim() && emailValid)

  /**
   * Build a Google Calendar add-event URL. When the visitor saves it,
   * Kshitij is added as a guest and Google emails him a calendar invite.
   * IST → UTC: subtract 5h30m (330 min).
   */
  const buildGoogleCalendarUrl = (): string => {
    if (!selected || !time) return "#"
    const [hh, mm] = time.split(":").map(Number)
    const startUtc = new Date(Date.UTC(selected.y, selected.m, selected.d, hh, mm))
    startUtc.setUTCMinutes(startUtc.getUTCMinutes() - 330) // IST → UTC
    const endUtc = new Date(startUtc.getTime() + selectedType.min * 60_000)
    const fmt = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0")
      return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`
    }
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Kshitij × ${name.split(" ")[0] || "Guest"}, ${selectedType.label}`,
      dates: `${fmt(startUtc)}/${fmt(endUtc)}`,
      details: `Booked via portfolio.\n\nGuest: ${name} <${visitorEmail}>\nTopic: ${what}\n\nA reply with the meeting link will follow.`,
      add: `${email},${visitorEmail}`,
      location: "Online (link to follow)",
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  if (confirmed) {
    return (
      <div style={{
        background: cardBg, border: `1px solid ${accent}`, borderRadius: 12,
        padding: 40, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(500px 300px at 80% 0%, ${accent}22, transparent 60%)`,
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: `${accent}22`, border: `1px solid ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: accent, marginBottom: 24,
          }}>✓</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: accent, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>
            Booked
          </div>
          <h3 style={{ fontSize: 32, fontWeight: 500, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Thanks, {name.split(" ")[0]}.<br />
            <span style={{ color: muted, fontStyle: "italic", fontFamily: SERIF, fontWeight: 400 }}>
              See you {selectedDay?.split(",")[0]}.
            </span>
          </h3>
          <div style={{ fontSize: 14, color: muted, lineHeight: 1.7, marginBottom: 24 }}>
            Save the Google Calendar event in the new tab, I&apos;ll get the invite by email and reply with a meeting link.<br />
            <span style={{ color: fg, fontFamily: MONO, fontSize: 13 }}>{selectedDay} · {time} IST · {selectedType.min} min</span>
          </div>
          <button
            onClick={() => { setConfirmed(false); setSelected(null); setTime(null); setName(""); setVisitorEmail(""); setWhat(""); }}
            style={{
              padding: "10px 18px", background: "transparent",
              border: `1px solid ${line}`, color: muted,
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", borderRadius: 999,
            }}
          >
            Book another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: cardBg, border: `1px solid ${line}`, borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${line}`,
        display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
            📅 Book a call
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>Find a time that works</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                padding: "6px 10px", fontSize: 10, fontFamily: MONO,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: type === t.id ? `${accent}22` : "transparent",
                border: `1px solid ${type === t.id ? accent : line}`,
                color: type === t.id ? accent : muted,
                borderRadius: 999, cursor: "pointer",
              }}
            >
              {t.label} · {t.min}m
            </button>
          ))}
        </div>
      </div>

      <div className="cine-calendar-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr" }}>
        <div style={{ padding: 24, borderRight: `1px solid ${line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => nav(-1)} style={{
              background: "transparent", border: `1px solid ${line}`, color: muted,
              width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14,
            }}>‹</button>
            <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{monthName}</div>
            <button onClick={() => nav(1)} style={{
              background: "transparent", border: `1px solid ${line}`, color: muted,
              width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14,
            }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{
                fontFamily: MONO, fontSize: 10, color: muted,
                textAlign: "center", padding: "6px 0", letterSpacing: "0.1em",
              }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />
              const avail = isAvail(view.y, view.m, d)
              const key = `${view.y}-${view.m}-${d}`
              const isToday = key === todayKey
              const isSel = Boolean(selected && selected.y === view.y && selected.m === view.m && selected.d === d)
              return (
                <button
                  key={i}
                  disabled={!avail}
                  onClick={() => { setSelected({ y: view.y, m: view.m, d }); setTime(null) }}
                  style={{
                    aspectRatio: "1",
                    background: isSel ? accent : isToday ? `${accent}15` : "transparent",
                    border: `1px solid ${isSel ? accent : isToday ? accent : "transparent"}`,
                    color: isSel ? "#0a0a0b" : avail ? fg : muted,
                    opacity: avail ? 1 : 0.35,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontFamily: MONO, fontSize: 12,
                    borderRadius: 6, padding: 0,
                    transition: "all .12s",
                    position: "relative",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {d}
                  {avail && !isSel && (
                    <span style={{
                      position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                      width: 3, height: 3, borderRadius: "50%", background: accent, opacity: 0.6,
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 16, fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <span><span style={{ color: accent }}>●</span> available</span>
            <span><span style={{ opacity: 0.4 }}>●</span> unavailable</span>
          </div>
        </div>

        <div style={{ padding: 24, background: "rgba(255,255,255,0.015)", minHeight: 360 }}>
          {!selected ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
              textAlign: "center", color: muted, fontSize: 13, lineHeight: 1.6,
              padding: "40px 8px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>←</div>
              Pick a day on the left<br />to see open times.
            </div>
          ) : (
            <>
              <div style={{ fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>
                {selectedDay?.split(",")[0]}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 16 }}>
                {selectedDay?.split(",").slice(1).join(",").trim()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    style={{
                      padding: "10px 8px",
                      background: time === t ? accent : "transparent",
                      border: `1px solid ${time === t ? accent : line}`,
                      color: time === t ? "#0a0a0b" : fg,
                      fontFamily: MONO, fontSize: 12, fontFeatureSettings: '"tnum"',
                      borderRadius: 6, cursor: "pointer", transition: "all .12s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10, color: muted, letterSpacing: "0.08em" }}>
                Times shown in IST · {selectedType.min} min
              </div>
            </>
          )}
        </div>
      </div>

      {selected && time && (
        <div style={{ padding: 24, borderTop: `1px solid ${line}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                padding: "12px 14px", background: "rgba(255,255,255,0.03)",
                border: `1px solid ${line}`, color: fg, fontFamily: DISPLAY, fontSize: 14,
                borderRadius: 6, outline: "none",
              }}
            />
            <input
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              placeholder="Your email"
              style={{
                padding: "12px 14px", background: "rgba(255,255,255,0.03)",
                border: `1px solid ${visitorEmail && !emailValid ? "#ef4444" : line}`,
                color: fg, fontFamily: DISPLAY, fontSize: 14,
                borderRadius: 6, outline: "none",
              }}
            />
          </div>
          <textarea
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="What would you like to chat about?"
            rows={2}
            style={{
              width: "100%", padding: "12px 14px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${line}`, color: fg, fontFamily: DISPLAY, fontSize: 14,
              borderRadius: 6, outline: "none", resize: "vertical", boxSizing: "border-box",
              marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: muted, letterSpacing: "0.08em" }}>
              <span style={{ color: accent }}>●</span> {selectedDay} · {time} IST · {selectedType.min} min
            </div>
            <button
              disabled={!canConfirm}
              onClick={() => {
                if (!canConfirm) return
                // Open Google Calendar prefilled, saving it sends Kshitij a calendar invite by email.
                window.open(buildGoogleCalendarUrl(), "_blank", "noopener, noreferrer")
                setConfirmed(true)
              }}
              style={{
                padding: "12px 22px",
                background: canConfirm ? accent : "transparent",
                border: `1px solid ${canConfirm ? accent : line}`,
                color: canConfirm ? "#0a0a0b" : muted,
                fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                borderRadius: 999, cursor: canConfirm ? "pointer" : "not-allowed",
                transition: "all .15s", fontWeight: 600,
              }}
            >
              Confirm booking →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main cinematic component ──
export default function Cinematic() {
  const accent = "#22d3ee"

  // Color scheme, dark with translucent surfaces so Astro StarField shows through.
  const fg = "#f4f1ec"
  const muted = "#9a979b"
  const line = "rgba(244,241,236,0.12)"
  // Slightly transparent surfaces to let stars peek through.
  const panelBg = "rgba(17,17,20,0.72)"
  const cardBg = "rgba(17,17,20,0.82)"

  const [filter, setFilter] = useState<string>("all")
  const kinds = useMemo<string[]>(() => ["all", ...Array.from(new Set(PORTFOLIO.projects.map((p) => p.kind)))], [])
  const filtered = filter === "all" ? PORTFOLIO.projects : PORTFOLIO.projects.filter((p) => p.kind === filter)

  const navItems = ["Home", "About", "Work", "Projects", "Stack", "Contact"]
  const [activeSection, setActiveSection] = useState("home")
  const [scrollY, setScrollY] = useState(0)

  const clock = useClock("Asia/Kolkata")

  useEffect(() => {
    injectAnimCss()
  }, [])

  useEffect(() => {
    const onScroll = (): void => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return (): void => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const ids = navItems.map((n) => n.toLowerCase())
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.25) {
            setActiveSection((e.target as HTMLElement).id)
          }
        })
      },
      { threshold: [0.25, 0.5, 0.75] }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return (): void => io.disconnect()
  }, [])

  const scrollPct =
    typeof document !== "undefined"
      ? Math.min(100, (scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100)
      : 0

  return (
    <div style={{ color: fg, minHeight: "100%", fontFamily: DISPLAY, position: "relative" }}>
      {/* Ambient gradient wash layered on top of Astro StarField */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(1200px 600px at 70% 0%, ${accent}15 0%, transparent 60%), radial-gradient(900px 500px at 10% 120%, ${accent}0a 0%, transparent 60%)`,
      }} />

      {/* Top nav */}
      <nav className="cine-nav" style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "18px 56px",
        background: "rgba(10,10,11,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${line}`,
      }}>
        <a href="#home" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, textDecoration: "none" }}>
          <span style={{ color: accent, fontSize: 9, marginRight: 8, verticalAlign: "middle" }}>●</span>
          KSHITIJ / '26
        </a>
        <div className="cine-nav-links" style={{ display: "flex", gap: 28, fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", position: "relative" }}>
          {navItems.map((t) => {
            const id = t.toLowerCase()
            const active = activeSection === id
            return (
              <a
                key={t}
                href={`#${id}`}
                style={{
                  color: active ? fg : muted, textDecoration: "none", transition: "color .2s",
                  position: "relative", padding: "4px 0",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = accent }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = muted }}
              >
                {t}
                <span style={{
                  position: "absolute", left: 0, right: 0, bottom: -2, height: 1,
                  background: accent,
                  transform: active ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left",
                  transition: "transform .35s cubic-bezier(.2,.7,.2,1)",
                }} />
              </a>
            )
          })}
        </div>
        <div className="cine-nav-clock" style={{ textAlign: "right", fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: muted }}>
          {clock} IST
        </div>
      </nav>

      {/* Scroll progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 30,
        background: "transparent", pointerEvents: "none",
      }}>
        <div style={{
          height: "100%",
          width: `${scrollPct}%`,
          background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
          boxShadow: `0 0 12px ${accent}`,
          transition: "width .05s linear",
        }} />
      </div>

      {/* HERO */}
      <section id="home" className="cine-section cine-hero" style={{ position: "relative", padding: "120px 56px 100px", borderBottom: `1px solid ${line}`, overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center" }}>
        {/* Ambient halo (always-on, sits behind robot on desktop, fills space on mobile) */}
        <div aria-hidden style={{
          position: "absolute",
          top: "50%", right: "-10%",
          width: "60%", height: "80%",
          transform: "translateY(-50%)",
          background: `radial-gradient(ellipse at center, ${accent}18 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(40px)",
        }} />
        <div aria-hidden style={{
          position: "absolute",
          top: "10%", left: "20%",
          width: "40%", height: "60%",
          background: `radial-gradient(ellipse at center, rgba(167, 139, 250, 0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(60px)",
        }} />

        {/* Robot, desktop only (hidden via CSS on <=900px), parallax + fade on scroll */}
        <div className="cine-hero-robot" style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          opacity: Math.max(0, 1 - scrollY / 900),
          transform: `translateY(${scrollY * 0.06}px)`,
          transition: "opacity .25s",
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0, width: "62%", height: "100%",
            pointerEvents: "auto",
            // Radial mask so the robot fades on every edge into the page background
            WebkitMaskImage: "radial-gradient(ellipse 68% 82% at 62% 50%, #000 32%, rgba(0,0,0,.9) 52%, rgba(0,0,0,.4) 75%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 68% 82% at 62% 50%, #000 32%, rgba(0,0,0,.9) 52%, rgba(0,0,0,.4) 75%, transparent 100%)",
          }}>
            <Suspense fallback={null}>
              <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" style={{ width: "100%", height: "100%", background: "transparent" }} />
            </Suspense>
          </div>
        </div>

        <div className="cine-hero-stack" style={{
          width: "100%",
          maxWidth: "min(720px, 52%)",
          transform: `translateY(${scrollY * 0.12}px)`,
          opacity: Math.max(0, 1 - scrollY / 750),
          transition: "opacity .2s",
          position: "relative", zIndex: 2,
        }}>
          <CineHeroStack accent={accent} muted={muted} fg={fg} />
        </div>
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.3em",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          opacity: Math.max(0, 1 - scrollY / 200), zIndex: 3,
        }}>
          <div>Scroll</div>
          <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${muted}, transparent)`, animation: "cine-pulse 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* Marquee */}
      <section style={{ borderBottom: `1px solid ${line}`, overflow: "hidden", padding: "18px 0", position: "relative", background: panelBg }}>
        <div className="cine-marquee-text" style={{
          display: "flex", gap: 40, whiteSpace: "nowrap",
          animation: "cine-marquee 60s linear infinite",
          fontFamily: DISPLAY, fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em",
          color: muted,
        }}>
          {Array.from({ length: 3 }).flatMap((_, k) =>
            ["PYTHON", "FASTAPI", "REACT", "AWS", "ML SYSTEMS", "DISTRIBUTED", "DSA"].map((w, i) => (
              <span key={`${k}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 40 }}>
                {w}<span style={{ color: accent }}>✦</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="cine-section" style={{ padding: "100px 56px", borderBottom: `1px solid ${line}`, position: "relative", background: panelBg }}>
        <Reveal variant="slide-left"><SectionKicker n="01" label="About" sub="The short version" accent={accent} muted={muted} /></Reveal>
        <div className="cine-grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, marginTop: 60, maxWidth: 1200 }}>
          <Reveal delay={0.1}>
            <h3 style={{
              fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 400,
              lineHeight: 1.25, letterSpacing: "-0.02em", margin: "0 0 28px",
            }}>
              I care about systems that stay <span style={{ color: accent, fontStyle: "italic", fontFamily: SERIF }}>scalable and legible</span>, backends, ML pipelines, developer tools.
            </h3>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: muted, margin: "0 0 16px", maxWidth: 620 }}>
              Computer Science (AI) undergrad at Manipal Institute of Technology, currently a Builder Resident at Zeoxia working on early-stage R&D across AI systems and edge computing.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: muted, margin: "0 0 16px", maxWidth: 620 }}>
              I write production-quality code in Python, C++ and JavaScript, FastAPI + React, deployed on AWS. Strong fundamentals in DSA, OOP, DBMS and system design.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: muted, margin: 0, maxWidth: 620 }}>
              Outside classes: building ML tools, shipping prototypes.
            </p>
          </Reveal>
          <Stagger>
            <div style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>
              Currently
            </div>
            {PORTFOLIO.now.slice(0, 4).map((n, i) => (
              <div key={i} style={{
                padding: "16px 0",
                borderTop: `1px solid ${line}`,
                fontSize: 16, lineHeight: 1.5,
                display: "grid", gridTemplateColumns: "24px 1fr", gap: 12,
              }}>
                <span style={{ color: accent, fontFamily: MONO, fontSize: 11, paddingTop: 3 }}>→</span>
                <span>{n}</span>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="cine-section" style={{ padding: "100px 56px", borderBottom: `1px solid ${line}`, position: "relative" }}>
        <Reveal variant="slide-left"><SectionKicker n="02" label="Work & Education" sub="R&D residency + CS @ Manipal Institute of Technology" accent={accent} muted={muted} /></Reveal>
        <Stagger style={{ marginTop: 60, maxWidth: 1100 }}>
          {PORTFOLIO.experience.map((e, i) => (
            <div key={i} className="cine-work-row" style={{
              display: "grid", gridTemplateColumns: "80px 1fr 180px 140px", gap: 24,
              padding: "28px 0", alignItems: "baseline",
              borderTop: i === 0 ? `1px solid ${line}` : "none",
              borderBottom: `1px solid ${line}`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: accent, letterSpacing: "0.08em" }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {e.co}
              </div>
              <div style={{ fontSize: 14, color: muted, lineHeight: 1.5 }}>{e.role}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>
                {e.yr}
              </div>
            </div>
          ))}
        </Stagger>

        <Reveal variant="scale-up" className="cine-stats" style={{
          marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
          border: `1px solid ${line}`, borderRadius: 8, overflow: "hidden",
          background: panelBg,
          maxWidth: 1100,
        }}>
          {PORTFOLIO.stats.map((s, i) => (
            <div key={s.k} style={{
              padding: "28px 24px",
              borderRight: i < PORTFOLIO.stats.length - 1 ? `1px solid ${line}` : "none",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>{s.k}</div>
              <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", color: fg, fontFeatureSettings: '"tnum"' }}>{s.v}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="cine-section" style={{ padding: "100px 56px", borderBottom: `1px solid ${line}`, position: "relative", background: panelBg }}>
        <Reveal variant="slide-left"><SectionKicker n="03" label="Projects" sub="Selected case studies" accent={accent} muted={muted} /></Reveal>

        <Reveal delay={0.1} style={{ display: "flex", gap: 10, margin: "40px 0 56px", fontFamily: MONO, fontSize: 11, flexWrap: "wrap" }}>
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                padding: "8px 14px", cursor: "pointer",
                background: filter === k ? "rgba(28,28,32,0.9)" : "transparent",
                border: `1px solid ${filter === k ? accent : line}`,
                color: filter === k ? accent : muted,
                textTransform: "uppercase", letterSpacing: "0.1em",
                borderRadius: 999,
                transition: "all .15s",
              }}
            >
              {k}
            </button>
          ))}
        </Reveal>

        <Stagger key={filter} className="cine-grid-projects" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
          {filtered.map((p, i) => (
            <CineCard key={p.id} p={p} i={i} fg={fg} muted={muted} line={line} accent={accent} cardBg={cardBg} />
          ))}
        </Stagger>
      </section>

      {/* STACK */}
      <section id="stack" className="cine-section" style={{ padding: "100px 56px", borderBottom: `1px solid ${line}`, position: "relative" }}>
        <Reveal variant="slide-left"><SectionKicker n="04" label="Stack" sub="Top 15 tools I reach for, in rotation" accent={accent} muted={muted} /></Reveal>
        <Reveal delay={0.1}>
          <CineStackSlideshow fg={fg} muted={muted} line={line} accent={accent} cardBg={cardBg} panelBg={panelBg} />
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="cine-section" style={{ padding: "100px 56px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(900px 500px at 50% 30%, ${accent}10 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", maxWidth: 1440, zIndex: 1 }}>
          <Reveal variant="slide-left"><SectionKicker n="05" label="Contact" sub="Let's find a time" accent={accent} muted={muted} /></Reveal>

          {/* Available pill */}
          <Reveal delay={0.08}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 14px",
              background: `${accent}12`,
              border: `1px solid ${accent}44`,
              borderRadius: 999,
              fontFamily: MONO, fontSize: 10.5, color: accent,
              textTransform: "uppercase", letterSpacing: "0.16em",
              marginTop: 24,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: accent, boxShadow: `0 0 10px ${accent}`,
                animation: "cine-pulse 2s ease-in-out infinite",
              }} />
              Available for 2026 roles
            </div>
          </Reveal>

          {/* Row 1: Headline on left, Reach-me on right */}
          <div className="cine-grid-2-narrow" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
            gap: 48,
            alignItems: "center",
            marginTop: 28,
            marginBottom: 56,
          }}>
            <Reveal delay={0.12}>
              <h2 style={{
                fontSize: "clamp(34px, 4.8vw, 64px)",
                fontWeight: 500, letterSpacing: "-0.03em",
                lineHeight: 1, margin: "0 0 16px", maxWidth: 680,
              }}>
                Got something <span style={{
                  fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: accent,
                }}>worth building?</span>
              </h2>
              <p style={{
                fontSize: 15, lineHeight: 1.6, color: muted,
                maxWidth: 520, margin: 0,
              }}>
                Internships, SWE roles, or deep-tech R&D, I&apos;m listening. Drop a line or pick a time that works.
              </p>
            </Reveal>

            {/* Reach me directly, right of headline */}
            <Reveal delay={0.18} variant="scale-up">
              <div style={{
                border: `1px solid ${line}`, borderRadius: 12,
                background: cardBg, padding: 20,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
                  Reach me directly
                </div>
                <a
                  href={`mailto:${PORTFOLIO.email}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px",
                    border: `1px solid ${accent}`, color: fg,
                    background: `${accent}10`,
                    textDecoration: "none", fontFamily: MONO, fontSize: 12,
                    letterSpacing: "0.04em",
                    borderRadius: 6, transition: "all .2s",
                    marginBottom: 12,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#0a0a0b" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}10`; e.currentTarget.style.color = fg }}
                >
                  <span>{PORTFOLIO.email}</span>
                  <span style={{ fontSize: 13 }}>→</span>
                </a>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {PORTFOLIO.social.map((s, i) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{
                        padding: "9px 0",
                        borderTop: `1px solid ${line}`,
                        display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 10, alignItems: "center",
                        color: fg, textDecoration: "none",
                        transition: "padding-left .2s, color .2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "6px"; e.currentTarget.style.color = accent }}
                      onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.color = fg }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11.5 }}>{s.url}</span>
                      <span style={{ color: muted, fontSize: 11 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Row 2: Calendar on left, Earth (transparent) on right, matched heights */}
          <div className="cine-grid-2-equal" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
            gap: 48,
            alignItems: "stretch",
          }}>
            <Reveal variant="scale-up" delay={0.22}>
              <Calendar fg={fg} muted={muted} line={line} accent={accent} cardBg={cardBg} email={PORTFOLIO.email} />
            </Reveal>

            {/* Transparent earth, no card, drops onto page bg */}
            <Reveal delay={0.28} variant="scale-up">
              <div className="cine-earth-wrap" style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 420,
                display: "grid",
                placeItems: "center",
                background: "transparent",
              }}>
                <div style={{
                  position: "absolute", inset: "6%",
                  background: `radial-gradient(circle at 50% 50%, ${accent}1a 0%, transparent 65%)`,
                  filter: "blur(24px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                <div className="cine-earth-inner" style={{ position: "relative", width: "100%", maxWidth: 520, zIndex: 1 }}>
                  <Suspense fallback={null}>
                    <RotatingEarth width={520} height={520} />
                  </Suspense>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cine-footer" style={{
        borderTop: `1px solid ${line}`,
        padding: "24px 56px",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.12em",
        position: "relative",
        background: "rgba(10,10,11,0.6)",
      }}>
        <div>© 2026 Kshitij Betwal</div>
        <div style={{ textAlign: "center" }}>Built with intent · no trackers</div>
        <div style={{ textAlign: "right" }}>{clock} IST · Bengaluru</div>
      </footer>
    </div>
  )
}
