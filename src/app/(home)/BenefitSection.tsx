"use client";

import React from "react";
import { Star, ShieldCheck, Zap, Users, Trophy, Quote } from "lucide-react";

const benefits = [
  { number: "98%", label: "Squad Match Rate", icon: Users },
  { number: "24/7", label: "Pro Moderation", icon: ShieldCheck },
  { number: "15m", label: "Avg. Find Time", icon: Zap },
  { number: "10k+", label: "Daily Tournaments", icon: Trophy },
];

const testimonials = [
  {
    quote:
      "Found my permanent Valorant duo within 10 minutes. The skill matching is scary accurate.",
    author: "Alex 'Cipher' K.",
    role: "Immortal Rank",
    avatar: "https://i.pravatar.cc/100?img=33",
  },
  {
    quote:
      "Finally, a place where people actually use their mics and don't tilt after one lost round.",
    author: "Sarah Jenkins",
    role: "Semi-Pro CS2",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    quote:
      "The reputation system actually works. Playing with verified teammates changed everything.",
    author: "Marcus Vane",
    role: "Team Captain",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
];

function BenefitsSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* --- Stats/Benefits Grid --- */}
        <div className="relative">
          {/* Subtle Background Text */}
          <div className="absolute -top-20 left-0 text-[12rem] font-black text-slate-50 select-none -z-10 tracking-tighter">
            STATS
          </div>

          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Metrics that{" "}
              <span className="text-emerald-600 font-serif italic">Matter</span>
            </h2>
            <div className="h-1.5 w-20 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-1">
                  {benefit.number}
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {benefit.label}
                </p>

                {/* Decorative Corner Glow */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/0 group-hover:bg-emerald-500/5 rounded-bl-[2.5rem] transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* --- Testimonials Section --- */}
        <div className="relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              The Player{" "}
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">
                Verdict
              </span>
            </h2>
            <p className="text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">
              Trusted by the competitive community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="relative flex flex-col p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100/80 hover:bg-white hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="absolute -top-4 left-10">
                  <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200 transform -rotate-6 group-hover:rotate-0 transition-transform">
                    <Quote className="w-5 h-5 fill-white" />
                  </div>
                </div>

                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-emerald-500 fill-emerald-500"
                    />
                  ))}
                </div>

                <p className="text-lg font-medium text-slate-700 leading-relaxed mb-10 italic">
                  "{testimonial.quote}"
                </p>

                <div className="mt-auto flex items-center gap-4 pt-6 border-t border-slate-200/60">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">
                      {testimonial.author}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
