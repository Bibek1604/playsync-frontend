// components/layout/header.jsx
import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative w-full h-[50vh] bg-white overflow-hidden flex items-center border-b border-slate-100">
      {/* MEGA LOGO BACKGROUND */}
      <div className="absolute -left-20 -top-20 opacity-[0.03] pointer-events-none">
        <Image 
          src="/playsync-logo.svg" 
          alt="" 
          width={1200} 
          height={1200} 
          className="w-auto h-[1000px] animate-[pulse_8s_ease-in-out_infinite]" 
        />
      </div>

      <div className="container mx-auto px-12 relative z-10 flex flex-col items-start gap-6">
        {/* Main Nav Logo */}
        <Image 
          src="/playsync-logo.svg" 
          alt="PLAYSYNC" 
          width={400} 
          height={400} 
          className="h-64 w-auto transition-transform hover:scale-105 duration-700" 
        />
        
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-mono font-black text-emerald-500 tracking-[0.8em] uppercase">
            System_Architecture_V1
          </h2>
          <div className="h-1 w-32 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
    </header>
  );
}