import React from 'react';
import { GraduationCap, LogOut, RefreshCw, KeyRound, User, FileCode } from 'lucide-react';
import { UserAccount, ExamSettings } from '../types/cbt';

interface NavbarProps {
  user: UserAccount | null;
  settings: ExamSettings;
  onLogout: () => void;
  onRefreshToken?: () => void;
  onOpenGasModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, settings, onLogout, onRefreshToken, onOpenGasModal }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base sm:text-lg tracking-tight flex items-center gap-2">
              PUSMENJAR CBT
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                ANBK 2026
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">Pusat Asesmen Pendidikan & Kemdikbudristek</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Google Apps Script Button */}
          {onOpenGasModal && (
            <button
              onClick={onOpenGasModal}
              title="Build & Deploy ke Google Apps Script (Code.gs & Index.html)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Google Script</span>
            </button>
          )}

          {/* Active Token Pill */}
          <div className="hidden md:flex items-center gap-2 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-medium text-blue-900">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Token:</span>
            <span className="font-mono font-bold tracking-wider text-blue-700">{settings.token}</span>
            {onRefreshToken && (
              <button
                onClick={onRefreshToken}
                title="Refresh Token Ujian"
                className="text-blue-600 hover:text-blue-800 transition-colors ml-0.5"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-50 overflow-hidden">
                {user.fotoUrl ? (
                  <img src={user.fotoUrl} alt={user.nama} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user.nama}</p>
                <p className="text-[11px] text-gray-500">{user.kelas} • {user.sekolah}</p>
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
