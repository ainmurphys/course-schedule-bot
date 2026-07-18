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

// =============================================================
// VERSI NATIVE: PERINTAH TAMBAH JADWAL LANGSUNG PAKE MONGO_CLIENT
// =============================================================
bot.command("tambahjadwal", async (ctx) => {
  const pesanRaw = ctx.message.text.replace("/tambahjadwal", "").trim();

  if (!pesanRaw) {
    return ctx.reply(
      "❌ Format salah, Bos! Contoh penggunaan:\n\n/tambahjadwal Senin | 08:00 | Struktur Data | Lab Komputer 3",
    );
  }

  // 🎯 UPGRADE ANTI-GESER: Ditambahkan .filter(Boolean) untuk buang potongan kosong akibat salah taruh pipa
  const bagian = pesanRaw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (bagian.length < 3) {
    return ctx.reply(
      "❌ Data kurang lengkap! Pastikan ada pemisah (|) untuk Hari, Jam, dan Matkul.",
    );
  }

  const [hari, jam, matkul, ruangan] = bagian;

  try {
    const db = client.db();
    const collection = db.collection("jadwals");

    await collection.insertOne({
      hari: hari,
      jam: jam,
      matkul: matkul,
      ruangan: ruangan || "Tidak Ada / Online",
      chatId: ctx.chat.id.toString(),
    });

    ctx.reply(
      `✅ Formula Jadwal Berhasil Disimpan di Cloud!\n\n📅 Hari: ${hari}\n⏰ Jam: ${jam}\n📚 Matkul: ${matkul}\n🏛️ Ruangan: ${ruangan || "-"}`,
    );
  } catch (error) {
    console.error("Gagal simpan ke database:", error);
    ctx.reply("❌ Waduh Bos, gagal nge-save ke MongoDB Atlas.");
  }
});

// =============================================================
// FITUR BARU: MELIHAT SEMUA DATA JADWAL LANGSUNG DARI MONGODB
// =============================================================
bot.command("semuajadwal", async (ctx) => {
  try {
    const db = client.db();
    const collection = db.collection("jadwals");

    // 🎯 Mencari semua dokumen di database yang chatId-nya cocok dengan ID Bos
    const listJadwal = await collection
      .find({ chatId: ctx.chat.id.toString() })
      .toArray();

    // Validasi kalau di database ternyata masih kosong melompong
    if (listJadwal.length === 0) {
      return ctx.reply(
        "📭 Peringatan Laboratorium: Belum ada jadwal kuliah yang disimpan di MongoDB, Bos! Gunakan perintah /tambahjadwal dulu.",
      );
    }

    let pesanOtomatis = "📋 *DAFTAR MASTER JADWAL KULIAH DI CLOUD* 📋\n";
    pesanOtomatis += "Berhasil ditarik langsung dari MongoDB Atlas:\n\n";

    // Looping untuk menyusun data dari database jadi teks rapi
    listJadwal.forEach((item, index) => {
      pesanOtomatis += `${index + 1}. 📅 *${item.hari}* (${item.jam})\n`;
      pesanOtomatis += `   📚 Matkul: ${item.matkul}\n`;
      pesanOtomatis += `   🏛️ Ruangan: ${item.ruangan}\n\n`;
    });

    pesanOtomatis +=
      "Formula rahasia aman tersimpan. Tetap semangat mengulang matkul, Bos!";

    // Mengirimkan kumpulan data ke Telegram dengan format Markdown biar tebal-tipisnya rapi
    ctx.replyWithMarkdown(pesanOtomatis);
  } catch (error) {
    console.error("Gagal mengambil data dari database:", error);
    ctx.reply(
      "❌ Waduh Bos, gagal menarik data dari MongoDB Atlas. Cek log terminal!",
    );
  }
});

