import React, { useState, useEffect } from 'react';
import { Coffee, ArrowRight, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { formatTimeShort } from '../utils/cbtLogic';

interface BreakScreenProps {
  completedMapel: string;
  nextMapel: string;
  breakDurationMinutes: number;
  onProceedToNextMapel: () => void;
}

export const BreakScreen: React.FC<BreakScreenProps> = ({
  completedMapel,
  nextMapel,
  breakDurationMinutes,
  onProceedToNextMapel,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(breakDurationMinutes * 60);
  const [showModalReady, setShowModalReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isTimerDone = remainingSeconds === 0;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-lg border border-gray-100 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Coffee className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Selesai Subtes <span className="text-blue-600">{completedMapel}</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Ujian selanjutnya:{' '}
          <b className="text-gray-900 font-bold uppercase">{nextMapel}</b>
        </p>

        {/* Big Timer */}
        <div className="my-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
            Waktu Jeda Istirahat
          </span>
          <div className="text-5xl sm:text-6xl font-mono font-extrabold text-blue-600 tracking-tight">
            {formatTimeShort(remainingSeconds)}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Gunakan waktu ini untuk rileks sejenak sebelum memasuki subtes berikutnya.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setShowModalReady(true)}
            className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isTimerDone ? 'Mulai Subtes Berikutnya' : 'Lewati Jeda & Mulai'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL VALIDASI MULAI SUBTES */}
        {showModalReady && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Validasi Subtes</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6">
                Apakah Anda sudah siap memulai subtes <b className="text-blue-600 uppercase">{nextMapel}</b>?
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModalReady(false)}
                  className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  Belum
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModalReady(false);
                    onProceedToNextMapel();
                  }}
                  className="flex-1 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Ya, Mulai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
