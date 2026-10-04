import React from 'react';
import { Calendar, Users, Award, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Meeting, Citizen, RTProfile } from '../types/meeting';

interface DashboardStatsProps {
  meetings: Meeting[];
  citizens: Citizen[];
  profile: RTProfile;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  meetings,
  citizens,
  profile,
}) => {
  const ongoingMeetings = meetings.filter((m) => m.status === 'Berlangsung').length;
  const completedMeetings = meetings.filter((m) => m.status === 'Selesai').length;

  // Calculate average attendance rate
  let totalHadir = 0;
  let totalTarget = 0;
  meetings.forEach((m) => {
    const hadir = m.attendances.filter((a) => a.status === 'Hadir' || a.status === 'Hadir Online').length;
    totalHadir += hadir;
    totalTarget += m.targetAttendeesCount || 25;
  });
  const avgAttendance = totalTarget > 0 ? Math.round((totalHadir / totalTarget) * 100) : 0;

  // Total decisions made
  const totalDecisions = meetings.reduce((acc, m) => acc + (m.decisions?.length || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Rapat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Total Agenda Rapat</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{meetings.length}</span>
            {ongoingMeetings > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                {ongoingMeetings} Aktif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Database Warga RT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Warga / KK Terdaftar</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{citizens.length}</span>
            <span className="text-[11px] text-slate-400">KK RT {profile.rtNumber}</span>
          </div>
        </div>
      </div>

      {/* Rata-rata Kuorum */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Rata-rata Kuorum</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{avgAttendance}%</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Kehadiran</span>
          </div>
        </div>
      </div>

      {/* Keputusan Musyawarah Disepakati */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Kesepakatan Mufakat</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{totalDecisions}</span>
            <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full font-bold">
              Keputusan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
