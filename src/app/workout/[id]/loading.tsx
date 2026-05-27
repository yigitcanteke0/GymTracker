export default function Loading() {
  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="h-14 bg-surface-dim rounded-[14px] mb-4 animate-pulse" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[68px] bg-surface-dim rounded-[18px] animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-44 bg-surface-dim rounded-[18px] animate-pulse"
            style={{ opacity: 1 - i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}
