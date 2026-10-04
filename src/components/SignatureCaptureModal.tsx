import React, { useState } from 'react';
import { X, Check, RotateCcw, PenTool, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface SignatureCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetName: string;
  targetRole?: string;
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  onSaveAndNext?: (dataUrl: string) => void;
  hasNext?: boolean;
}

export const SignatureCaptureModal: React.FC<SignatureCaptureModalProps> = ({
  isOpen,
  onClose,
  title,
  targetName,
  targetRole,
  initialSignature,
  onSave,
  onSaveAndNext,
  hasNext = false,
}) => {
  const [signature, setSignature] = useState<string | undefined>(initialSignature);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!signature) {
      setErrorMsg('Mohon goreskan tanda tangan terlebih dahulu pada kotak putih.');
      return;
    }
    setErrorMsg(null);
    onSave(signature);
    onClose();
  };

  const handleSaveAndNext = () => {
    if (!signature) {
      setErrorMsg('Mohon goreskan tanda tangan terlebih dahulu pada kotak putih.');
      return;
    }
    setErrorMsg(null);
    if (onSaveAndNext) {
      onSaveAndNext(signature);
      setSignature(undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Rekam tanda tangan digital sah dokumen musyawarah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Citizen / Leader Info */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {targetName.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Penandatangan:
              </span>
              <h4 className="text-sm font-bold text-slate-900">{targetName}</h4>
              {targetRole && (
                <span className="text-[11px] text-slate-500 font-medium">{targetRole}</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verifikasi Kehadiran
            </span>
          </div>
        </div>

        {/* Signature Pad Area */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <SignaturePad
            value={signature}
            onChange={(val) => {
              setSignature(val);
              if (val) setErrorMsg(null);
            }}
            height={160}
          />
          <p className="text-[11px] text-slate-400 text-center">
            Goreskan tanda tangan menggunakan jari tangan di layar sentuh atau kursor mouse.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            {hasNext && onSaveAndNext && (
              <button
                type="button"
                onClick={handleSaveAndNext}
                disabled={!signature}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                Simpan & Lanjut
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!signature}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Simpan Tanda Tangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
