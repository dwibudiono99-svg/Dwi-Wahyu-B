import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Phone,
  MapPin,
  Check,
  Shield,
  PenTool,
  Image,
  Sliders,
  Trash2,
  Edit,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { RTProfile, StampConfig } from '../types/meeting';
import { StampBadge } from './StampBadge';
import { StampCustomizerModal } from './StampCustomizerModal';
import { SignatureCaptureModal } from './SignatureCaptureModal';

interface RTSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RTProfile;
  onSaveProfile: (profile: RTProfile) => void;
}

export const RTSettingsModal: React.FC<RTSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<RTProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'umum' | 'kop_logo' | 'stempel_ttd'>('umum');

  // Stempel & Signature modal states
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [sigCaptureState, setSigCaptureState] = useState<{
    isOpen: boolean;
    title: string;
    targetName: string;
    targetRole?: string;
    roleKey: 'ketuaRtSignature' | 'sekretarisSignature' | 'bendaharaSignature';
    initialSig?: string;
  }>({
    isOpen: false,
    title: '',
    targetName: '',
    roleKey: 'ketuaRtSignature',
  });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            logoUrl: reader.result as string,
            logoType: 'custom',
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentStampConfig: StampConfig = formData.stampConfig || {
    textTop: `PENGURUS RUKUN TETANGGA ${formData.rtNumber || '004'}`,
    textMiddle: `RW ${formData.rwNumber || '008'}`,
    textBottom: `KELURAHAN ${(formData.kelurahan || 'SUKAMAJU').toUpperCase()}`,
    color: '#4338ca',
    rotation: -12,
    size: 105,
  };

  const handleSaveStamp = (newConfig: StampConfig) => {
    setFormData((prev) => ({
      ...prev,
      stampConfig: newConfig,
    }));
  };

  const handleSaveCapturedSignature = (dataUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      [sigCaptureState.roleKey]: dataUrl,
    }));
    setSigCaptureState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Identitas & Persuratan RT
              </h3>
              <p className="text-xs text-slate-500">
                Kelola nomor RT/RW, susunan pengurus, logo kop surat, stempel, dan tanda tangan digital master
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('umum')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'umum'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Wilayah & Pengurus RT
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kop_logo')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kop_logo'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Logo Kop Surat & Tinggi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stempel_ttd')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stempel_ttd'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Stempel & TTD Master Pengurus
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: WILAYAH & PENGURUS */}
          {activeTab === 'umum' && (
            <div className="space-y-4">
              {/* RT & RW Numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor RT *</label>
                  <input
                    type="text"
                    required
                    placeholder="004"
                    value={formData.rtNumber}
                    onChange={(e) => setFormData({ ...formData, rtNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor RW *</label>
                  <input
                    type="text"
                    required
                    placeholder="008"
                    value={formData.rwNumber}
                    onChange={(e) => setFormData({ ...formData, rwNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Komplek / Lingkungan / Dusun</label>
                <input
                  type="text"
                  placeholder="Contoh: Komplek Griya Mandiri"
                  value={formData.dusun || ''}
                  onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Wilayah Administratif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelurahan / Desa *</label>
                  <input
                    type="text"
                    required
                    value={formData.kelurahan}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kecamatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten *</label>
                  <input
                    type="text"
                    required
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.kodePos}
                    onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Susunan Pengurus */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Susunan Pengurus RT:</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Ketua RT *</label>
                    <input
                      type="text"
                      required
                      value={formData.ketuaRt}
                      onChange={(e) => setFormData({ ...formData, ketuaRt: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Sekretaris RT *</label>
                    <input
                      type="text"
                      required
                      value={formData.sekretaris}
                      onChange={(e) => setFormData({ ...formData, sekretaris: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Bendahara RT</label>
                    <input
                      type="text"
                      value={formData.bendahara}
                      onChange={(e) => setFormData({ ...formData, bendahara: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. Kontak / Hotline RT</label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={formData.kontakRt}
                      onChange={(e) => setFormData({ ...formData, kontakRt: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO KOP SURAT & TINGGI LOGO */}
          {activeTab === 'kop_logo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                <p className="text-slate-700 leading-relaxed">
                  Logo ini akan dicantumkan secara resmi pada Kop Surat Berita Acara Rapat, Daftar Hadir, dan Surat Edaran RT.
                </p>
              </div>

              {/* Tipe Lambang */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Pilihan Jenis Logo Kop Surat:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'garuda', label: 'Garuda Pancasila', desc: 'Standar Resmi Naskah Dinas RI' },
                    { id: 'rt', label: 'Emblem Baku RT', desc: `Bulatan Lambang RT ${formData.rtNumber}` },
                    { id: 'custom', label: 'Logo Custom RT / Pemda', desc: 'Unggah gambar logo sendiri' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoType: item.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        (formData.logoType || 'garuda') === item.id
                          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 font-bold text-emerald-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unggah Custom Logo */}
              {formData.logoType === 'custom' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block font-bold text-slate-800">Unggah Gambar Logo (PNG / JPG / SVG):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />

                  {formData.logoUrl && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <img
                          src={formData.logoUrl}
                          alt="Logo RT"
                          style={{ height: `${formData.logoHeight || 80}px`, maxWidth: '140px', objectFit: 'contain' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                        className="text-rose-600 hover:text-rose-700 underline text-xs font-semibold cursor-pointer"
                      >
                        Hapus logo kustom
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Setelan Tinggi Logo */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    Setelan Tinggi Logo Kop Surat:
                  </label>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {formData.logoHeight || 80} px ({((formData.logoHeight || 80) * 0.0264).toFixed(1)} cm)
                  </span>
                </div>

                <input
                  type="range"
                  min={45}
                  max={140}
                  step={2}
                  value={formData.logoHeight || 80}
                  onChange={(e) => setFormData({ ...formData, logoHeight: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Kecil (60px)', val: 60 },
                    { label: 'Dinas (80px)', val: 80 },
                    { label: 'Besar (100px)', val: 100 },
                    { label: 'Maksimal (120px)', val: 120 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoHeight: p.val })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        (formData.logoHeight || 80) === p.val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEMPEL DINAS & TTD DIGITAL MASTER */}
          {activeTab === 'stempel_ttd' && (
            <div className="space-y-6">
              {/* Bagian Stempel Dinas RT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-dashed border-slate-300 shadow-2xs shrink-0">
                    <StampBadge config={currentStampConfig} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Stempel Dinas Resmi RT (Master)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stempel ini otomatis digunakan untuk seluruh rapat dan berita acara musyawarah RT.
                    </p>
                    <div className="mt-1.5 text-[10px] text-indigo-700 font-semibold">
                      Teks: {currentStampConfig.textTop} • {currentStampConfig.textMiddle} • {currentStampConfig.textBottom}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStampModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Ubah Desain Stempel
                </button>
              </div>

              {/* Master Tanda Tangan Pengurus */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-emerald-600" />
                  Master Tanda Tangan Digital Pengurus RT (Tersimpan Otomatis):
                </h4>
                <p className="text-[11px] text-slate-500">
                  Rekam tanda tangan digital pengurus agar dapat langsung dibubuhkan ke setiap dokumen tanpa perlu menggambar berulang kali.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* 1. Ketua RT */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">Ketua RT</span>
                        {formData.ketuaRtSignature ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Tersimpan
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Belum Ada</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold truncate">{formData.ketuaRt}</p>

                      <div className="mt-2 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden">
                        {formData.ketuaRtSignature ? (
                          <img
                            src={formData.ketuaRtSignature}
                            alt="TTD Master Ketua RT"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Klik rekam tanda tangan</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSigCaptureState({
                            isOpen: true,
                            title: 'Rekam Master TTD Ketua RT',
                            targetName: formData.ketuaRt,
                            targetRole: 'Ketua RT (Master)',
                            roleKey: 'ketuaRtSignature',
                            initialSig: formData.ketuaRtSignature,
                          })
                        }
                        className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3 h-3" />
                        {formData.ketuaRtSignature ? 'Ubah TTD' : 'Rekam TTD'}
                      </button>
                      {formData.ketuaRtSignature && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, ketuaRtSignature: undefined })}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus tanda tangan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Sekretaris RT */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">Sekretaris RT</span>
                        {formData.sekretarisSignature ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Tersimpan
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Belum Ada</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold truncate">{formData.sekretaris}</p>

                      <div className="mt-2 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden">
                        {formData.sekretarisSignature ? (
                          <img
                            src={formData.sekretarisSignature}
                            alt="TTD Master Sekretaris RT"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Klik rekam tanda tangan</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSigCaptureState({
                            isOpen: true,
                            title: 'Rekam Master TTD Sekretaris RT',
                            targetName: formData.sekretaris,
                            targetRole: 'Sekretaris RT (Master)',
                            roleKey: 'sekretarisSignature',
                            initialSig: formData.sekretarisSignature,
                          })
                        }
                        className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3 h-3" />
                        {formData.sekretarisSignature ? 'Ubah TTD' : 'Rekam TTD'}
                      </button>
                      {formData.sekretarisSignature && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sekretarisSignature: undefined })}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus tanda tangan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Bendahara RT */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">Bendahara RT</span>
                        {formData.bendaharaSignature ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Tersimpan
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Belum Ada</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold truncate">{formData.bendahara || 'Bendahara'}</p>

                      <div className="mt-2 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden">
                        {formData.bendaharaSignature ? (
                          <img
                            src={formData.bendaharaSignature}
                            alt="TTD Master Bendahara RT"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Klik rekam tanda tangan</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSigCaptureState({
                            isOpen: true,
                            title: 'Rekam Master TTD Bendahara RT',
                            targetName: formData.bendahara || 'Bendahara RT',
                            targetRole: 'Bendahara RT (Master)',
                            roleKey: 'bendaharaSignature',
                            initialSig: formData.bendaharaSignature,
                          })
                        }
                        className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3 h-3" />
                        {formData.bendaharaSignature ? 'Ubah TTD' : 'Rekam TTD'}
                      </button>
                      {formData.bendaharaSignature && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, bendaharaSignature: undefined })}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus tanda tangan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Submit & Cancel */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Perubahan akan otomatis diterapkan ke seluruh persuratan RT
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Simpan Identitas & Format RT
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stamp Customizer Modal inside RT Settings */}
      <StampCustomizerModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        config={currentStampConfig}
        onSave={handleSaveStamp}
      />

      {/* Signature Capture Modal inside RT Settings */}
      <SignatureCaptureModal
        isOpen={sigCaptureState.isOpen}
        onClose={() => setSigCaptureState((prev) => ({ ...prev, isOpen: false }))}
        title={sigCaptureState.title}
        targetName={sigCaptureState.targetName}
        targetRole={sigCaptureState.targetRole}
        initialSignature={sigCaptureState.initialSig}
        onSave={handleSaveCapturedSignature}
      />
    </div>
  );
};
