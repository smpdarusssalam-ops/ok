export type QuestionType = 'PG' | 'PG_KOMPLEKS' | 'BENAR_SALAH' | 'MENJODOHKAN' | 'ISIAN';

export interface BaseQuestion {
  id: string;
  subtest: string;
  tipe: QuestionType;
  stimulus: string;
  stimulusImage?: string;
  pertanyaan: string;
  kunciJawaban: string; // e.g. "A" for PG, "A,C" for PG_KOMPLEKS, "0-1,1-2" for MENJODOHKAN
  bobot?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD?: string;
  opsiE?: string;
}

export interface MatchingItem {
  id: string;
  text: string;
  image?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
}

export interface UserAccount {
  username: string;
  password: string;
  nama: string;
  nik: string;
  kelas: string;
  sekolah: string;
  tglLahir: string;
  fotoUrl?: string;
}

export interface ExamSettings {
  namaTes: string;
  token: string;
  durasiMenit: number;
  durasiJedaMenit: number;
  tahunAjaran: string;
  allowSkipJeda: boolean;
}

export interface CheatingViolation {
  id: string;
  timestamp: string;
  tipe: 'TAB_SWITCH' | 'SPLIT_SCREEN' | 'COPY_ATTEMPT' | 'SCREEN_SHOT' | 'WINDOW_BLUR';
  pesan: string;
}

export interface ExamState {
  currentStage: 'LOGIN' | 'VERIFIKASI' | 'KONFIRMASI' | 'PETUNJUK' | 'UJIAN' | 'JEDA' | 'HASIL';
  currentUser: UserAccount | null;
  currentSubjectIndex: number;
  currentQuestionIndex: number;
  jawabanSiswa: Record<string, string>; // questionId -> answer string
  soalRagu: string[]; // questionId[]
  waktuSisaDetik: number;
  selfieDataUrl: string | null;
  examStartTime: string | null;
  examEndTime: string | null;
  violations?: CheatingViolation[];
}
