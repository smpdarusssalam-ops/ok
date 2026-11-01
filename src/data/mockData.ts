import { UserAccount, ExamSettings, BaseQuestion } from '../types/cbt';

export const DEFAULT_EXAM_SETTINGS: ExamSettings = {
  namaTes: 'SIMULASI ANBK PUSMENJAR TAHUN 2026/2027',
  token: 'PUSMEN26',
  durasiMenit: 15, // 15 menit per subtes for quick testing & realistic flow
  durasiJedaMenit: 1, // 1 menit jeda antar mapel (with skip button)
  tahunAjaran: '2026/2027',
  allowSkipJeda: true,
};

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    username: 'peserta01',
    password: 'password123',
    nama: 'SITI AFIFAH NURHAYATI',
    nik: '3201145608020003',
    kelas: 'IX - A (SMP)',
    sekolah: 'SMP NEGERI 1 TELADAN',
    tglLahir: '2010-05-18',
  },
  {
    username: 'siswa02',
    password: 'password123',
    nama: 'AHMAD RIZKY PRATAMA',
    nik: '3201146709030005',
    kelas: 'IX - B (SMP)',
    sekolah: 'SMP NEGERI 1 TELADAN',
    tglLahir: '2010-08-24',
  },
  {
    username: 'admincbt',
    password: 'admin123',
    nama: 'PROKTOR / PENGAWAS PUSMENJAR',
    nik: '198402152010011002',
    kelas: 'RUANG UJIAN LAB 01',
    sekolah: 'PUSAT ASESMEN PENDIDIKAN',
    tglLahir: '1984-02-15',
  },
];

export interface ExamQuestionItem extends BaseQuestion {
  opsiA?: string;
  opsiB?: string;
  opsiC?: string;
  opsiD?: string;
  opsiE?: string;
  leftItems?: string[]; // For MENJODOHKAN: labels for left items
  rightItems?: string[]; // For MENJODOHKAN: labels for right items
}

