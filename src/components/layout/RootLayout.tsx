import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Radial gradient background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)'
      }} />
      {/* Noise overlay */}
      <div className="noise-overlay" />

      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
