'use client';

import { Nav } from '@/components/Nav';
import { PlayerBar } from '@/components/PlayerBar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export function AppShell({ children }: { children: React.ReactNode }) {
  useSearchShortcut();

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <Nav />
      <main id="main-content" className="main-content">
        {children}
      </main>
      <PlayerBar />
      <OnboardingModal />
    </div>
  );
}
