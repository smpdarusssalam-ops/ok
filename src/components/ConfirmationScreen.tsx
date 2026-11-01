import React from 'react';
import { ArrowRight, Clock, BookOpen, Calendar, Award } from 'lucide-react';
import { ExamSettings } from '../types/cbt';

interface ConfirmationScreenProps {
  settings: ExamSettings;
  daftarMapel: string[];
  onProceedToInstructions: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  settings,
  daftarMapel,
  onProceedToInstructions,
}) => {
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date());

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Konfirmasi Ujian</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Harap periksa rincian asesmen sebelum memulai pengerjaan
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Nama Tes / Asesmen</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900">{settings.namaTes}</p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Waktu Pelaksanaan</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Durasi Subtes</span>
              </div>
              <p className="text-base font-bold text-blue-600">{settings.durasiMenit} Menit</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Mata Pelajaran</span>
              </div>
              <p className="text-base font-bold text-emerald-600">{daftarMapel.length} Subtes</p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block mb-1">
              Urutan Subtes Ujian:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {daftarMapel.map((mapel, idx) => (
                <span
                  key={mapel}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg text-xs font-medium shadow-2xs"
                >
                  {idx + 1}. {mapel}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToInstructions}
          className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lanjut ke Petunjuk Ujian</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
