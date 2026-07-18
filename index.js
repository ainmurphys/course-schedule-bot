const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Paksa Node.js gunakan DNS Google & Cloudflare

require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const cron = require("node-cron");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Koneksi ke MongoDB Atlas
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
let bossChatId = null;

console.log(
  "Sistem Aktif! Bot Pengawal Jadwal Kuliah (Secure Mode) berjalan...",
);

// Database jadwal kuliah lokal (Hardcoded)
const databaseJadwal = {
  1: "📅 JADWAL KULIAH HARI SENIN:\n\n1. 09:30 - 11:10 | Pengolahan Citra Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\n2. 10:20 - 12:00 | Konsep Perangkat Keras Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\nJangan sampai bolos, Bos! Ingat target lulus!",
  2: "📅 JADWAL KULIAH HARI SELASA:\n\n1. 07:00 - 09:30 | Elektronika Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\nJangan sampai bolos, Bos! Ingat target lulus!",
  3: "📅 JADWAL KULIAH HARI RABU:\n\n1. 08:40 - 10:20 | Sistem Operasi Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n2. 09:30 - 11:10 | Technopreneurship Semester 4 (Semester Pendek/Kredit Bawah/Mengulang)\n\nJangan sampai bolos, Bos! Ingat target lulus!",
  4: "📅 JADWAL KULIAH HARI KAMIS:\n\n1. 09:30 - 11:10 | Sistem Komputer Berkinerja Tinggi Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\nBelum ada matkul lain yang diinput untuk hari ini, Bos. Jangan keluyuran ke Krusty Krab!",
  5: "📅 JADWAL KULIAH HARI JUMAT:\n\n1. 09:30 - 11:10 | Teknologi IoT Semester 6 (Semester Pendek/Kredit Bawah/Mengulang)\n\nBelum ada matkul lain yang diinput untuk hari ini, Bos. Persiapan menuju akhir pekan.",
  6: "📅 JADWAL KULIAH HARI SABTU:\n\n🎉 HARI SABTU LIBUR! Waktunya menyusun rencana cadangan untuk mengalahkan Tuan Krabs!",
  0: "📅 JADWAL KULIAH HARI MINGGU:\n\n🛌 HARI MINGGU LIBUR! Istirahat total, Bos. siapkan energi untuk mengulang matkul besok pagi.",
};

// Database batas pengumpulan tugas lokal (Hardcoded)
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

// Perintah /start untuk mengunci Chat ID dan memunculkan menu tombol
bot.start((ctx) => {
  bossChatId = ctx.chat.id;
  console.log("Sistem berhasil mengunci Chat ID Bos: " + bossChatId);

  ctx.reply(
    "Siap, Bos Plankton! Sistem pengawal jadwal kuliah sudah aktif and stand-by di laboratorium.\n\n" +
      "Berikut adalah daftar perintah yang bisa Bos gunakan saat ini:\n" +
      "1. /jadwal - Membaca hari sistem secara otomatis dan memunculkan matkul HARI INI.\n" +
      "2. /esok - Mengintip daftar matkul untuk HARI ESOK demi persiapan mental dari sekarang.\n\n" +
      "Gunakan tombol di bawah ini untuk akses cepat tanpa mengetik, Bos!",
    Markup.keyboard([["/jadwal", "/esok"], ["/deadline"]]).resize(),
  );
});

// Perintah /jadwal untuk melihat matkul hari ini
bot.command("jadwal", (ctx) => {
  const angkaHariIni = new Date().getDay();
  ctx.reply(databaseJadwal[angkaHariIni]);
});

// Perintah /esok untuk mengintip matkul besok
bot.command("esok", (ctx) => {
  const angkaHariIni = new Date().getDay();
  const angkaHariEsok = (angkaHariIni + 1) % 7;
  ctx.reply(
    "Sistem mendeteksi jadwal untuk esok hari:\n\n" +
      databaseJadwal[angkaHariEsok],
  );
});

// Perintah manual untuk cek jadwal hari spesifik
bot.command("senin", (ctx) => ctx.reply(databaseJadwal[1]));
bot.command("selasa", (ctx) => ctx.reply(databaseJadwal[2]));
bot.command("rabu", (ctx) => ctx.reply(databaseJadwal[3]));
bot.command("kamis", (ctx) => ctx.reply(databaseJadwal[4]));
bot.command("jumat", (ctx) => ctx.reply(databaseJadwal[5]));
bot.command("sabtu", (ctx) => ctx.reply(databaseJadwal[6]));
bot.command("minggu", (ctx) => ctx.reply(databaseJadwal[0]));

// Perintah /deadline untuk melihat radar tugas aktif
bot.command("deadline", (ctx) => {
  if (databaseDeadline.length === 0) {
    return ctx.reply(
      "🎉 Bersih, Bos! Tidak ada deadline tugas yang terdeteksi di dalam sistem saat ini.",
    );
  }

  let pesanOtomatis =
    "⚠️ DOSEN PENGIKUT TUAN KRABS MULAI MENEROR! ⚠️\nBerikut daftar tugas yang harus segera Bos selesaikan:\n\n";
  databaseDeadline.forEach((item, index) => {
    pesanOtomatis += `${index + 1}. 📝 *${item.tugas}*\n 📅 Batas: ${item.tanggal} (${item.sisa})\n\n`;
  });
  pesanOtomatis +=
    "Jangan ditunda lagi Bos, demi formula rahasia kelulusan kita!";
  ctx.replyWithMarkdown(pesanOtomatis);
});

