import React, { useState } from 'react';
import { X, UserPlus, Trash2, Search, Users, Home, Phone, Shield } from 'lucide-react';
import { Citizen } from '../types/meeting';

interface CitizenManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: Citizen[];
  onAddCitizen: (citizen: Omit<Citizen, 'id'>) => void;
  onDeleteCitizen: (id: string) => void;
  onResetCitizens: () => void;
}

export const CitizenManagementModal: React.FC<CitizenManagementModalProps> = ({
  isOpen,
  onClose,
  citizens,
  onAddCitizen,
  onDeleteCitizen,
  onResetCitizens,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New citizen form fields
  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Citizen['role']>('Kepala Keluarga');
  const [gender, setGender] = useState<'L' | 'P'>('L');

  if (!isOpen) return null;

  const filtered = citizens.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !houseNumber.trim()) return;

    onAddCitizen({
      name: name.trim(),
      houseNumber: houseNumber.trim(),
      phone: phone.trim() || '-',
      role,
      gender,
    });

    setName('');
    setHouseNumber('');
    setPhone('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database Warga RT</h3>
              <p className="text-xs text-slate-500">
                Total {citizens.length} Warga/KK terdaftar untuk presensi cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari warga berdasarkan nama atau blok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isAdding ? 'Tutup Form' : 'Tambah Warga'}
            </button>
          </div>
        </div>

        {/* Add Citizen Form Collapse */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              Tambah Warga Baru
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Warga *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sukirman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Rumah / Blok *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Blok B3 No. 12"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="0812-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Peran / Kategori</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Citizen['role'])}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Warga">Warga</option>
                    <option value="Pengurus RT">Pengurus RT</option>
                    <option value="Ibu PKK">Ibu PKK</option>
                    <option value="Karang Taruna">Karang Taruna</option>
                    <option value="Tamu">Tamu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Simpan Warga
              </button>
            </div>
          </form>
        )}

        {/* Citizens List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Tidak ada data warga yang cocok dengan pencarian "{searchTerm}"
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {c.name}
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {c.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3 text-slate-400" />
                        {c.houseNumber}
                      </span>
                      {c.phone && c.phone !== '-' && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteCitizen(c.id)}
                  title="Hapus warga"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (confirm('Kembalikan database warga ke data default contoh?')) {
                onResetCitizens();
              }
            }}
            className="text-[11px] text-slate-400 hover:text-slate-700 underline"
          >
            Reset Contoh Data Warga
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
