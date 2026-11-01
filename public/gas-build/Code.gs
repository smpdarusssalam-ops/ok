/**
 * ====================================================================
 * PUSMENJAR CBT - Google Apps Script (Code.gs)
 * Web App & Database Server Spreadsheet Pusmenjar CBT
 * ====================================================================
 */

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'getDatabase') {
      return ContentService
        .createTextOutput(JSON.stringify(getDatabaseData()))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    if (e && e.parameter && e.parameter.action === 'getDatabase') {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Tampilkan antarmuka Web App CBT (Direct Launch / Auto Bypass)
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('PUSMENJAR CBT - Asesmen Nasional Berbasis Komputer')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  } catch (errIndex) {
    return HtmlService.createHtmlOutput(
      "<div style='font-family:sans-serif;padding:30px;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);'>" +
      "<h2 style='color:#1a73e8;'>PUSMENJAR CBT - Web App Active</h2>" +
      "<p>Pastikan Anda telah menambahkan berkas <b>Index.html</b> di editor Apps Script.</p>" +
      "</div>"
    );
  }
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
}