// Perintah /tambah untuk memasukkan radar tugas baru secara lokal
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

// Perintah /kelar untuk menghapus daftar tugas lokal yang selesai
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

// Logika cron job untuk mengirim broadcast otomatis jam 7 pagi
cron.schedule(
  "0 7 * * *",
  () => {
    if (bossChatId) {
      const angkaHariIni = new Date().getDay();
      bot.telegram.sendMessage(
        bossChatId,
        "PEMBERITAHUAN OTOMATIS LABORATORIUM:\n\n" +
          databaseJadwal[angkaHariIni],
      );
      console.log("Laporan rutin jam 7 pagi sukses dikirim ke Bos Plankton.");
    } else {
      console.log(
        "Reminder otomatis tertunda: Bos belum aktifkan bot lewat perintah /start.",
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  },
);

// Perintah /tambahjadwal untuk memasukkan jadwal kuliah baru ke MongoDB
bot.command("tambahjadwal", async (ctx) => {
  const pesanRaw = ctx.message.text.replace("/tambahjadwal", "").trim();

  if (!pesanRaw) {
    return ctx.reply(
      "❌ Format salah, Bos! Contoh penggunaan:\n\n/tambahjadwal Senin | 08:00 | Struktur Data | Lab Komputer 3",
    );
  }

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

// Perintah /semuajadwal untuk menarik seluruh daftar master jadwal dari MongoDB
bot.command("semuajadwal", async (ctx) => {
  try {
    const db = client.db();
    const collection = db.collection("jadwals");
    const listJadwal = await collection
      .find({ chatId: ctx.chat.id.toString() })
      .toArray();

    if (listJadwal.length === 0) {
      return ctx.reply(
        "📭 Peringatan Laboratorium: Belum ada jadwal kuliah yang disimpan di MongoDB, Bos! Gunakan perintah /tambahjadwal dulu.",
      );
    }

    let pesanOtomatis =
      "📋 *DAFTAR MASTER JADWAL KULIAH DI CLOUD* 📋\nBerhasil ditarik langsung dari MongoDB Atlas:\n\n";
    listJadwal.forEach((item, index) => {
      pesanOtomatis += `${index + 1}. 📅 *${item.hari}* (${item.jam})\n   📚 Matkul: ${item.matkul}\n   🏛️ Ruangan: ${item.ruangan}\n\n`;
    });
    pesanOtomatis +=
      "Formula rahasia aman tersimpan. Tetap semangat mengulang matkul, Bos!";

    ctx.replyWithMarkdown(pesanOtomatis);
  } catch (error) {
    console.error("Gagal mengambil data dari database:", error);
    ctx.reply(
      "❌ Waduh Bos, gagal menarik data dari MongoDB Atlas. Cek log terminal!",
    );
  }
});

// Perintah /hapusjadwal untuk membuang satu jadwal spesifik dari MongoDB
bot.command("hapusjadwal", async (ctx) => {
  const matkulTarget = ctx.message.text.replace("/hapusjadwal", "").trim();

  if (!matkulTarget) {
    return ctx.reply(
      "⚠️ Tentukan nama matkul yang mau dihapus, Bos!\n\nContoh untuk hapus data eror nomor 1:\n/hapusjadwal 09.30",
    );
  }

  try {
    const db = client.db();
    const collection = db.collection("jadwals");
    const hasil = await collection.deleteOne({
      chatId: ctx.chat.id.toString(),
      matkul: matkulTarget,
    });

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

// Perintah /editjadwal untuk memperbarui data jadwal di MongoDB
bot.command("editjadwal", async (ctx) => {
  const pesanRaw = ctx.message.text.replace("/editjadwal", "").trim();

  if (!pesanRaw) {
    return ctx.reply(
      "❌ Format salah, Bos! Contoh penggunaan:\n\n/editjadwal [Matkul Lama] | [Hari Baru] | [Jam Baru] | [Matkul Baru] | [Ruangan Baru]",
    );
  }

  const bagian = pesanRaw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (bagian.length < 4) {
    return ctx.reply(
      "❌ Parameter kurang! Format wajib:\n/editjadwal Matkul Lama | Hari Baru | Jam Baru | Matkul Baru | Ruangan Baru (Opsional)",
    );
  }

  const [matkulLama, hariBaru, jamBaru, matkulBaru, ruanganBaru] = bagian;

  try {
    const db = client.db();
    const collection = db.collection("jadwals");
    const hasil = await collection.updateOne(
      { chatId: ctx.chat.id.toString(), matkul: matkulLama },
      {
        $set: {
          hari: hariBaru,
          jam: jamBaru,
          matkul: matkulBaru,
          ruangan: ruanganBaru || "Tidak Ada / Online",
        },
      },
    );

    if (hasil.matchedCount === 0) {
      return ctx.reply(
        `❌ Gagal edit, Bos! Matkul lama "${matkulLama}" tidak ditemukan di database.`,
      );
    }

    ctx.reply(
      `✨ Mwahahaha! Formula Berhasil Di-update di Cloud!\n\n📝 *Sebelumnya:* ${matkulLama}\n🚀 *Sekarang:* ${matkulBaru} (${hariBaru} | ${jamBaru} | ${ruanganBaru || "-"})`,
    );
  } catch (error) {
    console.error("Gagal update data:", error);
    ctx.reply("❌ Waduh Bos, gagal memperbarui data di MongoDB Atlas.");
  }
});

// Inisialisasi dan siklus hidup bot
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
