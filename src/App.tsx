/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the React library along with hooks we need.
// - useState: Used to store and update dynamic data (state) that triggers 
//             component re-renders when updated.
// - useEffect: Used to run side effects (fetching data, setting timers, etc.) 
//              outside of rendering.
import React, { useState, useEffect } from 'react';

// Import animation tools from motion. AnimatePresence is used to animate components when they are unmounted/removed.
import { motion, AnimatePresence } from 'motion/react';

// Import our custom API helper client.
import { taskApi } from '@/src/services/api';

// Import our layouts and feature components.
import MainLayout from '@/src/layouts/MainLayout';
import { GreetingCard, StatsGrid } from '@/src/features/greeting';
import { ConnectionSettings } from '@/src/features/settings';
import { AccountLookup } from '@/src/features/account-settings';
import { SbPublicPageFeature } from '@/src/features/sbPublicPage';
import { SbMbrHomePageFeature } from '@/src/features/sbMbrHomePage';
import { SbMbrStoryPageFeature } from '@/src/features/sbMbrStoryPage';
import { SbMbrAuthorPageFeature } from '@/src/features/sbMbrAuthorPage';
import { SbMbrLogonFeature } from '@/src/features/sbMbrLogon';

// Define a TypeScript type to restrict activeTab to only these string values.
type TabType = 'greeting' | 'workspace' | 'settings' | 'account-settings' | 'sbPublicPage' | 'sbMbrHomePage' | 'sbMbrStoryPage' | 'sbMbrAuthorPage' | 'sbMbrLogon';

export default function App() {
  // --- STATE DEFINITIONS ---
  // useState returns an array with two elements: [currentValue, setterFunction].
  // React monitors state variables. When a setterFunction is called, React re-renders 
  // the component with the new value.
  
  const [activeTab, setActiveTab] = useState<TabType>('sbPublicPage');
  const [previousTab, setPreviousTab] = useState<TabType>('sbPublicPage');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('m1');
  const [logonType, setLogonType] = useState<'Google' | 'Apple'>('Google');
  
  // Stores the name inputted in the greeting card. This is shared between GreetingCard 
  // and StatsGrid.
  const [name, setName] = useState('');
  
  // Tracks whether the health check network request is currently active.
  const [loading, setLoading] = useState(true);
  
  // Holds any error message strings if backend communication fails.
  const [error, setError] = useState<string | null>(null);
  
  // Stores the health check status payload returned from the backend FastAPI service.
  const [apiHealth, setApiHealth] = useState<{ status: string; database: string } | null>(null);
  
  // Determines if the app should run using offline sandbox data. If the backend is unreachable, this falls back to true.
  const [isSandbox, setIsSandbox] = useState(false);

  // --- SIDE EFFECTS (useEffect) ---
  // useEffect runs after the component renders on the screen.
  // The second argument is a dependency array:
  // - [] (Empty array): Tells React to run this effect EXACTLY ONCE, when the component initially mounts (loads).
  useEffect(() => {
    loadHealth();
  }, []);

  // Helper function to query the backend health check endpoint.
  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt to hit the health check route.
      const health = await taskApi.checkHealth();
      setApiHealth(health);
      setIsSandbox(false); // Successfully reached the backend server.
    } catch (err: any) {
      // If the backend fails or times out, we catch the exception and fall back to sandbox mode.
      console.warn("Backend API not reachable, falling back to Sandbox Mode:", err);
      setIsSandbox(true);
      setApiHealth({ status: 'offline', database: 'disconnected' });
    } finally {
      setLoading(false); // Done checking health.
    }
  };

  const handleReadStory = (memberId: string) => {
    setPreviousTab(activeTab);
    setSelectedMemberId(memberId);
    setActiveTab('sbMbrStoryPage');
  };

  // --- RENDERING (JSX) ---
  // App.tsx returns JSX (HTML-like syntax inside Javascript).
  // We compose MainLayout as our primary shell structure, then render the appropriate 
  // screen inside it.
  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSandbox={isSandbox}
    >
      {/* AnimatePresence coordinates transition effects between our screens. */}
      {/* mode="wait" ensures the old screen completes its fade-out before the new one fades in. */}
      <AnimatePresence mode="wait">
        
        {/* If the active tab is 'greeting', render the greeting feature components */}
        {activeTab === 'greeting' && (
          <motion.div
            key="greeting-view"
            initial={{ opacity: 0, y: 15 }} // Starting state for slide-in animation
            animate={{ opacity: 1, y: 0 }}  // Final rendering state
            exit={{ opacity: 0, y: -15 }}   // State when transitioning away
            transition={{ duration: 0.4 }}  // Animation timing
            className="w-full flex flex-col items-center justify-center"
          >
            {/* Component Composition: passing data (props) down to children */}
            <GreetingCard name={name} setName={setName} />
            <StatsGrid name={name} />
          </motion.div>
        )}

        {/* If the active tab is 'settings', render connection configurations */}
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

        {/* If the active tab is 'account-settings', render the user database search UI */}
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

        {/* If the active tab is 'sbPublicPage', render the three-column memoir layout */}
        {activeTab === 'sbPublicPage' && (
          <motion.div
            key="sbPublicPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbPublicPageFeature
              setActiveTab={setActiveTab}
              onClickReadStory={handleReadStory}
              onSelectLogonType={(type) => {
                setLogonType(type);
                setActiveTab('sbMbrLogon');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrHomePage', render the home page dashboard */}
        {activeTab === 'sbMbrHomePage' && (
          <motion.div
            key="sbMbrHomePage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrHomePageFeature
              onClickReadStory={handleReadStory}
              onClickAuthorPage={() => {
                setPreviousTab(activeTab);
                setActiveTab('sbMbrAuthorPage');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrStoryPage', render the member story biography page */}
        {activeTab === 'sbMbrStoryPage' && (
          <motion.div
            key="sbMbrStoryPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrStoryPageFeature
              memberId={selectedMemberId}
              onClickBack={() => setActiveTab(previousTab)}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrAuthorPage', render the member co-writer workspace */}
        {activeTab === 'sbMbrAuthorPage' && (
          <motion.div
            key="sbMbrAuthorPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrAuthorPageFeature
              isSandbox={isSandbox}
              onClickBack={() => setActiveTab('sbMbrHomePage')}
            />
          </motion.div>
        )}
        {/* If the active tab is 'sbMbrLogon', render the secure logon screen */}
        {activeTab === 'sbMbrLogon' && (
          <motion.div
            key="sbMbrLogon-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrLogonFeature
              logonType={logonType}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
