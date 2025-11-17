import { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function PaperChat() {
  const [text, setText] = useState('')
  const [animating, setAnimating] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)

  // Layered animation controllers so we can sequence phases
  const paperControls = useAnimation()
  const shadowControls = useAnimation()
  const blurControls = useAnimation()
  const tailControls = useAnimation()

  const inputRef = useRef(null)

  useEffect(() => {
    if (!animating) inputRef.current?.focus()
  }, [animating, cycleKey])

  const [particlesKey, setParticlesKey] = useState(0)
  const runParticles = () => setParticlesKey((k) => k + 1)

  const onSubmit = async () => {
    if (!text.trim() || animating) return
    setAnimating(true)

    // PHASE 1 — bubble -> sheet of paper
    await Promise.all([
      paperControls.start({
        borderRadius: ['20px', '16px', '12px', '8px'],
        rotateX: [0, 6, 8],
        rotateY: [0, -6, -10],
        rotateZ: [0, 0.2, -0.2],
        scaleY: [1, 0.96, 0.94, 0.95],
        scaleX: [1, 1.04, 1.08, 1.1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      }),
      tailControls.start({
        opacity: [1, 0.5, 0],
        scale: [1, 0.8, 0.6],
        transition: { duration: 0.5, ease: 'easeInOut' },
      }),
      shadowControls.start({
        boxShadow: [
          '0px 8px 20px rgba(0,0,0,0.12)',
          '0px 12px 28px rgba(0,0,0,0.16)'
        ],
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
    ])

    // PHASE 2 — sheet crumples into a paper ball
    await Promise.all([
      paperControls.start({
        borderRadius: ['8px', '16px', '24px', '999px'],
        rotateZ: [0, 8, -10, 6, -8, 4, 0],
        scale: [1.1, 0.96, 0.82, 0.64, 0.56],
        y: [0, -2, -4, -6],
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      }),
      blurControls.start({
        filter: ['blur(0px)', 'blur(0.4px)', 'blur(0.8px)'],
        transition: { duration: 0.75, ease: 'easeOut' },
      }),
      shadowControls.start({
        boxShadow: [
          '0px 12px 28px rgba(0,0,0,0.18)',
          '0px 18px 40px rgba(0,0,0,0.22)'
        ],
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      })
    ])

    // PHASE 3 — throw away (scale down + rise + fade)
    runParticles()
    await Promise.all([
      paperControls.start({
        y: [-6, -10, -16, -22],
        scale: [0.56, 0.42, 0.28, 0.14, 0.06],
        rotateZ: [0, 40, 80, 120],
        opacity: [1, 0.9, 0.75, 0],
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      }),
      blurControls.start({
        filter: ['blur(0.8px)', 'blur(1.2px)', 'blur(2px)'],
        transition: { duration: 0.6, ease: 'easeOut' },
      }),
      shadowControls.start({
        boxShadow: '0px 10px 26px rgba(0,0,0,0.08)',
        transition: { duration: 0.6, ease: 'easeOut' }
      })
    ])

    // RESET — fresh bubble
    setText('')
    setAnimating(false)
    setCycleKey((k) => k + 1)

    paperControls.set({
      borderRadius: '20px', rotateX: 0, rotateY: 0, rotateZ: 0,
      scale: 1, scaleX: 1, scaleY: 1, y: 0, opacity: 1
    })
    tailControls.set({ opacity: 1, scale: 1 })
    shadowControls.set({ boxShadow: '0px 8px 20px rgba(0,0,0,0.12)' })
    blurControls.set({ filter: 'blur(0px)' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  // Paper surface textures
  const paperBackground = {
    backgroundImage: [
      'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.96), rgba(246,249,253,0.98) 60%, rgba(236,240,246,0.98))',
      'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 8px)',
      `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.03'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`)}")`
    ].join(', '),
    backgroundBlendMode: 'soft-light, multiply, normal',
  }

  const creaseOverlay = (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        background: 'linear-gradient(120deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 40%), linear-gradient(300deg, rgba(0,0,0,0.06), rgba(0,0,0,0) 45%)',
        mixBlendMode: 'soft-light',
      }}
    />
  )

  const Particles = ({ k }) => {
    const count = 14
    const items = Array.from({ length: count }).map((_, i) => {
      const x = randomBetween(-10, 10)
      const y = randomBetween(-6, -2)
      const d = randomBetween(0.45, 0.85)
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

    return <div key={k} className="pointer-events-none absolute inset-0">{items}</div>
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
              animate={paperControls}
              initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, y: 0, scale: 1, borderRadius: '20px', opacity: 1 }}
              style={{ transformStyle: 'preserve-3d', ...paperBackground }}
            >
              {/* dynamic blur and soft drop shadow layers */}
              <motion.div animate={blurControls} className="absolute inset-0 rounded-[inherit]" />
              <motion.div animate={shadowControls} className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: '0px 8px 20px rgba(0,0,0,0.12)' }} />

              {/* chat tail that retracts when turning into a sheet */}
              <motion.div
                className="absolute bottom-[-10px] left-10 h-4 w-6 origin-top-left"
                animate={tailControls}
                initial={{ opacity: 1, scale: 1 }}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(230,236,245,0.95))',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                }}
              />

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
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-2px_12px_rgba(0,0,0,0.08)]" />
            </motion.div>
          </AnimatePresence>

          {/* particles burst on throw */}
          <Particles k={particlesKey} />
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Enter to send • Turns into a sheet, crumples, then is thrown away
        </div>
      </div>
    </div>
  )
}
