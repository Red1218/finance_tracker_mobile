import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { UserMenu } from './UserMenu';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 mx-auto max-w-md px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-end">
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
