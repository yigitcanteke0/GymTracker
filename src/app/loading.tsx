export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-stone-800 border-t-accent-500 animate-spin" />
        <p className="text-stone-500 text-[13px]">Yükleniyor</p>
      </div>
    </div>
  )
}
