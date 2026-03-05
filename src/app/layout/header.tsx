'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Gamepad2, Menu, X, ChevronRight, ArrowRight } from "lucide-react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Trigger scroll effect slightly earlier for a smoother feel
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isScrolled
        ? "py-4 px-4 sm:px-8"
        : "py-8 px-6 sm:px-12"
        }`}
    >
      <nav
        className={`max-w-7xl mx-auto transition-all duration-500 ease-in-out rounded-[2rem] ${isScrolled
          ? "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] px-6 py-3"
          : "bg-transparent px-0 py-0"
          }`}
      >
        <div className="flex items-center justify-between">
          {/* --- Brand Identity --- */}
          <Link href="/" className="flex items-center group">
            <img
              src="/image.png"
              alt="PlaySync"
              className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {/* --- Desktop Navigation --- */}
          <div className="hidden lg:flex items-center gap-10">
            {["Find Squad", "Rankings", "Tournaments", "Intelligence"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-[13px] font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* --- Desktop Actions --- */}
          <div className="hidden md:flex items-center gap-8">
            <button className="text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
              Login
            </button>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-3 rounded-lg bg-green-600 text-white text-[13px] font-bold uppercase tracking-widest hover:bg-green-700 hover:shadow-lg hover:shadow-green-100 transition-all duration-300"
            >
              Move to dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* --- Mobile Menu Toggle --- */}
          <button
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* --- Mobile Full-Screen Menu --- */}
        <div
          className={`absolute top-[110%] left-4 right-4 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-8 lg:hidden transition-all duration-500 origin-top ${mobileMenuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
            }`}
        >
          <div className="flex flex-col gap-6">
            {["Find Squad", "Rankings", "Tournaments", "Intelligence"].map((item) => (
              <Link
                key={item}
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-bold text-gray-900 flex justify-between items-center group"
              >
                {item}
                <ChevronRight className="w-6 h-6 text-green-600 group-hover:translate-x-2 transition-transform" />
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-4" />
            <button className="w-full py-5 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all">
              Join the Network
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}