require("dotenv").config(); // 1. Aktifkan modul dotenv di baris paling atas
const { Telegraf } = require("telegraf");

// 2. Ambil token dari file .env DAN bersihkan dari karakter gaib/spasi
const token = process.env.TELEGRAM_TOKEN
  ? process.env.TELEGRAM_TOKEN.trim()
  : undefined;

const bot = new Telegraf(token);

console.log(
  "Sistem Aktif! Bot Pengawal Jadwal Kuliah (Secure Mode) berjalan...",
);
// ... (sisa kode bot ke bawahnya biarkan tetap sama)

// Respon ketika Bos ketik /start di Telegram
bot.start((ctx) => {
  ctx.reply(
    "Siap, Bos Plankton! Saya aktif. Ketik /jadwal untuk melihat kelas yang harus Bos hadapi hari ini.",
  );
});

// Respon ketika Bos ketik /jadwal
bot.command("jadwal", (ctx) => {
  const pesanJadwal =
    "📅 JADWAL KULIAH HARI INI:\n\n" +
    "1. 08:00 - 10:30 | Pemrograman Berorientasi Objek (Kelas Bawah/Mengulang)\n" +
    "2. 13:00 - 15:30 | Teori Graf (Semester Atas)\n\n" +
    "Jangan sampai bolos, Bos! Ingat target lulus!";
  ctx.reply(pesanJadwal);
});

// Menghidupkan mesin bot
bot.launch();

// Membuat bot mati dengan aman jika terminal ditutup
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
