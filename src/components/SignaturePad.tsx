import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  height = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  // Resize canvas according to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#1e3a8a'; // Navy blue ink color

        // If initial value exists and we just resized, draw it
        if (value) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, height);
          };
          img.src = value;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [height]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearSignature = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    onChange(undefined);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
        <span className="flex items-center gap-1.5 text-slate-700">
          <PenTool className="w-3.5 h-3.5 text-emerald-600" />
          Goreskan Tanda Tangan Anda di Kotak Berikut:
        </span>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Hapus / Ulangi
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 hover:bg-white transition-colors overflow-hidden touch-none cursor-crosshair focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full"
        />

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 select-none">
            <span className="text-xs font-medium">Usap jari atau geser mouse untuk tanda tangan</span>
            <span className="text-[11px] text-slate-400/80 mt-0.5">(Sah sebagai tanda kehadiran warga)</span>
          </div>
        )}

        {hasSignature && (
          <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1 text-[11px] bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-full font-medium shadow-xs">
            <Check className="w-3 h-3" />
            Tanda tangan terekam
          </div>
        )}
      </div>
    </div>
  );
};
