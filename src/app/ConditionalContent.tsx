'use client';

import { usePathname } from 'next/navigation';
import { Footer } from "./layout/footer";


export function ConditionalContent({ children }: { children: React.ReactNode }) {
  /* 
     We keep the hook call if needed for future logic, 
     but currently we render the same structure for all routes.
  */
  // const pathname = usePathname(); 

  return (
    <>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}