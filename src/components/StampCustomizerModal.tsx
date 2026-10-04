import React, { useState } from 'react';
import { X, Check, RotateCcw, Upload, Palette, Sliders, Shield } from 'lucide-react';
import { StampConfig } from '../types/meeting';
import { StampBadge } from './StampBadge';

interface StampCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StampConfig;
  onSave: (newConfig: StampConfig) => void;
}

const COLOR_PRESETS = [
  { name: 'Indigo / Ungu Dinas', hex: '#4338ca' },
  { name: 'Violet Resmi', hex: '#6b21a8' },
  { name: 'Biru Tua Klasik', hex: '#1e40af' },
  { name: 'Biru Langit', hex: '#0284c7' },
  { name: 'Merah Marun', hex: '#be123c' },
  { name: 'Hitam Resmi', hex: '#0f172a' },
];

export const StampCustomizerModal: React.FC<StampCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<StampConfig>({ ...config });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData({ ...formData, customStampImage: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = () => {
    setFormData({
      textTop: config.textTop || 'PENGURUS RUKUN TETANGGA',
      textMiddle: config.textMiddle || 'RW 008',
      textBottom: config.textBottom || 'KELURAHAN SUKAMAJU',
      color: '#4338ca',
      rotation: -12,
      size: 105,
      customStampImage: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ubah Stempel Dinas RT</h3>
              <p className="text-xs text-slate-500">Kustomisasi teks melingkar, warna tinta cap, ukuran, dan kemiringan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-5 bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200 flex flex-col items-center justify-center relative min-h-[160px]">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pratinjau Cap Stempel Basah Digital
          </span>
          <div className="p-3 bg-white/80 rounded-xl border border-dashed border-slate-300 shadow-inner flex items-center justify-center min-w-[150px] min-h-[140px]">
            <StampBadge config={formData} />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Teks Melingkar Atas */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Melingkar Atas:
            </label>
            <input
              type="text"
              required
              placeholder="PENGURUS RUKUN TETANGGA 004"
              value={formData.textTop}
              onChange={(e) => setFormData({ ...formData, textTop: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase"
            />
          </div>

          {/* Teks Tengah */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Bagian Tengah:
            </label>
            <input
              type="text"
              required
              placeholder="RW 008"
              value={formData.textMiddle}
              onChange={(e) => setFormData({ ...formData, textMiddle: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase"
            />
          </div>

          {/* Teks Melingkar Bawah */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Melingkar Bawah:
            </label>
            <input
              type="text"
              required
              placeholder="KELURAHAN SUKAMAJU"
              value={formData.textBottom}
              onChange={(e) => setFormData({ ...formData, textBottom: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase"
            />
          </div>

          {/* Pilihan Warna Tinta Cap */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Warna Tinta Stempel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: col.hex })}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    formData.color.toLowerCase() === col.hex.toLowerCase()
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 font-bold text-indigo-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate text-[11px]">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slider Kemiringan Cap & Ukuran */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Kemiringan Cap:</span>
                <span className="text-indigo-600 font-mono">{formData.rotation}°</span>
              </div>
              <input
                type="range"
                min={-25}
                max={25}
                value={formData.rotation}
                onChange={(e) => setFormData({ ...formData, rotation: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Efek cap basah alami</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Ukuran Diameter:</span>
                <span className="text-indigo-600 font-mono">{formData.size}px</span>
              </div>
              <input
                type="range"
                min={80}
                max={140}
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Diameter stempel</span>
            </div>
          </div>

          {/* Opsi Upload Scan Cap Fisik Asli */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Unggah Foto Scan Stempel Karet Asli (Opsional):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900"
            />
            {formData.customStampImage && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customStampImage: undefined })}
                className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold mt-1 block"
              >
                Hapus gambar unggahan & gunakan stempel vektor baku
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Baku
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Simpan Stempel Dinas
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
