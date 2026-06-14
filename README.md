# Bot Pengawal Jadwal Kuliah (Asisten Mahasiswa Semester Akhir)

Proyek bot Telegram berbasis Node.js dan Telegraf ini dibuat atas dasar rasa malas akibat kapasitas memori otak mahasiswa semester akhir yang sudah penuh oleh urusan bimbingan. Bot ini bertugas mendeteksi hari secara otomatis dan memunculkan daftar mata kuliah hari ini secara real-time, sehingga Anda tidak perlu lagi salah masuk kelas atau lupa jadwal matkul ulangan.

---

## Fitur Utama

- Deteksi Hari Otomatis: Menggunakan fungsi Date bawaan JavaScript untuk membaca hari saat ini. Bot langsung mengeluarkan jadwal yang cocok tanpa perlu Anda ketik nama harinya secara manual.
- Isolasi Token Aman: Menggunakan dotenv untuk memisahkan token API dari kode utama. Token Anda tetap menjadi rahasia lokal dan tidak akan pernah bocor ke riwayat Git.
- Hemat Resource: Dibangun di atas Telegraf engine yang ringan, jadi tidak akan menambah beban kerja laptop jompo Anda.

---

## Prasyarat Sistem

- Node.js (Versi terbaru sangat disarankan agar terhindar dari drama eror)
- npm (Node Package Manager)
- Token Bot Telegram (Silakan buat dan minta ke BotFather)

---

## Cara Instalasi

1. Unduh atau clone repositori ini ke direktori lokal komputer Anda.
2. Buka terminal di dalam folder proyek tersebut, lalu pasang dependency dengan perintah:
   ```bash
   npm install
   ```

---

## Konfigurasi Keamanan

Proyek ini menerapkan sistem pemisahan berkas demi keamanan. Token bot Anda tidak boleh ditulis langsung di dalam kode utama.

1. Buat file baru dengan nama `.env` di folder utama proyek.
2. Masukkan token dari BotFather dengan format di bawah ini (tanpa spasi di ujung dan tanpa tanda kutip):
   ```text
   TELEGRAM_TOKEN=isi_token_bot_anda_di_sini
   ```

Catatan: File `.env` sudah didaftarkan ke dalam `.gitignore` sehingga Git akan pura-pura tidak tahu dan tidak akan pernah mengunggah file rahasia ini ke GitHub.

---

## Cara Pakai

Untuk menghidupkan bot di server lokal, jalankan perintah ini di terminal Anda:

```bash
node index.js
```

Setelah terminal memunculkan laporan bahwa sistem aktif, silakan buka aplikasi Telegram dan gunakan perintah berikut:

- `/start` - Menghidupkan bot pertama kali dan memunculkan pesan sambutan.
- `/jadwal` - Memaksa bot membaca hari di sistem komputer dan mengeluarkan daftar matkul yang harus Anda hadapi hari ini.
