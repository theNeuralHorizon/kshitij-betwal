"use client"

import { useEffect, useRef } from "react"

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let rafId: number | null = null
    let running = true

    const move = (e: MouseEvent): void => {
      tx = e.clientX
      ty = e.clientY
    }

    const animate = (): void => {
      if (!running) return
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      // Use translate3d to force GPU compositing
      glow.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`
      rafId = requestAnimationFrame(animate)
    }

    const onVisibility = (): void => {
      if (document.hidden) {
        running = false
        if (rafId !== null) cancelAnimationFrame(rafId)
      } else {
        running = true
        rafId = requestAnimationFrame(animate)
      }
    }

    window.addEventListener("mousemove", move, { passive: true })
    document.addEventListener("visibilitychange", onVisibility)
    rafId = requestAnimationFrame(animate)

    return (): void => {
      running = false
      window.removeEventListener("mousemove", move)
      document.removeEventListener("visibilitychange", onVisibility)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[1] w-[300px] h-[300px] rounded-full opacity-[0.04]"
      style={{
        background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  )
}
