// components/layout/header.jsx
import Image from 'next/image';

export default function Header() {
  return (
    <header className="relative w-full h-[50vh] bg-white overflow-hidden flex items-center border-b border-slate-100">
      {/* MEGA LOGO BACKGROUND */}


      <div className="container mx-auto px-12 relative z-10 flex flex-col items-start gap-6">
        {/* Main Nav Logo */}
        <Image 
          src="/playsync-logo.svg" 
          alt="PLAYSYNC" 
          width={200} 
          height={200} 
          className="h-64 w-auto transition-transform hover:scale-105 duration-700" 
        />

      </div>
    </header>
  );
}