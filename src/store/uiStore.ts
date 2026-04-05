import { create } from 'zustand';

type Page = 'simulator' | 'dashboard' | 'history' | 'about';

interface UIState {
  activePage: Page;
  sidebarCollapsed: boolean;
  drawerOpen: string | null;
  activeChartTab: string;
  setActivePage: (page: Page) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setDrawerOpen: (id: string | null) => void;
  setActiveChartTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'simulator',
  sidebarCollapsed: false,
  drawerOpen: null,
  activeChartTab: 'reward',

  setActivePage: (activePage) => set({ activePage }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setActiveChartTab: (activeChartTab) => set({ activeChartTab }),
}));
