const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Memaksa Node.js memakai DNS Google & Cloudflare

require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const cron = require("node-cron");
// Import & setup MongoDB
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function hubungkanDatabase() {
  try {
    await client.connect();
    console.log(
      "Formula Rahasia Aman! Sukses Terkoneksi ke ChumBucket-DB 🪙✨",
    );
  } catch (error) {
    console.error("Waduh Bos, Gagal Konek ke Database:", error);
  }
}
hubungkanDatabase();

const token = process.env.TELEGRAM_TOKEN
  ? process.env.TELEGRAM_TOKEN.trim()
  : undefined;
const bot = new Telegraf(token);

// Variabel global untuk menampung ID Telegram Bos Plankton
let bossChatId = null;

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

// DATABASE BATAS PENGUMPULAN TUGAS (DEADLINE TRACKER)
let databaseDeadline = [
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

// 1. Respon ketika Bos ketik /start
bot.start((ctx) => {
  bossChatId = ctx.chat.id;
  console.log("Sistem berhasil mengunci Chat ID Bos: " + bossChatId);

  ctx.reply(
    "Siap, Bos Plankton! Sistem pengawal jadwal kuliah sudah aktif and stand-by di laboratorium.\n\n" +
      "Berikut adalah daftar perintah yang bisa Bos gunakan saat ini:\n" +
      "1. /jadwal - Membaca hari sistem secara otomatis dan memunculkan matkul HARI INI.\n" +
      "2. /esok - Mengintip daftar matkul untuk HARI ESOK demi persiapan mental dari sekarang.\n\n" +
      "Gunakan tombol di bawah ini untuk akses cepat tanpa mengetik, Bos!",

    Markup.keyboard([
      ["/jadwal", "/esok"], // Baris pertama (Tombol Waktu)
      ["/deadline"], // Baris kedua (Tombol Tugas)
    ]).resize(),
  );
});

// 2. Respon ketika Bos ketik /jadwal
bot.command("jadwal", (ctx) => {
  const angkaHariIni = new Date().getDay();
  const pesanJadwal = databaseJadwal[angkaHariIni];
  ctx.reply(pesanJadwal);
});

// 3. Respon ketika Bos ketik /esok
bot.command("esok", (ctx) => {
  const angkaHariIni = new Date().getDay();
  const angkaHariEsok = (angkaHariIni + 1) % 7;
  const pesanJadwalEsok = databaseJadwal[angkaHariEsok];
  ctx.reply("Sistem mendeteksi jadwal untuk esok hari:\n\n" + pesanJadwalEsok);
});

// 4. Respon Fitur Akses Jadwal Hari Spesifik secara Manual
bot.command("senin", (ctx) => ctx.reply(databaseJadwal[1]));
bot.command("selasa", (ctx) => ctx.reply(databaseJadwal[2]));
bot.command("rabu", (ctx) => ctx.reply(databaseJadwal[3]));
bot.command("kamis", (ctx) => ctx.reply(databaseJadwal[4]));
bot.command("jumat", (ctx) => ctx.reply(databaseJadwal[5]));
bot.command("sabtu", (ctx) => ctx.reply(databaseJadwal[6]));
bot.command("minggu", (ctx) => ctx.reply(databaseJadwal[0]));

// 5. Respon ketika Bos ketik /deadline
bot.command("deadline", (ctx) => {
  if (databaseDeadline.length === 0) {
    return ctx.reply(
      "🎉 Bersih, Bos! Tidak ada deadline tugas yang terdeteksi di dalam sistem saat ini.",
    );
  }

  let pesanOtomatis = "⚠️ DOSEN PENGIKUT TUAN KRABS MULAI MENEROR! ⚠️\n";
  pesanOtomatis += "Berikut daftar tugas yang harus segera Bos selesaikan:\n\n";

  databaseDeadline.forEach((item, index) => {
    pesanOtomatis += `${index + 1}. 📝 *${item.tugas}*\n`;
    pesanOtomatis += `   📅 Batas: ${item.tanggal} (${item.sisa})\n\n`;
  });

  pesanOtomatis +=
    "Jangan ditunda lagi Bos, demi formula rahasia kelulusan kita!";
  ctx.replyWithMarkdown(pesanOtomatis);
});

// 6. Perintah untuk menambah tugas baru secara instan
bot.command("tambah", (ctx) => {
  const teksInput = ctx.message.text.split(" ").slice(1).join(" ");

  if (!teksInput) {
    return ctx.reply(
      "⚠️ Format salah, Bos! Ketik: /tambah [nama tugas]\nContoh: /tambah Revisi Bab 5",
    );
  }

  databaseDeadline.push({
    tugas: teksInput,
    tanggal: "Belum diset",
    sisa: "Segera",
  });

  ctx.reply(
    `✅ Berhasil dimasukkan ke radar laboratorium, Bos Plankton!\nTugas: "*${teksInput}*" telah ditambahkan.`,
  );
});

// 7. Perintah untuk menghapus tugas yang sudah selesai
bot.command("kelar", (ctx) => {
  const nomorTugas = parseInt(ctx.message.text.split(" ")[1]);

  if (
    isNaN(nomorTugas) ||
    nomorTugas < 1 ||
    nomorTugas > databaseDeadline.length
  ) {
    return ctx.reply(
      "⚠️ Masukkan nomor urut tugas yang valid, Bos!\nContoh: /kelar 1",
    );
  }

  const tugasDihapus = databaseDeadline.splice(nomorTugas - 1, 1);

  ctx.reply(
    `🎉 Mwahahaha! Tugas "*${tugasDihapus[0].tugas}*" resmi dihancurkan! Selangkah lebih dekat menuju kelulusan, Bos!`,
  );
});

// 8. LOGIKA AUTO-REMINDER (Dijalankan setiap hari jam 07:00 pagi)
cron.schedule(
  "0 7 * * *",
  () => {
    if (bossChatId) {
      const angkaHariIni = new Date().getDay();
      const pesanJadwal = databaseJadwal[angkaHariIni];

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
    timezone: "Asia/Jakarta",
  },
);

// 9. Menghidupkan mesin bot
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
