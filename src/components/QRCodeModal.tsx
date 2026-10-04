import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, Download, Printer, QrCode as QrIcon } from 'lucide-react';
import { Meeting, RTProfile } from '../types/meeting';
import { formatDateIndonesian } from '../utils/formatters';

interface QRCodeModalProps {
  meeting: Meeting;
  profile: RTProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenPublicPresensi: (meetingId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  meeting,
  profile,
  isOpen,
  onClose,
  onOpenPublicPresensi,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate public attendance URL
  const publicUrl = `${window.location.origin}${window.location.pathname}?presensi=${meeting.id}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `QR_Presensi_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">QR Code Presensi Warga</h3>
              <p className="text-xs text-slate-500 font-normal">Scan untuk mengisi daftar hadir rapat secara mandiri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-center">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              RT {profile.rtNumber} / RW {profile.rwNumber} • Kel. {profile.kelurahan}
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{meeting.title}</h4>
            <p className="text-xs text-slate-500">
              {formatDateIndonesian(meeting.date)} • {meeting.startTime} WIB
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm mx-auto my-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Presensi"
                className="w-56 h-56 mx-auto object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
                Memuat QR Code...
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Arahkan kamera HP ke QR Code di atas
            </div>
          </div>

          {/* Link box */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Link Tautan Presensi Online:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh QR
            </button>
            <button
              onClick={handlePrintStandee}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Standee
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenPublicPresensi(meeting.id);
            }}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Form Presensi Warga
          </button>
        </div>
      </div>
    </div>
  );
};
