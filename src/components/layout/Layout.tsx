import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
