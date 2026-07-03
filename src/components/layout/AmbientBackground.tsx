/** Blob warna brand yang di-blur di belakang konten — bikin efek glassmorphism hidup. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-20 right-[-12%] h-80 w-80 rounded-full bg-rapi-yellow/35 blur-3xl" />
      <div className="absolute left-[-18%] top-1/4 h-96 w-96 rounded-full bg-rapi-blue/22 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-rapi-blue/18 blur-3xl" />
      <div className="absolute bottom-[8%] left-[6%] h-56 w-56 rounded-full bg-rapi-yellow/20 blur-3xl" />
    </div>
  )
}
