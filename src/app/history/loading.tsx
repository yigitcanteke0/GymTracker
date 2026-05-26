export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-950 p-4">
      <div className="h-14 bg-stone-900/60 rounded-xl mb-4 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-stone-900/60 rounded-2xl animate-pulse"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    </div>
  )
}
