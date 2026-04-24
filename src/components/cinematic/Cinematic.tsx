"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { PORTFOLIO, type Project } from "./data"

// ── Typography constants ──
const DISPLAY = '"Space Grotesk", "Inter Tight", system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const SERIF = '"Instrument Serif", serif'

// ── Hooks ──
function useInView<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15 }
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
    .cine-reveal { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); will-change: opacity, transform; }
    .cine-reveal.in { opacity: 1; transform: translateY(0); }
    .cine-reveal.slide-left { transform: translateX(-28px); }
    .cine-reveal.slide-left.in { transform: translateX(0); }
    .cine-reveal.scale-up { transform: scale(.96); }
    .cine-reveal.scale-up.in { transform: scale(1); }
    .cine-stagger > * { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
    .cine-stagger.in > * { opacity: 1; transform: translateY(0); }
    .cine-stagger.in > *:nth-child(1){ transition-delay:.00s } .cine-stagger.in > *:nth-child(2){ transition-delay:.06s }
    .cine-stagger.in > *:nth-child(3){ transition-delay:.12s } .cine-stagger.in > *:nth-child(4){ transition-delay:.18s }
    .cine-stagger.in > *:nth-child(5){ transition-delay:.24s } .cine-stagger.in > *:nth-child(6){ transition-delay:.30s }
    .cine-stagger.in > *:nth-child(7){ transition-delay:.36s } .cine-stagger.in > *:nth-child(n+8){ transition-delay:.42s }
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
    <div style={{ position: "relative", maxWidth: 1400 }}>
      <div className="cine-hero-eyebrow" style={{ fontFamily: MONO, fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <span className="cine-hero-sweep" style={{ display: "inline-block", width: 40, height: 1, background: muted }} />
        Builder Resident · Zeoxia · Open to 2026 roles
      </div>
      <h1 className="cine-hero-h1" style={{
        fontSize: "clamp(64px, 11vw, 180px)",
        fontWeight: 400, letterSpacing: "-0.045em",
        lineHeight: 0.92, margin: "0 0 40px",
      }}>
        Kshitij Betwal<br />
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: accent }}>builds scalable</span><br />
        software.
      </h1>
      <div className="cine-hero-meta" style={{
        display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 40,
        fontFamily: MONO, fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: "0.12em",
        justifyContent: "start",
      }}>
        <div>Role<br /><span style={{ color: fg, fontSize: 13, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY }}>Builder Resident · Zeoxia</span></div>
        <div>Based<br /><span style={{ color: fg, fontSize: 13, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY }}>Bengaluru, IN</span></div>
        <div>Focus<br /><span style={{ color: fg, fontSize: 13, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY }}>AI Systems · Backend</span></div>
        <div>Studying<br /><span style={{ color: fg, fontSize: 13, textTransform: "none", letterSpacing: 0, fontFamily: DISPLAY }}>B.Tech CS (AI), MIT</span></div>
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

  const canConfirm = Boolean(selected && time && name.trim() && what.trim())

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
            An invite is on the way to your inbox.<br />
            <span style={{ color: fg, fontFamily: MONO, fontSize: 13 }}>{selectedDay} · {time} IST · {selectedType.min} min</span>
          </div>
          <button
            onClick={() => { setConfirmed(false); setSelected(null); setTime(null); setName(""); setWhat(""); }}
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

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr" }}>
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
              placeholder="Your email"
              style={{
                padding: "12px 14px", background: "rgba(255,255,255,0.03)",
                border: `1px solid ${line}`, color: fg, fontFamily: DISPLAY, fontSize: 14,
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
                // Fire mailto as a real-world fallback; keep the nice confirmation UI.
                const subject = encodeURIComponent(`Booking: ${selectedType.label} — ${selectedDay} ${time} IST`)
                const body = encodeURIComponent(`Hi Kshitij,\n\nI'd like to book a ${selectedType.label} (${selectedType.min} min) on ${selectedDay} at ${time} IST.\n\nName: ${name}\nTopic: ${what}\n`)
                window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank")
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
  const accent = "#d97757"

  // Color scheme — dark with translucent surfaces so Astro StarField shows through.
  const fg = "#f4f1ec"
  const muted = "#9a979b"
  const line = "rgba(244,241,236,0.12)"
  // Slightly transparent surfaces to let stars peek through.
  const panelBg = "rgba(17,17,20,0.72)"
  const cardBg = "rgba(17,17,20,0.82)"

  const [filter, setFilter] = useState<string>("all")
  const kinds = useMemo<string[]>(() => ["all", ...Array.from(new Set(PORTFOLIO.projects.map((p) => p.kind)))], [])
  const filtered = filter === "all" ? PORTFOLIO.projects : PORTFOLIO.projects.filter((p) => p.kind === filter)

  const navItems = ["Home", "Work", "About", "Projects", "Contact"]
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
      <nav style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "20px 40px",
        background: "rgba(10,10,11,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${line}`,
      }}>
        <a href="#home" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: muted, textDecoration: "none" }}>
          <span style={{ color: accent, fontSize: 9, marginRight: 8, verticalAlign: "middle" }}>●</span>
          KSHITIJ / '26
        </a>
        <div style={{ display: "flex", gap: 28, fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", position: "relative" }}>
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
        <div style={{ textAlign: "right", fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: muted }}>
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
      <section id="home" style={{ position: "relative", padding: "120px 40px 100px", borderBottom: `1px solid ${line}`, overflow: "hidden", minHeight: "88vh", display: "flex", alignItems: "center" }}>
        <div style={{
          width: "100%",
          transform: `translateY(${scrollY * 0.18}px)`,
          opacity: Math.max(0, 1 - scrollY / 700),
          transition: "opacity .2s",
        }}>
          <CineHeroStack accent={accent} muted={muted} fg={fg} />
        </div>
        <div style={{
          position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
          fontFamily: MONO, fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.3em",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          opacity: Math.max(0, 1 - scrollY / 200),
        }}>
          <div>Scroll</div>
          <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${muted}, transparent)`, animation: "cine-pulse 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* Marquee */}
      <section style={{ borderBottom: `1px solid ${line}`, overflow: "hidden", padding: "22px 0", position: "relative", background: panelBg }}>
        <div style={{
          display: "flex", gap: 40, whiteSpace: "nowrap",
          animation: "cine-marquee 50s linear infinite",
          fontFamily: DISPLAY, fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em",
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

      {/* WORK */}
      <section id="work" style={{ padding: "120px 40px", borderBottom: `1px solid ${line}`, position: "relative" }}>
        <Reveal variant="slide-left"><SectionKicker n="01" label="Work" sub="R&D residency + CS @ Manipal Institute of Technology" accent={accent} muted={muted} /></Reveal>
        <Stagger style={{ marginTop: 60, maxWidth: 1100 }}>
          {PORTFOLIO.experience.map((e, i) => (
            <div key={i} style={{
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

        <Reveal variant="scale-up" style={{
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

      {/* ABOUT */}
      <section id="about" style={{ padding: "120px 40px", borderBottom: `1px solid ${line}`, position: "relative", background: panelBg }}>
        <Reveal variant="slide-left"><SectionKicker n="02" label="About" sub="The short version" accent={accent} muted={muted} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, marginTop: 60, maxWidth: 1200 }}>
          <Reveal delay={0.1}>
            <h3 style={{
              fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 400,
              lineHeight: 1.25, letterSpacing: "-0.02em", margin: "0 0 28px",
            }}>
              I care about systems that stay <span style={{ color: accent, fontStyle: "italic", fontFamily: SERIF }}>scalable and legible</span> — backends, ML pipelines, developer tools.
            </h3>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: muted, margin: "0 0 16px", maxWidth: 620 }}>
              Computer Science (AI) undergrad at Manipal Institute of Technology, currently a Builder Resident at Zeoxia working on early-stage R&D across AI systems and edge computing.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: muted, margin: "0 0 16px", maxWidth: 620 }}>
              I write production-quality code in Python, C++ and JavaScript — FastAPI + React, deployed on AWS. Strong fundamentals in DSA, OOP, DBMS and system design.
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

      {/* PROJECTS */}
      <section id="projects" style={{ padding: "120px 40px", borderBottom: `1px solid ${line}`, position: "relative" }}>
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

        <Stagger key={filter} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 28 }}>
          {filtered.map((p, i) => (
            <CineCard key={p.id} p={p} i={i} fg={fg} muted={muted} line={line} accent={accent} cardBg={cardBg} />
          ))}
        </Stagger>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "140px 40px 120px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(800px 500px at 50% 30%, ${accent}1a 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <Reveal variant="slide-left"><SectionKicker n="04" label="Contact" sub="Let's find a time" accent={accent} muted={muted} /></Reveal>

          <Reveal delay={0.1}>
            <h2 style={{
              fontSize: "clamp(44px, 7vw, 110px)",
              fontWeight: 400, letterSpacing: "-0.035em",
              lineHeight: 0.96, margin: "40px 0 60px", maxWidth: 1000,
            }}>
              Got something <span style={{
                fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
                background: `linear-gradient(90deg, ${fg}, ${accent})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>worth building?</span>
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 48, alignItems: "start" }}>
            <Reveal delay={0.15}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>
                Reach me directly
              </div>
              <a
                href={`mailto:${PORTFOLIO.email}`}
                style={{
                  display: "inline-block", padding: "16px 24px",
                  border: `1px solid ${accent}`, color: fg,
                  background: `${accent}12`,
                  textDecoration: "none", fontFamily: MONO, fontSize: 13,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  borderRadius: 999, transition: "all .2s",
                  marginBottom: 28,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#0a0a0b" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}12`; e.currentTarget.style.color = fg }}
              >
                {PORTFOLIO.email} →
              </a>

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
                {PORTFOLIO.social.map((s, i) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      padding: "14px 0",
                      borderTop: i === 0 ? `1px solid ${line}` : "none",
                      borderBottom: `1px solid ${line}`,
                      display: "grid", gridTemplateColumns: "90px 1fr auto", gap: 16, alignItems: "center",
                      color: fg, textDecoration: "none",
                      transition: "padding .15s, color .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "8px"; e.currentTarget.style.color = accent }}
                    onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.color = fg }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13 }}>{s.url}</span>
                    <span style={{ color: muted }}>↗</span>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: 32, padding: 20, border: `1px dashed ${line}`, borderRadius: 6 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                  ● Currently available
                </div>
                <div style={{ fontSize: 14, color: muted, lineHeight: 1.55 }}>
                  Open to internships, SWE roles, and deep-tech R&D opportunities for 2026.
                </div>
              </div>
            </Reveal>

            <Reveal variant="scale-up" delay={0.25}>
              <Calendar fg={fg} muted={muted} line={line} accent={accent} cardBg={cardBg} email={PORTFOLIO.email} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${line}`,
        padding: "24px 40px",
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
