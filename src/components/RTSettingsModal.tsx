import React, { useState } from 'react';
import { X, Building, User, Phone, MapPin, Check } from 'lucide-react';
import { RTProfile } from '../types/meeting';

interface RTSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RTProfile;
  onSaveProfile: (profile: RTProfile) => void;
}

export const RTSettingsModal: React.FC<RTSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<RTProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Identitas RT</h3>
              <p className="text-xs text-slate-500">Sesuaikan nomor RT, RW, dan susunan pengurus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* RT & RW Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor RT *</label>
              <input
                type="text"
                required
                placeholder="004"
                value={formData.rtNumber}
                onChange={(e) => setFormData({ ...formData, rtNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor RW *</label>
              <input
                type="text"
                required
                placeholder="008"
                value={formData.rwNumber}
                onChange={(e) => setFormData({ ...formData, rwNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Komplek / Lingkungan / Dusun</label>
            <input
              type="text"
              placeholder="Contoh: Komplek Griya Mandiri"
              value={formData.dusun || ''}
              onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Wilayah Administratif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kelurahan / Desa *</label>
              <input
                type="text"
                required
                value={formData.kelurahan}
                onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kecamatan *</label>
              <input
                type="text"
                required
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten *</label>
              <input
                type="text"
                required
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pengurus RT */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Susunan Pengurus RT:</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ketua RT *</label>
                <input
                  type="text"
                  required
                  value={formData.ketuaRt}
                  onChange={(e) => setFormData({ ...formData, ketuaRt: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sekretaris RT *</label>
                <input
                  type="text"
                  required
                  value={formData.sekretaris}
                  onChange={(e) => setFormData({ ...formData, sekretaris: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bendahara RT</label>
                <input
                  type="text"
                  value={formData.bendahara}
                  onChange={(e) => setFormData({ ...formData, bendahara: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Kontak / Hotline RT</label>
                <input
                  type="tel"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.kontakRt}
                  onChange={(e) => setFormData({ ...formData, kontakRt: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Identitas RT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
