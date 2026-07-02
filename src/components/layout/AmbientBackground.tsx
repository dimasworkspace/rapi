/** Blob warna brand yang di-blur di belakang konten — bikin efek glassmorphism hidup. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 right-[-15%] h-80 w-80 rounded-full bg-rapi-yellow/25 blur-3xl" />
      <div className="absolute left-[-20%] top-1/3 h-96 w-96 rounded-full bg-rapi-blue/15 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-5%] h-80 w-80 rounded-full bg-rapi-yellow/15 blur-3xl" />
    </div>
  )
}
