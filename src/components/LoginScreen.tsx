import React, { useState } from 'react';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, Sparkles, FileCode } from 'lucide-react';
import { UserAccount } from '../types/cbt';
import { DEMO_ACCOUNTS } from '../data/mockData';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onOpenGasModal?: () => void;
  accountsList?: UserAccount[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenGasModal,
  accountsList = DEMO_ACCOUNTS,
}) => {
  const [username, setUsername] = useState('peserta01');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan Username dan Password!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const activeList = accountsList.length > 0 ? accountsList : DEMO_ACCOUNTS;
      const found = activeList.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password.trim()
      );

      if (found) {
        setIsLoading(false);
        onLoginSuccess(found);
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password salah. Gunakan akun terdaftar di sheet "Data Siswa".');
      }
    }, 400);
  };

  const handleSelectDemo = (account: UserAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f0f4f9] to-[#e4edf7]">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 sm:p-10 border border-gray-100">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PUSMENJAR CBT</h1>
            <p className="text-sm text-gray-500 mt-1">Asesmen Nasional Berbasis Komputer</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Server Simulasi Siap & Aktif</span>
            </div>

            {onOpenGasModal && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onOpenGasModal}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition-all font-bold cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Build ke Google Apps Script (Code.gs & Index.html)</span>
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Username Peserta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username Anda"
                  className="w-full pl-10 pr-4 py-3 bg-[#f0f2f5] border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password Anda"
                  className="w-full pl-10 pr-4 py-3 bg-[#f0f2f5] border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke CBT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pilih Akun Demo Cepat
              </span>
            </div>
            <div className="space-y-2">
              {(accountsList.length > 0 ? accountsList : DEMO_ACCOUNTS).map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                    username === acc.username
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-500'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{acc.nama}</p>
                    <p className="text-[11px] text-gray-500">{acc.username} • {acc.kelas}</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    Pilih
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Kementerian Pendidikan Dasar dan Menengah • Pusat Asesmen Pendidikan
        </p>
      </div>
    </div>
  );
};
