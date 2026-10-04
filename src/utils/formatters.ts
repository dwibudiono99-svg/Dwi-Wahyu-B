import { Meeting, RTProfile } from '../types/meeting';

export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatTimeIndonesian = (timeStr?: string): string => {
  if (!timeStr) return '';
  return `${timeStr} WIB`;
};

export const formatDateTimeIndonesian = (isoStr: string): string => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d) + ' WIB';
  } catch {
    return isoStr;
  }
};

export const generateWhatsAppInvitation = (meeting: Meeting, profile: RTProfile, publicUrl: string): string => {
  const agendaList = meeting.agenda && meeting.agenda.length > 0 
    ? meeting.agenda.map((a, i) => `  ${i + 1}. ${a}`).join('\n')
    : '  - Pembahasan agenda lingkungan RT';

  return `*UNDANGAN MUSYAWARAH / RAPAT WARGA*
*PENGURUS RT ${profile.rtNumber} / RW ${profile.rwNumber}*
Kel. ${profile.kelurahan}, Kec. ${profile.kecamatan}
━━━━━━━━━━━━━━━━━━━━━━━

Kepada Yth.
*Bapak/Ibu/Sdr Warga RT ${profile.rtNumber}*
Di Tempat

Assalamu'alaikum Wr. Wb. / Salam Sejahtera,
Sehubungan dengan pentingnya kegiatan lingkungan RT, kami mengundang Bapak/Ibu sekalian untuk hadir dalam:

📌 *Acara:* ${meeting.title}
📁 *Kategori:* ${meeting.category}
🗓 *Hari/Tanggal:* ${formatDateIndonesian(meeting.date)}
⏰ *Waktu:* ${meeting.startTime} - ${meeting.endTime || 'Selesai'} WIB
📍 *Tempat:* ${meeting.location}
👤 *Pimpinan Rapat:* ${meeting.leader}

📝 *Agenda Pembahasan:*
${agendaList}

📲 *DAFTAR HADIR / PRESENSI ONLINE:*
Bapak/Ibu dapat mengisi daftar hadir online melalui tautan berikut:
${publicUrl}

Mengingat pentingnya musyawarah ini untuk kebaikan lingkungan bersama, kehadiran Bapak/Ibu warga sangat kami harapkan.

Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.

*Hormat kami,*
*Ketua RT ${profile.rtNumber}:* ${profile.ketuaRt}
*Sekretaris RT ${profile.rtNumber}:* ${profile.sekretaris}`;
};

export const generateWhatsAppMinutes = (meeting: Meeting, profile: RTProfile): string => {
  const hadirCount = meeting.attendances.filter(a => a.status === 'Hadir' || a.status === 'Hadir Online').length;
  const total = meeting.attendances.length;
  const decisionsList = meeting.decisions && meeting.decisions.length > 0
    ? meeting.decisions.map((d, i) => `✅ *${i + 1}.* ${d}`).join('\n')
    : '_Belum ada keputusan tercatat._';

  const actionList = meeting.actionItems && meeting.actionItems.length > 0
    ? meeting.actionItems.map((act, i) => `▫️ *${i + 1}.* ${act.task}\n   _PIC: ${act.pic} | Batas: ${act.deadline} | Status: [${act.status}]_`).join('\n')
    : '_Tidak ada tindak lanjut khusus._';

  return `*NOTULEN & HASIL KEPUTUSAN RAPAT RT ${profile.rtNumber}*
*RW ${profile.rwNumber}, Kel. ${profile.kelurahan}*
━━━━━━━━━━━━━━━━━━━━━━━

📌 *Rapat:* ${meeting.title}
🗓 *Tanggal:* ${formatDateIndonesian(meeting.date)}
⏰ *Waktu:* ${meeting.startTime} - ${meeting.endTime || 'Selesai'} WIB
📍 *Tempat:* ${meeting.location}
👥 *Kehadiran:* ${hadirCount} Warga Hadir (dari ${total} tercatat)
👤 *Pimpinan:* ${meeting.leader}
✍️ *Notulis:* ${meeting.notary}

━━━━━━━━━━━━━━━━━━━━━━━
📋 *POIN HASIL KESEPAKATAN / MUFAKAT:*
${decisionsList}

━━━━━━━━━━━━━━━━━━━━━━━
📌 *RENCANA TINDAK LANJUT (ACTION PLAN):*
${actionList}

${meeting.budgetNotes ? `💰 *Catatan Anggaran / Kas:*\n${meeting.budgetNotes}\n\n` : ''}Terima kasih kepada seluruh warga RT ${profile.rtNumber} yang telah meluangkan waktu dan berpartisipasi aktif dalam memajukan lingkungan kita bersama.

*Pengurus RT ${profile.rtNumber} / RW ${profile.rwNumber}*
Ketua RT: ${profile.ketuaRt}
Sekretaris: ${profile.sekretaris}`;
};

