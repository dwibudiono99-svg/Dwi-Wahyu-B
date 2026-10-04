import React from 'react';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { Meeting, RTProfile } from '../types/meeting';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatters';

interface OfficialPrintDocumentProps {
  meeting: Meeting;
  profile: RTProfile;
  onBack: () => void;
}

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  meeting,
  profile,
  onBack,
}) => {
  const hadirCount = meeting.attendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Hadir Online'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white">
      {/* Top Bar for screen controls (hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Aplikasi
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Tips: Pilih "Save as PDF" di dialog cetak browser
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen / Simpan PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-none border border-slate-200 print:border-none print:shadow-none print:p-0 print-page text-slate-900 leading-normal">
        
        {/* KOP SURAT RT */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-700">
            PEMERINTAH {profile.kota.toUpperCase()} • KECAMATAN {profile.kecamatan.toUpperCase()}
          </h3>
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
            KELURAHAN {profile.kelurahan.toUpperCase()} • RUKUN WARGA {profile.rwNumber}
          </h2>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-950 mt-1">
            RUKUN TETANGGA {profile.rtNumber}
          </h1>
          {profile.dusun && (
            <p className="text-xs font-medium text-slate-600">{profile.dusun}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Sekretariat: {profile.kelurahan}, Kec. {profile.kecamatan}, {profile.kota} {profile.kodePos} • Kontak: {profile.kontakRt}
          </p>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center my-6">
          <h2 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-950">
            BERITA ACARA & NOTULEN MUSYAWARAH WARGA
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Nomor: BA/{profile.rtNumber}/RW{profile.rwNumber}/{meeting.date.split('-')[0]}/{meeting.id.slice(-4).toUpperCase()}
          </p>
        </div>

        {/* PENGANTAR */}
        <div className="text-sm mb-6 text-justify">
          Pada hari ini, <strong className="font-bold">{formatDateIndonesian(meeting.date)}</strong>, bertempat di <strong>{meeting.location}</strong>, telah diselenggarakan kegiatan Musyawarah Rapat Warga RT {profile.rtNumber} / RW {profile.rwNumber} dengan rincian sebagai berikut:
        </div>

        {/* DETAIL PERTEMUAN */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <span className="text-slate-500 text-xs block">Topik / Nama Rapat:</span>
              <span className="font-bold text-slate-900">{meeting.title}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Kategori Rapat:</span>
              <span className="font-semibold text-slate-800">{meeting.category}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Waktu Pelaksanaan:</span>
              <span className="font-medium text-slate-900">{meeting.startTime} s/d {meeting.endTime || 'Selesai'} WIB</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Kehadiran Warga:</span>
              <span className="font-bold text-emerald-800">
                {hadirCount} Orang Hadir ({Math.round((hadirCount / (meeting.targetAttendeesCount || 1)) * 100)}% dari target {meeting.targetAttendeesCount} KK)
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Pimpinan Musyawarah:</span>
              <span className="font-medium text-slate-900">{meeting.leader}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Notulis:</span>
              <span className="font-medium text-slate-900">{meeting.notary}</span>
            </div>
          </div>
        </div>

        {/* AGENDA */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            I. AGENDA & SUSUNAN ACARA
          </h3>
          <ol className="list-decimal list-inside text-sm space-y-1 text-slate-800 pl-2">
            {meeting.agenda.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        </div>

        {/* JALANNYA RAPAT / NOTULEN */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            II. RINGKASAN JALANNYA MUSYAWARAH
          </h3>
          <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap pl-2 bg-slate-50/50 p-3 rounded border border-slate-100">
            {meeting.minutes || 'Tidak ada catatan khusus jalannya musyawarah.'}
          </div>
        </div>

        {/* HASIL KEPUTUSAN BERSAMA */}
        <div className="mb-6 page-break-inside-avoid">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            III. KEPUTUSAN & KESEPAKATAN BERSAMA (MUFAKAT)
          </h3>
          {meeting.decisions && meeting.decisions.length > 0 ? (
            <ul className="list-disc list-inside text-sm space-y-1.5 text-slate-900 pl-2 font-medium">
              {meeting.decisions.map((dec, idx) => (
                <li key={idx} className="leading-relaxed">
                  {dec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-slate-500 pl-2">Belum ada poin keputusan yang ditetapkan.</p>
          )}
        </div>

        {/* TINDAK LANJUT / ACTION ITEMS */}
        {meeting.actionItems && meeting.actionItems.length > 0 && (
          <div className="mb-6 page-break-inside-avoid">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              IV. RENCANA TINDAK LANJUT & PENANGGUNG JAWAB
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-300 mt-2">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-3 py-2 text-center w-10">No</th>
                  <th className="border border-slate-300 px-3 py-2">Uraian Tugas / Kegiatan</th>
                  <th className="border border-slate-300 px-3 py-2 w-48">Penanggung Jawab (PIC)</th>
                  <th className="border border-slate-300 px-3 py-2 w-28 text-center">Batas Waktu</th>
                  <th className="border border-slate-300 px-3 py-2 w-20 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {meeting.actionItems.map((act, idx) => (
                  <tr key={act.id}>
                    <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 px-3 py-2 font-medium">{act.task}</td>
                    <td className="border border-slate-300 px-3 py-2">{act.pic}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center">{act.deadline}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center font-semibold">
                      {act.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CATATAN ANGGARAN JIKA ADA */}
        {meeting.budgetNotes && (
          <div className="mb-6 page-break-inside-avoid">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              V. CATATAN ANGGARAN & KEUANGAN
            </h3>
            <div className="text-sm text-slate-800 pl-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              {meeting.budgetNotes}
            </div>
          </div>
        )}

        {/* HALAMAN 2: DAFTAR HADIR PESERTA RAPAT */}
        <div className="page-break-before pt-6">
          <div className="text-center mb-4">
            <h3 className="text-base font-bold uppercase underline decoration-1 underline-offset-4 tracking-wide text-slate-900">
              LAMPIRAN: DAFTAR HADIR PESERTA MUSYAWARAH
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Rapat: {meeting.title} • Tanggal: {formatDateIndonesian(meeting.date)}
            </p>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-400 mt-3">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase">
                <th className="border border-slate-400 px-2 py-2 text-center w-8">No</th>
                <th className="border border-slate-400 px-3 py-2">Nama Warga</th>
                <th className="border border-slate-400 px-3 py-2 w-32">No Rumah / Blok</th>
                <th className="border border-slate-400 px-2 py-2 w-28 text-center">Status</th>
                <th className="border border-slate-400 px-2 py-2 w-24 text-center">Waktu Presensi</th>
                <th className="border border-slate-400 px-3 py-2 w-36 text-center">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              {meeting.attendances.map((att, idx) => (
                <tr key={att.id} className="page-break-inside-avoid">
                  <td className="border border-slate-400 px-2 py-2 text-center font-medium">{idx + 1}</td>
                  <td className="border border-slate-400 px-3 py-2 font-semibold text-slate-900">
                    {att.name}
                    {att.notes && <span className="block text-[10px] font-normal text-slate-500">Ket: {att.notes}</span>}
                  </td>
                  <td className="border border-slate-400 px-3 py-2">{att.houseNumber || '-'}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center font-medium">
                    {att.status}
                  </td>
                  <td className="border border-slate-400 px-2 py-2 text-center text-[10px]">
                    {formatDateTimeIndonesian(att.timestamp).split(' ')[3] || '-'} WIB
                  </td>
                  <td className="border border-slate-400 px-2 py-1 text-center bg-white">
                    {att.signature ? (
                      <img
                        src={att.signature}
                        alt="TTD"
                        className="h-9 max-w-[120px] mx-auto object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Hadir</span>
                    )}
                  </td>
                </tr>
              ))}
              {meeting.attendances.length === 0 && (
                <tr>
                  <td colSpan={6} className="border border-slate-400 p-4 text-center text-slate-500 italic">
                    Belum ada warga yang mengisi presensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOTO DOKUMENTASI JIKA ADA */}
        {meeting.photos && meeting.photos.length > 0 && (
          <div className="page-break-inside-avoid mt-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
              Dokumentasi Foto Rapat:
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {meeting.photos.map((photo, i) => (
                <div key={i} className="border border-slate-200 rounded p-1 bg-slate-50">
                  <img
                    src={photo}
                    alt={`Dokumentasi ${i + 1}`}
                    className="w-full h-44 object-cover rounded"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">
                    Dokumentasi Kegiatan #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TANDA TANGAN PENGESAHAN */}
        <div className="page-break-inside-avoid mt-10 pt-4">
          <p className="text-xs text-right mb-6 text-slate-700">
            Ditetapkan di: {profile.kelurahan}, {formatDateIndonesian(meeting.date)}
          </p>

          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-600 mb-1">Notulis / Sekretaris RT,</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Nama Terang]</span>
              </div>
              <p className="font-bold text-slate-900 underline uppercase">{meeting.notary || profile.sekretaris}</p>
              <p className="text-slate-500 text-[11px]">Sekretaris RT {profile.rtNumber}</p>
            </div>

            <div>
              <p className="text-slate-600 mb-1">Pimpinan Rapat / Ketua RT,</p>
              <div className="h-20 flex items-center justify-center relative">
                {/* Stamp visual simulation */}
                <div className="border-2 border-dashed border-emerald-500/40 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded rotate-[-8deg] uppercase">
                  STEMPEL RT {profile.rtNumber}
                </div>
              </div>
              <p className="font-bold text-slate-900 underline uppercase">{meeting.leader || profile.ketuaRt}</p>
              <p className="text-slate-500 text-[11px]">Ketua RT {profile.rtNumber} / RW {profile.rwNumber}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
