/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { taskApi } from '@/src/services/api';
import MainLayout from '@/src/layouts/MainLayout';
import { GreetingCard, StatsGrid } from '@/src/features/greeting';
import { ConnectionSettings } from '@/src/features/settings';
import { AccountLookup } from '@/src/features/account-settings';

type TabType = 'greeting' | 'workspace' | 'settings' | 'account-settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('greeting');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; database: string } | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);

  // Fetch API health on mount
  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await taskApi.checkHealth();
      setApiHealth(health);
      setIsSandbox(false);
    } catch (err: any) {
      console.warn("Backend API not reachable, falling back to Sandbox Mode:", err);
      setIsSandbox(true);
      setApiHealth({ status: 'offline', database: 'disconnected' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSandbox={isSandbox}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'greeting' && (
          <motion.div
            key="greeting-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center justify-center"
          >
            <GreetingCard name={name} setName={setName} />
            <StatsGrid name={name} />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <ConnectionSettings isSandbox={isSandbox} />
          </motion.div>
        )}

        {activeTab === 'account-settings' && (
          <motion.div
            key="account-settings-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <AccountLookup isSandbox={isSandbox} />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
