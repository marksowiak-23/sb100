/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, User, Calendar, Save, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, Upload 
} from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface MbrProfileFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
}

const PRESET_AVATARS = [
  { name: 'Classic Portrait', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format' },
  { name: 'Professional Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format' },
  { name: 'Warm Female', url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&auto=format' },
  { name: 'Modern Male', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format' },
  { name: 'Casual Studio', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&auto=format' }
];

export default function MbrProfileFeature({ isSandbox, onClickBack }: MbrProfileFeatureProps) {
  // --- STATE DEFINITIONS ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Member profile state
  const [mbrId, setMbrId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mbrFirstName: '',
    mbrLastName: '',
    mbrMiddleName: '',
    mbrBirthDate: '',
    mbrDeathDate: '',
    mbrGenderCd: '',
    mbrBiography: '',
    mbrProfilePic: ''
  });

  // Local state for image upload preview (data URL)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- DATA LOADING (useEffect) ---
  useEffect(() => {
    loadMemberProfile();
  }, [isSandbox]);

  const loadMemberProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      setError("No logged-in user session found. Please logon first.");
      setLoading(false);
      return;
    }

    try {
      const u = JSON.parse(userStr);
      setUserId(u.user_id);

      if (isSandbox) {
        // --- SANDBOX MODE ---
        const savedMbr = sessionStorage.getItem('sandbox_mbr');
        if (savedMbr) {
          const mbr = JSON.parse(savedMbr);
          setMbrId(mbr.mbrId);
          setFormData(mbr);
          setPreviewImage(mbr.mbrProfilePic);
        } else {
          // Initialize default Eleanor Hartwell template for sandbox
          const defaultMbr = {
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Hartwell',
            mbrMiddleName: 'Ruth',
            mbrBirthDate: '1961-10-14',
            mbrDeathDate: '',
            mbrGenderCd: 'Female',
            mbrBiography: 'Eleanor Hartwell was born in the coastal town of Coos Bay, Oregon...',
            mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format'
          };
          sessionStorage.setItem('sandbox_mbr', JSON.stringify({ ...defaultMbr, mbrId: 'sandbox-id-eleanor' }));
          setMbrId('sandbox-id-eleanor');
          setFormData(defaultMbr);
          setPreviewImage(defaultMbr.mbrProfilePic);
        }
      } else {
        // --- LIVE DATABASE MODE ---
        try {
          const mbr = await taskApi.getMemberByUserId(u.user_id);
          if (mbr) {
            setMbrId(mbr.mbrId);
            setFormData({
              mbrFirstName: mbr.mbrFirstName || '',
              mbrLastName: mbr.mbrLastName || '',
              mbrMiddleName: mbr.mbrMiddleName || '',
              mbrBirthDate: mbr.mbrBirthDate || '',
              mbrDeathDate: mbr.mbrDeathDate || '',
              mbrGenderCd: mbr.mbrGenderCd || '',
              mbrBiography: mbr.mbrBiography || '',
              mbrProfilePic: mbr.mbrProfilePic || ''
            });
            // If the saved profile picture is stored locally for session
            const cachedPic = sessionStorage.getItem(`session_pic_${mbr.mbrId}`);
            setPreviewImage(cachedPic || mbr.mbrProfilePic || '');
          }
        } catch (err: any) {
          // If profile is not found (404), we auto-populate a draft to let them create it!
          if (err.message.includes('404') || err.message.includes('not found')) {
            console.log("No member profile found, initializing creation draft");
            const names = u.username.split('.');
            setFormData({
              mbrFirstName: names[0] ? names[0].charAt(0).toUpperCase() + names[0].slice(1) : 'Mark',
              mbrLastName: names[1] ? names[1].charAt(0).toUpperCase() + names[1].slice(1) : 'Sowiak',
              mbrMiddleName: '',
              mbrBirthDate: '1990-01-01',
              mbrDeathDate: '',
              mbrGenderCd: 'Male',
              mbrBiography: 'Co-authored narrative story biography workspace.',
              mbrProfilePic: ''
            });
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading member profile:", err);
      setError(`Failed to retrieve member profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Form validation
    if (!formData.mbrFirstName.trim() || !formData.mbrLastName.trim()) {
      setError("First Name and Last Name are required.");
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        mbrFirstName: formData.mbrFirstName.trim(),
        mbrLastName: formData.mbrLastName.trim(),
        mbrMiddleName: formData.mbrMiddleName.trim() || null,
        mbrBirthDate: formData.mbrBirthDate || null,
        mbrDeathDate: formData.mbrDeathDate || null,
        mbrGenderCd: formData.mbrGenderCd || null,
        mbrBiography: formData.mbrBiography.trim() || null,
        mbrProfilePic: formData.mbrProfilePic.trim() || null,
        user_id: userId
      };

      if (isSandbox) {
        // Save sandbox state
        const updatedMbr = { ...payload, mbrId: mbrId || 'sandbox-id-eleanor' };
        sessionStorage.setItem('sandbox_mbr', JSON.stringify(updatedMbr));
        
        // Update public stories feed list avatar
        const updatedStories = sessionStorage.getItem('sandbox_stories');
        if (updatedStories) {
          const stories = JSON.parse(updatedStories);
          const idx = stories.findIndex((s: any) => s.id === 'm1');
          if (idx !== -1) {
            stories[idx].name = `${payload.mbrFirstName} ${payload.mbrLastName}`;
            stories[idx].avatarUrl = payload.mbrProfilePic;
            stories[idx].excerpt = payload.mbrBiography ? payload.mbrBiography.substring(0, 150) + "..." : "";
            sessionStorage.setItem('sandbox_stories', JSON.stringify(stories));
          }
        }

        setSuccess("Sandbox member profile updated successfully!");
        setMbrId(updatedMbr.mbrId);
      } else {
        // Save live database
        if (mbrId) {
          // UPDATE
          const res = await taskApi.updateMember(mbrId, payload);
          setSuccess("Member profile updated successfully in sbDB100!");
          if (res.mbrId && previewImage && previewImage.startsWith('data:image')) {
            sessionStorage.setItem(`session_pic_${res.mbrId}`, previewImage);
          }
        } else {
          // CREATE
          // We call taskApi to create member record using FastAPI POST /mbrs
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/mbrs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Failed to create member profile.");
          }
          const res = await response.json();
          setMbrId(res.mbrId);
          setSuccess("Member profile created successfully in sbDB100!");
          if (res.mbrId && previewImage && previewImage.startsWith('data:image')) {
            sessionStorage.setItem(`session_pic_${res.mbrId}`, previewImage);
          }
        }
      }
    } catch (err: any) {
      console.error("Error saving member profile:", err);
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- IMAGE UPLOAD SIMULATION ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit base64 encoding to reasonable size)
      if (file.size > 2 * 1024 * 1024) {
        setError("Please choose an image file under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setPreviewImage(base64Url);

        // If sandbox, we can store full base64 data url.
        // If live mode, we store a mock cloud storage URL in the database (since column is VARCHAR(500)),
        // but store the actual base64 file locally for current session display.
        if (isSandbox) {
          setFormData((prev) => ({ ...prev, mbrProfilePic: base64Url }));
        } else {
          const simulatedUrl = `https://example.com/profiles/avatar_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          setFormData((prev) => ({ ...prev, mbrProfilePic: simulatedUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Preset Avatar Selection
  const handleSelectPreset = (url: string) => {
    setPreviewImage(url);
    setFormData((prev) => ({ ...prev, mbrProfilePic: url }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400 font-serif">Retrieving member profile record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] animate-fade-in">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFECE7] mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClickBack}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-[#EFECE7] text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-black text-slate-800 tracking-tight">Member Profile Settings</h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isSandbox ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {isSandbox ? 'Sandbox' : 'sbDB100 Live'}
              </span>
            </div>
            <p className="text-xs text-slate-450 font-serif mt-0.5">Customize your biography narratives, demographics, and profile visual assets.</p>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK ALERTS --- */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl mb-6 text-xs font-serif leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl mb-6 text-xs font-serif leading-relaxed"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* --- PROFILE FORM --- */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* PROFILE PICTURE COLUMN */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Profile Picture</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex items-center justify-center shrink-0">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-[10px] font-bold font-sans gap-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New</span>
              </label>
              
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Upload Options & Presets */}
            <div className="flex-grow space-y-4 w-full">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Preset Premium Avatars</span>
                <p className="text-[11px] text-slate-450 font-serif leading-relaxed">Choose a default premium portrait option for your layout:</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(avatar.url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      formData.mbrProfilePic === avatar.url 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-[#EFECE7] hover:border-slate-450'
                    }`}
                    title={avatar.name}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Direct URL Inputs */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1">Direct Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="https://example.com/your-profile-pic.jpg"
                      value={formData.mbrProfilePic.startsWith('data:image') ? 'Uploaded Local File (Base64)' : formData.mbrProfilePic}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.trim() === '') {
                          setPreviewImage(null);
                        } else if (!val.startsWith('Uploaded Local File')) {
                          setPreviewImage(val);
                        }
                        setFormData((prev) => ({ ...prev, mbrProfilePic: val }));
                      }}
                      className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-700 transition-colors"
                      disabled={formData.mbrProfilePic.startsWith('data:image')}
                    />
                  </div>
                  {formData.mbrProfilePic.startsWith('data:image') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, mbrProfilePic: '' }));
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-[#EFECE7] text-slate-650 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Clear File
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DEMOGRAPHIC NAMES SECTION */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Member Demographics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">First Name *</label>
              <input 
                type="text" 
                value={formData.mbrFirstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrFirstName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Middle Name</label>
              <input 
                type="text" 
                value={formData.mbrMiddleName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrMiddleName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Last Name *</label>
              <input 
                type="text" 
                value={formData.mbrLastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrLastName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Birth Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formData.mbrBirthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrBirthDate: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Death Date (Historical)</label>
              <input 
                type="date" 
                value={formData.mbrDeathDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrDeathDate: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Gender Classification</label>
              <select 
                value={formData.mbrGenderCd}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrGenderCd: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3 py-2.5 text-slate-700 transition-colors"
              >
                <option value="">-- Choose Gender --</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Rather not say">Rather not say</option>
              </select>
            </div>
          </div>
        </div>

        {/* LONG FORM BIOGRAPHY / CONTEXT */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Biography Narrative</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Biography / Co-authored Story Context</label>
            <textarea 
              rows={6}
              placeholder="Tell your life story, co-authored chronicles or write an introductory excerpt..."
              value={formData.mbrBiography}
              onChange={(e) => setFormData((prev) => ({ ...prev, mbrBiography: e.target.value }))}
              className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-2xl px-3.5 py-3 text-slate-700 transition-colors resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 font-serif mt-1">This text appears as the primary long-form narrative for your biography portfolio.</p>
          </div>
        </div>

        {/* --- BUTTONS --- */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE7]">
          <button
            type="button"
            onClick={onClickBack}
            className="px-6 py-2.5 bg-transparent hover:bg-slate-50 text-slate-650 hover:text-slate-800 border border-transparent hover:border-[#EFECE7] rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
