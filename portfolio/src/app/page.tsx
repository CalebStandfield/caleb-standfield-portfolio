export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Glow behind CS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Main content */}
      <h1 className="text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">
        CS
      </h1>
      <p className="mt-6 text-gray-400 text-base uppercase tracking-[0.4em] backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl">
        Caleb Standfield • Computer Science
      </p>
    </main>
  );
}