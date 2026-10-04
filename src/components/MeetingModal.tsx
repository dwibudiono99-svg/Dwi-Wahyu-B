import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, User, Users, Tag } from 'lucide-react';
import { Meeting, MeetingCategory, MeetingStatus, RTProfile } from '../types/meeting';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meetingData: Partial<Meeting>) => void;
  initialMeeting?: Meeting | null;
  profile: RTProfile;
}

const CATEGORIES: MeetingCategory[] = [
  'Rutin Bulanan',
  'Musyawarah Warga',
  'Rapat Pengurus',
  'Keamanan & Ronda',
  'Kerja Bakti & Lingkungan',
  'Peringatan Hari Besar / 17-an',
  'Darurat / Khusus',
];

const PRESETS = [
  'Rapat Rutin Bulanan Warga RT',
  'Musyawarah Pembentukan Panitia 17 Agustus',
  'Rapat Koordinasi Keamanan & Jadwal Ronda Malam',
  'Sosialisasi Pengelolaan Sampah & Kerja Bakti Masal',
  'Musyawarah Pemilihan Calon Pengurus RT Periode Baru',
  'Pembahasan Rencana Perbaikan Saluran Air & Gapura',
];

export const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMeeting,
  profile,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MeetingCategory>('Rutin Bulanan');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('19:30');
  const [endTime, setEndTime] = useState('21:30');
  const [location, setLocation] = useState('');
  const [leader, setLeader] = useState('');
  const [notary, setNotary] = useState('');
  const [status, setStatus] = useState<MeetingStatus>('Terjadwal');
  const [targetAttendeesInput, setTargetAttendeesInput] = useState<string>('25');
  const [agendaList, setAgendaList] = useState<string[]>(['Pembukaan dan Sambutan', 'Pembahasan Pokok Masalah', 'Tanya Jawab Warga', 'Kesepakatan & Penutup']);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');

  useEffect(() => {
    if (initialMeeting) {
      setTitle(initialMeeting.title);
      setCategory(initialMeeting.category);
      setDate(initialMeeting.date);
      setStartTime(initialMeeting.startTime);
      setEndTime(initialMeeting.endTime);
      setLocation(initialMeeting.location);
      setLeader(initialMeeting.leader);
      setNotary(initialMeeting.notary);
      setStatus(initialMeeting.status);
      setTargetAttendeesInput(String(initialMeeting.targetAttendeesCount ?? 25));
      setAgendaList(initialMeeting.agenda || []);
      setBudgetNotes(initialMeeting.budgetNotes || '');
    } else {
      // Default new meeting values
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      setTitle('');
      setCategory('Rutin Bulanan');
      setDate(dateStr);
      setStartTime('19:45');
      setEndTime('22:00');
      setLocation(`Balai Warga RT ${profile.rtNumber}`);
      setLeader(`${profile.ketuaRt} (Ketua RT)`);
      setNotary(`${profile.sekretaris} (Sekretaris)`);
      setStatus('Terjadwal');
      setTargetAttendeesInput('25');
      setAgendaList([
        'Pembukaan & Sambutan Ketua RT',
        'Laporan Kas & Evaluasi Kegiatan Bulan Lalu',
        'Pembahasan Agenda Utama',
        'Sesi Aspirasi / Tanya Jawab Warga',
        'Penetapan Kesepakatan Bersama & Doa Penutup',
      ]);
      setBudgetNotes('');
    }
  }, [initialMeeting, isOpen, profile]);

  if (!isOpen) return null;

  const handleAddAgenda = () => {
    if (!newAgendaItem.trim()) return;
    setAgendaList([...agendaList, newAgendaItem.trim()]);
    setNewAgendaItem('');
  };

  const handleRemoveAgenda = (idx: number) => {
    setAgendaList(agendaList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave({
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      location: location.trim(),
      leader: leader.trim(),
      notary: notary.trim(),
      status,
      targetAttendeesCount: (() => {
        const p = parseInt(targetAttendeesInput, 10);
        return !isNaN(p) && p > 0 ? p : 25;
      })(),
      agenda: agendaList,
      budgetNotes: budgetNotes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialMeeting ? 'Ubah Rincian Rapat RT' : 'Jadwalkan Kegiatan Rapat RT Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Isi data agenda dan waktu kegiatan musyawarah warga RT {profile.rtNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick presets for title if creating */}
          {!initialMeeting && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Contoh Topik Rapat Populer:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTitle(p)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama / Topik Rapat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Musyawarah Warga Pembahasan Iuran Keamanan & Ronda"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori Rapat
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MeetingCategory)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Rapat</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MeetingStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Terjadwal">Terjadwal (Akan Datang)</option>
                <option value="Berlangsung">Sedang Berlangsung (Buka Presensi)</option>
                <option value="Selesai">Selesai (Notulen Final)</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Waktu Mulai (WIB)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Waktu Selesai (WIB)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location & Target Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Tempat / Lokasi Musyawarah
              </label>
              <input
                type="text"
                placeholder="Contoh: Balai Warga RT 04 / Rumah Ketua RT"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Kuota Peserta / Target KK <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Ketik Manual
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Ketik kuota..."
                  value={targetAttendeesInput}
                  onChange={(e) => setTargetAttendeesInput(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  KK
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[15, 20, 25, 30, 35, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetAttendeesInput(String(num))}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      targetAttendeesInput === String(num)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num} KK
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leader & Notary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Pimpinan Musyawarah
              </label>
              <input
                type="text"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Notulis Rapat
              </label>
              <input
                type="text"
                value={notary}
                onChange={(e) => setNotary(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Agenda items dynamic editor */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Susunan Acara / Agenda Rapat:
            </label>
            <div className="space-y-1.5 mb-2">
              {agendaList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <span className="font-bold text-slate-400 text-[11px] w-5">{idx + 1}.</span>
                  <span className="flex-1 text-slate-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambahkan mata acara baru..."
                value={newAgendaItem}
                onChange={(e) => setNewAgendaItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgenda();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddAgenda}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>
          </div>

          {/* Budget notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Anggaran / Alokasi Kas (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Estimasi anggaran konsumsi Rp 250.000 dari kas RT"
              value={budgetNotes}
              onChange={(e) => setBudgetNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              {initialMeeting ? 'Simpan Perubahan' : 'Buat Agenda Rapat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
