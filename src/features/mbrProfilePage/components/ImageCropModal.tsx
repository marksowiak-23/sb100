import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, X, Check, Crop, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onCancel: () => void;
}

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
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset controls when a new image source is opened
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  // Handle Dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
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
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
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
      if (!img) {
        reject(new Error('Image not loaded'));
        return;
      }

      const canvas = document.createElement('canvas');
      const outputSize = 400; // 400x400 square for profile avatars
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Crop viewport box width (280px in UI)
      const viewportSize = 280;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Translate canvas origin to center of output square
      ctx.translate(outputSize / 2, outputSize / 2);

      // Scale factor from 280px viewport to 400px output canvas
      const scaleToCanvas = outputSize / viewportSize;
      ctx.translate(offset.x * scaleToCanvas, offset.y * scaleToCanvas);

      // Apply Rotation & Zoom
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Calculate initial fitted size of image inside 280px viewport box
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawWidth = viewportSize;
      let drawHeight = viewportSize;

      if (imgAspect > 1) {
        drawWidth = viewportSize * imgAspect;
        drawHeight = viewportSize;
      } else {
        drawWidth = viewportSize;
        drawHeight = viewportSize / imgAspect;
      }

      // Convert drawing dimensions to output canvas scale
      drawWidth *= scaleToCanvas;
      drawHeight *= scaleToCanvas;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            reject(new Error('Canvas blob generation failed'));
          }
        },
        'image/jpeg',
        0.92
      );
    });
  }, [offset, rotation, zoom]);

  // Generate live circular avatar preview when user manipulates crop
  useEffect(() => {
    if (isOpen && imgLoaded) {
      const timer = setTimeout(() => {
        generateCrop()
          .then(({ dataUrl }) => setLivePreviewUrl(dataUrl))
          .catch(() => {});
      }, 50);
      return () => clearTimeout(timer);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-800">Crop Profile Photo</h3>
              <p className="text-[11px] text-slate-450 font-serif">Position and scale your photo for your member avatar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow flex flex-col items-center">
          {/* Main Interactive Crop Canvas / Viewport Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
            {/* Viewport Box */}
            <div className="flex flex-col items-center space-y-2">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onWheel={handleWheel}
                className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-blue-400 shadow-inner cursor-move select-none touch-none group"
              >
                {/* Image Element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop Target"
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                  className="max-w-none max-h-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none"
                />

                {/* Circular Crop Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer dim background outside circular mask */}
                  <div className="w-full h-full rounded-2xl ring-[200px] ring-black/40" />
                  {/* Circle outline */}
                  <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    {/* Crosshair guide lines */}
                    <div className="w-full h-[1px] bg-white/20" />
                    <div className="h-full w-[1px] bg-white/20 absolute" />
                  </div>
                </div>

                {/* Hover Drag Hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Move className="w-3 h-3 text-blue-400" />
                  <span>Drag to reposition</span>
                </div>
              </div>
            </div>

            {/* Circular Preview Panel */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Avatar Preview
              </span>
              <div className="w-24 h-24 rounded-full p-1 bg-white border-2 border-blue-500 shadow-md overflow-hidden flex items-center justify-center">
                {livePreviewUrl ? (
                  <img src={livePreviewUrl} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-slate-450 font-serif">1:1 Profile Ratio</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-mono font-bold text-slate-600 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Action Buttons: Rotate & Reset */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-800 font-sans font-medium transition-all cursor-pointer shadow-xs hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-transparent hover:bg-slate-200/50 text-slate-650 hover:text-slate-800 border border-slate-200 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
          >
            <Check className="w-4 h-4" />
            <span>Crop & Save Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
