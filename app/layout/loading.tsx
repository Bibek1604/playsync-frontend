// app/loading.tsx
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* 1. Unique Energy Stream & Mask Logic */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes energy-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }
        @keyframes border-trace {
          0% { opacity: 0; stroke-dashoffset: 1000; }
          50% { opacity: 1; }
          100% { opacity: 0; stroke-dashoffset: 0; }
        }
      `}} />

      <div className="relative flex flex-col items-center">
        {/* 2. The Titan Logo with Liquid Energy Mask */}
        <div 
          className="relative w-[600px] h-[600px] flex items-center justify-center"
          style={{ animation: 'logo-float 6s ease-in-out infinite' }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-[140px] rounded-full animate-pulse" />

          {/* THE MASKED ENERGY LOGO */}
          <div 
            className="relative w-full h-full"
            style={{
              maskImage: 'url("/playsync-logo.svg")',
              WebkitMaskImage: 'url("/playsync-logo.svg")',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #10b981)',
              backgroundSize: '200% 100%',
              animation: 'energy-flow 2s linear infinite'
            }}
          />

          {/* 3. The "Scanning" Ring - Vertical Tech Bar */}
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_30px_#10b981] animate-[neural-sweep_3s_ease-in-out_infinite] opacity-50" 
                  style={{ transform: 'translateY(-150px)' }} />
          </div>
        </div>

        {/* 4. Unique Status Feed */}
        <div className="mt-[-40px] relative z-30 flex flex-col items-center gap-6">
           {/* Animated "Connecting" Dots */}
           <div className="flex gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-1.5 w-1.5 bg-emerald-500 rounded-full"
                  style={{ animation: `pulse 1.5s infinite`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
           </div>
           
           <div className="flex flex-col items-center gap-1">
             <p className="font-mono text-[11px] font-black uppercase tracking-[0.7em] text-slate-800">
               NEURAL_HANDSHAKE
             </p>
             <div className="flex items-center gap-4 text-[9px] font-bold text-emerald-600/60 font-mono">
               <span>P_LOAD: 88%</span>
               <span className="w-1 h-1 bg-slate-200 rounded-full" />
               <span>SYNC_BUF: OK</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}