require("dotenv").config();
const { Telegraf } = require("telegraf");

// 1. Ambil token aman dari brankas .env
const token = process.env.TELEGRAM_TOKEN
  ? process.env.TELEGRAM_TOKEN.trim()
  : undefined;
const bot = new Telegraf(token);

console.log(
  "Sistem Aktif! Bot Pengawal Jadwal Kuliah (Secure Mode) berjalan...",
);

// 2. DATABASE JADWAL KULIAH BOS PLANKTON
// Angka mewakili hari: 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 0 = Minggu
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
    "🛌 HARI MINGGU LIBUR! Istirahat total, siapkan energi untuk mengulang matkul besok pagi.",
};

// 3. Respon ketika Bos ketik /start
bot.start((ctx) => {
  ctx.reply(
    "Siap, Bos Plankton! Saya aktif. Ketik /jadwal untuk melihat kelas yang harus Bos hadapi HARI INI secara otomatis.",
  );
});

// 4. Respon ketika Bos ketik /jadwal (Logika Otomatisasi Hari)
bot.command("jadwal", (ctx) => {
  // Mengambil angka hari saat ini berdasarkan jam sistem komputer Bos
  const angkaHariIni = new Date().getDay(); // <-- SEKARANG SUDAH DIGABUNG (TANPA SPASI)

  // Mengambil teks jadwal yang cocok dari database
  const pesanJadwal = databaseJadwal[angkaHariIni]; // <-- SEKARANG SUDAH DIGABUNG JUGA

  // Kirimkan hasilnya ke Telegram
  ctx.reply(pesanJadwal);
});

// 5. Menghidupkan mesin bot
bot.launch();

// Membuat bot mati dengan aman jika terminal ditutup
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
