import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Panel, panelApi } from '@/src/services/api';

const SANDBOX_PANELS_KEY = 'sb_sandbox_panels';
const DISMISSED_PANELS_KEY = 'sb_dismissed_panels';

interface PanelContextValue {
  panels: Panel[];
  loading: boolean;
  refreshPanels: () => Promise<void>;
  dismissPanel: (panel: Panel) => void;
  isPanelDismissed: (panel: Panel) => boolean;
}

const PanelContext = createContext<PanelContextValue>({
  panels: [],
  loading: false,
  refreshPanels: async () => {},
  dismissPanel: () => {},
  isPanelDismissed: () => false,
});

const getDismissKey = (panel: Panel): string =>
  `${panel.panelId}::${panel.panelUpdatedAt || 'v1'}`;

const loadDismissedSet = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(DISMISSED_PANELS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const loadSandboxActivePanels = (): Panel[] => {
  try {
    const raw = sessionStorage.getItem(SANDBOX_PANELS_KEY);
    if (!raw) return [];
    const all: Panel[] = JSON.parse(raw);
    const now = Date.now();
    return all
      .filter((p) => {
        if (!p.panelActiveFlag) return false;
        if (p.panelStartAt && new Date(p.panelStartAt).getTime() > now) return false;
        if (p.panelEndAt && new Date(p.panelEndAt).getTime() < now) return false;
        return true;
      })
      .sort((a, b) => (a.panelDisplayOrder ?? 100) - (b.panelDisplayOrder ?? 100));
  } catch {
    return [];
  }
};

export const PanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissedSet);

  const refreshPanels = useCallback(async () => {
    setLoading(true);
    try {
      const active = await panelApi.getActive();
      setPanels(Array.isArray(active) ? active : []);
    } catch {
      // Fallback to Sandbox panels in sessionStorage when API is unreachable
      setPanels(loadSandboxActivePanels());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPanels();

    const handleRefresh = () => {
      void refreshPanels();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshPanels();
      }
    };

    window.addEventListener('panels-updated', handleRefresh);
    window.addEventListener('user-switched', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshPanels();
      }
    }, 60_000);

    return () => {
      window.removeEventListener('panels-updated', handleRefresh);
      window.removeEventListener('user-switched', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(pollInterval);
    };
  }, [refreshPanels]);

  const dismissPanel = useCallback((panel: Panel) => {
    const key = getDismissKey(panel);
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        sessionStorage.setItem(DISMISSED_PANELS_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const isPanelDismissed = useCallback(
    (panel: Panel) => dismissed.has(getDismissKey(panel)),
    [dismissed]
  );

  return (
    <PanelContext.Provider value={{ panels, loading, refreshPanels, dismissPanel, isPanelDismissed }}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanels = () => useContext(PanelContext);
