/** Latar lembut bersama tanpa grid atau animasi parallax. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-rapi-offwhite dark:bg-rapi-dark">
      {/* Glow biru lembut buat kedalaman glass */}
      <div className="absolute -top-24 right-[-12%] h-80 w-80 rounded-full bg-rapi-blue/18 blur-3xl dark:bg-rapi-blue/25" />
      <div className="absolute left-[-18%] top-1/3 h-96 w-96 rounded-full bg-rapi-blue/12 blur-3xl dark:bg-rapi-blue/20" />
      <div className="absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-rapi-navy/10 blur-3xl dark:bg-rapi-blue/10" />
    </div>
  )
}
