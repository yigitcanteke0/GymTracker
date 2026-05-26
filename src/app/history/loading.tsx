export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="h-14 bg-zinc-900 rounded-xl mb-4 animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-zinc-900 rounded-2xl mb-2 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}
