import { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function PaperChat() {
  const [text, setText] = useState('')
  const [animating, setAnimating] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const controls = useAnimation()
  const shadowControls = useAnimation()
  const blurControls = useAnimation()
  const inputRef = useRef(null)

  useEffect(() => {
    if (!animating) {
      inputRef.current?.focus()
    }
  }, [animating, cycleKey])

  const runParticles = () => {
    // fire-and-forget by toggling a key so AnimatePresence remounts particle set
    setParticlesKey((k) => k + 1)
  }

  const [particlesKey, setParticlesKey] = useState(0)

  const onSubmit = async () => {
    if (!text.trim() || animating) return
    setAnimating(true)

    // Sequence: bend/fold -> crumple -> throw -> reset
    // Bend/Fold: subtle creases simulated via 3D rotations and keyframe wiggles
    await Promise.all([
      controls.start({
        rotateX: [0, 8, -6, 10, 0],
        rotateY: [0, -6, 8, -10, -3],
        rotateZ: [0, 0.4, -0.6, 0.8, 0],
        skewX: [0, 2, -3, 1, 0],
        skewY: [0, -2, 1, -1, 0],
        scaleY: [1, 0.98, 0.96, 0.97, 0.99],
        transition: { duration: 0.45, ease: 'easeInOut' },
      }),
      shadowControls.start({
        boxShadow: [
          '0px 8px 20px rgba(0,0,0,0.12)',
          '0px 14px 28px rgba(0,0,0,0.16)'
        ],
        transition: { duration: 0.45, ease: 'easeInOut' },
      }),
    ])

    // Crumple: compact into a ball with wrinkles wiggle
    await Promise.all([
      controls.start({
        borderRadius: ['20px', '28px', '36px', '999px'],
        rotateZ: [0, 10, -12, 8, -16, 12, -8, 0],
        scale: [1, 0.9, 0.75, 0.55],
        translateZ: [0, 10, 0, 12],
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      }),
      shadowControls.start({
        boxShadow: [
          '0px 10px 22px rgba(0,0,0,0.18)',
          '0px 16px 36px rgba(0,0,0,0.22)'
        ],
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      }),
      blurControls.start({
        filter: ['blur(0px)', 'blur(0.4px)', 'blur(0.8px)'],
        transition: { duration: 0.7, ease: 'easeOut' },
      })
    ])

    // Throw backward in Z: simulate with scale down + translateY and opacity
    runParticles()
    await Promise.all([
      controls.start({
        y: [0, -6, -10, -14, -18],
        scale: [0.55, 0.42, 0.32, 0.22, 0.12, 0.06],
        rotateZ: [0, 40, 80],
        opacity: [1, 0.95, 0.85, 0.0],
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      }),
      blurControls.start({
        filter: ['blur(0.8px)', 'blur(1.2px)', 'blur(2px)'],
        transition: { duration: 0.55, ease: 'easeOut' },
      }),
      shadowControls.start({
        boxShadow: '0px 10px 26px rgba(0,0,0,0.08)',
        transition: { duration: 0.55, ease: 'easeOut' }
      })
    ])

    // Reset
    setText('')
    setAnimating(false)
    setCycleKey((k) => k + 1)
    controls.set({ rotateX: 0, rotateY: 0, rotateZ: 0, skewX: 0, skewY: 0, y: 0, scale: 1, borderRadius: '20px', opacity: 1 })
    shadowControls.set({ boxShadow: '0px 8px 20px rgba(0,0,0,0.12)' })
    blurControls.set({ filter: 'blur(0px)' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  // Generate subtle crease highlights using CSS gradients
  const paperBackground = {
    backgroundImage: [
      // base paper color gradient
      'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.9), rgba(245,247,250,0.95) 60%, rgba(235,238,242,0.95))',
      // vertical subtle lines
      'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 8px)',
      // noise texture via SVG data URL
      `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.03'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`)}`
    ].join(', '),
    backgroundBlendMode: 'soft-light, multiply, normal',
  }

  const creaseOverlay = (
    <div className="pointer-events-none absolute inset-0 rounded-[20px]"
      style={{
        background: 'linear-gradient(120deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 40%), linear-gradient(300deg, rgba(0,0,0,0.06), rgba(0,0,0,0) 45%)',
        mixBlendMode: 'soft-light',
      }}
    />
  )

  const Particles = ({ k }) => {
    const count = 12
    const items = Array.from({ length: count }).map((_, i) => {
      const x = randomBetween(-10, 10)
      const y = randomBetween(-6, -2)
      const d = randomBetween(0.4, 0.8)
      const s = randomBetween(2, 4)
      const rot = randomBetween(-45, 45)
      return (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.6, rotate: 0 }}
          animate={{ x: x * 6, y: y * 6, opacity: [0, 1, 0], scale: [0.6, s / 10, 0.2], rotate: rot }}
          transition={{ duration: d, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[2px] w-[8px] bg-white/80 rounded-full shadow-sm"
          style={{ boxShadow: '0 0 6px rgba(255,255,255,0.6)' }}
        />
      )
    })

    return (
      <div key={k} className="pointer-events-none absolute inset-0">
        {items}
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative flex flex-col items-center">
        <div className="mb-6 text-center text-gray-600">
          <p className="text-sm">Type a message and press Enter</p>
        </div>

        <div className="relative w-full perspective-[1200px]">
          <AnimatePresence>
            <motion.div
              key={cycleKey}
              className="relative w-full rounded-[20px] p-4 md:p-5 bg-white shadow-xl will-change-transform"
              animate={controls}
              initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, skewX: 0, skewY: 0, y: 0, scale: 1, borderRadius: '20px', opacity: 1 }}
              style={{
                transformStyle: 'preserve-3d',
                ...paperBackground,
                filter: undefined,
              }}
            >
              {/* dynamic blur and shadow wrappers */}
              <motion.div animate={blurControls} className="absolute inset-0 rounded-[20px]" />
              <motion.div animate={shadowControls} className="absolute inset-0 rounded-[20px]" style={{ boxShadow: '0px 8px 20px rgba(0,0,0,0.12)' }} />

              {/* inner content */}
              <div className="relative z-10">
                {creaseOverlay}
                <textarea
                  ref={inputRef}
                  disabled={animating}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Say something expressive..."
                  className="w-full resize-none bg-transparent outline-none placeholder:text-gray-400 text-gray-800 text-base md:text-lg leading-relaxed selection:bg-blue-200/60"
                  style={{ caretColor: animating ? 'transparent' : undefined }}
                />
              </div>

              {/* soft inner shadow for depth */}
              <div className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-2px_12px_rgba(0,0,0,0.08)]" />
            </motion.div>
          </AnimatePresence>

          {/* particles burst on throw */}
          <Particles k={particlesKey} />
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Enter to send • Crumples, flies away, then resets
        </div>
      </div>
    </div>
  )
}
