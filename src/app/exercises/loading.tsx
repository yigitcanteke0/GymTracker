export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="h-14 bg-zinc-900 rounded-xl mb-3 animate-pulse" />
      <div className="h-10 bg-zinc-900 rounded-xl mb-3 animate-pulse" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-14 bg-zinc-900 rounded-xl mb-1 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}
