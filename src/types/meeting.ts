export interface StampConfig {
  textTop: string;
  textMiddle: string;
  textBottom: string;
  color: string; // Hex color e.g. #4338ca (ungu/indigo resmi dinas)
  customStampImage?: string; // Data URL scan cap stempel asli
  rotation: number; // Derajat kemiringan (-25 s/d 25)
  size: number; // Diameter stempel dalam pixel (80 s/d 140)
  shape?: 'circle_double' | 'circle_single' | 'oval';
}

export interface RTProfile {
  rtNumber: string;
  rwNumber: string;
  dusun?: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  ketuaRt: string;
  sekretaris: string;
  bendahara: string;
  kontakRt: string;
  logoUrl?: string;
  logoHeight?: number; // Tinggi logo dalam pixel (misal: 80px)
  logoType?: 'garuda' | 'rt' | 'custom' | 'none';
  ketuaRtSignature?: string; // Default signature Ketua RT
  sekretarisSignature?: string; // Default signature Sekretaris
  bendaharaSignature?: string; // Default signature Bendahara
  stampConfig?: StampConfig;
}

export interface Citizen {
  id: string;
  name: string;
  houseNumber: string;
  phone: string;
  role: 'Kepala Keluarga' | 'Warga' | 'Pengurus RT' | 'Ibu PKK' | 'Karang Taruna' | 'Tamu';
  gender: 'L' | 'P';
}

export type AttendanceStatus = 'Hadir' | 'Hadir Online' | 'Izin' | 'Sakit';

export interface Attendance {
  id: string;
  meetingId: string;
  citizenId?: string;
  name: string;
  houseNumber: string;
  phone: string;
  status: AttendanceStatus;
  notes?: string;
  signature?: string; // Data URL PNG
  timestamp: string; // ISO String
  representedBy?: string; // e.g. "Diwakili Istri (Ny. Lina)"
}

export interface ActionItem {
  id: string;
  task: string;
  pic: string; // Penanggung Jawab
  deadline: string;
  status: 'Belum' | 'Proses' | 'Selesai';
}

export type MeetingStatus = 'Terjadwal' | 'Berlangsung' | 'Selesai';
export type MeetingCategory =
  | 'Rutin Bulanan'
  | 'Musyawarah Warga'
  | 'Rapat Pengurus'
  | 'Kerja Bakti & Lingkungan'
  | 'Keamanan & Ronda'
  | 'Peringatan Hari Besar / 17-an'
  | 'Darurat / Khusus';

export interface Meeting {
  id: string;
  title: string;
  category: MeetingCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  leader: string;
  notary: string;
  status: MeetingStatus;
  agenda: string[];
  minutes: string; // Jalannya rapat / notulen
  decisions: string[]; // Poin-poin kesepakatan / mufakat
  actionItems: ActionItem[];
  budgetNotes?: string;
  photos: string[];
  attendances: Attendance[];
  targetAttendeesCount: number; // Target KK hadir
  token: string; // Unique token for public presensi
  leaderSignature?: string; // Tanda tangan digital Ketua RT / Pimpinan
  notarySignature?: string; // Tanda tangan digital Notulis / Sekretaris
  bendaharaSignature?: string; // Tanda tangan digital Bendahara RT
  rwSignature?: string; // Tanda tangan Mengetahui Ketua RW
  stampConfig?: StampConfig; // Kustomisasi stempel per rapat
  requireDigitalSignature?: boolean; // Apakah tanda tangan wajib bagi setiap warga
  logoHeight?: number; // Kustomisasi tinggi logo pada berita acara rapat ini
}
