import { RootLayout } from '@/components/layout/RootLayout';
import { SimulatorPage } from '@/pages/SimulatorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AboutPage } from '@/pages/AboutPage';
import { useUIStore } from '@/store/uiStore';

export default function App() {
  const { activePage } = useUIStore();

  return (
    <RootLayout>
      {activePage === 'simulator' && <SimulatorPage />}
      {activePage === 'dashboard' && <DashboardPage />}
      {activePage === 'history' && <HistoryPage />}
      {activePage === 'about' && <AboutPage />}
    </RootLayout>
  );
}
