import { useEffect, useRef } from 'react'

/**
 * Latar ala fintech: glow biru lembut + grid tipis yang bergeser halus
 * mengikuti gerak cursor/touch (parallax). Bikin efek glass jadi hidup.
 */
export function AmbientBackground() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * -20}px, ${y * -20}px)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-rapi-offwhite dark:bg-rapi-dark">
      {/* Grid finansial tipis — parallax ikut pointer */}
      <div
        ref={gridRef}
        className="absolute -inset-10 opacity-70 transition-transform duration-200 ease-out will-change-transform dark:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(2,72,193,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,72,193,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow biru lembut buat kedalaman glass */}
      <div className="absolute -top-24 right-[-12%] h-80 w-80 rounded-full bg-rapi-blue/18 blur-3xl dark:bg-rapi-blue/25" />
      <div className="absolute left-[-18%] top-1/3 h-96 w-96 rounded-full bg-rapi-blue/12 blur-3xl dark:bg-rapi-blue/20" />
      <div className="absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-rapi-navy/10 blur-3xl dark:bg-rapi-blue/10" />
    </div>
  )
}
