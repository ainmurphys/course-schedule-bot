require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const cron = require("node-cron"); // <-- 1. IMPORT NODE-CRON DI SINI

const token = process.env.TELEGRAM_TOKEN
  ? process.env.TELEGRAM_TOKEN.trim()
  : undefined;
const bot = new Telegraf(token);

// Variabel global untuk menampung ID Telegram Bos Plankton
let bossChatId = null; // <-- 2. WADAH CHAT ID

console.log(
  "Sistem Aktif! Bot Pengawal Jadwal Kuliah (Secure Mode) berjalan...",
);

// DATABASE JADWAL KULIAH BOS PLANKTON
const databaseJadwal = {
  1:
    "📅 JADWAL KULIAH HARI SENIN:\n\n" +
    "1. 09:30 - 11:10 | Pengolahan Citra Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "2. 10:20 - 12:00 | Konsep Perangkat Keras Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "Jangan sampai bolos, Bos! Ingat target lulus!",

  2:
    "📅 JADWAL KULIAH HARI SELASA:\n\n" +
    "1. 07:00 - 09:30 | Elektronika Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "Jangan sampai bolos, Bos! Ingat target lulus!",

  3:
    "📅 JADWAL KULIAH HARI RABU:\n\n" +
    "1. 08:40 - 10:20 | Sistem Operasi Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n" +
    "2. 09:30 - 11:10 | Technopreneurship Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "Jangan sampai bolos, Bos! Ingat target lulus!",

  4:
    "📅 JADWAL KULIAH HARI KAMIS:\n\n" +
    "1. 09:30 - 11:10 | Sistem Komputer Berkinerja Tinggi Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "Belum ada matkul lain yang diinput untuk hari ini, Bos. Jangan keluyuran ke Krusty Krab!",

  5:
    "📅 JADWAL KULIAH HARI JUMAT:\n\n" +
    "1. 09:30 - 11:10 | Teknologi IoT Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\n" +
    "Belum ada matkul lain yang diinput untuk hari ini, Bos. Persiapan menuju akhir pekan.",

  6:
    "📅 JADWAL KULIAH HARI SABTU:\n\n" +
    "🎉 HARI SABTU LIBUR! Waktunya menyusun rencana cadangan untuk mengalahkan Tuan Krabs!",

  0:
    "📅 JADWAL KULIAH HARI MINGGU:\n\n" +
    "🛌 HARI MINGGU LIBUR! Istirahat total, Bos. siapkan energi untuk mengulang matkul besok pagi.",
};

// === COPIED / PASTE DATABASE DEADLINE DI BAWAH DATABASE JADWAL ===

// DATABASE BATAS PENGUMPULAN TUGAS (DEADLINE TRACKER)
const databaseDeadline = [
  {
    tugas: "Revisi Bab 4 Skripsi (Metodologi)",
    tanggal: "20 Juni 2026",
    sisa: "4 Hari lagi",
  },
  {
    tugas: "Laporan Proyek Akhir Teknologi IoT",
    tanggal: "25 Juni 2026",
    sisa: "9 Hari lagi",
  },
  {
    tugas: "Proposal Bisnis Technopreneurship",
    tanggal: "02 Juli 2026",
    sisa: "16 Hari lagi",
  },
];

// 3. Respon ketika Bos ketik /start
bot.start((ctx) => {
  // Amankan ID chat Bos ke dalam sistem variabel laboratorium
  bossChatId = ctx.chat.id; // <-- 3. PROSES PENANGKAPAN CHAT ID

  console.log("Sistem berhasil mengunci Chat ID Bos: " + bossChatId);

  ctx.reply(
    "Siap, Bos Plankton! Sistem pengawal jadwal kuliah sudah aktif dan stand-by di laboratorium.\n\n" +
      "Berikut adalah daftar perintah yang bisa Bos gunakan saat ini:\n" +
      "1. /jadwal - Membaca hari sistem secara otomatis dan memunculkan matkul HARI INI.\n" +
      "2. /esok - Mengintip daftar matkul untuk HARI ESOK demi persiapan mental dari sekarang.\n\n" +
      "Gunakan tombol di bawah ini untuk akses cepat tanpa mengetik, Bos!",

    // Update bagian Markup di dalam bot.start agar tombolnya jadi 2 baris rapi
    Markup.keyboard([
      ["/jadwal", "/esok"], // Baris pertama (Tombol Waktu)
      ["/deadline"], // Baris kedua (Tombol Tugas)
    ]).resize(),
  );
});

