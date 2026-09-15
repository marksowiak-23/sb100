/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, X, Check, Crop, Move, Maximize, Minimize } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onCancel: () => void;
}

const VIEWPORT_SIZE = 280; // 280x280 square viewport box in modal
const CIRCLE_DIAMETER = 260; // 260px circular avatar mask area

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
  });
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Compute base fitted dimensions (at zoom=1, the image fills the viewport cleanly without blowing up)
  const aspect = naturalDimensions.width / (naturalDimensions.height || 1);
  let baseWidth = VIEWPORT_SIZE;
  let baseHeight = VIEWPORT_SIZE;
  if (aspect > 1) {
    baseWidth = VIEWPORT_SIZE * aspect;
    baseHeight = VIEWPORT_SIZE;
  } else {
    baseWidth = VIEWPORT_SIZE;
    baseHeight = VIEWPORT_SIZE / (aspect || 1);
  }

  // Reset controls when a new image source is opened
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);
      setLivePreviewUrl('');
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.naturalWidth && target.naturalHeight) {
      setNaturalDimensions({
        width: target.naturalWidth,
        height: target.naturalHeight,
      });
    }
    setImgLoaded(true);
  };

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  // Handle Dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setOffset({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  // Handle Drag End
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mouse Wheel Zoom (supports unzoom down to 0.2 and zoom up to 3.0)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((prev) => Math.min(Math.max(0.2, +(prev + delta).toFixed(2)), 3.0));
  };

  // Zoom In / Out Buttons
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.0, +(prev + 0.1).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.2, +(prev - 0.1).toFixed(2)));
  };

  // Fit whole image inside the circular crop mask
  const handleFitEntireImage = () => {
    const fitZoom = aspect > 1 ? CIRCLE_DIAMETER / baseWidth : CIRCLE_DIAMETER / baseHeight;
    setZoom(Math.max(0.2, +fitZoom.toFixed(2)));
    setOffset({ x: 0, y: 0 });
  };

  // Fill crop circle
  const handleFillCircle = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset adjust
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Generate cropped image canvas Blob
  const generateCrop = useCallback((): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = imageRef.current;
      if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
        reject(new Error('Image not ready for cropping'));
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        const outputSize = 400; // 400x400 square for profile avatars
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Translate canvas origin to center of output square
        ctx.translate(outputSize / 2, outputSize / 2);

        // Scale factor from viewport to output canvas
        const scaleToCanvas = outputSize / VIEWPORT_SIZE;
        ctx.translate(offset.x * scaleToCanvas, offset.y * scaleToCanvas);

        // Apply Rotation & Zoom
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        const drawWidth = baseWidth * scaleToCanvas;
        const drawHeight = baseHeight * scaleToCanvas;

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                // Fallback from dataUrl if canvas.toBlob returns null
                try {
                  const byteString = atob(dataUrl.split(',')[1]);
                  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }
                  const fallbackBlob = new Blob([ab], { type: mimeString });
                  resolve({ blob: fallbackBlob, dataUrl });
                } catch (convErr) {
                  reject(new Error('Canvas blob conversion failed'));
                }
              }
            },
            'image/jpeg',
            0.92
          );
        } catch (exportErr) {
          reject(exportErr);
        }
      } catch (drawErr) {
        reject(drawErr);
      }
    });
  }, [offset, rotation, zoom, baseWidth, baseHeight]);

  // Generate live circular avatar preview when user manipulates crop
  useEffect(() => {
    let isCancelled = false;
    if (isOpen && imgLoaded) {
      const timer = setTimeout(() => {
        generateCrop()
          .then(({ dataUrl }) => {
            if (!isCancelled) {
              setLivePreviewUrl(dataUrl);
            }
          })
          .catch(() => {
            // Silently ignore interim preview errors while image is loading/adjusting
          });
      }, 60);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isOpen, imgLoaded, generateCrop]);

  const handleApplyCrop = async () => {
    try {
      const { blob, dataUrl } = await generateCrop();
      onCropComplete(blob, dataUrl);
    } catch (err) {
      console.error('Error cropping image:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white">Crop Profile Photo</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif">Position, scale, and adjust your avatar photo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-grow flex flex-col items-center">
          {/* Main Interactive Crop Canvas / Viewport Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full">
            {/* Viewport Box */}
            <div className="flex flex-col items-center space-y-1.5">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onWheel={handleWheel}
                className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-blue-400/80 shadow-inner cursor-move select-none touch-none group"
              >
                {/* Scaled & Positioned Image Element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  crossOrigin="anonymous"
                  alt="Crop Target"
                  onLoad={handleImageLoad}
                  onError={() => {
                    setImgLoaded(false);
                    console.warn('Image failed to load in cropper');
                  }}
                  style={{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-fill pointer-events-none select-none"
                />

                {/* Circular Crop Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer dim background outside circular mask */}
                  <div className="w-full h-full rounded-2xl ring-[200px] ring-black/50" />
                  {/* Circle outline */}
                  <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                    {/* Crosshair guide lines */}
                    <div className="w-full h-[1px] bg-white/25" />
                    <div className="h-full w-[1px] bg-white/25 absolute" />
                  </div>
                </div>

                {/* Hover Drag Hint */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-3 py-0.5 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Move className="w-3 h-3 text-blue-400" />
                  <span>Drag to reposition</span>
                </div>
              </div>
            </div>

            {/* Circular Preview Panel */}
            <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                Avatar Preview
              </span>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 sm:p-1 bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-md overflow-hidden flex items-center justify-center">
                {livePreviewUrl ? (
                  <img src={livePreviewUrl} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-serif">1:1 Square</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-4 rounded-2xl space-y-3">
            {/* Zoom Slider with Clickable - and + buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom out"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom in"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Action Presets: Fit All, Fill Circle, Rotate, Reset */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFitEntireImage}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-[11px] text-slate-700 dark:text-slate-200 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Minimize className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Fit All</span>
                </button>

                <button
                  type="button"
                  onClick={handleFillCircle}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-[11px] text-slate-700 dark:text-slate-200 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Maximize className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Fill Circle</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-[11px] text-slate-700 dark:text-slate-200 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RotateCw className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-5 py-2 bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
          >
            <Check className="w-4 h-4" />
            <span>Crop & Save Photo</span>
          </button>
        </div>
      </div>
      <AdminComponentTag name="ImageCropModal.tsx" />
    </div>
  );
}
