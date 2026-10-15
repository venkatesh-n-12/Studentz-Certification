export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin mb-4"></div>
      <p className="text-zinc-400 font-medium animate-pulse">Loading opportunities...</p>
    </div>
  );
}