export const EXAM_DATA: Record<string, ExamQuestionItem[]> = {
  'Literasi Membaca': [
    {
      id: 'lit_1',
      subtest: 'Literasi Membaca',
      tipe: 'PG',
      stimulus: `<b>Hutan Mangrove: Benteng Hijau Pesisir Indonesia</b><br>
Indonesia memiliki hutan mangrove seluas lebih dari 3,3 juta hektare atau sekitar 20% dari total mangrove di dunia. Mangrove memiliki akar tunjang kokoh yang mampu memecah gelombang pasang dan menahan abrasi pantai. Selain itu, ekosistem mangrove mampu menyimpan karbon (dikenal sebagai <i>Blue Carbon</i>) hingga lima kali lebih besar dibandingkan hutan tropis di daratan. Keberadaan mangrove juga menjadi tempat berkembang biak udang, kepiting bakau, dan ikan kecil sebelum bermigrasi ke laut lepas.`,
      pertanyaan: 'Berdasarkan teks di atas, apa fungsi utama dari akar tunjang mangrove bagi garis pantai?',
      opsiA: 'Menghasilkan garam alami untuk nutrisi ikan',
      opsiB: 'Memecah gelombang pasang serta mencegah terjadinya abrasi pantai',
      opsiC: 'Menyaring air laut menjadi air tawar bagi nelayan',
      opsiD: 'Mencegah kapal nelayan berlabuh di pesisir pantai',
      opsiE: 'Menghangatkan suhu air laut saat musim dingin',
      kunciJawaban: 'B',
      bobot: 1,
    },
    {
      id: 'lit_2',
      subtest: 'Literasi Membaca',
      tipe: 'PG_KOMPLEKS',
      stimulus: `<b>Konservasi dan Pemanfaatan Berkelanjutan</b><br>
Pemerintah dan komunitas pesisir telah mengembangkan ecotourism (ekowisata) di kawasan mangrove Kulon Progo dan Muara Gembong. Dengan adanya jalur pejalan kaki kayu (canopy boardwalk), wisatawan dapat belajar tentang keanekaragaman flora dan fauna tanpa merusak habitat liar. Warga sekitar juga mendapatkan pemasukan tambahan dari penyewaan perahu dan penjualan sirup buah mangrove (pidada).`,
      pertanyaan: 'Pilihlah DUA atau LEBIH pernyataan yang mencerminkan manfaat positif ekowisata mangrove!',
      opsiA: 'Meningkatkan kesadaran masyarakat tentang pelestarian lingkungan pesisir',
      opsiB: 'Memberikan alternatif pendapatan ekonomi yang ramah lingkungan bagi warga',
      opsiC: 'Mendorong penebangan pohon mangrove untuk dibangun gedung hotel mewah',
      opsiD: 'Menyediakan sarana edukasi bagi generasi muda tentang ekosistem pesisir',
      opsiE: 'Menghentikan seluruh aktivitas perikanan warga setempat secara permanen',
      kunciJawaban: 'A,B,D',
      bobot: 2,
    },
    {
      id: 'lit_3',
      subtest: 'Literasi Membaca',
      tipe: 'MENJODOHKAN',
      stimulus: 'Akar Tunjang, Daun & Buah Pidada, Sedimen Blue Carbon',
      pertanyaan: 'Hubungkan istilah komponen ekosistem mangrove di kolom KIRI dengan manfaat atau karakteristiknya di kolom KANAN!',
      opsiA: 'Menahan abrasi & pemecah ombak',
      opsiB: 'Diolah menjadi sirup & penganan khas',
      opsiC: 'Menyimpan karbon 5x lebih banyak dari darat',
      leftItems: ['Akar Tunjang', 'Buah Pidada', 'Sedimen Tanah'],
      rightItems: [
        'Menahan abrasi pesisir',
        'Bahan sirup & pangan lokal',
        'Penyimpan karbon Blue Carbon',
      ],
      kunciJawaban: '0-0,1-1,2-2',
      bobot: 2,
    },
    {
      id: 'lit_4',
      subtest: 'Literasi Membaca',
      tipe: 'BENAR_SALAH',
      stimulus: `Hasil penelitian Badan Restorasi Gambut dan Mangrove (BRGM) menunjukkan bahwa penanaman mangrove dengan melibatkan partisipasi masyarakat lokal menghasilkan tingkat kelulushidupan bibit mencapai 85%, jauh lebih tinggi dibanding proyek penanaman tanpa pendampingan warga.`,
      pertanyaan: 'Pernyataan: "Keterlibatan masyarakat lokal secara aktif berkorelasi positif dengan tingginya tingkat keberhasilan hidup bibit mangrove."',
      opsiA: 'BENAR',
      opsiB: 'SALAH',
      kunciJawaban: 'A',
      bobot: 1,
    },
  ],

  'Numerasi': [
    {
      id: 'num_1',
      subtest: 'Numerasi',
      tipe: 'PG',
      stimulus: `<b>Promo Spesial Hari Kemerdekaan Toko Buku 'Cendekia'</b><br>
Toko Buku Cendekia memberikan promo potongan harga untuk paket perlengkapan sekolah:
• Paket Hemat A: Harga normal Rp120.000, diskon 25%.
• Paket Pintar B: Harga normal Rp180.000, diskon 30%.
• Jika berbelanja total setelah diskon minimal Rp150.000, pembeli mendapatkan kupon potongan tunai tambahan sebesar Rp15.000.`,
      pertanyaan: 'Berapakah harga yang harus dibayar seorang siswa jika hanya membeli 1 Paket Hemat A?',
      opsiA: 'Rp85.000',
      opsiB: 'Rp90.000',
      opsiC: 'Rp95.000',
      opsiD: 'Rp100.000',
      opsiE: 'Rp105.000',
      kunciJawaban: 'B', // 120.000 - 25% = 90.000
      bobot: 1,
    },
    {
      id: 'num_2',
      subtest: 'Numerasi',
      tipe: 'PG_KOMPLEKS',
      stimulus: `Andi membeli 1 Paket Hemat A (Harga normal Rp120.000, diskon 25%) dan 1 Paket Pintar B (Harga normal Rp180.000, diskon 30%).<br>
Ingat: jika total setelah diskon ≥ Rp150.000, Andi berhak mendapatkan kupon potongan tunai tambahan Rp15.000.`,
      pertanyaan: 'Pilihlah semua pernyataan matematika berikut yang BENAR!',
      opsiA: 'Harga Paket Pintar B setelah diskon adalah Rp126.000',
      opsiB: 'Total belanjaan Andi sebelum kupon tambahan adalah Rp216.000',
      opsiC: 'Andi berhak mendapatkan kupon potongan tunai tambahan Rp15.000',
      opsiD: 'Total uang yang harus dibayar Andi di kasir akhir adalah Rp201.000',
      opsiE: 'Diskon Paket Pintar B setara dengan penghematan Rp60.000',
      kunciJawaban: 'A,B,C,D', // Paket B: 180k*0.7=126k. Paket A: 90k. Total=216k. Diskon tambahan 15k -> 201k.
      bobot: 2,
    },
    {
      id: 'num_3',
      subtest: 'Numerasi',
      tipe: 'MENJODOHKAN',
      stimulus: '1/4, 3/5, 75%',
      pertanyaan: 'Jodohkan bentuk pecahan atau persentase di kolom KIRI dengan bentuk desimal yang nilainya senilai di kolom KANAN!',
      opsiA: '0,25',
      opsiB: '0,60',
      opsiC: '0,75',
      leftItems: ['Pecahan 1/4', 'Pecahan 3/5', 'Persentase 75%'],
      rightItems: ['Desimal 0,25', 'Desimal 0,60', 'Desimal 0,75'],
      kunciJawaban: '0-0,1-1,2-2',
      bobot: 2,
    },
    {
      id: 'num_4',
      subtest: 'Numerasi',
      tipe: 'BENAR_SALAH',
      stimulus: `Sebuah bak mandi berbentuk balok memiliki ukuran panjang 100 cm, lebar 80 cm, dan tinggi 60 cm. Bak tersebut diisi air dari kran dengan debit 20 liter per menit. (Catatan: 1.000 cm³ = 1 liter).`,
      pertanyaan: 'Pernyataan: "Waktu yang dibutuhkan untuk mengisi bak mandi dari keadaan kosong hingga terisi penuh adalah tepat 24 menit."',
      opsiA: 'BENAR',
      opsiB: 'SALAH',
      kunciJawaban: 'A', // Volume = 100 * 80 * 60 = 480.000 cm³ = 480 liter. 480 / 20 = 24 menit.
      bobot: 1,
    },
  ],

  'Survei Karakter': [
    {
      id: 'kar_1',
      subtest: 'Survei Karakter',
      tipe: 'PG',
      stimulus: `Saat kerja bakti kebersihan lingkungan sekolah menjelang penilaian Adiwiyata, kelompok Anda ditugaskan membersihkan taman dan memilah sampah plastik. Salah satu anggota kelompok tampak pasif dan hanya bermain ponsel di bawah pohon.`,
      pertanyaan: 'Tindakan yang paling mencerminkan karakter gotong royong dan kepemimpinan yang bijak adalah...',
      opsiA: 'Memarahinya di depan umum agar dia merasa malu',
      opsiB: 'Mengajaknya berdialog secara santun, membagi tugas spesifik yang bisa ia kerjakan bersama-sama',
      opsiC: 'Melaporkannya langsung kepada kepala sekolah agar diberi sanksi skorsing',
      opsiD: 'Membiarkannya saja dan mengerjakan semua tugasnya seorang diri',
      opsiE: 'Ikut berhenti bekerja dan ikut bermain ponsel bersamanya',
      kunciJawaban: 'B',
      bobot: 1,
    },
    {
      id: 'kar_2',
      subtest: 'Survei Karakter',
      tipe: 'PG_KOMPLEKS',
      stimulus: `Nilai-nilai Profil Pelajar Pancasila meliputi: Beriman dan Bertakwa kepada Tuhan YME, Berkebinekaan Global, Bergotong Royong, Mandiri, Bernalar Kritis, dan Kreatif.`,
      pertanyaan: 'Pilihlah contoh sikap yang mencerminkan profil "Bernalar Kritis" dalam kehidupan sehari-hari!',
      opsiA: 'Memeriksa kebenaran dan sumber informasi sebelum membagikan berita di grup pesan singkat',
      opsiB: 'Menerima begitu saja semua klaim kesehatan di media sosial tanpa mengecek fakta ilmiah',
      opsiC: 'Berani mengajukan pertanyaan reflektif dan menganalisis argumentasi secara objektif',
      opsiD: 'Mampu membedakan antara fakta teruji dan opini subjektif',
      opsiE: 'Menolak semua pendapat teman yang berbeda suku atau keyakinan',
      kunciJawaban: 'A,C,D',
      bobot: 2,
    },
  ],
};
