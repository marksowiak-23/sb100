/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  ShieldCheck,
  AlertCircle,
  HardDrive,
  Clock,
  FileText,
  Key,
  X,
  Eye,
  CheckCircle2,
  FolderPlus,
  Sparkles,
  Cloud
} from 'lucide-react';
import { mediaApi, MediaObject, SignedUrlResponse } from '@/src/services/api';

interface AdminMediaManagementProps {
  isSandbox?: boolean;
}

// Fallback demo media objects when backend service is offline or in sandbox mode
const MOCK_MEDIA_ITEMS: MediaObject[] = [
  {
    name: 'avatars/member_portrait_1.jpg',
    size: 245120,
    content_type: 'image/jpeg',
    updated: '2026-07-22T18:30:00Z',
    public_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&auto=format',
    metadata: { original_filename: 'portrait_1.jpg', uploader: 'admin' }
  },
  {
    name: 'covers/memoir_family_roots.png',
    size: 1048576,
    content_type: 'image/png',
    updated: '2026-07-21T14:15:00Z',
    public_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop&auto=format',
    metadata: { original_filename: 'memoir_family_roots.png', uploader: 'system' }
  },
  {
    name: 'gallery/vintage_car_1965.jpg',
    size: 512000,
    content_type: 'image/jpeg',
    updated: '2026-07-20T09:45:00Z',
    public_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&h=400&fit=crop&auto=format',
    metadata: { original_filename: 'vintage_car_1965.jpg', uploader: 'member_m1' }
  },
  {
    name: 'gallery/grandma_recipes_handwritten.webp',
    size: 389120,
    content_type: 'image/webp',
    updated: '2026-07-19T11:20:00Z',
    public_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop&auto=format',
    metadata: { original_filename: 'recipes_page.webp', uploader: 'member_m2' }
  }
];

