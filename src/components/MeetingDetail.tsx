import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Share2,
  Printer,
  Download,
  Edit,
  CheckCircle,
  Clock3,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Eye,
  ArrowLeft,
  FileText,
  Camera,
  Search,
  UserPlus,
  MessageSquare,
  Sparkles,
  Award,
  PenTool,
  Shield,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Meeting, RTProfile, Citizen, Attendance, AttendanceStatus, ActionItem, StampConfig } from '../types/meeting';
import { formatDateIndonesian, formatDateTimeIndonesian, exportAttendanceToCSV } from '../utils/formatters';
import { StampBadge } from './StampBadge';
import { StampCustomizerModal } from './StampCustomizerModal';
import { SignatureCaptureModal } from './SignatureCaptureModal';

interface MeetingDetailProps {
  meeting: Meeting;
  profile: RTProfile;
  citizens: Citizen[];
  onBack: () => void;
  onUpdateMeeting: (updated: Meeting) => void;
  onOpenQR: () => void;
  onOpenWhatsApp: () => void;
  onOpenPrint: () => void;
  onOpenPublicPresensi: () => void;
  onEditMeeting: () => void;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({
  meeting,
  profile,
  citizens,
  onBack,
  onUpdateMeeting,
  onOpenQR,
  onOpenWhatsApp,
  onOpenPrint,
  onOpenPublicPresensi,
  onEditMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'presensi' | 'notulen' | 'agenda' | 'foto' | 'legalisasi'>('presensi');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & filter attendances
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Stempel & Signature Modals State
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const currentStampConfig: StampConfig = meeting.stampConfig || profile.stampConfig || {
    textTop: `PENGURUS RUKUN TETANGGA ${profile.rtNumber}`,
    textMiddle: `RW ${profile.rwNumber}`,
    textBottom: `KELURAHAN ${profile.kelurahan.toUpperCase()}`,
    color: '#4338ca',
    rotation: -12,
    size: 105,
  };

  const [sigCaptureState, setSigCaptureState] = useState<{
    isOpen: boolean;
    title: string;
    targetName: string;
    targetRole?: string;
    type: 'leader' | 'notary' | 'bendahara' | 'rw' | 'attendee';
    attendeeId?: string;
    initialSig?: string;
  }>({
    isOpen: false,
    title: '',
    targetName: '',
    type: 'attendee',
  });

  const handleSaveStamp = (newConfig: StampConfig) => {
    onUpdateMeeting({
      ...meeting,
      stampConfig: newConfig,
    });
    setToastMessage('Stempel dinas RT untuk rapat ini berhasil diperbarui!');
  };

  const handleSaveCapturedSignature = (dataUrl: string) => {
    const { type, attendeeId } = sigCaptureState;
    if (type === 'leader') {
      onUpdateMeeting({ ...meeting, leaderSignature: dataUrl });
      setToastMessage('Tanda tangan digital Ketua RT (Pimpinan Musyawarah) berhasil disimpan.');
    } else if (type === 'notary') {
      onUpdateMeeting({ ...meeting, notarySignature: dataUrl });
      setToastMessage('Tanda tangan digital Notulis / Sekretaris RT berhasil disimpan.');
    } else if (type === 'bendahara') {
      onUpdateMeeting({ ...meeting, bendaharaSignature: dataUrl });
      setToastMessage('Tanda tangan digital Bendahara RT berhasil disimpan.');
    } else if (type === 'rw') {
      onUpdateMeeting({ ...meeting, rwSignature: dataUrl });
      setToastMessage('Tanda tangan digital Ketua RW berhasil disimpan.');
    } else if (type === 'attendee' && attendeeId) {
      const updatedAttendances = meeting.attendances.map((a) =>
        a.id === attendeeId ? { ...a, signature: dataUrl } : a
      );
      onUpdateMeeting({ ...meeting, attendances: updatedAttendances });
      setToastMessage('Tanda tangan digital kehadiran warga berhasil dicatat.');
    }
    setSigCaptureState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveAndNextAttendee = (dataUrl: string) => {
    const { attendeeId } = sigCaptureState;
    if (!attendeeId) return;

    const updatedAttendances = meeting.attendances.map((a) =>
      a.id === attendeeId ? { ...a, signature: dataUrl } : a
    );
    onUpdateMeeting({ ...meeting, attendances: updatedAttendances });

    const nextUnsigned = updatedAttendances.find(
      (a) => !a.signature && a.id !== attendeeId && (a.status === 'Hadir' || a.status === 'Hadir Online')
    );
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
      setToastMessage('Seluruh anggota rapat yang hadir telah berhasil membubuhkan tanda tangan!');
    }
  };

  const handleOpenAttendeeSignature = (att: Attendance) => {
    setSigCaptureState({
      isOpen: true,
      title: 'Rekam Tanda Tangan Warga',
      targetName: att.name,
      targetRole: att.houseNumber || 'Warga RT',
      type: 'attendee',
      attendeeId: att.id,
      initialSig: att.signature,
    });
  };

  const handleStartSequentialSigning = () => {
    const firstUnsigned =
      meeting.attendances.find(
        (a) => !a.signature && (a.status === 'Hadir' || a.status === 'Hadir Online')
      ) || meeting.attendances[0];

    if (!firstUnsigned) {
      setToastMessage('Belum ada data warga dalam daftar hadir rapat ini.');
      return;
    }

    setSigCaptureState({
      isOpen: true,
      title: 'Mode Meja Presensi: Tanda Tangan Bergilir',
      targetName: firstUnsigned.name,
      targetRole: firstUnsigned.houseNumber || 'Warga RT',
      type: 'attendee',
      attendeeId: firstUnsigned.id,
      initialSig: firstUnsigned.signature,
    });
  };

  const handleToggleRequireSignature = () => {
    const nextVal = meeting.requireDigitalSignature === false ? true : false;
    onUpdateMeeting({
      ...meeting,
      requireDigitalSignature: nextVal,
    });
    setToastMessage(
      nextVal
        ? 'Tanda tangan digital kini diwajibkan bagi setiap warga yang mengisi presensi.'
        : 'Tanda tangan digital kini bersifat opsional.'
    );
  };

  // Quick manual attendance addition
  const [showManualAttendance, setShowManualAttendance] = useState(false);
  const [manualCitizenId, setManualCitizenId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualHouse, setManualHouse] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Hadir');
  const [manualNotes, setManualNotes] = useState('');

  // Editable notulen state
  const [minutesText, setMinutesText] = useState(meeting.minutes || '');
  const [decisions, setDecisions] = useState<string[]>(meeting.decisions || []);
  const [newDecision, setNewDecision] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>(meeting.actionItems || []);
  const [newTask, setNewTask] = useState('');
  const [newPic, setNewPic] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [budgetNotes, setBudgetNotes] = useState(meeting.budgetNotes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveAlert, setSaveAlert] = useState(false);

  // Photo URL input
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Completed agendas checklist tracking
  const [completedAgendas, setCompletedAgendas] = useState<number[]>([]);

  // Selected signature preview modal
  const [previewSignature, setPreviewSignature] = useState<{ name: string; url: string } | null>(null);

  // Quorum calculations
  const hadirCount = meeting.attendances.filter(
    (a) => a.status === 'Hadir' || a.status === 'Hadir Online'
  ).length;
  const quorumPercent = Math.min(
    100,
    Math.round((hadirCount / (meeting.targetAttendeesCount || 1)) * 100)
  );

  const filteredAttendances = meeting.attendances.filter((att) => {
    const matchSearch =
      att.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      att.houseNumber.toLowerCase().includes(attendanceSearch.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || att.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Manual Attendance Handler
  const handleAddManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newAttendance: Attendance = {
      id: `att-man-${Date.now()}`,
      meetingId: meeting.id,
      citizenId: manualCitizenId || undefined,
      name: manualName.trim(),
      houseNumber: manualHouse.trim() || '-',
      phone: manualPhone.trim() || '-',
      status: manualStatus,
      notes: manualNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    onUpdateMeeting({
      ...meeting,
      attendances: [newAttendance, ...meeting.attendances],
    });

    setManualCitizenId('');
    setManualName('');
    setManualHouse('');
    setManualPhone('');
    setManualNotes('');
    setShowManualAttendance(false);
  };

  const handleDeleteAttendance = (id: string) => {
    if (confirm('Hapus pencatatan kehadiran ini?')) {
      onUpdateMeeting({
        ...meeting,
        attendances: meeting.attendances.filter((a) => a.id !== id),
      });
    }
  };

  // Save Notulen Changes
  const handleSaveNotulen = () => {
    onUpdateMeeting({
      ...meeting,
      minutes: minutesText,
      decisions,
      actionItems,
      budgetNotes,
    });
    setHasUnsavedChanges(false);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  // Decision Handlers
  const handleAddDecision = () => {
    if (!newDecision.trim()) return;
    setDecisions([...decisions, newDecision.trim()]);
    setNewDecision('');
    setHasUnsavedChanges(true);
  };

  const handleRemoveDecision = (index: number) => {
    setDecisions(decisions.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  // Action Items Handlers
  const handleAddActionItem = () => {
    if (!newTask.trim() || !newPic.trim()) return;
    const item: ActionItem = {
      id: `act-${Date.now()}`,
      task: newTask.trim(),
      pic: newPic.trim(),
      deadline: newDeadline || formatDateIndonesian(meeting.date),
      status: 'Belum',
    };
    setActionItems([...actionItems, item]);
    setNewTask('');
    setNewPic('');
    setNewDeadline('');
    setHasUnsavedChanges(true);
  };

  const handleToggleActionStatus = (id: string) => {
    const updated = actionItems.map((act) => {
      if (act.id !== id) return act;
      const nextStatus: ActionItem['status'] =
        act.status === 'Belum' ? 'Proses' : act.status === 'Proses' ? 'Selesai' : 'Belum';
      return { ...act, status: nextStatus };
    });
    setActionItems(updated);
    setHasUnsavedChanges(true);
  };

  const handleRemoveActionItem = (id: string) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
    setHasUnsavedChanges(true);
  };

  // Photo handlers
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    onUpdateMeeting({
      ...meeting,
      photos: [...meeting.photos, newPhotoUrl.trim()],
    });
    setNewPhotoUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateMeeting({
            ...meeting,
            photos: [...meeting.photos, reader.result],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    onUpdateMeeting({
      ...meeting,
      photos: meeting.photos.filter((_, i) => i !== index),
    });
  };

  const toggleAgendaCompleted = (idx: number) => {
    if (completedAgendas.includes(idx)) {
      setCompletedAgendas(completedAgendas.filter((i) => i !== idx));
    } else {
      setCompletedAgendas([...completedAgendas, idx]);
    }
  };

  const attendeesWithSig = meeting.attendances.filter((a) => !!a.signature).length;
  const attendeesTotal = meeting.attendances.length;
  const sigPercentage = attendeesTotal > 0 ? Math.round((attendeesWithSig / attendeesTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Daftar Rapat RT
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Public Presensi View Button */}
          <button
            onClick={onOpenPublicPresensi}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            Layar Presensi Warga
          </button>

          {/* QR Code */}
          <button
            onClick={onOpenQR}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            QR Code Presensi
          </button>

          {/* WhatsApp */}
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-colors shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            Kirim WhatsApp
          </button>

          {/* Print Official Minutes */}
          <button
            onClick={onOpenPrint}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-200" />
            Cetak Berita Acara & TTD
          </button>
        </div>
      </div>

      {/* Meeting Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {meeting.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  meeting.status === 'Berlangsung'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                    : meeting.status === 'Selesai'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                ● Status: {meeting.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {meeting.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{formatDateIndonesian(meeting.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{meeting.startTime} - {meeting.endTime || 'Selesai'} WIB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{meeting.location}</span>
              </div>
              <div className="text-slate-400">
                Pimpinan: <strong className="text-slate-700">{meeting.leader}</strong> • Notulis: <strong className="text-slate-700">{meeting.notary}</strong>
              </div>
            </div>
          </div>

          {/* Quorum Metric Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[240px] shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Kuorum Kehadiran:
              </span>
              <span className="font-extrabold text-emerald-700 text-sm">{quorumPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  quorumPercent >= 60 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${quorumPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Hadir: <strong className="text-slate-800">{hadirCount} Orang</strong></span>
              <span>Target: <strong className="text-slate-800">{meeting.targetAttendeesCount} KK</strong></span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Token Akses Presensi: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">{meeting.id}</code>
          </div>
          <button
            onClick={onEditMeeting}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Info Rapat
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('presensi')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'presensi'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Hadir Online
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
            {meeting.attendances.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notulen')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'notulen'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notulen & Keputusan Musyawarah
          {hasUnsavedChanges && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Ada perubahan belum disimpan" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'agenda'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Susunan Acara ({completedAgendas.length}/{meeting.agenda.length})
        </button>

        <button
          onClick={() => setActiveTab('foto')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'foto'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          Dokumentasi Foto ({meeting.photos.length})
        </button>

        <button
          onClick={() => setActiveTab('legalisasi')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'legalisasi'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          Stempel Dinas & Legalisasi Pengurus
          {(meeting.leaderSignature || meeting.notarySignature) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tanda tangan pengurus telah dibubuhkan" />
          )}
        </button>
      </div>

      {/* TAB 1: DAFTAR HADIR ONLINE */}
      {activeTab === 'presensi' && (
        <div className="space-y-4">
          {/* Digital Signature Requirement & Batch Signing Bar */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Tanda Tangan Digital Anggota Rapat
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {attendeesWithSig} / {meeting.attendances.length} Terekam ({sigPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rekam tanda tangan digital sah bagi seluruh anggota rapat secara online atau langsung di meja presensi.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleRequireSignature}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  meeting.requireDigitalSignature !== false
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                title="Aktifkan/nonaktifkan kewajiban tanda tangan bagi pengisi formulir presensi"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {meeting.requireDigitalSignature !== false ? 'Wajib TTD: Aktif' : 'Wajib TTD: Nonaktif'}
              </button>

              <button
                type="button"
                onClick={handleStartSequentialSigning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                title="Buka form tanda tangan bergilir satu per satu untuk warga di meja rapat"
              >
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                Mode Meja: TTD Bergilir
              </button>
            </div>
          </div>

          {/* Attendance Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari warga atau nomor rumah..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua Status ({meeting.attendances.length})</option>
                <option value="Hadir">Hadir</option>
                <option value="Hadir Online">Hadir Online</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportAttendanceToCSV(meeting, profile)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                onClick={() => setShowManualAttendance(!showManualAttendance)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showManualAttendance ? 'Tutup Form' : 'Catat Presensi Manual'}
              </button>
            </div>
          </div>

          {/* Form Presensi Manual oleh Admin/Sekretaris */}
          {showManualAttendance && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                Catat Kehadiran Warga Secara Manual (Admin RT)
              </h3>
              <form onSubmit={handleAddManualAttendance} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih dari Warga RT:</label>
                  <select
                    value={manualCitizenId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setManualCitizenId(id);
                      const c = citizens.find((item) => item.id === id);
                      if (c) {
                        setManualName(c.name);
                        setManualHouse(c.houseNumber);
                        setManualPhone(c.phone);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih Nama Warga RT --</option>
                    {citizens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.houseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama warga"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Rumah / Blok</label>
                  <input
                    type="text"
                    placeholder="Blok A1 No. 04"
                    value={manualHouse}
                    onChange={(e) => setManualHouse(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Kehadiran</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Hadir">Hadir Langsung</option>
                    <option value="Hadir Online">Hadir Online</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan / Keterangan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Diwakili istri, atau alasan izin"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Simpan Presensi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="px-4 py-3 text-center w-12 font-bold">No</th>
                    <th className="px-4 py-3 font-bold">Nama Warga</th>
                    <th className="px-4 py-3 font-bold">No. Rumah / Blok</th>
                    <th className="px-4 py-3 font-bold text-center">Status</th>
                    <th className="px-4 py-3 font-bold text-center">Waktu Presensi</th>
                    <th className="px-4 py-3 font-bold text-center">Tanda Tangan</th>
                    <th className="px-4 py-3 font-bold text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                        Belum ada warga yang tercatat dalam daftar hadir ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{att.name}</div>
                          {att.representedBy && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Mewakili: {att.representedBy}
                            </span>
                          )}
                          {att.notes && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Ket: {att.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {att.houseNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              att.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : att.status === 'Hadir Online'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] text-slate-500">
                          {formatDateTimeIndonesian(att.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {att.signature ? (
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <button
                                onClick={() => setPreviewSignature({ name: att.name, url: att.signature! })}
                                className="group inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                                title="Lihat tanda tangan"
                              >
                                <img
                                  src={att.signature}
                                  alt="TTD"
                                  className="h-6 max-w-[70px] object-contain"
                                />
                                <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                              </button>
                              <button
                                onClick={() => handleOpenAttendeeSignature(att)}
                                className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                title="Rekam ulang tanda tangan warga ini"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAttendeeSignature(att)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                              title="Rekam tanda tangan digital warga ini"
                            >
                              <PenTool className="w-3 h-3 text-amber-600" />
                              + Rekam TTD
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteAttendance(att.id)}
                            title="Hapus presensi"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTULEN & KEPUTUSAN */}
      {activeTab === 'notulen' && (
        <div className="space-y-6">
          {saveAlert && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Notulen dan hasil keputusan berhasil disimpan!
              </span>
              <button onClick={() => setSaveAlert(false)} className="text-emerald-700 hover:text-emerald-900">
                Tutup
              </button>
            </div>
          )}

          {/* Section: Jalannya Rapat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Catatan Jalannya Musyawarah (Notulen Lengkap)
              </h3>
              <span className="text-[11px] text-slate-400">
                Pencatat: {meeting.notary}
              </span>
            </div>

            <textarea
              rows={8}
              placeholder="Tuliskan jalannya musyawarah, penyampaian aspirasi warga, tanggapan pengurus, dan kronologi rapat..."
              value={minutesText}
              onChange={(e) => {
                setMinutesText(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full p-4 text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Section: Keputusan Bersama / Mufakat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Poin Hasil Kesepakatan / Mufakat Bersama
              </h3>
              <span className="text-xs text-slate-500">{decisions.length} Kesepakatan</span>
            </div>

            <div className="space-y-2">
              {decisions.map((dec, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-slate-800"
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="font-semibold leading-relaxed">{dec}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveDecision(idx)}
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
                placeholder="Tambah poin kesepakatan rapat baru..."
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDecision();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddDecision}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Poin
              </button>
            </div>
          </div>

          {/* Section: Action Items / Tindak Lanjut */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Rencana Tindak Lanjut (Action Plan & PIC)
              </h3>
              <span className="text-xs text-slate-500">{actionItems.length} Tindak Lanjut</span>
            </div>

            {actionItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="p-3 font-bold">Uraian Tugas</th>
                      <th className="p-3 font-bold w-44">PIC / Penanggung Jawab</th>
                      <th className="p-3 font-bold w-32">Batas Waktu</th>
                      <th className="p-3 font-bold text-center w-28">Status</th>
                      <th className="p-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {actionItems.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{act.task}</td>
                        <td className="p-3 text-slate-700">{act.pic}</td>
                        <td className="p-3 text-slate-500">{act.deadline}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActionStatus(act.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              act.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : act.status === 'Proses'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {act.status}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveActionItem(act.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add action item form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <input
                type="text"
                placeholder="Nama tugas/kegiatan..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Penanggung Jawab (PIC)..."
                value={newPic}
                onChange={(e) => setNewPic(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Budget Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Catatan Anggaran / Iuran Kas RT
            </h3>
            <textarea
              rows={2}
              placeholder="Catatan anggaran yang dibahas, saldo kas terkini, rincian biaya yang disepakati..."
              value={budgetNotes}
              onChange={(e) => {
                setBudgetNotes(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Save button floating bar */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveNotulen}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan Notulen & Hasil Musyawarah
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SUSUNAN ACARA & AGENDAS */}
      {activeTab === 'agenda' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Susunan Acara Musyawarah</h3>
            <p className="text-xs text-slate-500">Centang agenda yang telah selesai dibahas selama musyawarah berlangsung</p>
          </div>

          <div className="space-y-2">
            {meeting.agenda.map((agenda, idx) => {
              const isChecked = completedAgendas.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleAgendaCompleted(idx)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-slate-500 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <button type="button" className="shrink-0 text-emerald-600">
                    {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </button>
                  <span className="font-bold w-6">{idx + 1}.</span>
                  <span className="font-medium text-sm flex-1">{agenda}</span>
                  {isChecked && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded no-underline">
                      Selesai
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DOKUMENTASI FOTO */}
      {activeTab === 'foto' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dokumentasi Foto Kegiatan Musyawarah</h3>
            <p className="text-xs text-slate-500">Unggah foto suasana rapat warga untuk dilampirkan dalam Berita Acara</p>
          </div>

          {/* Upload and URL input */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
              <Camera className="w-4 h-4" />
              Pilih Foto dari Galeri / Kamera
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <span className="text-xs text-slate-400">atau masukkan URL Foto:</span>

            <div className="flex-1 flex gap-2 min-w-[240px]">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddPhoto}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {meeting.photos.map((photo, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
              >
                <img
                  src={photo}
                  alt={`Dokumentasi ${idx + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1.5 bg-rose-600/90 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 bg-white text-[11px] text-slate-600 font-medium text-center">
                  Dokumentasi Kegiatan #{idx + 1}
                </div>
              </div>
            ))}

            {meeting.photos.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                Belum ada foto dokumentasi. Unggah foto suasana rapat RT warga di sini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STEMPEL DINAS & LEGALISASI PENGURUS */}
      {activeTab === 'legalisasi' && (
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-white border border-indigo-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stempel Dinas & Legalisasi Digital Pengurus RT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola stempel basah digital resmi dan rekam tanda tangan digital pengurus RT untuk keabsahan Berita Acara & Laporan Rapat.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Buka Pratinjau Cetak Berita Acara
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Stempel Dinas RT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Stempel Dinas RT Digital
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Cap Basah Sah
                  </span>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[180px] shadow-inner relative overflow-hidden">
                  <StampBadge config={currentStampConfig} />
                  <span className="text-[10px] text-slate-400 mt-3 font-medium">
                    Pratinjau Stempel Dinas pada Surat & Berita Acara
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Teks Lingkar Atas:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[180px]">{currentStampConfig.textTop}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Teks Tengah:</span>
                    <strong className="text-slate-800">{currentStampConfig.textMiddle}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Teks Lingkar Bawah:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[180px]">{currentStampConfig.textBottom}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Warna Tinta / Derajat:</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: currentStampConfig.color }} />
                      {currentStampConfig.rotation}° Kemiringan
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStampModalOpen(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Ubah Teks & Desain Stempel Dinas
              </button>
            </div>

            {/* Card 2: Susunan Tanda Tangan Digital Pengurus RT */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-600" />
                    Tanda Tangan Digital Pengurus & Penanggung Jawab
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rekam tanda tangan digital langsung melalui layar sentuh atau kursor mouse
                  </p>
                </div>

                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {[meeting.leaderSignature, meeting.notarySignature, meeting.bendaharaSignature, meeting.rwSignature].filter(Boolean).length} / 4 Pengurus
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Ketua RT */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Pimpinan Musyawarah
                      </span>
                      {meeting.leaderSignature ? (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sah Terekam
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum Terekam
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">{meeting.leader}</h5>
                    <p className="text-[11px] text-slate-500">Ketua RT {profile.rtNumber}</p>

                    <div className="mt-2 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      {meeting.leaderSignature ? (
                        <img
                          src={meeting.leaderSignature}
                          alt="TTD Ketua RT"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada tanda tangan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Ketua RT',
                          targetName: meeting.leader,
                          targetRole: `Pimpinan Musyawarah / Ketua RT ${profile.rtNumber}`,
                          type: 'leader',
                          initialSig: meeting.leaderSignature,
                        })
                      }
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" />
                      {meeting.leaderSignature ? 'Ubah TTD' : 'Rekam TTD'}
                    </button>
                    {meeting.leaderSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateMeeting({ ...meeting, leaderSignature: undefined });
                          setToastMessage('Tanda tangan Ketua RT dihapus.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus tanda tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Sekretaris RT */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Notulis Rapat
                      </span>
                      {meeting.notarySignature ? (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sah Terekam
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum Terekam
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">{meeting.notary}</h5>
                    <p className="text-[11px] text-slate-500">Sekretaris RT {profile.rtNumber}</p>

                    <div className="mt-2 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      {meeting.notarySignature ? (
                        <img
                          src={meeting.notarySignature}
                          alt="TTD Sekretaris"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada tanda tangan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Sekretaris RT',
                          targetName: meeting.notary,
                          targetRole: `Notulis Musyawarah / Sekretaris RT ${profile.rtNumber}`,
                          type: 'notary',
                          initialSig: meeting.notarySignature,
                        })
                      }
                      className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" />
                      {meeting.notarySignature ? 'Ubah TTD' : 'Rekam TTD'}
                    </button>
                    {meeting.notarySignature && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateMeeting({ ...meeting, notarySignature: undefined });
                          setToastMessage('Tanda tangan Sekretaris dihapus.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus tanda tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Bendahara RT */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        Keuangan & Anggaran
                      </span>
                      {meeting.bendaharaSignature ? (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sah Terekam
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Opsional
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">{profile.bendahara || 'Bendahara RT'}</h5>
                    <p className="text-[11px] text-slate-500">Bendahara RT {profile.rtNumber}</p>

                    <div className="mt-2 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      {meeting.bendaharaSignature ? (
                        <img
                          src={meeting.bendaharaSignature}
                          alt="TTD Bendahara"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada tanda tangan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Bendahara RT',
                          targetName: profile.bendahara || 'Bendahara RT',
                          targetRole: `Bendahara RT ${profile.rtNumber}`,
                          type: 'bendahara',
                          initialSig: meeting.bendaharaSignature,
                        })
                      }
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" />
                      {meeting.bendaharaSignature ? 'Ubah TTD' : 'Rekam TTD'}
                    </button>
                    {meeting.bendaharaSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateMeeting({ ...meeting, bendaharaSignature: undefined });
                          setToastMessage('Tanda tangan Bendahara dihapus.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus tanda tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Mengetahui Ketua RW */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Mengetahui
                      </span>
                      {meeting.rwSignature ? (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sah Terekam
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Opsional
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">Ketua RW {profile.rwNumber}</h5>
                    <p className="text-[11px] text-slate-500">Legalitas Lingkungan RW {profile.rwNumber}</p>

                    <div className="mt-2 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      {meeting.rwSignature ? (
                        <img
                          src={meeting.rwSignature}
                          alt="TTD Ketua RW"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada tanda tangan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSigCaptureState({
                          isOpen: true,
                          title: 'Rekam Tanda Tangan Ketua RW',
                          targetName: `Ketua RW ${profile.rwNumber}`,
                          targetRole: `Mengetahui / Ketua RW ${profile.rwNumber}`,
                          type: 'rw',
                          initialSig: meeting.rwSignature,
                        })
                      }
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" />
                      {meeting.rwSignature ? 'Ubah TTD' : 'Rekam TTD'}
                    </button>
                    {meeting.rwSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateMeeting({ ...meeting, rwSignature: undefined });
                          setToastMessage('Tanda tangan Ketua RW dihapus.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus tanda tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stamp Customizer Modal */}
      <StampCustomizerModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        config={currentStampConfig}
        onSave={handleSaveStamp}
      />

      {/* Signature Capture Modal (Pengurus & Peserta) */}
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

      {/* Signature Preview Modal */}
      {previewSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Tanda Tangan Digital Kehadiran
            </h4>
            <p className="text-xs text-slate-500">{previewSignature.name}</p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <img
                src={previewSignature.url}
                alt="Signature Preview"
                className="max-h-36 mx-auto object-contain"
              />
            </div>

            <button
              onClick={() => setPreviewSignature(null)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
