import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send, FileText, Users, Calendar } from 'lucide-react';
import { Meeting, RTProfile } from '../types/meeting';
import {
  generateWhatsAppInvitation,
  generateWhatsAppMinutes,
  generateWhatsAppAttendanceSummary,
} from '../utils/formatters';

interface WhatsAppShareModalProps {
  meeting: Meeting;
  profile: RTProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  meeting,
  profile,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'undangan' | 'notulen' | 'presensi'>('notulen');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}${window.location.pathname}?presensi=${meeting.id}`;

  const getText = () => {
    switch (activeTab) {
      case 'undangan':
        return generateWhatsAppInvitation(meeting, profile, publicUrl);
      case 'notulen':
        return generateWhatsAppMinutes(meeting, profile);
      case 'presensi':
        return generateWhatsAppAttendanceSummary(meeting, profile);
    }
  };

  const currentText = getText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(currentText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bagikan ke WhatsApp RT</h3>
              <p className="text-xs text-slate-500">Format pesan otomatis rapi untuk dikirim ke grup warga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-2 bg-white">
          <button
            onClick={() => setActiveTab('notulen')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'notulen'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Notulen & Keputusan
          </button>

          <button
            onClick={() => setActiveTab('undangan')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'undangan'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Undangan Rapat
          </button>

          <button
            onClick={() => setActiveTab('presensi')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'presensi'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Rekap Daftar Hadir
          </button>
        </div>

        {/* Body Preview */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="relative">
            <div className="bg-[#0b141a]/95 text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-emerald-600 selection:text-white border border-emerald-950/40 shadow-inner max-h-[360px] overflow-y-auto">
              {currentText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Teks siap disalin atau diteruskan langsung
          </span>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin ke Clipboard!' : 'Salin Pesan'}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              Buka WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
