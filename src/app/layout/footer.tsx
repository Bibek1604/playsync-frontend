
import React from "react"
import Link from "next/link"
import { Gamepad2, Twitter, Github, Youtube, Mail, ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-2xl font-black tracking-tighter italic">PLAYSYNC</span>
            </Link>
            <p className="text-slate-400 text-lg max-w-sm">
              The professional network for competitive gaming. Join 1M+ players finding their perfect squad every day.
            </p>
            <div className="relative max-w-md group">
              <input 
                type="text" 
                placeholder="Enter email for pro tips" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
                Join
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Platform</p>
              <ul className="space-y-4">
                {["Squad Finder", "Skill Analytics", "Tournaments", "Pro Directory"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 group">
                      {link} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Support</p>
              <ul className="space-y-4">
                {["Help Center", "Safety Portal", "Community", "API Docs"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Social</p>
              <div className="flex gap-4">
                {[Twitter, Youtube, Github, Mail].map((Icon, i) => (
                  <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all">
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
            © 2026 PlaySync Global Inc. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase hover:text-white tracking-widest">Privacy Policy</Link>
            <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase hover:text-white tracking-widest">Terms of Service</Link>
            <Link href="#" className="text-[10px] font-bold text-slate-500 uppercase hover:text-white tracking-widest">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}