import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  Info,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  X,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { UserAccount, CheatingViolation } from '../types/cbt';
import { ExamQuestionItem } from '../data/mockData';
import { formatTime, formatTimeShort, getQuestionStatus } from '../utils/cbtLogic';
import { MatchingQuestionView } from './MatchingQuestionView';

interface ExamScreenProps {
  user: UserAccount | null;
  token: string;
  mapelName: string;
  questions: ExamQuestionItem[];
  currentIndex: number;
  jawabanSiswa: Record<string, string>;
  soalRagu: string[];
  waktuSisaDetik: number;
  violations: CheatingViolation[];
  onRecordViolation: (tipe: CheatingViolation['tipe'], pesan: string) => void;
  onSelectQuestion: (index: number) => void;
  onSaveAnswer: (questionId: string, answer: string) => void;
  onToggleRagu: (questionId: string) => void;
  onSelesaiSubtes: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  user,
  token,
  mapelName,
  questions,
  currentIndex,
  jawabanSiswa,
  soalRagu,
  waktuSisaDetik,
  violations,
  onRecordViolation,
  onSelectQuestion,
  onSaveAnswer,
  onToggleRagu,
  onSelesaiSubtes,
}) => {
  const [showDaftarModal, setShowDaftarModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCheatWarningModal, setShowCheatWarningModal] = useState<string | null>(null);
  const [cekYakin, setCekYakin] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // 1-minute countdown lock for Selesai button (jeda waktu 1 menit)
  const [jedaTombolSelesai, setJedaTombolSelesai] = useState(60);

  // Trigger violation and show alert modal
  const triggerViolation = (tipe: CheatingViolation['tipe'], pesan: string) => {
    onRecordViolation(tipe, pesan);
    setShowCheatWarningModal(pesan);
  };

  // Anti-cheat mobile screen monitoring: visibilitychange, window blur, keyboard capture
  useEffect(() => {
    let lastViolationTime = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastViolationTime > 2000) {
          lastViolationTime = now;
          triggerViolation(
            'TAB_SWITCH',
            'Terdeteksi berpindah aplikasi atau meminimalkan layar ujian di HP.'
          );
        }
      }
    };

    const handleWindowBlur = () => {
      const now = Date.now();
      if (now - lastViolationTime > 2500) {
        lastViolationTime = now;
        triggerViolation(
          'WINDOW_BLUR',
          'Layar ujian kehilangan fokus (membuka chat, WhatsApp, split screen, atau panggilan).'
        );
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerViolation(
          'SCREEN_SHOT',
          'Terdeteksi mencoba pintasan salin/tangkapan layar materi ujian.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Reset delay to 60 seconds whenever subtest changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fastDelay') === '1') {
      setJedaTombolSelesai(3);
    } else {
      setJedaTombolSelesai(60);
    }
  }, [mapelName]);

  // Tick down every second
  useEffect(() => {
    if (jedaTombolSelesai <= 0) return;
    const interval = setInterval(() => {
      setJedaTombolSelesai((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [jedaTombolSelesai]);

  const currentQ = questions[currentIndex] || questions[0];

  // Count answered, doubt, and unanswered for this subject
  let countTerjawab = 0;
  let countRagu = 0;
  let countBelum = 0;

  questions.forEach((q) => {
    const isAnswered = jawabanSiswa[q.id] !== undefined && jawabanSiswa[q.id] !== '';
    const isDoubt = soalRagu.includes(q.id);

    if (isDoubt) countRagu++;
    if (isAnswered) countTerjawab++;
    else countBelum++;
  });

  const isAllAnsweredAndNoDoubt = countBelum === 0 && countRagu === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Change font size classes
  const fontMultiplierClass =
    fontSizeLevel === 'normal'
      ? 'text-sm sm:text-base'
      : fontSizeLevel === 'large'
      ? 'text-base sm:text-lg'
      : 'text-lg sm:text-xl';

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectQuestion(currentIndex - 1);
    }
  };

  // Radio option changer
  const handleRadioChange = (val: string) => {
    onSaveAnswer(currentQ.id, val);
  };

  // Checkbox option changer for PG_KOMPLEKS
  const handleCheckboxChange = (opt: string, checked: boolean) => {
    const existing = jawabanSiswa[currentQ.id]
      ? jawabanSiswa[currentQ.id].split(',').map((s) => s.trim())
      : [];

    let updated: string[];
    if (checked) {
      updated = [...existing, opt];
    } else {
      updated = existing.filter((item) => item !== opt);
    }
    const finalAnswer = updated.sort().join(',');
    onSaveAnswer(currentQ.id, finalAnswer);
  };

  const isDoubtActive = soalRagu.includes(currentQ.id);

  return (
    <div
      className="min-h-screen bg-[#f0f4f9] pb-44 select-none relative"
      onCopy={(e) => {
        e.preventDefault();
        triggerViolation('COPY_ATTEMPT', 'Mencoba menyalin (copy) teks soal ujian ke aplikasi lain.');
      }}
      onCut={(e) => {
        e.preventDefault();
        triggerViolation('COPY_ATTEMPT', 'Mencoba memotong (cut) teks soal ujian.');
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {/* Watermark Dinamis Anti-Foto / Anti-Rekam (Anti-Leak Overlay) */}
      {user && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.035] select-none flex flex-wrap items-center justify-around gap-20 p-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="transform -rotate-12 font-mono text-xs font-bold text-gray-900 tracking-wider whitespace-nowrap"
            >
              {user.nik} • {user.nama} • PUSMENJAR CBT
            </div>
          ))}
        </div>
      )}

      {/* 1. Header Soal CBT */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm sm:text-base tracking-tight">
                  PUSMENJAR CBT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide uppercase">
                  {mapelName}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">Simulasi Ujian Nasional Berbasis Komputer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Anti-Cheat Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                violations.length === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : violations.length <= 2
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-800 border-red-300 animate-pulse'
              }`}
              title="Sistem Pengawas Layar HP Aktif (Mendeteksi Perpindahan Aplikasi & Split-Screen)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{violations.length === 0 ? 'Pengawas Layar Aktif' : `${violations.length} Pelanggaran`}</span>
            </div>

            {/* Token Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-mono font-bold border border-gray-200">
              <span className="text-gray-400 font-sans font-normal">Token:</span>
              <span className="text-blue-700">{token}</span>
            </div>

            {/* Student info */}
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {user.nama.charAt(0)}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user.nama}</p>
                  <p className="text-[11px] text-gray-500">{user.kelas}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top Bar (Nomor Soal, Timer, Info, Daftar Soal, Zoom) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-200/80">
          {/* Question Number & Type Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-gray-900">
              Soal <span className="text-blue-600 font-mono text-base">{currentIndex + 1}</span> dari{' '}
              {questions.length}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
              {currentQ.tipe === 'PG'
                ? 'Pilihan Ganda'
                : currentQ.tipe === 'PG_KOMPLEKS'
                ? 'PG Kompleks'
                : currentQ.tipe === 'MENJODOHKAN'
                ? 'Menjodohkan'
                : currentQ.tipe === 'BENAR_SALAH'
                ? 'Benar / Salah'
                : 'Isian'}
            </span>
          </div>

          {/* Center Timer Pill */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm shadow-xs border ${
              waktuSisaDetik <= 60
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-white text-blue-700 border-gray-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${waktuSisaDetik <= 60 ? 'text-red-600' : 'text-blue-600'}`} />
            <span>Sisa Waktu: {formatTime(waktuSisaDetik)}</span>
          </div>

          {/* Action buttons (Info, Daftar, Font Zoom) */}
          <div className="flex items-center gap-2">
            {/* Font Zoom Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setFontSizeLevel('normal')}
                title="Ukuran Font Normal"
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  fontSizeLevel === 'normal' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('large')}
                title="Ukuran Font Sedang"
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  fontSizeLevel === 'large' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('xlarge')}
                title="Ukuran Font Besar"
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  fontSizeLevel === 'xlarge' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600'
                }`}
              >
                A++
              </button>
            </div>

            <button
              type="button"
              onClick={() => triggerViolation('TAB_SWITCH', 'Simulasi: Terdeteksi membuka aplikasi chat / WhatsApp di HP.')}
              title="Uji coba deteksi keluar layar HP"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full border border-dashed border-gray-300 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-red-500" />
              <span>Tes Deteksi HP</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Info</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDaftarModal(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>Daftar Soal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Area Soal (Stimulus & Pertanyaan) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-2">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200/80 min-h-[55vh]">
          {/* Stimulus Box */}
          {currentQ.stimulus && currentQ.stimulus !== '-' && (
            <div className="pb-6 mb-6 border-b border-gray-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                Teks Bacaan / Stimulus
              </span>
              <div
                className={`text-gray-800 leading-relaxed font-normal ${fontMultiplierClass}`}
                dangerouslySetInnerHTML={{ __html: currentQ.stimulus }}
              />
            </div>
          )}

          {/* Pertanyaan */}
          <div className="mb-6">
            <h3 className={`font-semibold text-gray-900 leading-snug ${fontMultiplierClass}`}>
              {currentQ.pertanyaan}
            </h3>
          </div>

          {/* Render Options based on type */}
          <div>
            {/* Type 1: PG (Pilihan Ganda Biasa) */}
            {currentQ.tipe === 'PG' && (
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                  const key = `opsi${letter}` as keyof ExamQuestionItem;
                  const text = currentQ[key] as string | undefined;
                  if (!text || text === '-') return null;

                  const isChecked = jawabanSiswa[currentQ.id] === letter;

                  return (
                    <label
                      key={letter}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-500 shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 text-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`opsi_${currentQ.id}`}
                        value={letter}
                        checked={isChecked}
                        onChange={() => handleRadioChange(letter)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm sm:text-base leading-relaxed`}>
                        <b className="text-blue-700 mr-2">{letter}.</b> {text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Type 2: PG Kompleks (Checkboxes) */}
            {currentQ.tipe === 'PG_KOMPLEKS' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 text-xs font-medium border border-amber-200 mb-2">
                  ℹ️ Pertanyaan Pilihan Ganda Kompleks: Anda dapat memilih lebih dari satu jawaban yang benar.
                </div>
                {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                  const key = `opsi${letter}` as keyof ExamQuestionItem;
                  const text = currentQ[key] as string | undefined;
                  if (!text || text === '-') return null;

                  const currentSelected = jawabanSiswa[currentQ.id]
                    ? jawabanSiswa[currentQ.id].split(',')
                    : [];
                  const isChecked = currentSelected.includes(letter);

                  return (
                    <label
                      key={letter}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-500 shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 text-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(letter, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm sm:text-base leading-relaxed`}>
                        <b className="text-blue-700 mr-2">{letter}.</b> {text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Type 3: BENAR_SALAH */}
            {currentQ.tipe === 'BENAR_SALAH' && (
              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B'] as const).map((letter) => {
                  const label = letter === 'A' ? 'BENAR' : 'SALAH';
                  const isChecked = jawabanSiswa[currentQ.id] === letter;

                  return (
                    <label
                      key={letter}
                      data-testid={`opt-${label.toLowerCase()}`}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isChecked
                          ? letter === 'A'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-300 shadow-2xs'
                            : 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-300 shadow-2xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`bs_${currentQ.id}`}
                        value={letter}
                        checked={isChecked}
                        onChange={() => handleRadioChange(letter)}
                        className="w-4 h-4 text-blue-600 mb-2"
                      />
                      <span
                        className={`text-lg sm:text-xl font-extrabold ${
                          letter === 'A' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {isChecked ? 'Pilihan Terpilih' : 'Klik untuk memilih'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Type 4: MENJODOHKAN (Interactive matching with SVG lines) */}
            {currentQ.tipe === 'MENJODOHKAN' && (
              <MatchingQuestionView
                questionId={currentQ.id}
                leftItems={
                  currentQ.leftItems ||
                  (currentQ.stimulus !== '-'
                    ? currentQ.stimulus.split(',').map((s) => s.trim())
                    : ['Butir Kiri 1', 'Butir Kiri 2', 'Butir Kiri 3'])
                }
                rightItems={
                  currentQ.rightItems ||
                  [currentQ.opsiA, currentQ.opsiB, currentQ.opsiC].filter(Boolean) as string[]
                }
                value={jawabanSiswa[currentQ.id]}
                onChange={(newVal) => onSaveAnswer(currentQ.id, newVal)}
              />
            )}

            {/* Type 5: ISIAN */}
            {currentQ.tipe === 'ISIAN' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Ketikkan Jawaban Singkat Anda:
                </label>
                <input
                  type="text"
                  value={jawabanSiswa[currentQ.id] || ''}
                  onChange={(e) => onSaveAnswer(currentQ.id, e.target.value)}
                  placeholder="Ketik jawaban di sini..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 focus:border-blue-600 focus:bg-white rounded-xl text-base font-semibold text-gray-900 outline-none transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. Navigasi Bawah (Fixed Floating Dock) */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl">
        <div className="bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-full shadow-xl shadow-gray-900/10 border border-gray-200 flex items-center justify-between gap-2">
          {/* Sebelumnya */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Ragu-Ragu */}
          <button
            type="button"
            onClick={() => onToggleRagu(currentQ.id)}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isDoubtActive
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Flag className={`w-4 h-4 ${isDoubtActive ? 'fill-white' : 'fill-amber-600'}`} />
            <span>Ragu</span>
          </button>

          {/* Selanjutnya OR Selesai */}
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : jedaTombolSelesai > 0 && waktuSisaDetik > 60 ? (
            <button
              type="button"
              id="btnSelesaiSubtes"
              disabled
              title={`Tombol Selesai ditahan selama 1 menit (sisa ${formatTimeShort(jedaTombolSelesai)})`}
              className="flex-1 py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all bg-[#cfd4dc] text-white shadow-xs cursor-not-allowed select-none border border-[#c4c9d2]"
            >
              <span>Selesai {formatTimeShort(jedaTombolSelesai)}</span>
            </button>
          ) : (
            <button
              type="button"
              id="btnSelesaiSubtes"
              onClick={() => setShowConfirmModal(true)}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isAllAnsweredAndNoDoubt
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md btn-pulse-green'
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai Subtes</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL: DAFTAR SOAL */}
      {showDaftarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Daftar Nomor Soal</h3>
              <button
                onClick={() => setShowDaftarModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 1..N */}
            <div className="grid grid-cols-5 gap-3 my-6">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q.id, jawabanSiswa, soalRagu);
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50';

                if (isCurrent) {
                  btnClass = 'bg-blue-600 text-white border-blue-600 font-bold ring-2 ring-blue-300';
                } else if (status === 'doubt') {
                  btnClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                } else if (status === 'answered') {
                  btnClass = 'bg-emerald-500 text-white border-emerald-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      onSelectQuestion(idx);
                      setShowDaftarModal(false);
                    }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all shadow-2xs mx-auto cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-around gap-2 pt-4 border-t border-gray-100 text-[11px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600"></span>
                <span>Aktif</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                <span>Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400"></span>
                <span>Ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-gray-400 bg-white"></span>
                <span>Belum</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDaftarModal(false)}
              className="mt-6 w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-all cursor-pointer"
            >
              Tutup Daftar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: INFO SOAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Pengerjaan Soal</h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Terjawab
                </span>
                <span className="text-2xl font-extrabold text-emerald-600">{countTerjawab}</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Ragu-Ragu
                </span>
                <span className="text-2xl font-extrabold text-amber-600">{countRagu}</span>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                  Belum Diisi
                </span>
                <span className="text-2xl font-extrabold text-red-600">{countBelum}</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                  Total Soal
                </span>
                <span className="text-2xl font-extrabold text-gray-900">{questions.length}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-all cursor-pointer"
            >
              Tutup Informasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI SELESAI SUBTES */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            {!isAllAnsweredAndNoDoubt ? (
              // Warning if incomplete
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-red-600 text-center mb-2">
                  Cek Kembali Jawaban Anda!
                </h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-800 leading-relaxed mb-6">
                  {countBelum > 0 && <p className="mb-1 font-semibold">• Ada {countBelum} soal belum dijawab.</p>}
                  {countRagu > 0 && (
                    <p className="font-semibold">• Ada {countRagu} soal yang masih ditandai ragu-ragu.</p>
                  )}
                  <p className="mt-2 text-xs text-red-700">
                    Pastikan semua soal sudah dijawab dan hapus tanda ragu-ragu sebelum mengakhiri subtes ini.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    Periksa Kembali Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      onSelesaiSubtes();
                    }}
                    className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Tetap Selesai (Paksa)
                  </button>
                </div>
              </div>
            ) : (
              // Ready to complete
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-700 text-center mb-2">
                  Selesaikan Subtes {mapelName}?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-6">
                  Semua soal telah terjawab lengkap dan tidak ada soal ragu-ragu.
                </p>

                <label
                  onClick={() => setCekYakin(!cekYakin)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer mb-6 ${
                    cekYakin
                      ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={cekYakin}
                    onChange={(e) => setCekYakin(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold select-none">
                    Saya sudah memeriksa dan yakin dengan seluruh jawaban saya pada subtes ini.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!cekYakin}
                    onClick={() => {
                      setShowConfirmModal(false);
                      onSelesaiSubtes();
                    }}
                    className="flex-1 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Ya, Selesai Subtes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MODAL PERINGATAN KECURANGAN LAYAR HP (1 KALI PELANGGARAN LANGSUNG TUTUP) */}
      {showCheatWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-red-600 animate-bounce-once">
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="text-center mb-5">
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-600 text-white inline-block mb-2 shadow-sm">
                Diskualifikasi - Ujian Ditutup
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Satu Kali Pelanggaran, Layar Langsung Ditutup!
              </h3>
              <p className="text-xs text-red-600 font-bold mt-1">
                Kebijakan Ketat Keamanan Ujian CBT (1-Strike Policy)
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-900 leading-relaxed space-y-2 mb-6">
              <p className="font-bold">Aktivitas Terlarang Terdeteksi:</p>
              <p className="italic bg-white p-2.5 rounded-xl border border-red-100 font-mono text-[11px] text-red-700 font-semibold">
                {showCheatWarningModal}
              </p>
              <p className="text-[11px] text-gray-800">
                Sesuai peraturan ujian, <b>1 (satu) kali pelanggaran</b> (berpindah aplikasi, meminimalkan layar, membuka WhatsApp/browser/kalkulator/AI, split-screen, atau tangkapan layar) mengakibatkan <b>ujian langsung dihentikan, layar ditutup, dan peserta didiskualifikasi</b>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCheatWarningModal(null);
                onSelesaiSubtes(); // Langsung tutup layar ujian dan akhiri sesi
              }}
              className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/40 transition-all cursor-pointer"
            >
              Tutup Layar & Lihat Hasil Diskualifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
