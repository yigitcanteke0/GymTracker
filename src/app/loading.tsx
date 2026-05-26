export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Yükleniyor…</p>
      </div>
    </div>
  )
}
