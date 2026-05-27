export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-surface-3 border-t-accent-500 animate-spin" />
        <p className="text-fg-tertiary text-[13px]">Yükleniyor</p>
      </div>
    </div>
  )
}
