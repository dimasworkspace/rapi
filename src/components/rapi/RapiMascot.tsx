import { motion } from 'framer-motion'

/** Maskot Rapi dalam frame bulat glass — dipakai di Rapi AI & empty state. */
export function RapiMascot({ size = 128 }: { size?: number }) {
  return (
    <div
      className="rapi-glass relative flex items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Glow lembut biar karakternya "hidup" di dalam kaca */}
      <div aria-hidden className="absolute inset-3 rounded-full bg-rapi-blue/15 blur-xl" />
      <motion.img
        src="/rapi-mascot.png"
        alt="Maskot Rapi"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-[78%] w-auto object-contain drop-shadow-md"
      />
    </div>
  )
}
