import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Settings,
  Eye,
  Sliders,
  Check,
  FileText,
  Users,
  Image,
  Award,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  PenTool,
  Shield,
  Edit,
  Download,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { Meeting, RTProfile, StampConfig, Attendance } from '../types/meeting';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatters';
import { generateDefaultDocNumber, getFormalDatePhraze, getDayNameIndonesian } from '../utils/persuratan';
import { StampBadge } from './StampBadge';
import { StampCustomizerModal } from './StampCustomizerModal';
import { SignatureCaptureModal } from './SignatureCaptureModal';

interface OfficialPrintDocumentProps {
  meeting: Meeting;
  profile: RTProfile;
  onBack: () => void;
  onUpdateMeeting?: (updated: Meeting) => void;
  onUpdateProfile?: (updated: RTProfile) => void;
}

export type DocumentType =
  | 'lengkap'
  | 'berita_acara'
  | 'daftar_hadir'
  | 'presensi_kosong'
  | 'mading_warga';

export type PaperSize = 'a4' | 'f4' | 'letter';
export type MarginPreset = 'dinas' | 'arsip_lebar' | 'normal' | 'kompak';
export type TypographyFont = 'bookman' | 'times' | 'arial' | 'jakarta';
export type FontSize = '10pt' | '11pt' | '12pt';
export type KopLogoType = 'garuda' | 'rt' | 'custom' | 'none';
export type LogoPosition = 'kiri' | 'ganda' | 'tengah';
export type SignatureColumnStyle = 'digital' | 'zikzak' | 'kosong';

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  meeting,
  profile,
  onBack,
  onUpdateMeeting,
  onUpdateProfile,
}) => {
  // SETELAN PERSURATAN (PRINT SETTINGS)
  const [docType, setDocType] = useState<DocumentType>('lengkap');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [marginPreset, setMarginPreset] = useState<MarginPreset>('dinas');
  const [fontFamily, setFontFamily] = useState<TypographyFont>('bookman');
  const [fontSize, setFontSize] = useState<FontSize>('11pt');
  const [lineSpacing, setLineSpacing] = useState<'1.15' | '1.3' | '1.5'>('1.15');

  // Kop, Logo & Nomor Surat
  const [showKop, setShowKop] = useState<boolean>(true);
  const [kopLogo, setKopLogo] = useState<KopLogoType>(() => (profile.logoType as KopLogoType) || (profile.logoUrl ? 'custom' : 'garuda'));
  const [logoHeight, setLogoHeight] = useState<number>(() => meeting.logoHeight || profile.logoHeight || 80); // in pixels, e.g. 80px ≈ 2.1cm
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('kiri');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => profile.logoUrl || '');
  const [docNumber, setDocNumber] = useState<string>(() =>
    generateDefaultDocNumber(meeting, profile)
  );
  const [printToastMsg, setPrintToastMsg] = useState<string | null>(null);

  // Stempel Dinas State
  const [stampConfig, setStampConfig] = useState<StampConfig>(() => {
    return meeting.stampConfig || profile.stampConfig || {
      textTop: `PENGURUS RUKUN TETANGGA ${profile.rtNumber}`,
      textMiddle: `RW ${profile.rwNumber}`,
      textBottom: `KELURAHAN ${profile.kelurahan.toUpperCase()}`,
      color: '#4338ca',
      rotation: -12,
      size: 105,
    };
  });
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  // Tanda Tangan Pengurus & Legalisasi State
  const [leaderSignature, setLeaderSignature] = useState<string | undefined>(
    meeting.leaderSignature || profile.ketuaRtSignature
  );
  const [notarySignature, setNotarySignature] = useState<string | undefined>(
    meeting.notarySignature || profile.sekretarisSignature
  );
  const [rwSignature, setRwSignature] = useState<string | undefined>(meeting.rwSignature);

  // Modal Rekam Tanda Tangan (bisa untuk Pengurus atau Warga)
  const [sigCaptureState, setSigCaptureState] = useState<{
    isOpen: boolean;
    title: string;
    targetName: string;
    targetRole?: string;
    type: 'leader' | 'notary' | 'rw' | 'attendee';
    attendeeId?: string;
    initialSig?: string;
  }>({
    isOpen: false,
    title: '',
    targetName: '',
    type: 'attendee',
  });

  const handleSaveStamp = (newConfig: StampConfig) => {
    setStampConfig(newConfig);
    if (onUpdateMeeting) {
      onUpdateMeeting({
        ...meeting,
        stampConfig: newConfig,
      });
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        stampConfig: newConfig,
      });
    }
  };

  const handleSaveCapturedSignature = (dataUrl: string) => {
    const { type, attendeeId } = sigCaptureState;

    if (type === 'leader') {
      setLeaderSignature(dataUrl);
      if (onUpdateMeeting) onUpdateMeeting({ ...meeting, leaderSignature: dataUrl });
      if (onUpdateProfile) onUpdateProfile({ ...profile, ketuaRtSignature: dataUrl });
    } else if (type === 'notary') {
      setNotarySignature(dataUrl);
      if (onUpdateMeeting) onUpdateMeeting({ ...meeting, notarySignature: dataUrl });
      if (onUpdateProfile) onUpdateProfile({ ...profile, sekretarisSignature: dataUrl });
    } else if (type === 'rw') {
      setRwSignature(dataUrl);
      if (onUpdateMeeting) onUpdateMeeting({ ...meeting, rwSignature: dataUrl });
    } else if (type === 'attendee' && attendeeId) {
      const updatedAttendances = meeting.attendances.map((a) =>
        a.id === attendeeId ? { ...a, signature: dataUrl } : a
      );
      if (onUpdateMeeting) {
        onUpdateMeeting({
          ...meeting,
          attendances: updatedAttendances,
        });
      }
    }

    setSigCaptureState((prev) => ({ ...prev, isOpen: false }));
  };

  // Handler for Save & Next during attendee signature collection
  const handleSaveAndNextAttendee = (dataUrl: string) => {
    const { attendeeId } = sigCaptureState;
    if (!attendeeId) return;

    const updatedAttendances = meeting.attendances.map((a) =>
      a.id === attendeeId ? { ...a, signature: dataUrl } : a
    );

    if (onUpdateMeeting) {
      onUpdateMeeting({
        ...meeting,
        attendances: updatedAttendances,
      });
    }

    // Find next attendee without signature
    const nextUnsigned = updatedAttendances.find((a) => !a.signature && a.id !== attendeeId);
    if (nextUnsigned) {
      setSigCaptureState({
        isOpen: true,
        title: 'Rekam Tanda Tangan Kehadiran Warga',
        targetName: nextUnsigned.name,
        targetRole: nextUnsigned.houseNumber,
        type: 'attendee',
        attendeeId: nextUnsigned.id,
        initialSig: undefined,
      });
    } else {
      setSigCaptureState((prev) => ({ ...prev, isOpen: false }));
      setPrintToastMsg('Semua anggota rapat telah berhasil merekam tanda tangan kehadiran!');
    }
  };

  const handleOpenAttendeeSignature = (att: Attendance) => {
    setSigCaptureState({
      isOpen: true,
      title: 'Rekam Tanda Tangan Kehadiran Warga',
      targetName: att.name,
      targetRole: att.houseNumber || 'Warga RT',
      type: 'attendee',
      attendeeId: att.id,
      initialSig: att.signature,
    });
  };

  const handleStartSequentialSigning = () => {
    const firstUnsigned = meeting.attendances.find((a) => !a.signature) || meeting.attendances[0];
    if (!firstUnsigned) {
      setPrintToastMsg('Belum ada data warga dalam daftar hadir.');
      return;
    }
    setSigCaptureState({
      isOpen: true,
      title: 'Mode Gilir Tanda Tangan Warga',
      targetName: firstUnsigned.name,
      targetRole: firstUnsigned.houseNumber || 'Warga RT',
      type: 'attendee',
      attendeeId: firstUnsigned.id,
      initialSig: firstUnsigned.signature,
    });
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
          setKopLogo('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderLogoElement = (size: number) => {
    if (kopLogo === 'garuda') {
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: `${size}px`, height: `${size}px` }}
          className="text-slate-900 shrink-0"
          fill="currentColor"
        >
          <path d="M50 8 C46 16, 32 16, 26 22 C20 28, 16 38, 10 46 C20 48, 30 45, 38 42 C32 48, 22 56, 14 66 C24 66, 34 62, 42 56 C38 64, 30 74, 24 82 C34 80, 44 74, 50 66 C56 74, 66 80, 76 82 C70 74, 62 64, 58 56 C66 62, 76 66, 86 66 C78 56, 68 48, 62 42 C70 45, 80 48, 90 46 C84 38, 80 28, 74 22 C68 16, 54 16, 50 8 Z" />
          <circle cx="50" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <rect x="44" y="34" width="12" height="12" fill="currentColor" />
        </svg>
      );
    }

    if (kopLogo === 'rt') {
      return (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="shrink-0 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center font-bold text-center leading-none"
        >
          <span style={{ fontSize: `${Math.max(7, size * 0.12)}px` }} className="uppercase font-black">RT</span>
          <span style={{ fontSize: `${Math.max(11, size * 0.22)}px` }} className="font-black text-slate-900">{profile.rtNumber}</span>
          <span style={{ fontSize: `${Math.max(6, size * 0.1)}px` }} className="uppercase">RW {profile.rwNumber}</span>
        </div>
      );
    }

    if (kopLogo === 'custom' && customLogoUrl) {
      return (
        <img
          src={customLogoUrl}
          alt="Logo Kop Kustom"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
          className="shrink-0"
        />
      );
    }

    return null;
  };

  // Tanda Tangan & Pengesahan
  const [sigStyle, setSigStyle] = useState<SignatureColumnStyle>('digital');
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [showMengetahuiRW, setShowMengetahuiRW] = useState<boolean>(false);
  const [rwLeaderName, setRwLeaderName] = useState<string>(`Ketua RW ${profile.rwNumber}`);

  // Lampiran & Bagian
  const [showMinutesDetail, setShowMinutesDetail] = useState<boolean>(true);
  const [showDecisions, setShowDecisions] = useState<boolean>(true);
  const [showActionItems, setShowActionItems] = useState<boolean>(true);
  const [showBudget, setShowBudget] = useState<boolean>(!!meeting.budgetNotes);
  const [showPhotos, setShowPhotos] = useState<boolean>(meeting.photos.length > 0);

  // UI State
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [customQuotaCount, setCustomQuotaCount] = useState<number>(meeting.targetAttendeesCount || 25);
  const [isEditingInlineQuota, setIsEditingInlineQuota] = useState<boolean>(false);
  const [inlineQuotaInput, setInlineQuotaInput] = useState<string>(String(meeting.targetAttendeesCount || 25));

  const handleSaveQuotaCount = (count: number) => {
    const validCount = Math.max(1, count);
    setCustomQuotaCount(validCount);
    setInlineQuotaInput(String(validCount));
    if (onUpdateMeeting) {
      onUpdateMeeting({
        ...meeting,
        targetAttendeesCount: validCount,
      });
    }
    setPrintToastMsg(`Target kuota peserta rapat berhasil diubah menjadi ${validCount} KK.`);
  };

  // Update dynamic CSS for print margins and paper size
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-print-paper-styles';

    let pageDimensions = '210mm 297mm'; // A4
    if (paperSize === 'f4') pageDimensions = '215mm 330mm';
    if (paperSize === 'letter') pageDimensions = '8.5in 11in';

    let marginCss = '25mm 20mm 25mm 30mm'; // Dinas Baku (Atas 2.5cm, Kanan 2.0cm, Bawah 2.5cm, Kiri 3.0cm)
    if (marginPreset === 'arsip_lebar') marginCss = '30mm 20mm 25mm 35mm'; // Berkas Arsip Jilid (Kiri 3.5cm)
    if (marginPreset === 'normal') marginCss = '25mm 25mm 25mm 25mm';
    if (marginPreset === 'kompak') marginCss = '15mm 15mm 15mm 15mm';

    styleEl.innerHTML = `
      @page {
        size: ${pageDimensions};
        margin: ${marginCss};
      }
      @media print {
        html, body {
          background: #ffffff !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
        .print-page {
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .page-break-before {
          page-break-before: always !important;
          break-before: page !important;
        }
        .page-break-inside-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        table {
          border-collapse: collapse !important;
        }
        thead {
          display: table-header-group !important;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `;

    document.head.appendChild(styleEl);
    return () => {
      const existing = document.getElementById('dynamic-print-paper-styles');
      if (existing) existing.remove();
    };
  }, [paperSize, marginPreset]);

  const hadirCount = meeting.attendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Hadir Online'
  ).length;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdfToLocalDisk = async () => {
    const element = document.getElementById('printable-official-document-area');
    if (!element) {
      setPrintToastMsg('Elemen dokumen pelaporan tidak ditemukan.');
      return;
    }

    setIsGeneratingPdf(true);
    setPrintToastMsg('Sedang menyusun berkas PDF resmi utuh dengan margin kedinasan...');

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;
      const cleanTitle = meeting.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const filename = `Berita_Acara_Resmi_RT${profile.rtNumber}_${meeting.date}_${cleanTitle}.pdf`;

      // Format margin kedinasan baku: [Top, Left, Bottom, Right]
      let pdfMargin: [number, number, number, number] = [25, 30, 25, 20]; // Standar Permendagri: Atas 2.5cm, Kiri 3.0cm, Bawah 2.5cm, Kanan 2.0cm
      if (marginPreset === 'arsip_lebar') pdfMargin = [30, 35, 25, 20]; // Berkas Jilid/Arsip (Kiri 3.5cm)
      if (marginPreset === 'normal') pdfMargin = [25, 25, 25, 25];
      if (marginPreset === 'kompak') pdfMargin = [15, 15, 15, 15];

      // Perhitungan presisi lebar cetak bersih (Inner Printable Width) agar layout tidak downscale / teks tidak menyusut
      const totalPaperWidthMm = paperSize === 'f4' ? 215 : paperSize === 'letter' ? 215.9 : 210;
      const leftMarginMm = pdfMargin[1];
      const rightMarginMm = pdfMargin[3];
      const printableWidthMm = totalPaperWidthMm - leftMarginMm - rightMarginMm;

      // Clone element and strip screen padding so margins are applied strictly by jsPDF
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.padding = '0';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.width = `${printableWidthMm}mm`;
      clone.style.maxWidth = `${printableWidthMm}mm`;
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';

      // Hide all no-print elements inside the clone
      clone.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // Show print-only elements inside the clone
      clone.querySelectorAll('.print-only').forEach((el) => {
        (el as HTMLElement).style.display = 'block';
      });

      const opt = {
        margin: pdfMargin,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 1024,
        },
        jsPDF: {
          unit: 'mm',
          format: paperSize === 'f4' ? ([215, 330] as [number, number]) : paperSize === 'letter' ? 'letter' : 'a4',
          orientation: 'portrait' as const,
          compress: true,
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          avoid: ['.page-break-inside-avoid', 'tr', 'table'] 
        },
      };

      await html2pdf().set(opt).from(clone).save();
      setPrintToastMsg(`Berkas PDF resmi utuh berhasil diunduh ke disk lokal: ${filename}`);
    } catch (err: any) {
      console.error('Gagal generate PDF langsung:', err);
      // Fallback: trigger print dialog for saving as PDF
      window.print();
      setPrintToastMsg('Membuka dialog cetak browser (Pilih "Simpan sebagai PDF" dengan Margin Default).');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Font family helper class
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'bookman':
        return 'font-bookman';
      case 'times':
        return 'font-times';
      case 'arial':
        return 'font-arial';
      case 'jakarta':
      default:
        return 'font-jakarta';
    }
  };

  // Paper styling for on-screen preview
  const getPaperDimensionsClass = () => {
    switch (paperSize) {
      case 'f4':
        return 'max-w-[215mm] min-h-[330mm]';
      case 'letter':
        return 'max-w-[216mm] min-h-[279mm]';
      case 'a4':
      default:
        return 'max-w-[210mm] min-h-[297mm]';
    }
  };

  // Margin padding for on-screen preview
  const getScreenMarginPadding = () => {
    switch (marginPreset) {
      case 'arsip_lebar':
        return 'pt-[30mm] pb-[25mm] pr-[20mm] pl-[35mm]';
      case 'kompak':
        return 'pt-[15mm] pb-[15mm] pr-[15mm] pl-[15mm]';
      case 'normal':
        return 'pt-[25mm] pb-[25mm] pr-[25mm] pl-[25mm]';
      case 'dinas':
      default:
        return 'pt-[25mm] pb-[25mm] pr-[20mm] pl-[30mm]';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/90 text-slate-900 pb-16">
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR (PREVIEW & ACTION HEADER - NO PRINT) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 shadow-lg no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Back & Document Type Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Pratinjau Cetak Pelaporan RT
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Standar Tata Naskah Dinas
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-100 truncate max-w-[280px] sm:max-w-md">
                {meeting.title}
              </h2>
            </div>
          </div>

          {/* Quick Selectors & Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Document Type Dropdown */}
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="lengkap">Dokumen Lengkap (BA + Presensi + Foto)</option>
              <option value="berita_acara">Hanya Berita Acara & Notulen</option>
              <option value="daftar_hadir">Hanya Lampiran Daftar Hadir Bertanda Tangan</option>
              <option value="presensi_kosong">Lembar Presensi Meja (Kosong untuk TTD Basah)</option>
              <option value="mading_warga">Ringkasan Hasil Rapat (Format Mading Warga)</option>
            </select>

            {/* Zoom Controls */}
            <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded-xl px-1 text-slate-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                title="Perkecil Pratinjau"
                className="p-1.5 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 w-12 text-center text-emerald-400">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                title="Perbesar Pratinjau"
                className="p-1.5 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Settings Drawer Button */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                showSettingsDrawer
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Setelan Persuratan</span>
            </button>

            {/* Primary Print / Save as PDF Dialog */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              title="Buka dialog cetak untuk mencetak ke kertas fisik atau Simpan sebagai PDF resmi (Margin Kedinasan Baku)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Resmi (PDF)</span>
            </button>

            {/* Direct Official PDF Download to Local Disk */}
            <button
              onClick={handleDownloadPdfToLocalDisk}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Unduh berkas pelaporan resmi lengkap (.pdf) langsung ke disk lokal"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Menyusun PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Unduh Berkas PDF (.pdf)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* BANNER INFORMASI STANDAR PERSURATAN KEDINASAN RESMI */}
      <div className="bg-slate-800/95 border-b border-slate-700 px-4 py-2 text-xs no-print shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-500/30">
              Format Pelaporan Resmi Kedinasan
            </span>
            <span className="text-slate-300 text-[11px]">
              Margin Baku: <strong>Kiri 3,0 cm</strong> (Ruang Jilid/Arsip), <strong>Atas 2,5 cm</strong>, <strong>Kanan 2,0 cm</strong>, <strong>Bawah 2,5 cm</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Kertas: <strong className="text-slate-200 uppercase">{paperSize}</strong></span>
            <span>•</span>
            <span>Huruf: <strong className="text-slate-200">{fontFamily === 'bookman' ? 'Bookman Old Style (Permendagri)' : fontFamily === 'times' ? 'Times New Roman' : 'Arial'}</strong></span>
            <span>•</span>
            <span>Ukuran: <strong className="text-slate-200">{fontSize}</strong></span>
          </div>
        </div>
      </div>

      {/* Non-print Toast Notification */}
      {printToastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between no-print shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-200 shrink-0" />
              {printToastMsg}
            </span>
            <button
              onClick={() => setPrintToastMsg(null)}
              className="text-emerald-100 hover:text-white font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SETTINGS DRAWER / ACCORDION PANEL (NO PRINT) */}
      {/* ========================================================================= */}
      {showSettingsDrawer && (
        <div className="bg-slate-800/95 border-b border-slate-700 text-slate-200 px-4 py-4 shadow-xl no-print animate-in slide-in-from-top-4 duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Parameter & Setelan Format Sesuai Acuan Tata Naskah Dinas
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Semua setelan di bawah otomatis menyesuaikan tampilan kertas fisik dan hasil cetak
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* KOLOM 1: KERTAS & MARGIN DINAS */}
              <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  1. Kertas & Margin
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Ukuran Kertas:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['a4', 'f4', 'letter'] as PaperSize[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPaperSize(sz)}
                        className={`py-1 text-[11px] font-bold rounded-lg uppercase border transition-all ${
                          paperSize === sz
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {sz === 'f4' ? 'F4 / Folio' : sz}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {paperSize === 'f4' ? '215 x 330 mm (Standar Arsip Desa/RT)' : '210 x 297 mm'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Margin Standar:
                  </label>
                  <select
                    value={marginPreset}
                    onChange={(e) => setMarginPreset(e.target.value as MarginPreset)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <option value="dinas">Standar Dinas (Kiri 3cm, Atas/Bawah 2.5cm, Kanan 2cm)</option>
                    <option value="normal">Normal (2.5 cm Keliling)</option>
                    <option value="kompak">Kompak / Hemat Halaman (1.5 cm)</option>
                  </select>
                </div>
              </div>

              {/* KOLOM 2: TIPOGRAFI & HURUF RESMI */}
              <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  2. Tipografi & Huruf Dinas
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Jenis Font Naskah:
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as TypographyFont)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <option value="bookman">Bookman Old Style (Standar Permendagri)</option>
                    <option value="times">Times New Roman (Formal Klasik)</option>
                    <option value="arial">Arial (Modern Tegas)</option>
                    <option value="jakarta">Plus Jakarta Sans (Elegan)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Ukuran Huruf:
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as FontSize)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    >
                      <option value="10pt">10 pt (Rapat)</option>
                      <option value="11pt">11 pt (Standar Dinas)</option>
                      <option value="12pt">12 pt (Formal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Spasi Baris:
                    </label>
                    <select
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs"
                    >
                      <option value="1.15">1.15 (Baku)</option>
                      <option value="1.3">1.3 (Sedang)</option>
                      <option value="1.5">1.5 (Renggang)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* KOLOM 3: KOP & PENOMORAN SURAT */}
              <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  3. Kop, Logo & Nomor Naskah
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">Tampilkan Kop Resmi:</span>
                  <input
                    type="checkbox"
                    checked={showKop}
                    onChange={(e) => setShowKop(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Pilihan Lambang / Logo:
                  </label>
                  <select
                    disabled={!showKop}
                    value={kopLogo}
                    onChange={(e) => setKopLogo(e.target.value as KopLogoType)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs disabled:opacity-50"
                  >
                    <option value="garuda">Garuda Pancasila (Standar RI)</option>
                    <option value="rt">Lambang Rukun Warga / RT</option>
                    <option value="custom">Unggah Logo Sendiri (Pemda / Desa)</option>
                    <option value="none">Tanpa Logo (Teks Saja)</option>
                  </select>
                </div>

                {/* Upload logo jika memilih custom */}
                {showKop && kopLogo === 'custom' && (
                  <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1.5">
                    <label className="block text-[10px] font-semibold text-emerald-300">
                      Pilih Gambar Logo dari Perangkat:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomLogoUpload}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    />
                    <input
                      type="url"
                      placeholder="Atau masukkan link URL logo..."
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-[10px]"
                    />
                  </div>
                )}

                {/* SETELAN TINGGI LOGO KOP (LOGO HEIGHT) */}
                {showKop && kopLogo !== 'none' && (
                  <div className="space-y-1.5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-300">Setelan Tinggi Logo:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {logoHeight} px <span className="text-[10px] text-slate-400 font-normal">({(logoHeight * 0.0264).toFixed(1)} cm)</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min={45}
                      max={140}
                      step={2}
                      value={logoHeight}
                      onChange={(e) => setLogoHeight(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />

                    {/* Presets Cepat Tinggi Logo */}
                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                      {[
                        { label: '60px', val: 60, desc: '1.6cm' },
                        { label: '80px', val: 80, desc: 'Dinas' },
                        { label: '100px', val: 100, desc: '2.6cm' },
                        { label: '120px', val: 120, desc: 'Besar' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setLogoHeight(item.val)}
                          className={`py-0.5 px-1 rounded text-[10px] font-bold border transition-all text-center ${
                            logoHeight === item.val
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Posisi Logo Kop */}
                    <div className="pt-1.5">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Posisi Tata Letak Logo:
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'kiri', label: 'Kiri (Dinas)' },
                          { id: 'ganda', label: 'Kiri & Kanan' },
                          { id: 'tengah', label: 'Tengah Atas' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setLogoPosition(pos.id as LogoPosition)}
                            className={`py-1 text-[10px] font-semibold rounded border transition-all text-center ${
                              logoPosition === pos.id
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nomor Berita Acara:
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono px-2.5 py-1 rounded-lg text-[11px]"
                  />
                </div>
              </div>

              {/* KOLOM 4: PENGESAHAN & TANDA TANGAN */}
              <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  4. Legalisasi, Stempel & Tanda Tangan
                </h4>

                {/* Stempel Dinas Action */}
                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">Stempel Dinas RT:</span>
                    <input
                      type="checkbox"
                      checked={showStamp}
                      onChange={(e) => setShowStamp(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  {showStamp && (
                    <button
                      type="button"
                      onClick={() => setIsStampModalOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Shield className="w-3 h-3" />
                      Ubah Desain & Warna Stempel...
                    </button>
                  )}
                </div>

                {/* Tanda Tangan Pengurus */}
                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Tanda Tangan Digital Pengurus:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Ketua RT',
                          targetName: meeting.leader || profile.ketuaRt,
                          targetRole: 'Pimpinan Musyawarah / Ketua RT',
                          type: 'leader',
                          initialSig: leaderSignature,
                        })
                      }
                      className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-semibold truncate flex items-center justify-center gap-1"
                      title="Rekam atau ubah tanda tangan Ketua RT"
                    >
                      <PenTool className="w-2.5 h-2.5 text-emerald-400" />
                      {leaderSignature ? 'Ubah TTD Ketua' : 'TTD Ketua RT'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Notulis / Sekretaris',
                          targetName: meeting.notary || profile.sekretaris,
                          targetRole: 'Notulis / Sekretaris RT',
                          type: 'notary',
                          initialSig: notarySignature,
                        })
                      }
                      className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-semibold truncate flex items-center justify-center gap-1"
                      title="Rekam atau ubah tanda tangan Notulis"
                    >
                      <PenTool className="w-2.5 h-2.5 text-emerald-400" />
                      {notarySignature ? 'Ubah TTD Notulis' : 'TTD Notulis'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Tanda Tangan Lampiran Warga:
                    </label>
                    <button
                      type="button"
                      onClick={handleStartSequentialSigning}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-bold"
                    >
                      Gilir TTD Warga
                    </button>
                  </div>
                  <select
                    value={sigStyle}
                    onChange={(e) => setSigStyle(e.target.value as SignatureColumnStyle)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <option value="digital">Tanda Tangan Digital Warga</option>
                    <option value="zikzak">Kolom Zik-Zak Dinas (1, 2, 3..)</option>
                    <option value="kosong">Kolom Kosong untuk TTD Basah</option>
                  </select>
                </div>

                {/* Pengaturan Kuota / Target KK Dokumen */}
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">Target Kuota Warga:</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                      Ketik Bebas
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={customQuotaCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          handleSaveQuotaCount(val);
                        } else {
                          setCustomQuotaCount(1);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-600 text-slate-100 font-bold px-2 py-1 rounded text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-400">KK</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {[15, 20, 25, 30, 40, 50, 75, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSaveQuotaCount(num)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                          customQuotaCount === num
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center justify-between text-[11px] font-semibold text-slate-300 cursor-pointer">
                    <span>Mengetahui Ketua RW:</span>
                    <input
                      type="checkbox"
                      checked={showMengetahuiRW}
                      onChange={(e) => setShowMengetahuiRW(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-[11px] font-semibold text-slate-300 cursor-pointer">
                    <span>Dokumentasi Foto Rapat:</span>
                    <input
                      type="checkbox"
                      checked={showPhotos}
                      onChange={(e) => setShowPhotos(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULATED PAPER WORKSPACE CANVAS */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center overflow-x-auto">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="print:transform-none"
        >
          {/* SIMULATED PRINT SHEET */}
          <div
            id="printable-official-document-area"
            className={`bg-white shadow-2xl rounded-none border border-slate-300 print:border-none print:shadow-none print-page text-slate-900 ${getFontFamilyClass()} ${getPaperDimensionsClass()} ${getScreenMarginPadding()}`}
            style={{
              fontSize: fontSize,
              lineHeight: lineSpacing,
            }}
          >
            {/* ------------------------------------------------------------------- */}
            {/* KOP SURAT RESMI RT (TATA NASKAH DINAS) */}
            {/* ------------------------------------------------------------------- */}
            {showKop && (
              <div className="mb-6">
                {/* Mode Logo Tengah Atas */}
                {logoPosition === 'tengah' && kopLogo !== 'none' && (
                  <div className="flex justify-center mb-2">
                    {renderLogoElement(logoHeight)}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pb-3">
                  {/* Logo Kiri jika posisi bukan tengah */}
                  {logoPosition !== 'tengah' && kopLogo !== 'none' && (
                    <div
                      style={{ width: `${logoHeight}px`, height: `${logoHeight}px` }}
                      className="shrink-0 flex items-center justify-center"
                    >
                      {renderLogoElement(logoHeight)}
                    </div>
                  )}

                  {/* Header Teks Instansi Baku Dinas */}
                  <div className={`text-center flex-1 ${kopLogo === 'none' || logoPosition === 'tengah' ? 'w-full' : ''}`}>
                    <h4 className="text-[11pt] font-semibold tracking-wider uppercase leading-snug">
                      PEMERINTAH {profile.kota.toUpperCase()}
                    </h4>
                    <h3 className="text-[11.5pt] font-bold tracking-wider uppercase leading-snug">
                      KECAMATAN {profile.kecamatan.toUpperCase()} • KELURAHAN {profile.kelurahan.toUpperCase()}
                    </h3>
                    <h2 className="text-[13pt] font-black tracking-wide uppercase leading-tight mt-0.5">
                      PENGURUS RUKUN WARGA {profile.rwNumber}
                    </h2>
                    <h1 className="text-[15pt] font-black tracking-wider uppercase text-slate-950 leading-tight">
                      RUKUN TETANGGA {profile.rtNumber}
                    </h1>
                    {profile.dusun && (
                      <p className="text-[9.5pt] font-medium text-slate-700">{profile.dusun}</p>
                    )}
                    <p className="text-[8.5pt] text-slate-600 mt-1">
                      Sekretariat: {profile.kelurahan}, Kec. {profile.kecamatan}, {profile.kota} {profile.kodePos} • Kontak: {profile.kontakRt}
                    </p>
                  </div>

                  {/* Penyeimbang Kanan atau Logo Kanan (Ganda) */}
                  {logoPosition === 'ganda' && (
                    <div
                      style={{ width: `${logoHeight}px`, height: `${logoHeight}px` }}
                      className="shrink-0 flex items-center justify-center"
                    >
                      <div
                        style={{ width: `${logoHeight}px`, height: `${logoHeight}px` }}
                        className="rounded-full border-2 border-slate-900 flex flex-col items-center justify-center font-bold text-center leading-none"
                      >
                        <span style={{ fontSize: `${Math.max(7, logoHeight * 0.12)}px` }} className="uppercase font-black">RT</span>
                        <span style={{ fontSize: `${Math.max(11, logoHeight * 0.22)}px` }} className="font-black text-slate-900">{profile.rtNumber}</span>
                        <span style={{ fontSize: `${Math.max(6, logoHeight * 0.1)}px` }} className="uppercase">RW {profile.rwNumber}</span>
                      </div>
                    </div>
                  )}

                  {logoPosition === 'kiri' && kopLogo !== 'none' && (
                    <div
                      style={{ width: `${logoHeight}px`, height: `${logoHeight}px` }}
                      className="shrink-0 hidden sm:block pointer-events-none"
                    />
                  )}
                </div>

                {/* Garis Ganda Baku Naskah Dinas: Garis tebal 3px dan tipis 1px */}
                <div className="border-t-[3px] border-slate-950 mt-1" />
                <div className="border-t-[1px] border-slate-950 mt-[2px]" />
              </div>
            )}

            {/* =================================================================== */}
            {/* BAGIAN I: BERITA ACARA (JIKA DOKUMEN LENGKAP / BA) */}
            {/* =================================================================== */}
            {(docType === 'lengkap' || docType === 'berita_acara' || docType === 'mading_warga') && (
              <div className="space-y-5">
                {/* JUDUL DAN NOMOR NASKAH DINAS RESMI RT */}
                <div className="text-center my-4 space-y-1">
                  <h2 className="text-[13pt] font-black uppercase underline decoration-2 underline-offset-4 tracking-wider text-slate-950">
                    BERITA ACARA MUSYAWARAH RUKUN TETANGGA
                  </h2>
                  <p className="text-[10pt] font-bold text-slate-900 tracking-wide uppercase">
                    NOMOR : {docNumber}
                  </p>
                  <p className="text-[10pt] font-bold text-slate-800 uppercase tracking-wide pt-0.5">
                    TENTANG : {meeting.title}
                  </p>
                </div>

                {/* PARAGRAF PEMBUKA BAKU PERSURATAN */}
                <p className="text-justify leading-relaxed indent-8">
                  Pada {getFormalDatePhraze(meeting.date)}, bertempat di <strong>{meeting.location}</strong>, telah diselenggarakan Musyawarah Warga Rukun Tetangga (RT) {profile.rtNumber} Rukun Warga (RW) {profile.rwNumber}, Kelurahan {profile.kelurahan}, Kecamatan {profile.kecamatan}, {profile.kota}, yang dihadiri oleh Pengurus RT dan seluruh warga anggota musyawarah sebagaimana tercantum dalam Lembar Daftar Hadir terlampir, dengan rincian pelaksanaan sebagai berikut:
                </p>

                {/* KOTAK INFORMASI MUSYAWARAH DINAS (TITIK DUA SEJAJAR) */}
                <div className="border border-slate-400 bg-white p-3.5 text-[10pt] shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="align-top">
                        <td className="w-48 py-1 font-semibold text-slate-800">1. Hari / Tanggal</td>
                        <td className="w-4 py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 font-bold text-slate-950">{getDayNameIndonesian(meeting.date)}, {formatDateIndonesian(meeting.date)}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 font-semibold text-slate-800">2. Waktu Pelaksanaan</td>
                        <td className="py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 text-slate-900">{meeting.startTime} s/d {meeting.endTime || 'Selesai'} WIB</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 font-semibold text-slate-800">3. Tempat Musyawarah</td>
                        <td className="py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 text-slate-900 font-medium">{meeting.location}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 font-semibold text-slate-800">4. Pimpinan Musyawarah</td>
                        <td className="py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 font-bold text-slate-950">{meeting.leader} (Ketua RT {profile.rtNumber})</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 font-semibold text-slate-800">5. Notulis / Sekretaris</td>
                        <td className="py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 text-slate-900 font-semibold">{meeting.notary}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-1 font-semibold text-slate-800">6. Kuorum Kehadiran</td>
                        <td className="py-1 text-center font-bold text-slate-800">:</td>
                        <td className="py-1 text-slate-900">
                          <strong className="font-bold text-slate-950">{hadirCount} Orang / KK</strong>{' '}
                          dari target{' '}
                          {isEditingInlineQuota ? (
                            <span className="no-print inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-400 rounded-lg p-1 shadow-xs my-0.5">
                              <input
                                type="number"
                                min={1}
                                value={inlineQuotaInput}
                                onChange={(e) => setInlineQuotaInput(e.target.value)}
                                className="w-18 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[9.5pt] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = parseInt(inlineQuotaInput, 10);
                                    if (!isNaN(val) && val > 0) {
                                      handleSaveQuotaCount(val);
                                    }
                                    setIsEditingInlineQuota(false);
                                  } else if (e.key === 'Escape') {
                                    setInlineQuotaInput(String(customQuotaCount));
                                    setIsEditingInlineQuota(false);
                                  }
                                }}
                              />
                              <span className="font-bold text-slate-700 text-xs">KK</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const val = parseInt(inlineQuotaInput, 10);
                                  if (!isNaN(val) && val > 0) {
                                    handleSaveQuotaCount(val);
                                  }
                                  setIsEditingInlineQuota(false);
                                }}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9pt] font-bold cursor-pointer transition-colors"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineQuotaInput(String(customQuotaCount));
                                  setIsEditingInlineQuota(false);
                                }}
                                className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[9pt] cursor-pointer"
                              >
                                Batal
                              </button>
                            </span>
                          ) : (
                            <>
                              <strong className="font-bold text-slate-950">{customQuotaCount} KK</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineQuotaInput(String(customQuotaCount));
                                  setIsEditingInlineQuota(true);
                                }}
                                className="no-print text-emerald-700 hover:text-emerald-900 font-semibold underline text-[9pt] ml-1.5 cursor-pointer inline-flex items-center gap-0.5"
                                title="Ketik manual kuota peserta rapat ini"
                              >
                                (Ubah Kuota)
                              </button>
                            </>
                          )}{' '}
                          — Kuorum {Math.round((hadirCount / (customQuotaCount || 1)) * 100)}%{' '}
                          <span className="font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[8.5pt]">
                            (Sah Sesuai Aturan RT)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PASAL / BUTIR I: AGENDA & SUSUNAN ACARA */}
                <div className="space-y-1.5">
                  <h3 className="font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                    I. SUSUNAN ACARA & AGENDA PEMBAHASAN
                  </h3>
                  <ol className="list-decimal list-inside pl-2 space-y-1">
                    {meeting.agenda.map((ag, idx) => (
                      <li key={idx} className="leading-snug">
                        {ag}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* PASAL / BUTIR II: JALANNYA MUSYAWARAH */}
                {showMinutesDetail && meeting.minutes && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                      II. NOTULENSI & JALANNYA MUSYAWARAH
                    </h3>
                    <div className="whitespace-pre-wrap pl-2 leading-relaxed text-justify bg-slate-50/40 p-3 rounded border border-slate-200">
                      {meeting.minutes}
                    </div>
                  </div>
                )}

                {/* PASAL / BUTIR III: KEPUTUSAN KESEPAKATAN MUFAKAT */}
                {showDecisions && (
                  <div className="space-y-1.5 page-break-inside-avoid">
                    <h3 className="font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                      III. POKOK-POKOK KEPUTUSAN & KESEPAKATAN BERSAMA (MUFAKAT)
                    </h3>
                    {meeting.decisions && meeting.decisions.length > 0 ? (
                      <ul className="list-disc list-inside pl-2 space-y-1.5 font-medium">
                        {meeting.decisions.map((dec, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {dec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-slate-600 pl-2">Seluruh warga menyetujui seluruh materi pembahasan musyawarah secara mufakat.</p>
                    )}
                  </div>
                )}

                {/* PASAL / BUTIR IV: RENCANA TINDAK LANJUT & PENANGGUNG JAWAB (ACTION PLAN) */}
                {showActionItems && meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div className="space-y-2 page-break-inside-avoid">
                    <h3 className="font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                      IV. RENCANA TINDAK LANJUT & PENANGGUNG JAWAB (ACTION PLAN)
                    </h3>
                    <table className="w-full text-left border-collapse border border-slate-500 text-[9.5pt]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-950">
                          <th className="border border-slate-500 px-2 py-1.5 text-center w-8">No</th>
                          <th className="border border-slate-500 px-3 py-1.5">Uraian Tugas / Rencana Kerja</th>
                          <th className="border border-slate-500 px-3 py-1.5 w-44">Penanggung Jawab (PIC)</th>
                          <th className="border border-slate-500 px-2 py-1.5 w-24 text-center">Batas Waktu</th>
                          <th className="border border-slate-500 px-2 py-1.5 w-20 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meeting.actionItems.map((act, i) => (
                          <tr key={act.id}>
                            <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                            <td className="border border-slate-400 px-3 py-1.5 font-medium text-slate-900">{act.task}</td>
                            <td className="border border-slate-400 px-3 py-1.5">{act.pic}</td>
                            <td className="border border-slate-400 px-2 py-1.5 text-center">{act.deadline}</td>
                            <td className="border border-slate-400 px-2 py-1.5 text-center font-bold text-slate-900">
                              {act.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PASAL / BUTIR V: CATATAN KEUANGAN JIKA ADA */}
                {showBudget && meeting.budgetNotes && (
                  <div className="space-y-1 page-break-inside-avoid">
                    <h3 className="font-bold uppercase tracking-wider text-slate-950 border-b border-slate-400 pb-0.5">
                      V. ALOKASI ANGGARAN & KEUANGAN KAS RT
                    </h3>
                    <p className="pl-2 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-300">
                      {meeting.budgetNotes}
                    </p>
                  </div>
                )}

                {/* KALIMAT PENUTUP RESMI TATA NASKAH DINAS */}
                <p className="text-justify leading-relaxed indent-8 page-break-inside-avoid pt-2 mb-4">
                  Demikian Berita Acara Musyawarah Rukun Tetangga ini dibuat dengan sebenarnya dan penuh rasa tanggung jawab, dilandasi asas musyawarah untuk mufakat serta semangat kerukunan dan kekeluargaan, untuk dapat dipergunakan sebagaimana mestinya dan menjadi pedoman bersama bagi seluruh warga.
                </p>

                {/* =============================================================== */}
                {/* LEMBAR PENGESAHAN / KAKI SURAT (TANDA TANGAN & STEMPEL DINAS) */}
                {/* =============================================================== */}
                <div className="pt-4 page-break-inside-avoid">
                  {/* Titimangsa Sejajar Kolom Kanan */}
                  <div className="flex justify-end mb-3">
                    <div className="w-72 text-left text-[10pt] space-y-0.5">
                      <p>Ditetapkan di : <span className="font-semibold">{profile.kelurahan}</span></p>
                      <p>Pada tanggal  : <span className="font-semibold">{formatDateIndonesian(meeting.date)}</span></p>
                    </div>
                  </div>

                  {/* 2 Kolom Pelaksana: Notulis (Kiri) dan Ketua RT (Kanan) */}
                  <div className="grid grid-cols-2 gap-8 text-center text-[10pt]">
                    {/* 1. Notulis / Sekretaris RT */}
                    <div className="flex flex-col items-center justify-between">
                      <p className="font-semibold text-slate-800">Notulis / Sekretaris RT,</p>
                      <div className="h-24 flex items-center justify-center relative w-full my-1">
                        {notarySignature ? (
                          <img
                            src={notarySignature}
                            alt="TTD Notulis"
                            onClick={() =>
                              setSigCaptureState({
                                isOpen: true,
                                title: 'Ubah Tanda Tangan Notulis',
                                targetName: meeting.notary || profile.sekretaris,
                                targetRole: 'Notulis / Sekretaris RT',
                                type: 'notary',
                                initialSig: notarySignature,
                              })
                            }
                            className="h-18 max-w-[130px] object-contain mx-auto cursor-pointer"
                            title="Klik untuk mengubah tanda tangan Notulis"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSigCaptureState({
                                isOpen: true,
                                title: 'Rekam Tanda Tangan Notulis',
                                targetName: meeting.notary || profile.sekretaris,
                                targetRole: 'Notulis / Sekretaris RT',
                                type: 'notary',
                              })
                            }
                            className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                            Bubuhkan TTD
                          </button>
                        )}
                        {!notarySignature && (
                          <span className="print-only text-[9pt] text-slate-400 italic font-mono">[Tanda Tangan]</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950 underline uppercase tracking-wide">
                          {meeting.notary || profile.sekretaris}
                        </p>
                        <p className="text-[9pt] text-slate-600">Sekretaris RT {profile.rtNumber}</p>
                      </div>
                    </div>

                    {/* 2. Pimpinan Musyawarah / Ketua RT (dengan Stempel Resmi di sisi kiri TTD) */}
                    <div className="flex flex-col items-center justify-between relative">
                      <p className="font-semibold text-slate-800">Pimpinan Musyawarah / Ketua RT,</p>
                      
                      <div className="h-24 flex items-center justify-center relative w-full my-1">
                        {/* Stempel Dinas Bulat RT: Di sebelah kiri tanda tangan secara resmi */}
                        {showStamp && (
                          <div
                            className="absolute -left-6 sm:-left-10 top-1/2 -translate-y-1/2 z-0 cursor-pointer pointer-events-auto"
                            onClick={() => setIsStampModalOpen(true)}
                            title="Klik untuk mengubah teks/warna stempel dinas"
                          >
                            <StampBadge config={stampConfig} />
                          </div>
                        )}

                        {/* Digital Signature of Ketua RT */}
                        <div className="z-10 relative">
                          {leaderSignature ? (
                            <img
                              src={leaderSignature}
                              alt="TTD Ketua RT"
                              onClick={() =>
                                setSigCaptureState({
                                 isOpen: true,
                                 title: 'Ubah Tanda Tangan Ketua RT',
                                 targetName: meeting.leader || profile.ketuaRt,
                                 targetRole: 'Pimpinan Musyawarah / Ketua RT',
                                 type: 'leader',
                                 initialSig: leaderSignature,
                               })
                              }
                              className="h-18 max-w-[130px] object-contain mx-auto cursor-pointer"
                              title="Klik untuk mengubah tanda tangan Ketua RT"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setSigCaptureState({
                                  isOpen: true,
                                  title: 'Rekam Tanda Tangan Ketua RT',
                                  targetName: meeting.leader || profile.ketuaRt,
                                  targetRole: 'Pimpinan Musyawarah / Ketua RT',
                                  type: 'leader',
                                })
                              }
                              className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                              Bubuhkan TTD
                            </button>
                          )}
                          {!leaderSignature && (
                            <span className="print-only text-[9pt] text-slate-400 italic font-mono">[Tanda Tangan & Cap]</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-slate-950 underline uppercase tracking-wide">
                          {meeting.leader || profile.ketuaRt}
                        </p>
                        <p className="text-[9pt] text-slate-600">Ketua RT {profile.rtNumber} / RW {profile.rwNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mengetahui Ketua RW (Hierarki Pengesahan di Tengah Bawah) */}
                  {showMengetahuiRW && (
                    <div className="mt-8 pt-4 border-t border-slate-200 text-center flex flex-col items-center justify-center page-break-inside-avoid">
                      <p className="font-semibold text-slate-800 text-[10pt]">Mengetahui,</p>
                      <p className="font-bold text-slate-900 text-[10pt]">Pengurus Rukun Warga (RW) {profile.rwNumber}</p>
                      <div className="h-22 flex items-center justify-center relative w-64 my-1">
                        {rwSignature ? (
                          <img
                            src={rwSignature}
                            alt="TTD Ketua RW"
                            onClick={() =>
                              setSigCaptureState({
                                isOpen: true,
                                title: 'Ubah Tanda Tangan Ketua RW',
                                targetName: rwLeaderName,
                                targetRole: 'Ketua RW',
                                type: 'rw',
                                initialSig: rwSignature,
                              })
                            }
                            className="h-16 max-w-[130px] object-contain mx-auto cursor-pointer"
                            title="Klik untuk mengubah tanda tangan Ketua RW"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSigCaptureState({
                                isOpen: true,
                                title: 'Rekam Tanda Tangan Ketua RW',
                                targetName: rwLeaderName,
                                targetRole: 'Ketua RW',
                                type: 'rw',
                              })
                            }
                            className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                            Bubuhkan TTD
                          </button>
                        )}
                        {!rwSignature && (
                          <span className="print-only text-[9pt] text-slate-400 italic font-mono">[Tanda Tangan]</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950 underline uppercase tracking-wide text-[10pt]">
                          {rwLeaderName}
                        </p>
                        <p className="text-[9pt] text-slate-600">Ketua RW {profile.rwNumber} / Kelurahan {profile.kelurahan}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* BAGIAN II: LAMPIRAN DAFTAR HADIR PESERTA MUSYAWARAH */}
            {/* =================================================================== */}
            {(docType === 'lengkap' || docType === 'daftar_hadir' || docType === 'presensi_kosong') && (
              <div className={`${docType === 'lengkap' ? 'page-break-before pt-8' : ''} space-y-4`}>
                
                {/* KOP PERSURATAN LAMPIRAN DINAS */}
                <div className="flex justify-between items-start border-b-2 border-slate-950 pb-2 mb-3">
                  <div className="text-left text-[9pt] font-semibold text-slate-800 uppercase">
                    <span>PENGURUS RUKUN TETANGGA {profile.rtNumber} / RW {profile.rwNumber}</span>
                    <span className="block text-[8pt] text-slate-600 font-normal">KELURAHAN {profile.kelurahan.toUpperCase()}, KECAMATAN {profile.kecamatan.toUpperCase()}</span>
                  </div>

                  <div className="text-right text-[8.5pt] text-slate-800 space-y-0.5">
                    <p className="font-bold tracking-wide uppercase">LAMPIRAN I : BERITA ACARA MUSYAWARAH RT</p>
                    <p>Nomor   : <span className="font-semibold">{docNumber}</span></p>
                    <p>Tanggal : <span className="font-semibold">{formatDateIndonesian(meeting.date)}</span></p>
                  </div>
                </div>

                <div className="text-center my-3 space-y-1">
                  <h3 className="text-[12pt] font-black uppercase underline decoration-1 underline-offset-4 tracking-wide text-slate-950">
                    DAFTAR HADIR PESERTA MUSYAWARAH WARGA
                  </h3>
                  <p className="text-[10pt] font-bold text-slate-800 uppercase">
                    RUKUN TETANGGA {profile.rtNumber} RUKUN WARGA {profile.rwNumber}
                  </p>
                  <div className="inline-block text-[9pt] text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded">
                    Agenda: <strong>{meeting.title}</strong> • {getDayNameIndonesian(meeting.date)}, {formatDateIndonesian(meeting.date)} • Pukul {meeting.startTime} WIB • {meeting.location}
                  </div>
                  
                  {/* Quick button to record signatures in table */}
                  <div className="no-print mt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartSequentialSigning}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" />
                      Mulai Mode Gilir Rekam TTD Warga Meja Rapat
                    </button>
                  </div>
                </div>

                {/* TABEL DAFTAR HADIR BAKU DINAS */}
                <table className="w-full text-left border-collapse border border-slate-500 text-[9.5pt] mt-3">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-950 uppercase">
                      <th className="border border-slate-500 px-2 py-2 text-center w-8">No</th>
                      <th className="border border-slate-500 px-3 py-2">Nama Lengkap Warga</th>
                      <th className="border border-slate-500 px-3 py-2 w-36">No. Rumah / Blok</th>
                      <th className="border border-slate-500 px-2 py-2 w-28 text-center">Status</th>
                      <th className="border border-slate-500 px-2 py-2 w-20 text-center">Waktu</th>
                      <th className="border border-slate-500 px-3 py-2 w-44 text-center">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mode Blank Sheet (Kosong untuk TTD Basah) */}
                    {docType === 'presensi_kosong' ? (
                      Array.from({ length: Math.max(1, customQuotaCount) }).map((_, idx) => (
                        <tr key={idx} className="h-10 page-break-inside-avoid">
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="border border-slate-400 px-3 py-1"></td>
                          <td className="border border-slate-400 px-3 py-1"></td>
                          <td className="border border-slate-400 px-2 py-1 text-center text-slate-400 text-[8pt]">Hadir / Izin</td>
                          <td className="border border-slate-400 px-2 py-1 text-center"></td>
                          <td className="border border-slate-400 px-3 py-1">
                            <span className="text-[9pt] text-slate-400 font-mono">
                              {idx % 2 === 0 ? `${idx + 1}. .........` : `...... ${idx + 1}.`}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Mode Nyata Data Kehadiran */
                      meeting.attendances.map((att, idx) => (
                        <tr key={att.id} className="page-break-inside-avoid">
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-400 px-3 py-1.5 font-bold text-slate-900">
                            {att.name}
                            {att.representedBy && (
                              <span className="block text-[8.5pt] font-normal text-amber-800">
                                (Mewakili: {att.representedBy})
                              </span>
                            )}
                            {att.notes && (
                              <span className="block text-[8.5pt] font-normal text-slate-500 italic">
                                Ket: {att.notes}
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-400 px-3 py-1.5 font-medium text-slate-700">
                            {att.houseNumber || '-'}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-[9pt]">
                            {att.status}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-[8.5pt] text-slate-600 font-mono">
                            {formatDateTimeIndonesian(att.timestamp).split(' ')[3] || '-'}
                          </td>
                          <td className="border border-slate-400 px-2 py-1 text-center bg-white">
                            {sigStyle === 'digital' ? (
                              att.signature ? (
                                <img
                                  src={att.signature}
                                  alt="TTD"
                                  onClick={() => handleOpenAttendeeSignature(att)}
                                  className="h-8 max-w-[110px] mx-auto object-contain cursor-pointer"
                                  title="Klik untuk mengubah tanda tangan warga ini"
                                />
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAttendeeSignature(att)}
                                    className="no-print inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[8pt] font-bold rounded border border-emerald-300 transition-colors cursor-pointer"
                                    title="Rekam Tanda Tangan Warga Ini"
                                  >
                                    <PenTool className="w-2.5 h-2.5 text-emerald-600" />
                                    Rekam TTD
                                  </button>
                                  <span className="print-only text-[8.5pt] text-slate-400 italic">
                                    {att.status === 'Hadir' ? 'Hadir' : att.status}
                                  </span>
                                </>
                              )
                            ) : sigStyle === 'zikzak' ? (
                              <div className={`text-[9pt] font-mono font-bold text-slate-600 ${idx % 2 === 0 ? 'text-left pl-2' : 'text-right pr-2'}`}>
                                {idx + 1}. _________
                              </div>
                            ) : (
                              <span className="text-[8.5pt] text-slate-400 italic">
                                {att.status === 'Hadir' ? 'Hadir' : att.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}

                    {docType !== 'presensi_kosong' && meeting.attendances.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border border-slate-400 p-6 text-center text-slate-500 italic">
                          Belum ada peserta yang mengisi daftar hadir online pada musyawarah ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* REKAPITULASI KUORUM DI BAWAH DAFTAR HADIR */}
                <div className="border border-slate-300 bg-slate-50 p-3 rounded text-[9pt] flex items-center justify-between page-break-inside-avoid">
                  <div>
                    <span className="font-bold text-slate-800">Rekapitulasi Kehadiran Warga RT {profile.rtNumber}:</span>
                    <p className="text-slate-600 text-[8.5pt]">
                      Hadir Langsung: <strong>{meeting.attendances.filter(a => a.status === 'Hadir').length}</strong> | 
                      Hadir Online: <strong>{meeting.attendances.filter(a => a.status === 'Hadir Online').length}</strong> | 
                      Izin/Sakit: <strong>{meeting.attendances.filter(a => a.status === 'Izin' || a.status === 'Sakit').length}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10pt] font-black text-slate-900">
                      Total: {meeting.attendances.length} Orang
                    </span>
                    <span className="block text-[8.5pt] font-bold text-emerald-800">
                      Kuorum Sah: {Math.round((hadirCount / (customQuotaCount || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* PENGESAHAN LAMPIRAN RESMI */}
                <div className="pt-6 page-break-inside-avoid flex justify-between items-start text-[9.5pt] text-center">
                  <div className="w-64 flex flex-col items-center">
                    <p className="font-semibold text-slate-800">Notulis Musyawarah,</p>
                    <div className="h-20 flex items-center justify-center relative w-full my-1">
                      {notarySignature ? (
                        <img
                          src={notarySignature}
                          alt="TTD Notulis"
                          className="h-16 max-w-[120px] object-contain mx-auto"
                        />
                      ) : (
                        <span className="print-only text-[8.5pt] text-slate-400 italic">[Tanda Tangan]</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-950 underline uppercase tracking-wide">
                      {meeting.notary || profile.sekretaris}
                    </p>
                    <p className="text-[8.5pt] text-slate-600">Sekretaris RT {profile.rtNumber}</p>
                  </div>

                  <div className="w-64 flex flex-col items-center relative">
                    <p className="font-semibold text-slate-800">Pimpinan Musyawarah / Ketua RT,</p>
                    <div className="h-20 flex items-center justify-center relative w-full my-1">
                      {showStamp && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-0 scale-75 origin-center">
                          <StampBadge config={stampConfig} />
                        </div>
                      )}
                      <div className="z-10 relative">
                        {leaderSignature ? (
                          <img
                            src={leaderSignature}
                            alt="TTD Ketua RT"
                            className="h-16 max-w-[120px] object-contain mx-auto"
                          />
                        ) : (
                          <span className="print-only text-[8.5pt] text-slate-400 italic">[Tanda Tangan & Cap]</span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-slate-950 underline uppercase tracking-wide">
                      {meeting.leader || profile.ketuaRt}
                    </p>
                    <p className="text-[8.5pt] text-slate-600">Ketua RT {profile.rtNumber} / RW {profile.rwNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* BAGIAN III: LAMPIRAN DOKUMENTASI FOTO KEGIATAN */}
            {/* =================================================================== */}
            {showPhotos && meeting.photos && meeting.photos.length > 0 && (docType === 'lengkap' || docType === 'berita_acara') && (
              <div className="page-break-before pt-8 space-y-4">
                {/* KOP PERSURATAN LAMPIRAN II */}
                <div className="flex justify-between items-start border-b-2 border-slate-950 pb-2 mb-3">
                  <div className="text-left text-[9pt] font-semibold text-slate-800 uppercase">
                    <span>PENGURUS RUKUN TETANGGA {profile.rtNumber} / RW {profile.rwNumber}</span>
                    <span className="block text-[8pt] text-slate-600 font-normal">KELURAHAN {profile.kelurahan.toUpperCase()}, KECAMATAN {profile.kecamatan.toUpperCase()}</span>
                  </div>

                  <div className="text-right text-[8.5pt] text-slate-800 space-y-0.5">
                    <p className="font-bold tracking-wide uppercase">LAMPIRAN II : BERITA ACARA MUSYAWARAH RT</p>
                    <p>Nomor   : <span className="font-semibold">{docNumber}</span></p>
                    <p>Tanggal : <span className="font-semibold">{formatDateIndonesian(meeting.date)}</span></p>
                  </div>
                </div>

                <div className="text-center my-3 space-y-1">
                  <h3 className="text-[12pt] font-black uppercase underline decoration-1 underline-offset-4 tracking-wide text-slate-950">
                    DOKUMENTASI FOTO PELAKSANAAN MUSYAWARAH RT
                  </h3>
                  <p className="text-[9.5pt] font-semibold text-slate-700">
                    {meeting.title} • {formatDateIndonesian(meeting.date)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {meeting.photos.map((photo, i) => (
                    <div key={i} className="border border-slate-300 rounded p-1.5 bg-slate-50 page-break-inside-avoid">
                      <img
                        src={photo}
                        alt={`Dokumentasi ${i + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      <div className="text-[9pt] font-medium text-slate-700 text-center mt-1.5">
                        Dokumentasi Kegiatan Musyawarah #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal Ubah Stempel Dinas RT */}
      <StampCustomizerModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        config={stampConfig}
        onSave={handleSaveStamp}
      />

      {/* Modal Rekam Tanda Tangan Digital Pengurus & Warga */}
      <SignatureCaptureModal
        isOpen={sigCaptureState.isOpen}
        onClose={() => setSigCaptureState((prev) => ({ ...prev, isOpen: false }))}
        title={sigCaptureState.title}
        targetName={sigCaptureState.targetName}
        targetRole={sigCaptureState.targetRole}
        initialSignature={sigCaptureState.initialSig}
        onSave={handleSaveCapturedSignature}
        onSaveAndNext={sigCaptureState.type === 'attendee' ? handleSaveAndNextAttendee : undefined}
        hasNext={sigCaptureState.type === 'attendee'}
      />
    </div>
  );
};