export default function AdminMediaManagement({ isSandbox = false }: AdminMediaManagementProps) {
  // Service connection & bucket state
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    service: string;
    bucket: string;
    bucket_status: string;
  } | null>(null);
  const [isServiceOnline, setIsServiceOnline] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Media list & retrieval state
  const [items, setItems] = useState<MediaObject[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [prefixFilter, setPrefixFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [destinationPath, setDestinationPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals & Action States
  const [selectedObject, setSelectedObject] = useState<MediaObject | null>(null);
  const [deleteObjectTarget, setDeleteObjectTarget] = useState<MediaObject | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Signed URL Modal State
  const [signedUrlTarget, setSignedUrlTarget] = useState<MediaObject | null>(null);
  const [signedUrlResult, setSignedUrlResult] = useState<SignedUrlResponse | null>(null);
  const [expirationMinutes, setExpirationMinutes] = useState(15);
  const [generatingSignedUrl, setGeneratingSignedUrl] = useState(false);

  // Notification messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check health on mount
  useEffect(() => {
    checkMediaServiceHealth();
  }, [isSandbox]);

  // Clean up object URL previews
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const checkMediaServiceHealth = async () => {
    setLoadingHealth(true);
    setErrorMsg(null);
    try {
      if (isSandbox) {
        setIsServiceOnline(false);
        setHealthStatus({
          status: 'sandbox',
          service: 'sb-api-media (Sandbox)',
          bucket: 'sb-media-01',
          bucket_status: 'sandbox_simulated'
        });
        setItems(MOCK_MEDIA_ITEMS);
      } else {
        const res = await mediaApi.checkHealth();
        setHealthStatus(res);
        setIsServiceOnline(res.status === 'healthy' || res.bucket_status === 'accessible');
        fetchMediaList();
      }
    } catch (err: any) {
      console.warn('sb-api-media service offline, using sandbox fallback:', err);
      setIsServiceOnline(false);
      setHealthStatus({
        status: 'offline',
        service: 'sb-api-media (Offline)',
        bucket: 'sb-media-01',
        bucket_status: 'unreachable'
      });
      setItems(MOCK_MEDIA_ITEMS);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchMediaList = async (overridePrefix?: string) => {
    setLoadingItems(true);
    const prefixToUse = overridePrefix !== undefined ? overridePrefix : prefixFilter;
    try {
      if (isSandbox || !isServiceOnline) {
        // Filter mock items in sandbox mode
        let filtered = MOCK_MEDIA_ITEMS;
        if (prefixToUse) {
          filtered = filtered.filter(item => item.name.toLowerCase().startsWith(prefixToUse.toLowerCase()));
        }
        setItems(filtered);
      } else {
        const res = await mediaApi.listMedia(prefixToUse, 100);
        setItems(res.items || []);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to list media from GCS: ${err.message}`);
      setItems(MOCK_MEDIA_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    if (!destinationPath) {
      setDestinationPath(file.name);
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please choose an image file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetBlobName = destinationPath.trim() || selectedFile.name;

    try {
      if (isSandbox || !isServiceOnline) {
        // Sandbox mock upload
        await new Promise(r => setTimeout(r, 800));
        const newMockItem: MediaObject = {
          name: targetBlobName,
          size: selectedFile.size,
          content_type: selectedFile.type,
          updated: new Date().toISOString(),
          public_url: filePreviewUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&auto=format',
          metadata: { original_filename: selectedFile.name, uploader: 'admin' }
        };
        MOCK_MEDIA_ITEMS.unshift(newMockItem);
        setItems([newMockItem, ...items]);
        setSuccessMsg(`Simulated Upload Success! '${targetBlobName}' added to sandbox cloud storage.`);
      } else {
        const uploadRes = await mediaApi.uploadMedia(selectedFile, targetBlobName);
        setSuccessMsg(uploadRes.message || `Image '${targetBlobName}' uploaded to GCS successfully!`);
        fetchMediaList();
      }

      // Reset form state
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setDestinationPath('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteObjectTarget) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      if (isSandbox || !isServiceOnline) {
        await new Promise(r => setTimeout(r, 400));
        setItems(items.filter(i => i.name !== deleteObjectTarget.name));
        const mockIdx = MOCK_MEDIA_ITEMS.findIndex(i => i.name === deleteObjectTarget.name);
        if (mockIdx !== -1) MOCK_MEDIA_ITEMS.splice(mockIdx, 1);
        setSuccessMsg(`Simulated Delete: '${deleteObjectTarget.name}' removed from bucket.`);
      } else {
        await mediaApi.deleteMedia(deleteObjectTarget.name);
        setSuccessMsg(`Object '${deleteObjectTarget.name}' deleted successfully from Cloud Storage.`);
        fetchMediaList();
      }
      setDeleteObjectTarget(null);
    } catch (err: any) {
      setErrorMsg(`Failed to delete object: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateSignedUrl = async () => {
    if (!signedUrlTarget) return;
    setGeneratingSignedUrl(true);
    setErrorMsg(null);

    try {
      if (isSandbox || !isServiceOnline) {
        await new Promise(r => setTimeout(r, 300));
        const mockUrl = `https://storage.googleapis.com/sb-media-01/${encodeURIComponent(signedUrlTarget.name)}?GoogleAccessId=service-account%40sb-media.iam.gserviceaccount.com&Expires=${Math.floor(Date.now() / 1000) + expirationMinutes * 60}&Signature=mock_signature_hash`;
        setSignedUrlResult({
          bucket: 'sb-media-01',
          object_name: signedUrlTarget.name,
          signed_url: mockUrl,
          method: 'GET',
          expiration_minutes: expirationMinutes
        });
      } else {
        const res = await mediaApi.createSignedUrl(signedUrlTarget.name, 'GET', expirationMinutes);
        setSignedUrlResult(res);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to generate signed URL: ${err.message}`);
    } finally {
      setGeneratingSignedUrl(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageSrc = (item: MediaObject): string => {
    if (isServiceOnline) {
      return mediaApi.getReadUrl(item.name);
    }
    return item.public_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&auto=format';
  };

  // Filter items by client search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.content_type && item.content_type.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl shadow-xs">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              Admin Media Management
              <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                sb-api-media
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload images to Google Cloud Storage bucket <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">sb-media-01</code> and retrieve media assets.
            </p>
          </div>
        </div>

        {/* Bucket Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={checkMediaServiceHealth}
            disabled={loadingHealth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Connection Health"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            isServiceOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isServiceOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isServiceOnline ? (
              <span>GCS Connected (sb-media-01)</span>
            ) : (
              <span>Sandbox / Offline Mode</span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-3 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: UPLOAD PANEL (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <h2 className="font-serif font-bold text-slate-800 text-sm">Upload Image to Cloud</h2>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {filePreviewUrl ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                      <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                      {selectedFile?.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedFile && formatBytes(selectedFile.size)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to browse or drop image</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP, GIF up to 20MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Destination Path Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Destination Path / Object Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. avatars/user_101.jpg"
                  value={destinationPath}
                  onChange={(e) => setDestinationPath(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave empty to use original filename. Add path prefix (e.g. <code className="text-slate-600">gallery/</code>) for folders.
                </span>
              </div>

              {/* Submit Upload Button */}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading to GCS...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bucket Quick Info Card */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 font-serif">
              <HardDrive className="w-4 h-4" />
              <span>GCS Storage Target</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Bucket:</span>
                <span className="text-white font-bold">sb-media-01</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-slate-300 text-[11px]">localhost:8003</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Total Items:</span>
                <span className="text-emerald-400 font-bold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CORS Support:</span>
                <span className="text-emerald-400">Enabled (*)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLOUD MEDIA GALLERY & RETRIEVAL (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            {/* Toolbar: Search, Prefix Filter, Refresh, View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search images or paths..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Prefix Filter */}
                <div className="relative w-36">
                  <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Prefix filter"
                    value={prefixFilter}
                    onChange={(e) => {
                      setPrefixFilter(e.target.value);
                      fetchMediaList(e.target.value);
                    }}
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Right View Controls & Refresh */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMediaList()}
                  disabled={loadingItems}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Refresh media list from GCS"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingItems ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Refresh</span>
                </button>

                <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Table View"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Items Display */}
            {loadingItems ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs font-medium">Retrieving objects from Google Cloud Storage...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-100 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No media objects found</p>
                <p className="text-[11px] text-slate-400">Upload an image or adjust prefix search filter.</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden transition-all duration-200 shadow-xs flex flex-col justify-between"
                  >
                    {/* Image Thumbnail Container */}
                    <div className="relative aspect-video w-full bg-slate-200 overflow-hidden cursor-pointer" onClick={() => setSelectedObject(item)}>
                      <img
                        src={getImageSrc(item)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&auto=format';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedObject(item);
                          }}
                          className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white transition-all shadow-md"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSignedUrlTarget(item);
                            setSignedUrlResult(null);
                          }}
                          className="p-2 rounded-xl bg-white/90 text-blue-600 hover:bg-white transition-all shadow-md"
                          title="Generate Signed URL"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {formatBytes(item.size)}
                      </div>
                    </div>

                    {/* Metadata & Actions Card Footer */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate font-mono" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.updated ? new Date(item.updated).toLocaleDateString() : 'Cloud Asset'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Icon Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => copyToClipboard(mediaApi.getReadUrl(item.name), `url-${item.name}`)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                          title="Copy Read API Stream URL"
                        >
                          {copiedKey === `url-${item.name}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSignedUrlTarget(item);
                              setSignedUrlResult(null);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Signed Access URL"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteObjectTarget(item)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Object Path / Name</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Content Type</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((item) => (
                      <tr key={item.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4">
                          <img
                            src={getImageSrc(item)}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 cursor-pointer"
                            onClick={() => setSelectedObject(item)}
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">
                          {formatBytes(item.size)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                          {item.content_type || 'image/jpeg'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                          {item.updated ? new Date(item.updated).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => setSelectedObject(item)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSignedUrlTarget(item);
                              setSignedUrlResult(null);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Signed URL"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteObjectTarget(item)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Object"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL / INSPECTION MODAL */}
      <AnimatePresence>
        {selectedObject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-serif font-bold text-slate-800 text-sm truncate max-w-md">
                    {selectedObject.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedObject(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Image Preview Box */}
                <div className="max-h-72 w-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={getImageSrc(selectedObject)}
                    alt={selectedObject.name}
                    className="max-h-68 max-w-full object-contain rounded-lg"
                  />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-mono">File Size</span>
                    <span className="font-bold font-mono text-slate-800">{formatBytes(selectedObject.size)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-mono">Content Type</span>
                    <span className="font-bold font-mono text-slate-800">{selectedObject.content_type || 'image/jpeg'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] font-mono">Bucket</span>
                    <span className="font-bold font-mono text-blue-600">sb-media-01</span>
                  </div>
                </div>

                {/* API Stream & Download Links */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Direct API Stream Endpoint:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={mediaApi.getReadUrl(selectedObject.name)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
                    />
                    <button
                      onClick={() => copyToClipboard(mediaApi.getReadUrl(selectedObject.name), 'detail-read-url')}
                      className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'detail-read-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedObject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIGNED URL GENERATOR MODAL */}
      <AnimatePresence>
        {signedUrlTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-blue-600">
                  <Key className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-slate-800 text-sm">
                    Generate GCS Signed URL
                  </h3>
                </div>
                <button
                  onClick={() => setSignedUrlTarget(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Generate a temporary, secure signature URL to read object <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">{signedUrlTarget.name}</code> directly from GCS.
                </p>

                {/* Expiration Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiration Time:
                  </label>
                  <select
                    value={expirationMinutes}
                    onChange={(e) => setExpirationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={240}>4 Hours</option>
                    <option value={1440}>24 Hours (1 Day)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateSignedUrl}
                  disabled={generatingSignedUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {generatingSignedUrl ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Signed URL...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Generate Signed URL</span>
                    </>
                  )}
                </button>

                {/* Signed URL Output */}
                {signedUrlResult && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Signed URL Generated (Valid for {signedUrlResult.expiration_minutes}m):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <textarea
                        readOnly
                        rows={3}
                        value={signedUrlResult.signed_url}
                        className="w-full p-2.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 resize-none"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(signedUrlResult.signed_url, 'modal-signed-url')}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-signed-url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>Copy Signed URL to Clipboard</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteObjectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Delete Media Object?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete <code className="font-mono text-rose-600 font-bold">{deleteObjectTarget.name}</code> from Google Cloud Storage bucket <code className="font-mono">sb-media-01</code>? This action cannot be undone.
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setDeleteObjectTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
