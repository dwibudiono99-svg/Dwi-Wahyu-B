import React, { useState } from 'react';
import { CheckCircle2, UserCheck, MapPin, Calendar, Clock, ArrowLeft, Users, Building, ShieldCheck, Search } from 'lucide-react';
import { Meeting, RTProfile, Citizen, Attendance, AttendanceStatus } from '../types/meeting';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatters';
import { SignaturePad } from './SignaturePad';

interface PublicPresensiFormProps {
  meeting: Meeting;
  profile: RTProfile;
  citizens: Citizen[];
  onAddAttendance: (meetingId: string, attendance: Omit<Attendance, 'id'>) => void;
  onBackToAdmin?: () => void;
  isStandalone?: boolean;
}

export const PublicPresensiForm: React.FC<PublicPresensiFormProps> = ({
  meeting,
  profile,
  citizens,
  onAddAttendance,
  onBackToAdmin,
  isStandalone = false,
}) => {
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [notes, setNotes] = useState<string>('');
  const [representedBy, setRepresentedBy] = useState<string>('');
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCitizenDropdown, setShowCitizenDropdown] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastSubmittedName, setLastSubmittedName] = useState<string>('');
  const [showAttendeesList, setShowAttendeesList] = useState<boolean>(false);

  // Filter citizens for fast selection
  const filteredCitizens = citizens.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCitizen = (citizen: Citizen) => {
    setSelectedCitizenId(citizen.id);
    setName(citizen.name);
    setHouseNumber(citizen.houseNumber);
    setPhone(citizen.phone);
    setSearchTerm('');
    setShowCitizenDropdown(false);
    setErrorMsg(null);
  };

  const isSigRequired = meeting.requireDigitalSignature !== false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Mohon lengkapi nama Anda.');
      return;
    }

    // Check if require signature for 'Hadir' or 'Hadir Online'
    if (isSigRequired && (status === 'Hadir' || status === 'Hadir Online') && !signature) {
      setErrorMsg('Mohon bubuhkan tanda tangan kehadiran digital Anda pada kotak tanda tangan di bawah.');
      return;
    }

    setErrorMsg(null);
    onAddAttendance(meeting.id, {
      meetingId: meeting.id,
      citizenId: selectedCitizenId || undefined,
      name: name.trim(),
      houseNumber: houseNumber.trim(),
      phone: phone.trim(),
      status,
      notes: notes.trim() || undefined,
      signature: signature || undefined,
      timestamp: new Date().toISOString(),
      representedBy: representedBy.trim() || undefined,
    });

    setLastSubmittedName(name);
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setName('');
    setHouseNumber('');
    setPhone('');
    setSelectedCitizenId('');
    setStatus('Hadir');
    setNotes('');
    setRepresentedBy('');
    setSignature(undefined);
    setSubmitted(false);
  };

  const hadirTotal = meeting.attendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Hadir Online'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-800 via-emerald-900 to-slate-950 text-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Top Switch / Admin Return Button */}
        {onBackToAdmin && (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Menu Pengurus
            </button>
            <span className="text-[11px] text-emerald-300/80">Mode Presensi Warga</span>
          </div>
        )}

        {/* RT Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md text-emerald-300 mb-2.5">
            <Building className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            RUKUN TETANGGA {profile.rtNumber} / RW {profile.rwNumber}
          </h2>
          <p className="text-[11px] text-emerald-200/80">
            Kelurahan {profile.kelurahan}, {profile.kota}
          </p>
        </div>

        {/* Meeting Information Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-6 text-white shadow-xl">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold mb-2 border border-emerald-400/30">
            {meeting.category}
          </div>
          <h1 className="text-lg sm:text-xl font-bold leading-snug mb-3">
            {meeting.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100/90 pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{formatDateIndonesian(meeting.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{meeting.startTime} WIB s/d Selesai</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-emerald-200/80 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Tercatat Hadir: <strong className="text-white font-bold">{hadirTotal} Warga</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowAttendeesList(!showAttendeesList)}
              className="text-emerald-300 hover:text-white underline text-xs font-semibold cursor-pointer"
            >
              {showAttendeesList ? 'Tutup Daftar Hadir' : 'Lihat Siapa Saja yang Hadir'}
            </button>
          </div>
        </div>

        {/* Real-time Attendees List Accordion */}
        {showAttendeesList && (
          <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-4 mb-6 text-slate-100 shadow-xl max-h-72 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Daftar Warga yang Sudah Presensi ({meeting.attendances.length})
            </h3>
            {meeting.attendances.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Belum ada warga yang mengisi presensi. Jadilah yang pertama!
              </p>
            ) : (
              <div className="space-y-2">
                {meeting.attendances.map((att, idx) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {idx + 1}. {att.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {att.houseNumber || 'Warga RT'} {att.representedBy ? `• Mewakili: ${att.representedBy}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'Hadir'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : att.status === 'Hadir Online'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBMISSION SUCCESS STATE */}
        {submitted ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Presensi Berhasil Dicatat!</h2>
            <p className="text-sm text-slate-600 mb-6">
              Terima kasih <strong className="text-slate-900">{lastSubmittedName}</strong>, kehadiran Anda telah terverifikasi dalam sistem Musyawarah RT {profile.rtNumber}.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Kegiatan:</span>
                <span className="font-semibold text-slate-800 text-right">{meeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Tercatat:</span>
                <span className="font-semibold text-slate-800">{formatDateTimeIndonesian(new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Kehadiran:</span>
                <span className="font-bold text-emerald-700">{status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
              >
                Isi Presensi untuk Warga Lain
              </button>
              {onBackToAdmin && (
                <button
                  type="button"
                  onClick={onBackToAdmin}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
                >
                  Kembali ke Panel Pengurus RT
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ATTENDANCE FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Formulir Kehadiran Warga</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quick citizen picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cari Warga RT (Atau Pilih Cepat):
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Ketik nama atau nomor rumah warga..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowCitizenDropdown(true);
                      }}
                      onFocus={() => setShowCitizenDropdown(true)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {showCitizenDropdown && (
                    <div className="absolute z-20 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 text-xs">
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                        Pilih nama Anda di bawah ini:
                      </div>
                      {filteredCitizens.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          Nama tidak ditemukan di database RT. Anda dapat mengetik manual pada kolom di bawah.
                        </div>
                      ) : (
                        filteredCitizens.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectCitizen(c)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between transition-colors"
                          >
                            <span className="font-semibold text-slate-800">{c.name}</span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {c.houseNumber}
                            </span>
                          </button>
                        ))
                      )}
                      <div className="p-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowCitizenDropdown(false)}
                          className="w-full py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 text-center"
                        >
                          Tutup Pilihan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Warga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Sutrisno"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (selectedCitizenId) setSelectedCitizenId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
              </div>

              {/* House Number / Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rumah / Blok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Blok A1 No. 04"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp / HP (Opsional)
                  </label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Representative / Mewakili */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mewakili (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan jika hadir sendiri (atau tulis: Istri, Anak, Kakak)"
                  value={representedBy}
                  onChange={(e) => setRepresentedBy(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Radio Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Kehadiran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Hadir', 'Hadir Online', 'Izin', 'Sakit'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                        status === st
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes if Izin/Sakit or comments */}
              {(status === 'Izin' || status === 'Sakit') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alasan / Keterangan {status}:
                  </label>
                  <textarea
                    rows={2}
                    placeholder={`Tuliskan alasan ${status.toLowerCase()} (misal: dinas luar kota, kurang enak badan)...`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Signature Canvas Pad */}
              {(status === 'Hadir' || status === 'Hadir Online') && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Tanda Tangan Digital Warga</span>
                      {isSigRequired && (
                        <span className="text-rose-500 font-bold">* (Wajib Sah)</span>
                      )}
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Goreskan di layar sentuh / mouse
                    </span>
                  </div>
                  <SignaturePad
                    value={signature}
                    onChange={(dataUrl) => {
                      setSignature(dataUrl);
                      if (dataUrl) setErrorMsg(null);
                    }}
                    height={135}
                  />
                </div>
              )}

              {/* Submit button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Kirim & Konfirmasi Kehadiran
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Data kehadiran Anda tersimpan otomatis dalam Berita Acara Rapat RT.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
