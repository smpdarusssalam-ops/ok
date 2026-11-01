import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Sparkles, Upload } from 'lucide-react';
import { UserAccount, ExamSettings } from '../types/cbt';
import { validateToken } from '../utils/cbtLogic';

interface VerificationScreenProps {
  user: UserAccount;
  settings: ExamSettings;
  onRefreshSettings: () => void;
  onVerificationSuccess: (selfieDataUrl: string) => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  user,
  settings,
  onRefreshSettings,
  onVerificationSuccess,
}) => {
  const [inputNama, setInputNama] = useState(user.nama);
  const [inputTglLahir, setInputTglLahir] = useState(user.tglLahir || '2010-05-18');
  const [inputToken, setInputToken] = useState('');
  const [previewFoto, setPreviewFoto] = useState<string | null>(user.fotoUrl || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto fill token button helper
  const handleAutoFillToken = () => {
    setInputToken(settings.token);
    setErrorMsg('');
  };

  // Turn on camera for selfie
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      // Fallback message
      setErrorMsg('Tidak dapat mengakses webcam. Anda dapat mengunggah file foto atau gunakan foto demo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw center crop
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewFoto(dataUrl);
      stopCamera();
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewFoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Demo avatar generator for testing
  const useDemoPhoto = () => {
    // Generate a clean stylized student avatar canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0b57d0';
      ctx.fillRect(0, 0, 200, 200);

      // Circle face
      ctx.fillStyle = '#fce8e6';
      ctx.beginPath();
      ctx.arc(100, 100, 70, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1f1f1f';
      ctx.beginPath();
      ctx.arc(100, 75, 75, Math.PI, 0);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1f1f1f';
      ctx.beginPath();
      ctx.arc(80, 95, 8, 0, Math.PI * 2);
      ctx.arc(120, 95, 8, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#1f1f1f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(100, 115, 20, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewFoto(dataUrl);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputNama.trim()) {
      setErrorMsg('Nama lengkap peserta tidak boleh kosong!');
      return;
    }
    if (!inputTglLahir) {
      setErrorMsg('Tanggal lahir harus diisi!');
      return;
    }
    if (!validateToken(inputToken, settings.token)) {
      setErrorMsg(`Token tidak valid! Masukkan token aktif (${settings.token}).`);
      return;
    }
    if (!previewFoto) {
      setErrorMsg('Harap ambil foto selfie atau unggah foto terlebih dahulu!');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerificationSuccess(previewFoto);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Verifikasi Data & Presensi Peserta
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cocokkan identitas ijazah dengan data terdaftar, lalu lakukan swafoto (selfie) dan input token ujian.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Kiri (Input Identitas) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
            {/* Token Active Bar */}
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-blue-900 font-medium block">Token Ujian Aktif:</span>
                  <span className="text-lg font-mono font-extrabold text-blue-700 tracking-wider">
                    {settings.token}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillToken}
                  className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Isi Otomatis</span>
                </button>
                <button
                  type="button"
                  onClick={onRefreshSettings}
                  title="Generate Token Baru"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Input Identitas Peserta
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap (Sesuai Ijazah)
                </label>
                <input
                  type="text"
                  id="inputNama"
                  value={inputNama}
                  onChange={(e) => setInputNama(e.target.value)}
                  placeholder="Ketik Nama Lengkap Anda"
                  className="w-full px-4 py-3 bg-[#f0f2f5] border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  id="inputTglLahir"
                  value={inputTglLahir}
                  onChange={(e) => setInputTglLahir(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f0f2f5] border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Token Ujian
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="inputToken"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    placeholder={`Masukkan token aktif (${settings.token})`}
                    className="w-full uppercase font-mono tracking-wider px-4 py-3 bg-[#f0f2f5] border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-sm font-bold text-gray-900 outline-none transition-all"
                    required
                  />
                  {validateToken(inputToken, settings.token) && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cocok</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Panel Kanan (Konfirmasi Data & Selfie) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Konfirmasi Data Terdaftar
              </h2>

              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-semibold">
                    Nomor Induk Kependudukan (NIK)
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm sm:text-base">{user.nik}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-semibold">
                    Nama Siswa Terdaftar
                  </span>
                  <span className="font-bold text-gray-900">{user.nama}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/50">
                  <div>
                    <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-semibold">
                      Kelas
                    </span>
                    <span className="font-semibold text-gray-800">{user.kelas}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-semibold">
                      Sekolah
                    </span>
                    <span className="font-semibold text-gray-800">{user.sekolah}</span>
                  </div>
                </div>
              </div>

              {/* Upload Selfie Section */}
              <div className="mt-5 bg-[#f0f2f5] p-5 rounded-2xl text-center border-2 border-dashed border-gray-300">
                {isCameraActive ? (
                  <div className="relative mx-auto w-48 h-48 bg-black rounded-2xl overflow-hidden mb-3 border-2 border-blue-600">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Jepret Foto</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-blue-600 overflow-hidden bg-white mb-3 shadow-sm flex items-center justify-center">
                      {previewFoto ? (
                        <img src={previewFoto} alt="Selfie Peserta" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      {previewFoto ? (
                        <span className="text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap Diverifikasi
                        </span>
                      ) : (
                        <span className="text-amber-700">Foto selfie wajib diambil</span>
                      )}
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Buka Kamera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-full bg-gray-600 text-white text-xs font-medium cursor-pointer"
                    >
                      Tutup Kamera
                    </button>
                  )}

                  <label className="px-3 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-all">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={useDemoPhoto}
                    className="px-3 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gunakan Foto Demo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="mt-6 w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <span>Memverifikasi Data...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Lanjut</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
