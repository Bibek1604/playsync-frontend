import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="relative w-full h-[50vh] min-h-[400px] bg-white overflow-hidden flex items-center border-b border-slate-100">
      
      {/* MEGA LOGO BACKGROUND - Light Watermark */}
      <div className="absolute inset-0 select-none pointer-events-none overflow-hidden flex items-center justify-center">
        <h1 className="text-[35vw] font-black text-slate-50 leading-none tracking-tighter uppercase italic select-none">
          PLAYSYNC
        </h1>
      </div>

      {/* SOFT GRADIENT OVERLAYS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(241,245,249,1),transparent_70%)]" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-start gap-6 max-w-3xl">
          
          {/* Logo Container with Soft Interaction */}
          <div className="relative group">
            {/* Subtle glow for white theme */}
            <div className="absolute -inset-4 bg-slate-100/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-700" />
            
            <Link href="/" className="relative block">
              <Image 
                src="/playsync-logo.svg" 
                alt="PLAYSYNC" 
                width={250} 
                height={80} 
                priority
                className="h-24 md:h-32 w-auto transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h2 className="text-slate-900 text-4xl md:text-6xl font-extrabold tracking-tight">
              Elevate your <span className="text-blue-600">sync.</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-md">
              The next generation of seamless play and real-time coordination.
            </p>
          </div>

          {/* Minimalist Action Tag */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">System Active</span>
          </div>
          
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </header>
  );
} 