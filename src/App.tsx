import React, { useState, useEffect } from 'react';
import { UserAccount, ExamSettings, CheatingViolation } from './types/cbt';
import { DEFAULT_EXAM_SETTINGS, DEMO_ACCOUNTS, EXAM_DATA, ExamQuestionItem } from './data/mockData';
import { recordViolation } from './utils/cbtLogic';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { InstructionsScreen } from './components/InstructionsScreen';
import { ExamScreen } from './components/ExamScreen';
import { BreakScreen } from './components/BreakScreen';
import { ResultScreen } from './components/ResultScreen';
import { GasExportModal } from './components/GasExportModal';

export type AppStage =
  | 'LOGIN'
  | 'VERIFIKASI'
  | 'KONFIRMASI'
  | 'PETUNJUK'
  | 'UJIAN'
  | 'JEDA'
  | 'HASIL';

export default function App() {
  const [stage, setStage] = useState<AppStage>('LOGIN');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [settings, setSettings] = useState<ExamSettings>(DEFAULT_EXAM_SETTINGS);
  const [accountsList, setAccountsList] = useState<UserAccount[]>(DEMO_ACCOUNTS);
  const [examData, setExamData] = useState<Record<string, ExamQuestionItem[]>>(EXAM_DATA);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [showGasModal, setShowGasModal] = useState(false);

  // Subject and question indexes
  const daftarMapel = Object.keys(examData);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers and doubt list
  const [jawabanSiswa, setJawabanSiswa] = useState<Record<string, string>>({});
  const [soalRagu, setSoalRagu] = useState<string[]>([]);

  // Mobile anti-cheating violation records
  const [violations, setViolations] = useState<CheatingViolation[]>([]);

  const handleRecordViolation = (tipe: CheatingViolation['tipe'], pesan: string) => {
    setViolations((prev) => recordViolation(prev, tipe, pesan));
  };

  // Handler to load live Spreadsheet database
  const handleLoadDatabaseFromGas = (dbData: {
    pengaturan?: any;
    siswa?: any[];
    bankSoal?: any;
  }) => {
    if (dbData.pengaturan && Object.keys(dbData.pengaturan).length > 0) {
      setSettings((prev) => ({
        ...prev,
        ...dbData.pengaturan,
      }));
    }
    if (Array.isArray(dbData.siswa) && dbData.siswa.length > 0) {
      setAccountsList(dbData.siswa);
    }
    if (dbData.bankSoal && Object.keys(dbData.bankSoal).length > 0) {
      setExamData(dbData.bankSoal);
    }
  };

  // Timer in seconds
  const [waktuSisaDetik, setWaktuSisaDetik] = useState(settings.durasiMenit * 60);

  const activeMapel = daftarMapel[currentSubjectIndex] || daftarMapel[0];
  const activeQuestions = examData[activeMapel] || [];

  // All questions flattened for final result calculation
  const allQuestions: ExamQuestionItem[] = Object.values(examData).flat();

  // Auto-fetch database if running inside Google Apps Script OR from GitHub Pages with gasUrl
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
      try {
        (window as any).google.script.run
          .withSuccessHandler((res: any) => {
            if (res && res.status === 'success') {
              handleLoadDatabaseFromGas(res);
            }
          })
          .getDatabaseData();
      } catch (err) {
        console.warn('GAS Auto-fetch notice:', err);
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const gasUrl = params.get('gasUrl') || localStorage.getItem('cbt_gas_url');
    if (gasUrl) {
      localStorage.setItem('cbt_gas_url', gasUrl);
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getDatabase' }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json && json.data) {
            handleLoadDatabaseFromGas(json.data);
          }
        })
        .catch((err) => console.warn('GitHub Pages GAS Sync notice:', err));
    }
  }, []);

  // Autostart URL query parameter support for ultra-mode & automated testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const demoUser = accountsList[0] || DEMO_ACCOUNTS[0];
      setUser(demoUser);
      // Generate a mock selfie
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0b57d0';
        ctx.fillRect(0, 0, 150, 150);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.fillText('SITI', 45, 80);
      }
      setSelfieDataUrl(canvas.toDataURL());

      const targetStage = params.get('stage') as AppStage | null;
      if (targetStage && ['VERIFIKASI', 'KONFIRMASI', 'PETUNJUK', 'UJIAN', 'HASIL'].includes(targetStage)) {
        setStage(targetStage);
      } else {
        setStage('KONFIRMASI');
      }
    }
  }, []);

  // Exam Countdown Timer
  useEffect(() => {
    if (stage !== 'UJIAN') return;

    const timer = setInterval(() => {
      setWaktuSisaDetik((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto advance when time runs out
          handleSelesaiSubtes();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, currentSubjectIndex]);

  // Handle token refresh
  const handleRefreshToken = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newToken = 'PUS';
    for (let i = 0; i < 4; i++) {
      newToken += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    setSettings((prev) => ({ ...prev, token: newToken }));
  };

  // Login handler
  const handleLoginSuccess = (account: UserAccount) => {
    setUser(account);
    setStage('VERIFIKASI');
  };

  // Verification success
  const handleVerificationSuccess = (selfieUrl: string) => {
    setSelfieDataUrl(selfieUrl);
    setStage('KONFIRMASI');
  };

  // Start exam from instructions
  const handleStartExam = () => {
    setStage('UJIAN');
    setWaktuSisaDetik(settings.durasiMenit * 60);
    setCurrentQuestionIndex(0);
  };

  // Answer saver
  const handleSaveAnswer = (questionId: string, answer: string) => {
    setJawabanSiswa((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Toggle doubt (ragu)
  const handleToggleRagu = (questionId: string) => {
    setSoalRagu((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  // Complete a subject
  const handleSelesaiSubtes = () => {
    const nextIndex = currentSubjectIndex + 1;
    if (nextIndex < daftarMapel.length) {
      // Go to Break screen
      setStage('JEDA');
    } else {
      // Completed all subjects! Go to Result
      setStage('HASIL');
    }
  };

  // Proceed to next subject after break
  const handleProceedAfterBreak = () => {
    const nextIndex = currentSubjectIndex + 1;
    setCurrentSubjectIndex(nextIndex);
    setCurrentQuestionIndex(0);
    setWaktuSisaDetik(settings.durasiMenit * 60);
    setStage('UJIAN');
  };

  // Restart CBT exam
  const handleRestart = () => {
    setJawabanSiswa({});
    setSoalRagu([]);
    setViolations([]);
    setCurrentSubjectIndex(0);
    setCurrentQuestionIndex(0);
    setWaktuSisaDetik(settings.durasiMenit * 60);
    setStage('KONFIRMASI');
  };

  // Full logout
  const handleLogout = () => {
    setUser(null);
    setSelfieDataUrl(null);
    setJawabanSiswa({});
    setSoalRagu([]);
    setViolations([]);
    setCurrentSubjectIndex(0);
    setCurrentQuestionIndex(0);
    setStage('LOGIN');
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] flex flex-col font-sans">
      {/* Navbar visible on non-login and non-exam stages (Exam has its own dedicated CBT header) */}
      {stage !== 'LOGIN' && stage !== 'UJIAN' && (
        <Navbar
          user={user}
          settings={settings}
          onLogout={handleLogout}
          onRefreshToken={handleRefreshToken}
          onOpenGasModal={() => setShowGasModal(true)}
        />
      )}

      {/* Screen Render */}
      <div className="flex-1">
        {stage === 'LOGIN' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenGasModal={() => setShowGasModal(true)}
            accountsList={accountsList}
          />
        )}

        {stage === 'VERIFIKASI' && user && (
          <VerificationScreen
            user={user}
            settings={settings}
            onRefreshSettings={handleRefreshToken}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}

        {stage === 'KONFIRMASI' && (
          <ConfirmationScreen
            settings={settings}
            daftarMapel={daftarMapel}
            onProceedToInstructions={() => setStage('PETUNJUK')}
          />
        )}

        {stage === 'PETUNJUK' && <InstructionsScreen onStartExam={handleStartExam} />}

        {stage === 'UJIAN' && (
          <ExamScreen
            user={user}
            token={settings.token}
            mapelName={activeMapel}
            questions={activeQuestions}
            currentIndex={currentQuestionIndex}
            jawabanSiswa={jawabanSiswa}
            soalRagu={soalRagu}
            waktuSisaDetik={waktuSisaDetik}
            violations={violations}
            onRecordViolation={handleRecordViolation}
            onSelectQuestion={(idx) => setCurrentQuestionIndex(idx)}
            onSaveAnswer={handleSaveAnswer}
            onToggleRagu={handleToggleRagu}
            onSelesaiSubtes={handleSelesaiSubtes}
          />
        )}

        {stage === 'JEDA' && (
          <BreakScreen
            completedMapel={daftarMapel[currentSubjectIndex]}
            nextMapel={daftarMapel[currentSubjectIndex + 1]}
            breakDurationMinutes={settings.durasiJedaMenit}
            onProceedToNextMapel={handleProceedAfterBreak}
          />
        )}

        {stage === 'HASIL' && user && (
          <ResultScreen
            user={user}
            settings={settings}
            allQuestions={allQuestions}
            jawabanSiswa={jawabanSiswa}
            selfieDataUrl={selfieDataUrl}
            violations={violations}
            onRestart={handleRestart}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* Global Google Apps Script Modal */}
      <GasExportModal
        isOpen={showGasModal}
        onClose={() => setShowGasModal(false)}
        onLoadDatabaseFromGas={handleLoadDatabaseFromGas}
      />
    </div>
  );
}
