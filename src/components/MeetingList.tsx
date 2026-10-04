import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Share2,
  Trash2,
  Plus,
  ArrowRight,
  Search,
  Filter,
  UserCheck
} from 'lucide-react';
import { Meeting, RTProfile } from '../types/meeting';
import { formatDateIndonesian } from '../utils/formatters';

interface MeetingListProps {
  meetings: Meeting[];
  profile: RTProfile;
  onSelectMeeting: (meeting: Meeting) => void;
  onCreateMeeting: () => void;
  onDeleteMeeting: (id: string) => void;
  onOpenQR: (meeting: Meeting) => void;
  onOpenWhatsApp: (meeting: Meeting) => void;
  onOpenPublicPresensi: (meetingId: string) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  profile,
  onSelectMeeting,
  onCreateMeeting,
  onDeleteMeeting,
  onOpenQR,
  onOpenWhatsApp,
  onOpenPublicPresensi,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = meetings.filter((m) => {
    const matchStatus = filterStatus === 'Semua' || m.status === filterStatus;
    const matchSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari agenda rapat RT, kategori, atau tempat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['Semua', 'Berlangsung', 'Terjadwal', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-2 rounded-xl font-bold transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={onCreateMeeting}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4" />
            Jadwalkan Rapat Baru
          </button>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada jadwal rapat ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada agenda musyawarah yang cocok dengan filter atau pencarian Anda. Silakan jadwalkan rapat baru untuk RT {profile.rtNumber}.
            </p>
            <button
              onClick={onCreateMeeting}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Buat Rapat Sekarang
            </button>
          </div>
        ) : (
          filtered.map((m) => {
            const hadir = m.attendances.filter(
              (a) => a.status === 'Hadir' || a.status === 'Hadir Online'
            ).length;
            const quorum = Math.min(
              100,
              Math.round((hadir / (m.targetAttendeesCount || 1)) * 100)
            );

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {m.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        m.status === 'Berlangsung'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                          : m.status === 'Selesai'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectMeeting(m)}
                    className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2"
                  >
                    {m.title}
                  </h3>

                  {/* Meeting Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{formatDateIndonesian(m.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{m.startTime} - {m.endTime || 'Selesai'} WIB</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{m.location}</span>
                    </div>
                  </div>

                  {/* Quorum / Attendance Bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-600 flex items-center gap-1 font-semibold">
                        <Users className="w-3 h-3 text-slate-500" />
                        Daftar Hadir Online:
                      </span>
                      <span className="font-bold text-slate-900">
                        {hadir} / {m.targetAttendeesCount} KK ({quorum}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${quorum >= 60 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                        style={{ width: `${quorum}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenQR(m)}
                      title="Tampilkan QR Code Presensi"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenWhatsApp(m)}
                      title="Bagikan ke WhatsApp Warga"
                      className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenPublicPresensi(m.id)}
                      title="Buka Form Presensi Warga"
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus rapat "${m.title}"?`)) {
                          onDeleteMeeting(m.id);
                        }
                      }}
                      title="Hapus Rapat"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectMeeting(m)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-emerald-700 py-1 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                  >
                    Buka Notulen
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
