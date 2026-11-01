import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  BookOpen,
  FileCode,
  ShieldCheck,
  Send,
  HelpCircle,
  X,
  Database,
  RefreshCw,
  Table,
  Github,
  Globe,
  ExternalLink
} from 'lucide-react';

interface GasExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examResultPayload?: {
    nik: string;
    nama: string;
    kelas: string;
    sekolah: string;
    finalScore: number;
    kategori?: string;
    correctCount: number;
    incorrectCount: number;
    totalQuestions: number;
    violationsCount: number;
    isDisqualified: boolean;
    violations: any[];
  } | null;
  onLoadDatabaseFromGas?: (dbData: {
    pengaturan?: any;
    siswa?: any[];
    bankSoal?: any;
  }) => void;
}

export const GasExportModal: React.FC<GasExportModalProps> = ({
  isOpen,
  onClose,
  examResultPayload,
  onLoadDatabaseFromGas
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'download' | 'database' | 'sync' | 'guide'>('github');
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [copiedGhUrl, setCopiedGhUrl] = useState(false);
  const [gasWebUrl, setGasWebUrl] = useState(() => {
    return localStorage.getItem('cbt_gas_url') || 'https://script.google.com/macros/s/AKfycbwnO46ByAhwZorx5TrX1Sp1tQqcDfh9il3rqqmU4n6ejh70EEOqxMPAzuEYGVlPKTq1/exec';
  });
  const [githubUsername, setGithubUsername] = useState('username');
  const [githubRepo, setGithubRepo] = useState('pusmenjar-cbt');
  const [gasLoading, setGasLoading] = useState(false);
  const [gasStatus, setGasStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isInsideGas, setIsInsideGas] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
      setIsInsideGas(true);
    }
  }, []);

  useEffect(() => {
    if (gasWebUrl.trim()) {
      localStorage.setItem('cbt_gas_url', gasWebUrl.trim());
    }
  }, [gasWebUrl]);

  if (!isOpen) return null;

  const CODE_GS_CONTENT = `/**
 * ====================================================================
 * PUSMENJAR CBT - Google Apps Script (Code.gs)
 * Database Spreadsheet Server Lengkap:
 * 1. Sheet "Pengaturan Ujian" (Nama Tes, Token, Durasi, Jeda)
 * 2. Sheet "Data Siswa" (Login Username, Password, NIK, Nama, Kelas)
 * 3. Sheet "Bank Soal" (Soal Literasi, Numerasi, Karakter & SVG Matching)
 * 4. Sheet "Hasil Ujian" (Rekap Skor, Benar/Salah, Log Anti-Kecurangan)
 * ====================================================================
 */

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'getDatabase') {
      return ContentService
        .createTextOutput(JSON.stringify(getDatabaseData()))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {}

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('PUSMENJAR CBT - Asesmen Nasional Berbasis Komputer')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(contents);
    var action = data.action || "saveResult";

    if (action === "getDatabase") {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", data: getDatabaseData() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var res = recordToSheet(data);
    return ContentService
      .createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function recordToSheet(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { status: "error", message: "Spreadsheet tidak ditemukan." };

    var sheet = ss.getSheetByName("Hasil Ujian");
    if (!sheet) sheet = ss.insertSheet("Hasil Ujian");
    
    if (sheet.getLastRow() === 0) {
      var headers = ["Waktu Selesai", "NIK / NISN", "Nama Peserta", "Kelas", "Sekolah", "Nilai Akhir", "Kategori Capaian", "Jumlah Benar", "Jumlah Salah", "Total Soal", "Total Pelanggaran", "Status Didiskualifikasi", "Log Pelanggaran Anti-Kecurangan"];
      sheet.appendRow(headers);
      var h = sheet.getRange(1, 1, 1, headers.length);
      h.setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var nik = data.nik || "-";
    var nama = data.nama || "-";
    var kelas = data.kelas || "-";
    var sekolah = data.sekolah || "-";
    var finalScore = Number(data.finalScore || 0);
    var kategori = data.kategori || (finalScore >= 85 ? "Mahir" : finalScore >= 70 ? "Cakap" : finalScore >= 50 ? "Dasar" : "Perlu Intervensi");
    var correctCount = Number(data.correctCount || 0);
    var incorrectCount = Number(data.incorrectCount || 0);
    var totalQuestions = Number(data.totalQuestions || (correctCount + incorrectCount));
    var violationsCount = Number(data.violationsCount || 0);
    var isDisqualified = data.isDisqualified ? "YA (DISKUALIFIKASI)" : "TIDAK (VALID)";
    var violationsLog = typeof data.violations === "string" ? data.violations : JSON.stringify(data.violations || []);
    
    sheet.appendRow([timestamp, nik, nama, kelas, sekolah, finalScore, kategori, correctCount, incorrectCount, totalQuestions, violationsCount, isDisqualified, violationsLog]);
    var lastRow = sheet.getLastRow();
    if (data.isDisqualified) sheet.getRange(lastRow, 1, 1, 13).setBackground("#fce8e6");
    
    return { status: "success", message: "Nilai " + nama + " (" + finalScore + ") berhasil dicatat di Google Sheets!" };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

function getDatabaseData() {
  setupInitialSheets(false);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return { status: "notice", pengaturan: {}, siswa: [], bankSoal: {} };

  var sPengaturan = ss.getSheetByName("Pengaturan Ujian");
  var pengaturanData = {};
  if (sPengaturan) {
    var pVals = sPengaturan.getDataRange().getValues();
    for (var i = 1; i < pVals.length; i++) {
      var key = String(pVals[i][0]).trim();
      var val = pVals[i][1];
      if (key) pengaturanData[key] = val;
    }
  }

  var sSiswa = ss.getSheetByName("Data Siswa");
  var listSiswa = [];
  if (sSiswa) {
    var sVals = sSiswa.getDataRange().getValues();
    for (var j = 1; j < sVals.length; j++) {
      if (sVals[j][0]) {
        listSiswa.push({
          username: String(sVals[j][0]).trim(),
          password: String(sVals[j][1]).trim(),
          nama: String(sVals[j][2]),
          nik: String(sVals[j][3]),
          kelas: String(sVals[j][4]),
          sekolah: String(sVals[j][5])
        });
      }
    }
  }

  return { status: "success", pengaturan: pengaturanData, siswa: listSiswa };
}

function setupInitialSheets(forceReset) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;

    var sPengaturan = ss.getSheetByName("Pengaturan Ujian");
    if (!sPengaturan) {
      sPengaturan = ss.insertSheet("Pengaturan Ujian");
      sPengaturan.appendRow(["Parameter", "Nilai / Setting"]);
      sPengaturan.appendRow(["namaTes", "SIMULASI ANBK PUSMENJAR TAHUN 2026/2027"]);
      sPengaturan.appendRow(["token", "PUSMEN26"]);
      sPengaturan.appendRow(["durasiMenit", 15]);
      sPengaturan.appendRow(["durasiJedaMenit", 1]);
      sPengaturan.getRange(1, 1, 1, 2).setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    }

    var sSiswa = ss.getSheetByName("Data Siswa");
    if (!sSiswa) {
      sSiswa = ss.insertSheet("Data Siswa");
      sSiswa.appendRow(["Username", "Password", "Nama Peserta", "NIK / NISN", "Kelas", "Sekolah"]);
      sSiswa.appendRow(["peserta01", "password123", "SITI AFIFAH NURHAYATI", "3201145608020003", "IX - A (SMP)", "SMP NEGERI 1 TELADAN"]);
      sSiswa.appendRow(["siswa02", "password123", "AHMAD RIZKY PRATAMA", "3201146709030005", "IX - B (SMP)", "SMP NEGERI 1 TELADAN"]);
      sSiswa.getRange(1, 1, 1, 6).setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    }
  } catch (e) {}
}`;

  const handleDownloadCodeGs = () => {
    const blob = new Blob([CODE_GS_CONTENT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIndexHtml = () => {
    const a = document.createElement('a');
    a.href = '/gas-build/Index.html';
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCodeGs = () => {
    navigator.clipboard.writeText(CODE_GS_CONTENT);
    setCopiedCodeGs(true);
    setTimeout(() => setCopiedCodeGs(false), 2000);
  };

  const generatedGhPagesUrl = `https://${githubUsername.trim() || 'username'}.github.io/${githubRepo.trim() || 'pusmenjar-cbt'}/?gasUrl=${encodeURIComponent(gasWebUrl.trim())}`;

  const handleCopyGhUrl = () => {
    navigator.clipboard.writeText(generatedGhPagesUrl);
    setCopiedGhUrl(true);
    setTimeout(() => setCopiedGhUrl(false), 2000);
  };

  const handleFetchDatabase = async () => {
    setGasLoading(true);
    setDbStatusMsg(null);

    if (isInsideGas && (window as any).google?.script?.run) {
      try {
        (window as any).google.script.run
          .withSuccessHandler((res: any) => {
            setGasLoading(false);
            if (res && res.status === 'success') {
              if (onLoadDatabaseFromGas) onLoadDatabaseFromGas(res);
              setDbStatusMsg('✅ Berhasil memuat data dari Spreadsheet (Siswa & Pengaturan Ujian)!');
            } else {
              setDbStatusMsg('❌ Gagal memuat data dari Spreadsheet: ' + (res?.message || 'Error tidak diketahui'));
            }
          })
          .getDatabaseData();
      } catch (err: any) {
        setGasLoading(false);
        setDbStatusMsg('❌ Error: ' + err.message);
      }
      return;
    }

    if (!gasWebUrl.trim()) {
      setGasLoading(false);
      setDbStatusMsg('⚠️ Masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    try {
      const res = await fetch(gasWebUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getDatabase' }),
      });
      const json = await res.json();
      if (json && json.data) {
        if (onLoadDatabaseFromGas) onLoadDatabaseFromGas(json.data);
        setDbStatusMsg('✅ Berhasil menarik database dari Spreadsheet via Web App URL!');
      } else {
        setDbStatusMsg('❌ Tanggapan URL tidak valid: ' + JSON.stringify(json));
      }
    } catch (err: any) {
      setDbStatusMsg('❌ Gagal mengambil data: ' + (err.message || 'Cek CORS/akses Web App'));
    } finally {
      setGasLoading(false);
    }
  };

  const handleSyncToGas = async (e: React.FormEvent) => {
    e.preventDefault();
    setGasLoading(true);
    setGasStatus(null);

    const payload = examResultPayload || {
      nik: '1234567890123456',
      nama: 'Peserta Uji Coba',
      kelas: 'IX SMP',
      sekolah: 'SMP Negeri Simulasi',
      finalScore: 85,
      kategori: 'Mahir',
      correctCount: 9,
      incorrectCount: 1,
      totalQuestions: 10,
      violationsCount: 0,
      isDisqualified: false,
      violations: [],
    };

    if (isInsideGas && (window as any).google?.script?.run) {
      try {
        (window as any).google.script.run
          .withSuccessHandler((res: any) => {
            setGasLoading(false);
            setGasStatus({
              success: true,
              message: res?.message || 'Data berhasil disimpan langsung ke Google Spreadsheet!'
            });
          })
          .saveExamResult(payload);
      } catch (err: any) {
        setGasLoading(false);
        setGasStatus({
          success: false,
          message: 'Error Google Apps Script: ' + (err.message || String(err))
        });
      }
      return;
    }

    if (!gasWebUrl.trim()) {
      setGasLoading(false);
      setGasStatus({ success: false, message: 'Masukkan URL Web App Google Apps Script Anda terlebih dahulu.' });
      return;
    }

    try {
      const res = await fetch(gasWebUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setGasStatus({
        success: true,
        message: data.message || 'Hasil ujian berhasil dikirim ke Google Sheets!'
      });
    } catch (err: any) {
      setGasStatus({
        success: false,
        message: 'Gagal mengirim data: ' + (err.message || 'Error jaringan')
      });
    } finally {
      setGasLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20 shadow-inner">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Hosting UI di GitHub Pages + Database Spreadsheet
              </h3>
              <p className="text-xs text-gray-300">
                Tampilan Cepat & Bebas Cookie di GitHub Pages • Data Tersimpan di Google Sheets
              </p>
            </div>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 pt-3 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'github'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Pages (Utama)</span>
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'download'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Berkas</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'database'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Struktur Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim/Tarik Data</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {activeTab === 'github' && (
            <div className="space-y-5 text-xs text-gray-700">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900 space-y-1.5">
                <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-800">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Kombinasi Terbaik: GitHub Pages + Google Spreadsheet</span>
                </h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Tampilan CBT di-host gratis di <strong>GitHub Pages</strong> (sangat cepat, ringan, tanpa hambatan cookie di HP mana pun), sedangkan seluruh data siswa, bank soal, dan hasil nilai ujian tersimpan otomatis di <strong>Google Spreadsheet</strong> Anda!
                </p>
              </div>

              {/* Step 1: Apps Script URL */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                  1. Masukkan URL Web App Google Apps Script Anda:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasWebUrl}
                  onChange={(e) => setGasWebUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-mono text-gray-900 outline-none transition-all"
                />
              </div>

              {/* Step 2: Download index.html for Github */}
              <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-gray-900 text-xs">
                    2. Unduh Berkas <code>index.html</code> Siap Pakai
                  </h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Tinggal unggah file <code>index.html</code> ini ke repository GitHub Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadIndexHtml}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download index.html</span>
                </button>
              </div>

              {/* Step 3: Link GitHub Pages generator */}
              <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-2xl space-y-3">
                <h5 className="font-bold text-blue-950 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>3. Link GitHub Pages Siswa Anda (Auto-Generated):</span>
                </h5>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Username GitHub:</label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Repo GitHub:</label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                  <span className="text-[11px] font-mono text-blue-900 truncate">
                    {generatedGhPagesUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyGhUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedGhUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGhUrl ? 'Tersalin' : 'Salin Link'}</span>
                  </button>
                </div>
              </div>

              {/* Step 4: Simple GitHub steps */}
              <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50 space-y-2">
                <h5 className="font-bold text-gray-900 text-xs">4. Cara Pasang di GitHub dalam 3 Klik:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-600">
                  <li>Buka <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">github.com/new</a> &gt; buat repository baru (misal: <code>pusmenjar-cbt</code>).</li>
                  <li>Klik <strong>Upload an existing file</strong> &gt; unggah file <code>index.html</code> yang baru Anda unduh di atas.</li>
                  <li>Buka <strong>Settings</strong> repo &gt; pilih menu <strong>Pages</strong> (di bilah kiri).</li>
                  <li>Di bagian <em>Build and deployment</em>, set Branch ke <strong>main</strong> &gt; klik <strong>Save</strong>.</li>
                  <li>Selesai! Bagikan <strong>Link GitHub Pages</strong> di atas kepada seluruh siswa Anda!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Berkas Lengkap Siap Pakai
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                      Anda dapat mengunduh berkas <code>index.html</code> untuk GitHub Pages / Google Sites dan berkas <code>Code.gs</code> untuk server Google Spreadsheet Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* File 1: Index.html */}
              <div className="border border-gray-200 rounded-2xl p-4.5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-mono font-bold">
                      index.html
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      Tampilan CBT untuk GitHub Pages
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Seluruh aplikasi CBT, CSS Tailwind, SVG Matching, timer, dan anti-kecurangan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadIndexHtml}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download index.html</span>
                </button>
              </div>

              {/* File 2: Code.gs */}
              <div className="border border-gray-200 rounded-2xl p-4.5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                      Code.gs
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      Server Database Google Spreadsheet
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Script pembuat otomatis sheet Data Siswa, Bank Soal, Pengaturan Ujian, & Hasil Ujian.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCodeGs}
                    className="px-3 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedCodeGs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeGs ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCodeGs}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Code.gs</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-900 space-y-2">
                <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Struktur 4 Lembar (Sheets) Database Spreadsheet</span>
                </h4>
                <p className="text-[11px]">
                  Saat skrip <code>Code.gs</code> dijalankan pertama kali, Google Apps Script akan secara otomatis membuat 4 sheet berikut di Google Spreadsheet Anda:
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50">
                <p className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. Sheet "Pengaturan Ujian"
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Menyimpan parameter: <code>namaTes</code>, <code>token</code>, <code>durasiMenit</code>, <code>durasiJedaMenit</code>.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50">
                <p className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  2. Sheet "Data Siswa"
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Kolom: <code>Username</code> | <code>Password</code> | <code>Nama Peserta</code> | <code>NIK / NISN</code> | <code>Kelas</code> | <code>Sekolah</code>.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50">
                <p className="font-bold text-gray-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  3. Sheet "Hasil Ujian"
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Kolom: <code>Waktu Selesai</code> | <code>NIK</code> | <code>Nama</code> | <code>Nilai Akhir</code> | <code>Status Disqualified</code> | <code>Log Anti-Kecurangan</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="border border-indigo-200 bg-indigo-50/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600" />
                    <span>Tarik Live Database dari Spreadsheet</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleFetchDatabase}
                    disabled={gasLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gasLoading ? 'animate-spin' : ''}`} />
                    <span>{gasLoading ? 'Memuat...' : 'Muat Database Live'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Tekan tombol di atas untuk menyinkronkan data peserta, bank soal, dan pengaturan ujian terbaru yang Anda ubah di Google Spreadsheet ke antarmuka aplikasi CBT ini.
                </p>
                {dbStatusMsg && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs font-semibold text-gray-800">
                    {dbStatusMsg}
                  </div>
                )}
              </div>

              <form onSubmit={handleSyncToGas} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    URL Web App Google Apps Script
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={gasWebUrl}
                    onChange={(e) => setGasWebUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-mono text-gray-900 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={gasLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{gasLoading ? 'Mengirim Data...' : 'Kirim Hasil Ujian ke Spreadsheet'}</span>
                </button>
              </form>

              {gasStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold border ${
                    gasStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {gasStatus.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-[11px] text-gray-400">
            PUSMENJAR CBT • GitHub Pages & Google Spreadsheet Integration
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
