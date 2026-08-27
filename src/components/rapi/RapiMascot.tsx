import { motion } from 'framer-motion'

/** Identitas visual Rapi dalam frame bulat glass. */
export function RapiMascot({ size = 128 }: { size?: number }) {
  return (
    <div
      className="rapi-glass relative flex items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Glow lembut biar karakternya "hidup" di dalam kaca */}
      <div aria-hidden className="absolute inset-3 rounded-full bg-rapi-blue/15 blur-xl" />
      <motion.img
        src="/logo-rapi.png"
        alt="Logo Rapi"
        width={104}
        height={63}
        loading="lazy"
        decoding="async"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-auto w-[78%] object-contain"
      />
    </div>
  )
}
