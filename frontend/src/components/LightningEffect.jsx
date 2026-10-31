import { useEffect, useRef } from 'react'

/**
 * Storm-lightning overlay for the cloud background.
 *
 * - Canvas is fixed, sits above <SiteBackground /> and below all page content,
 *   and never captures pointer events.
 * - Idle between strikes: no animation loop runs until a strike starts, so it
 *   costs nothing most of the time.
 * - Pauses while the tab is hidden and is disabled entirely when the user has
 *   "reduce motion" turned on.
 * - Flash pattern stays under 3 flashes per second (WCAG 2.3.1).
 */

// ---- Tuning knobs --------------------------------------------------------
const FIRST_STRIKE_DELAY = 1000 // ms before the first strike after page load
const MIN_GAP = 1000 // ms between strikes (minimum)
const MAX_GAP = 2000 // ms between strikes (maximum)
const SHEET_CHANCE = 0.2 // chance of cloud-only glow (no visible bolt)
const DURATION = 500 // ms one strike lasts
const GLOW_STRENGTH = 0.6 // max brightness of the cloud flash (0 - 1)
const BOLT_COLOR = '167, 139, 250' // violet-400, matches the site accent
// Brightness envelope: [time in ms, intensity 0-1]. Two quick peaks = flicker.
const ENVELOPE = [
  [0, 0],
  [45, 1],
  [100, 0.25],
  [160, 0.9],
  [260, 0.45],
  [DURATION, 0],
]
// --------------------------------------------------------------------------

const rand = (min, max) => min + Math.random() * (max - min)

function intensityAt(t) {
  for (let i = 1; i < ENVELOPE.length; i++) {
    const [t1, v1] = ENVELOPE[i]
    if (t <= t1) {
      const [t0, v0] = ENVELOPE[i - 1]
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
    }
  }
  return 0
}

/** Jagged polyline between two points using repeated midpoint displacement. */
function jag(x1, y1, x2, y2, spread) {
  let pts = [
    [x1, y1],
    [x2, y2],
  ]
  let s = spread
  for (let pass = 0; pass < 6; pass++) {
    const next = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]
      const [bx, by] = pts[i + 1]
      next.push([(ax + bx) / 2 + rand(-s, s), (ay + by) / 2 + rand(-s, s) * 0.3], pts[i + 1])
    }
    pts = next
    s *= 0.55
  }
  return pts
}

function createBolt(w, h) {
  const startX = w * rand(0.12, 0.88)
  const endX = startX + rand(-0.12, 0.12) * w
  const endY = h * rand(0.45, 0.75)
  const main = jag(startX, -10, endX, endY, w * 0.07)

  const branches = []
  const count = Math.floor(rand(2, 5))
  for (let i = 0; i < count; i++) {
    const [bx, by] = main[Math.floor(rand(0.2, 0.75) * main.length)]
    const dir = Math.random() < 0.5 ? -1 : 1
    const ex = bx + dir * rand(0.04, 0.14) * w
    const ey = by + rand(0.08, 0.22) * h
    branches.push(jag(bx, by, ex, ey, w * 0.035))
  }
  return { main, branches }
}

function strokePath(ctx, pts) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.stroke()
}

function drawStrike(ctx, w, h, strike, intensity) {
  ctx.clearRect(0, 0, w, h)
  if (intensity <= 0.01) return

  // Cloud glow: bright core near the strike, soft wash across the whole sky
  const glow = ctx.createRadialGradient(strike.glowX, h * 0.1, 0, strike.glowX, h * 0.1, h * 0.95)
  glow.addColorStop(0, `rgba(220, 200, 255, ${GLOW_STRENGTH * intensity})`)
  glow.addColorStop(0.45, `rgba(${BOLT_COLOR}, ${GLOW_STRENGTH * 0.45 * intensity})`)
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = `rgba(${BOLT_COLOR}, ${GLOW_STRENGTH * 0.12 * intensity})`
  ctx.fillRect(0, 0, w, h)

  if (!strike.bolt) return

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  const paths = [strike.bolt.main, ...strike.bolt.branches]

  // Outer glow pass, then bright core pass
  ctx.shadowColor = `rgba(${BOLT_COLOR}, 1)`
  ctx.shadowBlur = 28
  ctx.strokeStyle = `rgba(${BOLT_COLOR}, ${0.55 * intensity})`
  paths.forEach((p, i) => {
    ctx.lineWidth = i === 0 ? 6 : 3.5
    strokePath(ctx, p)
  })

  ctx.shadowColor = 'rgba(255, 255, 255, 1)'
  ctx.shadowBlur = 10
  ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`
  paths.forEach((p, i) => {
    ctx.lineWidth = i === 0 ? 2.2 : 1.2
    strokePath(ctx, p)
  })
  ctx.shadowBlur = 0
}

export default function LightningEffect() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let w = 0
    let h = 0
    let timer = null
    let raf = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // cap for performance
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const stop = () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      timer = null
      raf = null
      ctx.clearRect(0, 0, w, h)
    }

    const strike = () => {
      timer = null
      const bolt = Math.random() < SHEET_CHANCE ? null : createBolt(w, h)
      const data = { bolt, glowX: bolt ? bolt.main[0][0] : w * rand(0.1, 0.9) }
      const startTime = performance.now()

      const frame = (now) => {
        const t = now - startTime
        if (t >= DURATION) {
          ctx.clearRect(0, 0, w, h)
          raf = null
          schedule(false)
          return
        }
        drawStrike(ctx, w, h, data, intensityAt(t))
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    const schedule = (first) => {
      timer = setTimeout(strike, first ? FIRST_STRIKE_DELAY : rand(MIN_GAP, MAX_GAP))
    }

    const start = () => {
      if (timer || raf || reduceMotion.matches || document.hidden) return
      resize()
      schedule(true)
    }

    const onVisibility = () => (document.hidden ? stop() : start())
    const onMotionChange = () => (reduceMotion.matches ? stop() : start())
    const onResize = () => resize()

    resize()
    start()
    document.addEventListener('visibilitychange', onVisibility)
    reduceMotion.addEventListener('change', onMotionChange)
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      reduceMotion.removeEventListener('change', onMotionChange)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] h-full w-full"
    />
  )
}