// =============================================================
// FITUR BARU: MENGHAPUS JADWAL TERTENTU DARI MONGODB
// =============================================================
bot.command("hapusjadwal", async (ctx) => {
  // Mengambil nama matkul yang mau dihapus setelah kata /hapusjadwal
  const matkulTarget = ctx.message.text.replace("/hapusjadwal", "").trim();

  if (!matkulTarget) {
    return ctx.reply(
      "⚠️ Tentukan nama matkul yang mau dihapus, Bos!\n\nContoh untuk hapus data eror nomor 1:\n/hapusjadwal 09.30",
    );
  }

  try {
    const db = client.db();
    const collection = db.collection("jadwals");

    // 🎯 Perintah mendelete 1 dokumen yang cocok dengan chatId dan nama matkulnya
    const hasil = await collection.deleteOne({
      chatId: ctx.chat.id.toString(),
      matkul: matkulTarget,
    });

    // Validasi kalau ternyata nama matkulnya gak ketemu
    if (hasil.deletedCount === 0) {
      return ctx.reply(
        `❌ Gagal, Bos! Matkul "${matkulTarget}" tidak ditemukan di database. Pastikan ketikannya sama persis.`,
      );
    }

    ctx.reply(
      `🗑️ Sukses! Formula jadwal matkul "${matkulTarget}" resmi dimusnahkan dari cloud!`,
    );
  } catch (error) {
    console.error("Gagal menghapus data:", error);
    ctx.reply("❌ Waduh Bos, gagal menghapus data dari MongoDB Atlas.");
  }
});

// =============================================================
// FITUR BARU: MENGUBAH / UPDATE JADWAL DI MONGO_DB (SI HURUF 'U')
// =============================================================
bot.command("editjadwal", async (ctx) => {
  const pesanRaw = ctx.message.text.replace("/editjadwal", "").trim();

  if (!pesanRaw) {
    return ctx.reply(
      "❌ Format salah, Bos! Contoh penggunaan:\n\n/editjadwal [Matkul Lama] | [Hari Baru] | [Jam Baru] | [Matkul Baru] | [Ruangan Baru]",
    );
  }

  // Memotong input berdasarkan pipa
  const bagian = pesanRaw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  // Validasi minimal harus ada 4 parameter (Matkul Lama, Hari Baru, Jam Baru, Matkul Baru)
  if (bagian.length < 4) {
    return ctx.reply(
      "❌ Parameter kurang! Format wajib:\n/editjadwal Matkul Lama | Hari Baru | Jam Baru | Matkul Baru | Ruangan Baru (Opsional)",
    );
  }

  const [matkulLama, hariBaru, jamBaru, matkulBaru, ruanganBaru] = bagian;

  try {
    const db = client.db();
    const collection = db.collection("jadwals");

    // 🎯 Menggunakan method updateOne dengan operator $set untuk mengubah data di cloud
    const hasil = await collection.updateOne(
      {
        chatId: ctx.chat.id.toString(),
        matkul: matkulLama,
      },
      {
        $set: {
          hari: hariBaru,
          jam: jamBaru,
          matkul: matkulBaru,
          ruangan: ruanganBaru || "Tidak Ada / Online",
        },
      },
    );

    // Validasi kalau matkul lama yang mau diedit ternyata gak terdaftar
    if (hasil.matchedCount === 0) {
      return ctx.reply(
        `❌ Gagal edit, Bos! Matkul lama "${matkulLama}" tidak ditemukan di database.`,
      );
    }

    ctx.reply(
      `✨ Mwahahaha! Formula Berhasil Di-update di Cloud!\n\n` +
        `📝 *Sebelumnya:* ${matkulLama}\n` +
        `🚀 *Sekarang:* ${matkulBaru} (${hariBaru} | ${jamBaru} | ${ruanganBaru || "-"})`,
    );
  } catch (error) {
    console.error("Gagal update data:", error);
    ctx.reply("❌ Waduh Bos, gagal memperbarui data di MongoDB Atlas.");
  }
});

// 9. Menghidupkan mesin bot
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