export const generateWhatsAppAttendanceSummary = (meeting: Meeting, profile: RTProfile): string => {
  const hadir = meeting.attendances.filter(a => a.status === 'Hadir');
  const online = meeting.attendances.filter(a => a.status === 'Hadir Online');
  const izin = meeting.attendances.filter(a => a.status === 'Izin' || a.status === 'Sakit');

  let list = `*REKAP DAFTAR HADIR RAPAT RT ${profile.rtNumber}*\n`;
  list += `*Kegiatan:* ${meeting.title}\n`;
  list += `*Tanggal:* ${formatDateIndonesian(meeting.date)}\n`;
  list += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  list += `*HADIR DI BALAI (${hadir.length}):*\n`;
  if (hadir.length === 0) list += `_Belum ada_\n`;
  hadir.forEach((a, i) => {
    list += `${i + 1}. ${a.name} (${a.houseNumber || '-'})\n`;
  });

  if (online.length > 0) {
    list += `\n*HADIR ONLINE (${online.length}):*\n`;
    online.forEach((a, i) => {
      list += `${i + 1}. ${a.name} (${a.houseNumber || '-'})\n`;
    });
  }

  if (izin.length > 0) {
    list += `\n*IZIN / SAKIT (${izin.length}):*\n`;
    izin.forEach((a, i) => {
      list += `${i + 1}. ${a.name} (${a.houseNumber || '-'}) - Ket: ${a.notes || 'Izin'}\n`;
    });
  }

  list += `\n*Total Tercatat:* ${meeting.attendances.length} orang\n`;
  list += `*Kuorum Kehadiran:* ${Math.round((hadir.length + online.length) / (meeting.targetAttendeesCount || 1) * 100)}% dari target ${meeting.targetAttendeesCount} KK`;

  return list;
};

export const exportAttendanceToCSV = (meeting: Meeting, profile: RTProfile): void => {
  const headers = ['No', 'Nama Warga', 'No Rumah / Blok', 'No Telepon', 'Status Kehadiran', 'Waktu Presensi', 'Keterangan / Perwakilan', 'Tanda Tangan'];
  
  const rows = meeting.attendances.map((att, idx) => [
    idx + 1,
    `"${(att.name || '').replace(/"/g, '""')}"`,
    `"${(att.houseNumber || '').replace(/"/g, '""')}"`,
    `"${(att.phone || '').replace(/"/g, '""')}"`,
    `"${att.status}"`,
    `"${formatDateTimeIndonesian(att.timestamp)}"`,
    `"${(att.notes || att.representedBy || '').replace(/"/g, '""')}"`,
    att.signature ? 'Ada Tanda Tangan' : 'Tanpa TTD',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + `Laporan Presensi Rapat RT ${profile.rtNumber} RW ${profile.rwNumber}\n`
    + `Kegiatan: "${meeting.title.replace(/"/g, '""')}"\n`
    + `Tanggal: ${meeting.date} ${meeting.startTime} WIB\n\n`
    + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Daftar_Hadir_RT${profile.rtNumber}_${meeting.date}_${meeting.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
