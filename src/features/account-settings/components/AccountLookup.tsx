/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Search, Loader2, AlertCircle, X, Info, Mail, ShieldCheck } from 'lucide-react';
import { taskApi, User as ApiUser } from '@/src/services/api';
import { SANDBOX_USERS } from '../constants/mockUsers';
import { matchUser } from '../utils/search';
import UserCard from './UserCard';

interface AccountLookupProps {
  isSandbox: boolean; // Tells us whether we query mock offline data or a live backend DB.
}

/**
 * AccountLookup Component
 * Coordinates searching and showing lists of user accounts.
 * Manages complex async lifecycle operations (loading spinners, error banners, mock vs live API endpoints).
 */
export default function AccountLookup({ isSandbox }: AccountLookupProps) {
  // --- STATE FOR USER SELECTION AND LOGIC ---
  // Tracks user input in search field.
  const [searchUsername, setSearchUsername] = useState('');
  // Stores array of matching users fetched from the datasource.
  const [searchUsersResults, setSearchUsersResults] = useState<ApiUser[]>([]);
  // Boolean flag displaying a loading spinner during network roundtrips.
  const [searchLoading, setSearchLoading] = useState(false);
  // Holds errors if backend rejects the queries.
  const [searchError, setSearchError] = useState<string | null>(null);
  // Stores the currently logged-in user profile from session storage.
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse logged-in user session:", e);
      }
    }
  }, []);

  // Fired when the form is submitted.
  // We accept `FormEvent` to control default form behavior.
  const handleSearchUsers = async (e?: FormEvent) => {
    // e?.preventDefault() stops the browser from refreshing the page when the user presses Enter/clicks submit.
    if (e) e.preventDefault();
    
    setSearchLoading(true);
    setSearchError(null);
    try {
      if (isSandbox) {
        // MOCK DATA QUERY:
        // Runs standard JS array filter matching usernames against our wildcard utility.
        const results = SANDBOX_USERS.filter(u => matchUser(u.username, searchUsername.trim()));
        setSearchUsersResults(results);
      } else {
        // LIVE NETWORK QUERY:
        // Contacts the FastAPI server database using the SDK wrapper.
        const results = await taskApi.getUsers(searchUsername.trim() || undefined);
        setSearchUsersResults(results);
      }
    } catch (err: any) {
      setSearchError(`Failed to fetch user accounts: ${err.message}`);
    } finally {
      setSearchLoading(false); // Disable spinner.
    }
  };

  // --- AUTOMATIC RE-FETCH EFFECT ---
  // When `isSandbox` changes (e.g. going offline/online), this effect automatically runs.
  // It ensures the search results refresh immediately using the correct data source.
  useEffect(() => {
    handleSearchUsers();
  }, [isSandbox]);

  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* --- STATUS CONNECTION HEADER --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 border border-[#EFECE7] text-slate-700 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800">Account Settings Lookup</h2>
            <p className="text-xs text-slate-450 font-serif mt-0.5">
              Query and view user credentials, registration dates, and active statuses.
            </p>
          </div>
        </div>
        
        {/* Connection mode details */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
              isSandbox
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-250'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            {isSandbox ? 'Sandbox Mock Data' : 'Live DB Connected'}
          </span>
        </div>
      </div>

      {/* --- ACTIVE SESSION PROFILE PANEL --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-600" /> Active Session Profile
        </h3>
        
        {currentUser ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-blue-50/20 border border-blue-100 p-5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 border border-blue-600/20 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-slate-800 text-base leading-none">{currentUser.username}</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-serif mt-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentUser.email}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right font-serif text-[10px] text-slate-400 space-y-1">
              <div><strong>User ID:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px] font-mono text-slate-600">{currentUser.user_id}</code></div>
              <div><strong>Registered:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 border-dashed p-6 rounded-2xl text-center">
            <p className="text-xs font-serif text-slate-500 italic">
              No user logged in. Please use the logon buttons on the home page to authenticate.
            </p>
          </div>
        )}
      </div>

      {/* --- SEARCH INPUT CONTROLS --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-sm font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" /> Search User Accounts
        </h3>
        
        {/* Standard Form element. Allows users to submit queries by pressing the 'Enter' key. */}
        <form onSubmit={handleSearchUsers} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username (e.g. john_doe, john*, *smith)..."
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-xs md:text-sm rounded-xl border border-[#EFECE7] outline-none py-3.5 pl-11 pr-4 transition-all duration-150 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {/* Submit button. Disabled during network fetching requests to prevent duplicate requests. */}
          <button
            type="submit"
            disabled={searchLoading}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm rounded-xl shadow-md transition-all duration-150 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 border border-blue-600 cursor-pointer"
          >
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search Accounts</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400 mt-3 leading-normal font-serif">
          💡 Wildcard support: Use <strong>*</strong> for matching prefixes (e.g. <code>john*</code>), suffixes (e.g. <code>*smith</code>), or internal patterns. Entering plain text defaults to a partial substring search.
        </p>
      </div>

      {/* --- ERROR BANNER DISPLAY --- */}
      {searchError && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm font-medium">{searchError}</p>
          </div>
          <button onClick={() => setSearchError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- RESULTS AREA --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Results ({searchUsersResults.length})
          </h3>
        </div>

        {/* Dynamic loading vs. empty vs. list renders using nested ternary statements */}
        {searchLoading ? (
          /* State 1: Search is active */
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            <span className="text-sm font-medium">Searching account records...</span>
          </div>
        ) : searchUsersResults.length === 0 ? (
          /* State 2: Search complete, but returned no matches */
          <div className="bg-[#FDFCFB] border border-[#EFECE7] border-dashed rounded-2xl py-16 px-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EFECE7] text-slate-400">
              <Info className="w-6 h-6" />
            </div>
            <h4 className="text-slate-800 font-serif font-bold mb-1">No user accounts found</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
              Try searching with different keywords or check if the backend mock accounts are seeded.
            </p>
          </div>
        ) : (
          /* State 3: Render list results */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Array.map compiles each user data object in the array into a visual <UserCard> element. */}
            {/* The 'key' attribute is required by React when rendering lists. */}
            {/* It helps React identify exactly which items have changed, been added, or been removed. */}
            {searchUsersResults.map((user) => (
              <UserCard key={user.user_id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
