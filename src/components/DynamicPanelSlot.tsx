import React, { useEffect, useState } from 'react';
import { usePanels } from '@/src/context/PanelContext';
import { DynamicPanelCard } from '@/src/components/DynamicPanelCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import type { Panel } from '@/src/services/api';

interface DynamicPanelSlotProps {
  location: string;
  className?: string;
  compact?: boolean;
}

const getViewerContext = (): { isLoggedIn: boolean; isAdmin: boolean } => {
  try {
    const isLoggedIn = Boolean(
      sessionStorage.getItem('user') || sessionStorage.getItem('sb_current_mbr')
    );
    let isAdmin = Boolean(sessionStorage.getItem('sb_current_adm'));
    if (!isAdmin) {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const role = String(u?.role || u?.user_role || '').toLowerCase();
        const userType = String(u?.user_typeCd || '').toUpperCase();
        if (
          role === 'admin' ||
          role === 'administrator' ||
          userType === 'ADMIN' ||
          userType === 'SUPPORT' ||
          userType === 'SUPERADMIN' ||
          u?.is_admin === true
        ) {
          isAdmin = true;
        }
      }
    }
    return { isLoggedIn, isAdmin };
  } catch {
    return { isLoggedIn: false, isAdmin: false };
  }
};

export const DynamicPanelSlot: React.FC<DynamicPanelSlotProps> = ({
  location,
  className = '',
  compact = false,
}) => {
  const { panels, dismissPanel, isPanelDismissed } = usePanels();
  const [, setAuthVersion] = useState(0);

  useEffect(() => {
    const bump = () => setAuthVersion((v) => v + 1);
    window.addEventListener('user-switched', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('user-switched', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const { isLoggedIn, isAdmin } = getViewerContext();
  const locUpper = location.toUpperCase();
  const matchingPanels = panels.filter((p) => {
    if ((p.panelLocationCd || '').toUpperCase() !== locUpper) return false;
    if (isPanelDismissed(p)) return false;

    const aud = (p.panelAudienceCd || 'ALL').toUpperCase();
    if (aud === 'MEMBERS' && !isLoggedIn) return false;
    if (aud === 'PUBLIC' && isLoggedIn) return false;
    if (aud === 'ADMINS' && !isAdmin) return false;
    return true;
  });

  if (matchingPanels.length === 0) return null;

  const handleCta = (panel: Panel) => {
    const target = (panel.panelCtaTarget || '').trim();
    if (!target) return;
    if (/^https?:\/\//i.test(target)) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: target } }));
    }
  };

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {matchingPanels.map((panel) => (
        <DynamicPanelCard
          key={panel.panelId}
          panel={panel}
          compact={compact}
          onCtaClick={() => handleCta(panel)}
          onDismiss={panel.panelDismissibleFlag ? () => dismissPanel(panel) : undefined}
        />
      ))}
      <AdminComponentTag name={`DynamicPanelSlot:${location}`} />
    </div>
  );
};
