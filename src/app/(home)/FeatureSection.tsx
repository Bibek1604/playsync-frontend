"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  ShieldCheck,
  Zap,
  Star,
  LayoutGrid,
} from "lucide-react";

function CTASection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfdfc] overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative group rounded-[4rem] bg-white p-2 shadow-[0_32px_80px_-20px_rgba(16,185,129,0.1)] border border-emerald-100/50 overflow-hidden">
          <div className="relative bg-white rounded-[3.8rem] px-8 py-20 sm:px-20 sm:py-24">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none bg-[size:20px_20px] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]" />

            <div className="grid lg:grid-cols-5 gap-16 items-center relative z-10">
              {/* Content Left */}
              <div className="lg:col-span-3 space-y-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-[0.2em]">
                    The Professional Standard
                  </span>
                </div>

                <div className="space-y-6">
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                    Your squad is <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                      Waiting for you.
                    </span>
                  </h2>
                  <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                    Experience PlaySync—the world's most refined player matching
                    network. Designed for gamers who demand excellence and zero
                    toxicity.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-300"
                  >
                    Join the Network
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-bold text-sm uppercase tracking-widest hover:border-emerald-200 hover:text-emerald-600 transition-all">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Stats/Badge Right */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      label: "Uptime Guarantee",
                      val: "99.9%",
                      icon: ShieldCheck,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Daily Active Syncs",
                      val: "140k+",
                      icon: Zap,
                      color: "text-amber-500",
                    },
                    {
                      label: "Global Regions",
                      val: "12",
                      icon: Globe,
                      color: "text-blue-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:translate-x-2 transition-transform duration-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-50">
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Trust Row */}
        <div className="mt-16 text-center space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            Integrated with elite platforms
          </p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="font-black text-xl text-slate-900 italic tracking-tighter">
              DISCORD
            </div>
            <div className="font-black text-xl text-slate-900 italic tracking-tighter">
              STEAM
            </div>
            <div className="font-black text-xl text-slate-900 italic tracking-tighter">
              TWITCH
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
