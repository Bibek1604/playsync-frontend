// components/layout/footer.jsx
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative w-full min-h-[80vh] bg-white pt-40 pb-20 overflow-hidden border-t border-slate-100 flex items-end">
      {/* MONOLITH LOGO (Right Aligned Mega-Crop) */}
      <div className="absolute -right-64 -bottom-64 opacity-[0.04] pointer-events-none">
        <Image 
          src="/playsync-logo.svg" 
          alt="" 
          width={2000} 
          height={2000} 
          className="w-auto h-[1500px] -rotate-12" 
        />
      </div>

      <div className="container mx-auto px-12 relative z-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-20">
          <div className="space-y-12 max-w-2xl">
            {/* Primary Footer Logo */}
            <Image 
              src="/playsync-logo.svg" 
              alt="Logo" 
              width={600} 
              height={600} 
              className="h-80 w-auto filter drop-shadow-2xl" 
            />
            <p className="text-lg font-bold text-slate-400 leading-relaxed tracking-tight">
              A massive-scale synchronization engine designed for high-concurrency environments. 
              The future is synchronized.
            </p>
          </div>

          <div className="flex flex-col items-end text-right space-y-6">
            <div className="p-8 border-l-4 border-emerald-500 bg-emerald-50/30">
              <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest mb-2">Global_Sync_Rate</p>
              <p className="text-7xl font-mono font-black text-slate-900 tracking-tighter">99.98%</p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}