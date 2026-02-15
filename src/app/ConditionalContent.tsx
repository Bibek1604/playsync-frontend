'use client';

import { usePathname } from 'next/navigation';
import { Providers } from "./providers";
import { Footer } from "./layout/Footer";
import Header from "./layout/Header";

export function ConditionalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/games');

  if (isDashboard) {
    return (
      <>
        <main className="flex-grow">
          <Providers>
            {children}
          </Providers>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-grow">
        <Providers>
          {children}
        </Providers>
      </main>
      <Footer />
    </>
  );
}