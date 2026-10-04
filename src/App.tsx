import React, { useState, useEffect } from 'react';
import {
  RTProfile,
  Citizen,
  Meeting,
  Attendance,
} from './types/meeting';
import {
  loadRTProfile,
  saveRTProfile,
  loadCitizens,
  saveCitizens,
  loadMeetings,
  saveMeetings,
  resetAllData,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { MeetingList } from './components/MeetingList';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingModal } from './components/MeetingModal';
import { CitizenManagementModal } from './components/CitizenManagementModal';
import { RTSettingsModal } from './components/RTSettingsModal';
import { QRCodeModal } from './components/QRCodeModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { OfficialPrintDocument } from './components/OfficialPrintDocument';
import { PublicPresensiForm } from './components/PublicPresensiForm';
import { Plus, Users, Calendar, QrCode } from 'lucide-react';

export default function App() {
  // Core state from storage
  const [profile, setProfile] = useState<RTProfile>(loadRTProfile);
  const [citizens, setCitizens] = useState<Citizen[]>(loadCitizens);
  const [meetings, setMeetings] = useState<Meeting[]>(loadMeetings);

  // Selected meeting for detail view
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Target meeting for QR / WhatsApp / Print / Public Presensi
  const [targetModalMeeting, setTargetModalMeeting] = useState<Meeting | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  // Public presensi screen state
  const [publicPresensiMeetingId, setPublicPresensiMeetingId] = useState<string | null>(null);

  // Check URL query parameters for direct public presensi access (e.g. ?presensi=m1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presensiId = params.get('presensi');
    if (presensiId) {
      setPublicPresensiMeetingId(presensiId);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveRTProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveCitizens(citizens);
  }, [citizens]);

  useEffect(() => {
    saveMeetings(meetings);
  }, [meetings]);

  // Active meeting getter
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || null;
  const currentPublicMeeting = meetings.find((m) => m.id === publicPresensiMeetingId) || null;

  // Handlers for Meetings
  const handleCreateMeeting = (meetingData: Partial<Meeting>) => {
    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      token: `token-${Date.now()}`,
      title: meetingData.title || 'Musyawarah Warga RT',
      category: meetingData.category || 'Rutin Bulanan',
      date: meetingData.date || new Date().toISOString().split('T')[0],
      startTime: meetingData.startTime || '19:30',
      endTime: meetingData.endTime || '21:30',
      location: meetingData.location || `Balai RT ${profile.rtNumber}`,
      leader: meetingData.leader || profile.ketuaRt,
      notary: meetingData.notary || profile.sekretaris,
      status: meetingData.status || 'Terjadwal',
      targetAttendeesCount: meetingData.targetAttendeesCount || 25,
      agenda: meetingData.agenda || ['Pembukaan', 'Pembahasan', 'Penutup'],
      minutes: '',
      decisions: [],
      actionItems: [],
      budgetNotes: meetingData.budgetNotes || '',
      photos: [],
      attendances: [],
    };

    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    setSelectedMeetingId(newMeeting.id);
  };

  const handleUpdateMeeting = (updated: Meeting) => {
    setMeetings(meetings.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter((m) => m.id !== id));
    if (selectedMeetingId === id) setSelectedMeetingId(null);
  };

  // Add Attendance (works from both Public Form and Admin)
  const handleAddAttendance = (meetingId: string, attendanceData: Omit<Attendance, 'id'>) => {
    const newAtt: Attendance = {
      ...attendanceData,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        // Avoid duplicate attendance for the same person if desired, or add to list
        return {
          ...m,
          attendances: [newAtt, ...m.attendances],
        };
      })
    );
  };

  // Citizen management handlers
  const handleAddCitizen = (newCitizen: Omit<Citizen, 'id'>) => {
    const citizen: Citizen = {
      ...newCitizen,
      id: `c-${Date.now()}`,
    };
    setCitizens([citizen, ...citizens]);
  };

  const handleDeleteCitizen = (id: string) => {
    setCitizens(citizens.filter((c) => c.id !== id));
  };

  const handleResetData = () => {
    const fresh = resetAllData();
    setProfile(fresh.profile);
    setCitizens(fresh.citizens);
    setMeetings(fresh.meetings);
    setSelectedMeetingId(null);
    setPublicPresensiMeetingId(null);
    setIsPrintView(false);
  };

  // If in Print View for Official Berita Acara & TTD
  if (isPrintView && (targetModalMeeting || selectedMeeting)) {
    const activeDocMeeting = targetModalMeeting || selectedMeeting!;
    return (
      <OfficialPrintDocument
        meeting={activeDocMeeting}
        profile={profile}
        onBack={() => setIsPrintView(false)}
      />
    );
  }

  // If in Public Presensi Mode (Citizens checking in from phone or tablet)
  if (currentPublicMeeting) {
    return (
      <PublicPresensiForm
        meeting={currentPublicMeeting}
        profile={profile}
        citizens={citizens}
        onAddAttendance={handleAddAttendance}
        onBackToAdmin={() => {
          // Clear query param if present
          window.history.replaceState({}, '', window.location.pathname);
          setPublicPresensiMeetingId(null);
        }}
      />
    );
  }

  // Default Admin / Pengurus RT Workspace
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        activeMeeting={selectedMeeting}
        onOpenCitizenModal={() => setIsCitizenModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCreateMeeting={() => setIsCreateModalOpen(true)}
        onOpenPublicPresensi={() => {
          const m = selectedMeeting || meetings[0];
          if (m) setPublicPresensiMeetingId(m.id);
        }}
        onResetData={handleResetData}
        onHomeClick={() => setSelectedMeetingId(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {selectedMeeting ? (
          /* Meeting Detail Workspace */
          <MeetingDetail
            meeting={selectedMeeting}
            profile={profile}
            citizens={citizens}
            onBack={() => setSelectedMeetingId(null)}
            onUpdateMeeting={handleUpdateMeeting}
            onOpenQR={() => {
              setTargetModalMeeting(selectedMeeting);
              setIsQRModalOpen(true);
            }}
            onOpenWhatsApp={() => {
              setTargetModalMeeting(selectedMeeting);
              setIsWhatsAppModalOpen(true);
            }}
            onOpenPrint={() => {
              setTargetModalMeeting(selectedMeeting);
              setIsPrintView(true);
            }}
            onOpenPublicPresensi={() => {
              setPublicPresensiMeetingId(selectedMeeting.id);
            }}
            onEditMeeting={() => setIsEditModalOpen(true)}
          />
        ) : (
          /* Meetings Dashboard & List */
          <div className="space-y-6">
            {/* Neighborhood Hero / Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-2">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 tracking-wide">
                  Musyawarah Mufakat & Guyub Rukun RT
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Pencatatan Rapat & Presensi Online RT {profile.rtNumber}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Kelola jadwal musyawarah warga, rekap presensi hadir dengan tanda tangan digital, buat notulen dan hasil keputusan, serta cetak Berita Acara resmi RT.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Jadwalkan Rapat RT
                  </button>

                  <button
                    onClick={() => {
                      const m = meetings[0];
                      if (m) setPublicPresensiMeetingId(m.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/90 border border-white/20 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer backdrop-blur-xs"
                  >
                    <QrCode className="w-4 h-4 text-emerald-300" />
                    Buka Presensi Warga
                  </button>

                  <button
                    onClick={() => setIsCitizenModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/90 border border-white/20 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer backdrop-blur-xs"
                  >
                    <Users className="w-4 h-4 text-emerald-300" />
                    Kelola Database Warga ({citizens.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Stats */}
            <DashboardStats
              meetings={meetings}
              citizens={citizens}
              profile={profile}
            />

            {/* Meetings List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Daftar Kegiatan Rapat & Musyawarah RT
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {meetings.length} Agenda Rapat
                </span>
              </div>

              <MeetingList
                meetings={meetings}
                profile={profile}
                onSelectMeeting={(m) => setSelectedMeetingId(m.id)}
                onCreateMeeting={() => setIsCreateModalOpen(true)}
                onDeleteMeeting={handleDeleteMeeting}
                onOpenQR={(m) => {
                  setTargetModalMeeting(m);
                  setIsQRModalOpen(true);
                }}
                onOpenWhatsApp={(m) => {
                  setTargetModalMeeting(m);
                  setIsWhatsAppModalOpen(true);
                }}
                onOpenPublicPresensi={(meetingId) => {
                  setPublicPresensiMeetingId(meetingId);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print mt-auto">
        <p className="font-medium text-slate-600">
          Sistem Notulen Rapat & Presensi Kehadiran Online • Rukun Tetangga (RT) {profile.rtNumber} / RW {profile.rwNumber}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Kelurahan {profile.kelurahan}, Kecamatan {profile.kecamatan}, {profile.kota} • Dilengkapi Tanda Tangan Digital & Format Berita Acara Resmi
        </p>
      </footer>

      {/* MODALS */}
      {/* Create Meeting Modal */}
      <MeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateMeeting}
        profile={profile}
      />

      {/* Edit Meeting Modal */}
      {isEditModalOpen && selectedMeeting && (
        <MeetingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedFields) => {
            handleUpdateMeeting({
              ...selectedMeeting,
              ...updatedFields,
            });
          }}
          initialMeeting={selectedMeeting}
          profile={profile}
        />
      )}

      {/* Citizen Management Modal */}
      <CitizenManagementModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        citizens={citizens}
        onAddCitizen={handleAddCitizen}
        onDeleteCitizen={handleDeleteCitizen}
        onResetCitizens={() => setCitizens(loadCitizens())}
      />

      {/* RT Settings Modal */}
      <RTSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={(newProf) => setProfile(newProf)}
      />

      {/* QR Code Presensi Modal */}
      {isQRModalOpen && targetModalMeeting && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          meeting={targetModalMeeting}
          profile={profile}
          onClose={() => {
            setIsQRModalOpen(false);
            setTargetModalMeeting(null);
          }}
          onOpenPublicPresensi={(meetingId) => {
            setPublicPresensiMeetingId(meetingId);
          }}
        />
      )}

      {/* WhatsApp Share Modal */}
      {isWhatsAppModalOpen && targetModalMeeting && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          meeting={targetModalMeeting}
          profile={profile}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setTargetModalMeeting(null);
          }}
        />
      )}
    </div>
  );
}
