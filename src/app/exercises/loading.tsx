export default function Loading() {
  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="h-14 bg-surface-dim rounded-[14px] mb-3 animate-pulse" />
      <div className="h-11 bg-surface-dim rounded-[14px] mb-3 animate-pulse" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-[68px] bg-surface-dim rounded-[14px] animate-pulse"
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    </div>
  )
}
