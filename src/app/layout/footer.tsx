"use client";
import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-16 px-6 font-sans relative mt-24">
      {/* Footer Top Header / Status */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="bg-white border border-gray-100 rounded-full px-8 py-3 shadow-xl flex items-center gap-4 transition-all hover:shadow-2xl hover:border-green-100 group">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute opacity-20" />
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full relative shadow-sm" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Matrix Sync</span>
            </div>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Global Cluster Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-8">
            <div className="flex items-center">
              <img src="/p.svg" alt="PlaySync Logo" className="h-48 w-auto hover:grayscale-0 grayscale transition-all duration-500" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed max-w-[200px] uppercase tracking-widest">
              The standard for quantitative performance tracking and global competition metrics.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Infrastructure</h4>
              <ul className="space-y-4">
                <li><Link href="/dashboard" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">Performance Dashboard</Link></li>
                <li><Link href="/games/online" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">Active Matrix</Link></li>
                <li><Link href="/rankings" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">Global Ratings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Documentation</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">System API</Link></li>
                <li><Link href="/history" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">Ledger Logs</Link></li>
                <li><Link href="#" className="text-[10px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest">Core Support</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Connectivity</h4>
              <div className="flex gap-2 mb-6">
                <input
                  type="email"
                  placeholder="Enter Index..."
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-[10px] font-bold outline-none focus:border-green-400 focus:bg-white transition-all shadow-sm"
                />
                <button className="bg-green-600 text-white px-5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm active:scale-95">
                  Link
                </button>
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recieve periodic sync updates.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
              © 2026 PS-ENGINE
            </p>
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              System Status: <span className="text-green-600 font-extrabold">Online</span>
            </p>
          </div>
          <div className="flex gap-10">
            <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-[0.25em] transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-[0.25em] transition-colors">Safety</Link>
            <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-[0.25em] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