// 4. Respon ketika Bos ketik /jadwal
bot.command("jadwal", (ctx) => {
  const angkaHariIni = new Date().getDay();
  const pesanJadwal = databaseJadwal[angkaHariIni];
  ctx.reply(pesanJadwal);
});

// 4b. Respon ketika Bos ketik /esok
bot.command("esok", (ctx) => {
  const angkaHariIni = new Date().getDay();
  const angkaHariEsok = (angkaHariIni + 1) % 7;
  const pesanJadwalEsok = databaseJadwal[angkaHariEsok];
  ctx.reply("Sistem mendeteksi jadwal untuk esok hari:\n\n" + pesanJadwalEsok);
});

// === COPIED / PASTE KODE AKSES HARI SPESIFIK DI BAWAH INI ===

// 4d. Respon Fitur Akses Jadwal Hari Spesifik secara Manual
bot.command("senin", (ctx) => ctx.reply(databaseJadwal[1]));
bot.command("selasa", (ctx) => ctx.reply(databaseJadwal[2]));
bot.command("rabu", (ctx) => ctx.reply(databaseJadwal[3]));
bot.command("kamis", (ctx) => ctx.reply(databaseJadwal[4]));
bot.command("jumat", (ctx) => ctx.reply(databaseJadwal[5]));
bot.command("sabtu", (ctx) => ctx.reply(databaseJadwal[6]));
bot.command("minggu", (ctx) => ctx.reply(databaseJadwal[0]));

// === COPIED / PASTE PERINTAH /DEADLINE DI SINI ===

// 4e. Respon ketika Bos ketik /deadline
bot.command("deadline", (ctx) => {
  // Jika database kosong, beri laporan aman
  if (databaseDeadline.length === 0) {
    return ctx.reply(
      "🎉 Bersih, Bos! Tidak ada deadline tugas yang terdeteksi di dalam sistem saat ini.",
    );
  }

  let pesanOtomatis = "⚠️ DOSEN PENGIKUT TUAN KRABS MULAI MENEROR! ⚠️\n";
  pesanOtomatis += "Berikut daftar tugas yang harus segera Bos selesaikan:\n\n";

  // Looping untuk menyusun daftar tugas agar rapi ke bawah
  databaseDeadline.forEach((item, index) => {
    pesanOtomatis += `${index + 1}. 📝 *${item.tugas}*\n`;
    pesanOtomatis += `   📅 Batas: ${item.tanggal} (${item.sisa})\n\n`;
  });

  pesanOtomatis +=
    "Jangan ditunda lagi Bos, demi formula rahasia kelulusan kita!";

  // Mengirim pesan dengan mode Markdown agar teks tugas bisa tebal (bold)
  ctx.replyWithMarkdown(pesanOtomatis);
});

// 4c. LOGIKA AUTO-REMINDER (Dijalankan setiap hari jam 07:00 pagi)
// Format cron: menit jam hari-dari-bulan bulan hari-dari-minggu
cron.schedule(
  "0 7 * * *",
  () => {
    if (bossChatId) {
      const angkaHariIni = new Date().getDay();
      const pesanJadwal = databaseJadwal[angkaHariIni];

      // Mengirim pesan langsung menggunakan bot instance tanpa trigger user
      bot.telegram.sendMessage(
        bossChatId,
        "PEMBERITAHUAN OTOMATIS LABORATORIUM:\n\n" + pesanJadwal,
      );
      console.log("Laporan rutin jam 7 pagi sukses dikirim ke Bos Plankton.");
    } else {
      console.log(
        "Reminder otomatis tertunda: Bos belum mengaktifkan bot lewat perintah /start pagi ini.",
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta", // Menyelaraskan waktu server lokal dengan zona waktu WIB/WITA/WIT
  },
);

// 5. Menghidupkan mesin bot
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
