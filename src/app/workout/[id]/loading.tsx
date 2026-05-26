export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="h-14 bg-zinc-900 rounded-xl mb-4 animate-pulse" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 bg-zinc-900 rounded-2xl mb-3 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  )
}
