import { Meeting, RTProfile } from '../types/meeting';

export const getRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'I';
};

export const generateDefaultDocNumber = (meeting: Meeting, profile: RTProfile): string => {
  if (!meeting.date) return '001 / BA / RT / 2026';
  const parts = meeting.date.split('-');
  const year = parts[0] || '2026';
  const monthNum = parseInt(parts[1] || '1', 10) - 1;
  const roman = getRomanMonth(monthNum);
  const serial = meeting.id.replace(/\D/g, '').slice(-3) || '001';

  return `${serial.padStart(3, '0')} / BA.RT-${profile.rtNumber} / RW.${profile.rwNumber} / ${roman} / ${year}`;
};

export const getDayNameIndonesian = (dateStr: string): string => {
  if (!dateStr) return 'Hari ini';
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()] || 'Hari';
};

// Convert number to Indonesian words (terbilang)
export const terbilang = (n: number): string => {
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
  if (n < 200) return 'Seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
  return n.toString();
};

export const getFormalDatePhraze = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = getDayNameIndonesian(dateStr);
    const dayNum = d.getDate();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    return `hari ${dayName}, tanggal ${terbilang(dayNum).trim()} bulan ${month} tahun ${terbilang(year).trim()} (${dayNum} ${month} ${year})`;
  } catch {
    return dateStr;
  }
};
