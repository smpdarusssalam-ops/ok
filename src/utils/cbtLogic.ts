import { QuestionType, CheatingViolation } from '../types/cbt';

/**
 * Format seconds into HH:MM:SS format (e.g. 125 -> "00:02:05")
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const jam = Math.floor(safeSeconds / 3600);
  const menit = Math.floor((safeSeconds % 3600) / 60);
  const detik = safeSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(jam)}:${pad(menit)}:${pad(detik)}`;
}

/**
 * Format seconds into short MM:SS format (for countdowns like breaks)
 */
export function formatTimeShort(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const menit = Math.floor(safeSeconds / 60);
  const detik = safeSeconds % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(menit)}:${pad(detik)}`;
}

/**
 * Check if the input token matches the current exam token (case-insensitive, trimmed)
 */
export function validateToken(inputToken: string, actualToken: string): boolean {
  if (!inputToken || !actualToken) return false;
  return inputToken.trim().toUpperCase() === actualToken.trim().toUpperCase();
}

/**
 * Normalize an answer for comparison
 */
export function normalizeAnswer(type: QuestionType, rawAnswer: string | undefined): string {
  if (!rawAnswer) return '';
  const trimmed = rawAnswer.trim();

  if (type === 'PG_KOMPLEKS') {
    // Sort items alphabetically: "C,A" -> "A,C"
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .sort()
      .join(',');
  }

  if (type === 'MENJODOHKAN') {
    // Sort pair mappings "1-2,0-1" -> "0-1,1-2"
    return trimmed
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .sort((a, b) => {
        const aKey = parseInt(a.split('-')[0], 10) || 0;
        const bKey = parseInt(b.split('-')[0], 10) || 0;
        return aKey - bKey;
      })
      .join(',');
  }

  if (type === 'ISIAN') {
    return trimmed.toLowerCase().replace(/\s+/g, ' ');
  }

  return trimmed.toUpperCase();
}

/**
 * Evaluate if student answer matches key
 */
export function isAnswerCorrect(
  question: { tipe: QuestionType; kunciJawaban: string },
  studentAnswer: string | undefined
): boolean {
  if (!studentAnswer) return false;
  const normKey = normalizeAnswer(question.tipe, question.kunciJawaban);
  const normAns = normalizeAnswer(question.tipe, studentAnswer);
  return normKey === normAns;
}

/**
 * Calculate total score and breakdown for a list of questions
 */
export function calculateExamScore(
  questions: Array<{ id: string; tipe: QuestionType; kunciJawaban: string; bobot?: number; subtest?: string }>,
  answers: Record<string, string>
) {
  let totalBobot = 0;
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const perSubtest: Record<string, { total: number; correct: number; score: number }> = {};

  questions.forEach((q) => {
    const bobot = q.bobot || 1;
    totalBobot += bobot;
    const sub = q.subtest || 'Umum';

    if (!perSubtest[sub]) {
      perSubtest[sub] = { total: 0, correct: 0, score: 0 };
    }
    perSubtest[sub].total += 1;

    const ans = answers[q.id];
    if (!ans) {
      unansweredCount++;
    } else if (isAnswerCorrect(q, ans)) {
      correctCount++;
      totalScore += bobot;
      perSubtest[sub].correct += 1;
    } else {
      incorrectCount++;
    }
  });

  // Calculate percentage out of 100
  const finalScore = totalBobot > 0 ? Math.round((totalScore / totalBobot) * 100) : 0;

  // Calculate per-subtest percentage
  Object.keys(perSubtest).forEach((sub) => {
    const entry = perSubtest[sub];
    entry.score = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
  });

  return {
    finalScore,
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    unansweredCount,
    perSubtest,
  };
}

/**
 * Get visual status of a question in CBT grid
 */
export function getQuestionStatus(
  questionId: string,
  answers: Record<string, string>,
  doubtList: string[]
): 'unanswered' | 'answered' | 'doubt' {
  if (doubtList.includes(questionId)) {
    return 'doubt';
  }
  if (answers[questionId] !== undefined && answers[questionId] !== '') {
    return 'answered';
  }
  return 'unanswered';
}

/**
 * Parse string "0-1,1-2" to Record<string, string>
 */
export function parseMatchingAnswer(answerStr: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!answerStr) return result;
  answerStr.split(',').forEach((pair) => {
    const parts = pair.split('-');
    if (parts.length === 2 && parts[0] && parts[1]) {
      result[parts[0].trim()] = parts[1].trim();
    }
  });
  return result;
}

/**
 * Convert Record<string, string> to sorted string "0-1,1-2"
 */
export function serializeMatchingAnswer(matches: Record<string, string>): string {
  return Object.keys(matches)
    .filter((k) => matches[k] !== undefined && matches[k] !== '')
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((k) => `${k}-${matches[k]}`)
    .join(',');
}

export const PROHIBITED_CHEATING_ACTIVITIES = [
  {
    id: 1,
    title: 'Membuka Browser / Internet',
    desc: 'Membuka browser lain atau internet untuk mencari jawaban.',
    kategori: 'Pencarian Tidak Sah',
  },
  {
    id: 2,
    title: 'Membuka Chat & Media Sosial',
    desc: 'Membuka chat, DM, WhatsApp, Telegram, atau media sosial untuk bertanya jawaban.',
    kategori: 'Komunikasi Luar',
  },
  {
    id: 3,
    title: 'Aplikasi AI, Kalkulator, & Kamus Digital',
    desc: 'Menggunakan asisten AI, kalkulator, kamus, atau catatan digital tanpa izin.',
    kategori: 'Alat Bantu Digital',
  },
  {
    id: 4,
    title: 'Memotret / Merekam Soal',
    desc: 'Memotret atau merekam soal maupun lembar jawaban dengan kamera atau aplikasi.',
    kategori: 'Perekaman Layar',
  },
  {
    id: 5,
    title: 'Membuka Foto Catatan & PDF Ringkasan',
    desc: 'Membuka foto catatan di galeri, file PDF ringkasan, atau screenshot materi.',
    kategori: 'Dokumen Ilegal',
  },
  {
    id: 6,
    title: 'Split Screen & Floating Window',
    desc: 'Memakai fitur layar belah (split screen) atau jendela mengambang untuk membuka aplikasi lain.',
    kategori: 'Multi-Window',
  },
  {
    id: 7,
    title: 'Panggilan Telepon & Notifikasi Pesan',
    desc: 'Menerima panggilan biasa/video call atau membuka notifikasi pesan saat ujian berlangsung.',
    kategori: 'Gangguan Panggilan',
  },
  {
    id: 8,
    title: 'Remote Access & Screen Sharing',
    desc: 'Memakai remote access atau screen sharing agar pihak lain dapat mengerjakan ujian.',
    kategori: 'Pengendali Jarak Jauh',
  },
  {
    id: 9,
    title: 'Multiple Login / Menggantikan Peserta',
    desc: 'Login ujian dari akun/perangkat lain atau meminta bantuan orang lain untuk menggantikan.',
    kategori: 'Joki / Identitas Palsu',
  },
  {
    id: 10,
    title: 'Hotspot & Tethering ke Perangkat Lain',
    desc: 'Mengaktifkan atau menggunakan hotspot/tethering untuk perangkat lain tanpa izin proktor.',
    kategori: 'Jaringan Ilegal',
  },
];

/**
 * Record a detected violation
 */
export function recordViolation(
  existing: CheatingViolation[],
  tipe: CheatingViolation['tipe'],
  pesan: string
): CheatingViolation[] {
  const newEntry: CheatingViolation = {
    id: `viol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    tipe,
    pesan,
  };
  return [...existing, newEntry];
}

/**
 * Determine integrity rating based on logged violations count (1 violation = immediate disqualification)
 */
export function getIntegrityRating(violationsCount: number): {
  label: string;
  badgeClass: string;
  isDisqualified: boolean;
} {
  if (violationsCount === 0) {
    return {
      label: 'Sangat Baik (Jujur / Tanpa Pelanggaran)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isDisqualified: false,
    };
  }
  return {
    label: `Diskualifikasi (${violationsCount} Pelanggaran - Ujian Ditutup)`,
    badgeClass: 'bg-red-50 text-red-800 border-red-300',
    isDisqualified: true,
  };
}
