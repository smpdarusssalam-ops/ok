import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Printer,
  RotateCcw,
  LogOut,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { UserAccount, ExamSettings, CheatingViolation } from '../types/cbt';
import { ExamQuestionItem } from '../data/mockData';
import { calculateExamScore, isAnswerCorrect, getIntegrityRating } from '../utils/cbtLogic';
import { GasExportModal } from './GasExportModal';

interface ResultScreenProps {
  user: UserAccount;
  settings: ExamSettings;
  allQuestions: ExamQuestionItem[];
  jawabanSiswa: Record<string, string>;
  selfieDataUrl: string | null;
  violations?: CheatingViolation[];
  onRestart: () => void;
  onLogout: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  user,
  settings,
  allQuestions,
  jawabanSiswa,
  selfieDataUrl,
  violations = [],
  onRestart,
  onLogout,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [showGasModal, setShowGasModal] = useState(false);

  const scoreData = calculateExamScore(allQuestions, jawabanSiswa);

  // Grade categorization based on Indonesian Kemdikbud ANBK standards
  let kategoriCapaian = 'Perlu Intervensi Khusus';
  let badgeColor = 'bg-red-50 text-red-700 border-red-200';

  if (scoreData.finalScore >= 85) {
    kategoriCapaian = 'Mahir (Tingkat Lanjut)';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (scoreData.finalScore >= 70) {
    kategoriCapaian = 'Cakap (Kompeten)';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (scoreData.finalScore >= 50) {
    kategoriCapaian = 'Dasar (Mencukupi)';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="text-center mb-8 no-print">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Asesmen Berhasil Diselesaikan!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Seluruh jawaban Anda telah tersimpan dan terverifikasi di server Pusmenjar CBT.
        </p>
      </div>

      {/* Main Certificate / Kartu Hasil Nilai */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200/90 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-gray-200 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                LEMBAR HASIL ASESMEN NASIONAL (CBT)
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Pusat Asesmen Pendidikan • Kemdikbudristek RI
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
              Tahun Ajaran
            </span>
            <span className="text-sm font-bold text-gray-800 font-mono">{settings.tahunAjaran}</span>
          </div>
        </div>

        {/* Participant Profile & Verified Selfie */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-gray-50 border border-gray-200/70 mb-8">
          {/* Selfie Photo */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <div className="w-28 h-28 rounded-2xl border-3 border-blue-600 overflow-hidden shadow-sm bg-white mb-2 flex items-center justify-center">
              {selfieDataUrl ? (
                <img src={selfieDataUrl} alt="Foto Peserta" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
            </span>
          </div>

          {/* Details */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Nama Lengkap Peserta
              </span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{user.nama}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Nomor Induk Kependudukan (NIK)
              </span>
              <p className="font-mono font-bold text-gray-800">{user.nik}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Kelas & Asal Sekolah
              </span>
              <p className="font-semibold text-gray-800">{user.kelas} • {user.sekolah}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Waktu Penyelesaian
              </span>
              <p className="font-medium text-gray-700">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
            {/* Total Big Score */}
            <div className="sm:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col justify-between text-center shadow-md">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200 block">
                  Nilai Akhir Asesmen
                </span>
                <div className="text-6xl sm:text-7xl font-mono font-extrabold my-2 tracking-tight">
                  {scoreData.finalScore}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider block mb-1">
                  Kategori Capaian
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white text-blue-900 shadow-xs">
                  {kategoriCapaian}
                </span>
              </div>
            </div>

            {/* Subtests Breakdown */}
            <div className="sm:col-span-7 flex flex-col justify-between gap-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Rincian Skor Per Subtes:
              </span>

              {Object.entries(scoreData.perSubtest).map(([subtestName, val]) => (
                <div
                  key={subtestName}
                  className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-gray-900">{subtestName}</p>
                    <p className="text-[11px] text-gray-500">
                      Benar {val.correct} dari {val.total} butir soal
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-extrabold text-blue-700">{val.score}</span>
                    <span className="text-xs text-gray-500 ml-1">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistical Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#f0f4f9] text-center mb-6">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Jawaban Benar
            </span>
            <span className="text-xl font-mono font-bold text-emerald-700">{scoreData.correctCount}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
              Jawaban Salah
            </span>
            <span className="text-xl font-mono font-bold text-red-700">{scoreData.incorrectCount}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
              Total Soal
            </span>
            <span className="text-xl font-mono font-bold text-gray-900">{scoreData.totalQuestions}</span>
          </div>
        </div>

        {/* Laporan Integritas & Pengawasan Ujian Layar HP */}
        {(() => {
          const integrity = getIntegrityRating(violations.length);
          return (
            <div className="p-5 rounded-2xl border mb-8 bg-gray-50 border-gray-200">
              <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-gray-200/80 gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 text-xs sm:text-sm">
                    Laporan Integritas & Pengawasan Layar HP
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${integrity.badgeClass}`}>
                  {integrity.label}
                </span>
              </div>

              {violations.length === 0 ? (
                <div className="flex items-start gap-2.5 text-xs text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Ujian Bersih Tanpa Indikasi Pelanggaran Layar</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Peserta tidak terdeteksi meminimalkan layar, membuka WhatsApp/browser lain, split screen, atau menggunakan alat bantu digital tanpa izin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Terdeteksi {violations.length} catatan aktivitas layar yang dicatat pengawas:</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {violations.map((v, i) => (
                      <div
                        key={v.id || i}
                        className="bg-white p-2.5 rounded-lg border border-red-100 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span className="text-gray-800 font-medium">{v.pesan}</span>
                        </div>
                        <span className="text-gray-400 font-mono">{v.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Review Answers Toggle */}
        <div className="no-print border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{showReview ? 'Sembunyikan Pembahasan Soal' : 'Lihat Rekap & Pembahasan Soal'}</span>
            </div>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReview && (
            <div className="mt-4 space-y-4">
              {allQuestions.map((q, idx) => {
                const ans = jawabanSiswa[q.id];
                const isCorrect = isAnswerCorrect(q, ans);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">
                        {idx + 1}. [{q.subtest}] - {q.tipe}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {isCorrect ? 'BENAR' : 'SALAH'}
                      </span>
                    </div>

                    <p className="text-gray-800 font-medium mb-3">{q.pertanyaan}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/60 font-mono">
                      <div>
                        <span className="text-gray-500 block">Jawaban Peserta:</span>
                        <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                          {ans || '(Tidak dijawab)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Kunci Jawaban:</span>
                        <span className="text-blue-700 font-bold">{q.kunciJawaban}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGasModal(true)}
              className="px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sinkron ke Google Sheets (GAS)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="px-4 py-3 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Uji Coba Ulang</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-3 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL GOOGLE APPS SCRIPT SYNC */}
      <GasExportModal
        isOpen={showGasModal}
        onClose={() => setShowGasModal(false)}
        examResultPayload={{
          nik: user.nik,
          nama: user.nama,
          kelas: user.kelas,
          sekolah: user.sekolah,
          finalScore: scoreData.finalScore,
          kategori: kategoriCapaian,
          correctCount: scoreData.correctCount,
          incorrectCount: scoreData.incorrectCount,
          totalQuestions: scoreData.totalQuestions,
          violationsCount: violations.length,
          isDisqualified: getIntegrityRating(violations.length).isDisqualified,
          violations: violations,
        }}
      />
    </div>
  );
};
