export default function Loading() {
  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="h-14 bg-surface-dim rounded-[14px] mb-4 animate-pulse" />
      <div className="h-32 bg-surface-dim rounded-[18px] mb-4 animate-pulse" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-[72px] bg-surface-dim rounded-[18px] animate-pulse"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    </div>
  )
}
