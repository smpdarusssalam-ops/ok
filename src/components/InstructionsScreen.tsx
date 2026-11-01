import React, { useState } from 'react';
import {
  FileText,
  Play,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldAlert,
  Smartphone,
  Info,
} from 'lucide-react';
import { PROHIBITED_CHEATING_ACTIVITIES } from '../utils/cbtLogic';

interface InstructionsScreenProps {
  onStartExam: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStartExam }) => {
  const [activeTab, setActiveTab] = useState<'tataTertib' | 'antiKecurangan'>('tataTertib');
  const [isChecked, setIsChecked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleStart = () => {
    if (!isChecked) {
      setShowWarning(true);
      return;
    }
    onStartExam();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Petunjuk & Protokol Integritas Ujian
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Harap baca tata tertib dan larangan kecurangan di layar HP/perangkat sebelum memulai
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#f0f2f5] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('tataTertib')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tataTertib'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Tata Tertib Ujian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('antiKecurangan')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'antiKecurangan'
                ? 'bg-white text-red-700 shadow-xs ring-1 ring-red-200'
                : 'text-gray-600 hover:text-red-700'
            }`}
          >
            <Smartphone className="w-4 h-4 text-red-600" />
            <span>10 Larangan Layar HP</span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          </button>
        </div>

        {/* Content Tab 1: Tata Tertib Umum */}
        {activeTab === 'tataTertib' && (
          <div className="bg-[#f0f2f5] p-5 sm:p-6 rounded-2xl max-h-72 overflow-y-auto border border-gray-200/80 mb-6 text-xs sm:text-sm text-gray-800 leading-relaxed space-y-3">
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">1.</span>
              <p>Peserta wajib membaca dan memahami seluruh petunjuk pengerjaan soal asesmen dengan teliti.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">2.</span>
              <p>Waktu ujian berjalan otomatis sesuai dengan durasi yang telah ditentukan per mata pelajaran/subtes.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">3.</span>
              <p>
                Peserta dapat menandai soal yang dirasa sulit dengan tombol <b className="text-amber-700">Ragu-Ragu</b> untuk diperiksa kembali kemudian.
              </p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">4.</span>
              <p>Pastikan seluruh soal telah dijawab dan tidak ada soal ragu-ragu sebelum waktu habis.</p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">5.</span>
              <p>
                Tombol <b className="text-emerald-700">Selesai</b> ditahan selama 1 menit (hitung mundur) dan akan aktif berwarna hijau jika semua soal terjawab lengkap tanpa ragu.
              </p>
            </div>
            <div className="flex gap-2.5">
              <span className="font-bold text-blue-600 shrink-0">6.</span>
              <p>Dilarang menutup, berpindah aplikasi/tab, atau me-refresh halaman ujian tanpa seizin proktor/pengawas.</p>
            </div>
          </div>
        )}

        {/* Content Tab 2: 10 Larangan Layar HP */}
        {activeTab === 'antiKecurangan' && (
          <div className="bg-red-50/50 p-4 sm:p-5 rounded-2xl max-h-72 overflow-y-auto border border-red-200/80 mb-6 space-y-2.5">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-red-200 text-red-900 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Aktivitas di Layar HP yang Termasuk Pelanggaran Berat:</span>
            </div>

            {PROHIBITED_CHEATING_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="bg-white p-3 rounded-xl border border-red-100 flex items-start gap-2.5 text-xs shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {act.id}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-gray-900">{act.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 shrink-0">
                      {act.kategori}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-tight">{act.desc}</p>
                </div>
              </div>
            ))}

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed font-medium">
              ⚡ <b>Sistem Deteksi Otomatis:</b> Aplikasi CBT mendeteksi setiap kali layar diminimalkan, berganti aplikasi (WhatsApp/Browser), split screen, serta memblokir copy-paste. Pelanggaran dicatat dalam log proktor.
            </div>
          </div>
        )}

        {/* Agreement Checkbox */}
        <label
          onClick={() => {
            setIsChecked(!isChecked);
            if (!isChecked) setShowWarning(false);
          }}
          className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer mb-6 ${
            isChecked
              ? 'bg-blue-50/70 border-blue-400 text-blue-900 ring-1 ring-blue-400'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/60'
          }`}
        >
          <div className="pt-0.5 text-blue-600 shrink-0">
            {isChecked ? (
              <CheckSquare className="w-5 h-5 fill-blue-600 text-white" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-medium select-none">
            Saya telah membaca, memahami, dan menyetujui seluruh tata tertib serta <b>10 larangan kecurangan layar HP</b>. Saya bersedia menerima sanksi pembatalan ujian jika terbukti melanggar.
          </span>
        </label>

        {showWarning && !isChecked && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Centang pernyataan persetujuan tata tertib terlebih dahulu untuk mulai ujian.</span>
          </div>
        )}

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isChecked
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Mulai Ujian Sekarang</span>
        </button>
      </div>
    </div>
  );
};
