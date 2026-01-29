"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Gamepad2,
  ShieldCheck,
  Zap,
  Plus,
  Target,
  Trophy,
  Users,
} from "lucide-react";

function HeroSection() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Interaction logic for the RIGHT side only
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Calculate rotation based on mouse position relative to the card center
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;

    setRotate({ x: x * -20, y: y * 20 }); // Multiply by 20 for tilt intensity
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#ffffff]">
      {/* --- Sophisticated Background Pattern --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 left-[-5%] w-[30%] h-[40%] bg-slate-50 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* --- Left Column: Stable & Professional Content --- */}
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Next-Gen Squad Discovery
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                PlaySync <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Pro-Elite.
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                Stop gambling with random teammates. Connect with verified
                high-performance players through our professional-grade
                matchmaking ecosystem.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/join"
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
              >
                Find My Squad
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:border-emerald-500 transition-all">
                <Search className="w-4 h-4 text-emerald-500" />
                Directory
              </button>
            </div>

            {/* Social Proof Stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900">45k+</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Verified Pros
                </p>
              </div>
              <div className="h-10 w-px bg-slate-100" />
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 12}`}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"
                    alt="user"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column: Trackable Interactive UI --- */}
          <div className="lg:col-span-7 relative perspective-1000">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: "transform 0.1s ease-out",
              }}
              className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden cursor-crosshair"
            >
              {/* Fake UI Header */}
              <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Syncing...
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-3">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 uppercase">
                        Season Rank
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        Diamond III
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      Suggested Squads
                    </p>
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="h-2 w-20 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                  <div className="flex justify-between items-center">
                    <Gamepad2 className="w-8 h-8 text-emerald-400" />
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Compatibility
                    </p>
                    <p className="text-4xl font-black">98.4%</p>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-emerald-400 rounded-full" />
                  </div>
                  <button className="w-full py-3 rounded-xl bg-emerald-500 text-slate-900 font-black uppercase text-xs tracking-widest">
                    Request Sync
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements that also "Move" subtly */}
            <div className="absolute -top-6 -right-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
              <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
              <Target className="w-6 h-6 text-slate-800" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default HeroSection;
