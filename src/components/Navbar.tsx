import React from 'react';
import { Building, Users, Settings, Plus, QrCode, RotateCcw, ExternalLink } from 'lucide-react';
import { RTProfile, Meeting } from '../types/meeting';

interface NavbarProps {
  profile: RTProfile;
  activeMeeting?: Meeting | null;
  onOpenCitizenModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenCreateMeeting: () => void;
  onOpenPublicPresensi: () => void;
  onResetData: () => void;
  onHomeClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeMeeting,
  onOpenCitizenModal,
  onOpenSettingsModal,
  onOpenCreateMeeting,
  onOpenPublicPresensi,
  onResetData,
  onHomeClick,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* RT Identity Branding */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs group-hover:bg-emerald-700 transition-colors">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                Sistem Notulen & Presensi RT {profile.rtNumber}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                RW {profile.rwNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Kel. {profile.kelurahan}, {profile.kota}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Public attendance view switcher */}
          <button
            onClick={onOpenPublicPresensi}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
            title="Buka tampilan layar presensi untuk warga"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Layar Presensi Warga</span>
            <span className="sm:hidden">Presensi</span>
          </button>

          {/* Citizen database */}
          <button
            onClick={onOpenCitizenModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title="Kelola Data Warga RT"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Data Warga</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Pengaturan Identitas RT"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Muat ulang data contoh RT semula? Semua data kustom akan direset ke pengaturan awal.')) {
                onResetData();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Contoh Data RT"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
