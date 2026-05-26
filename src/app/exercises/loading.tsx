export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-950 p-4">
      <div className="h-14 bg-stone-900/60 rounded-xl mb-3 animate-pulse" />
      <div className="h-10 bg-stone-900/60 rounded-xl mb-3 animate-pulse" />
      <div className="space-y-1.5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-14 bg-stone-900/60 rounded-xl animate-pulse"
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    </div>
  )
}
