# Tema Website APMOI

Tema website untuk **APMOI — Asosiasi Pengusaha Media Online Indonesia**.
Static site (HTML + CSS + JS murni), tanpa dependency dan tanpa build step. Semua menu sudah mengarah ke halaman nyata.

## Halaman

| File | Isi |
| --- | --- |
| `index.html` | Beranda — hero, statistik, profil ringkas, program, berita, anggota, CTA |
| `daftar-media.html` | **Direktori 50 media anggota** — pencarian teks + filter kategori & provinsi, ada hasil kosong |
| `media-detail.html?id=0` | Profil detail media (dirender dari `js/media.js`) |
| `persyaratan.html` | Syarat umum & kriteria media, **9 dokumen yang dibutuhkan** (wajib/opsional), alur 5 langkah, tabel iuran, hak & kewajiban, FAQ |
| `pendaftaran.html` | Formulir pendaftaran 4 bagian: data media, pengurus, unggah dokumen, deklarasi |
| `tentang.html` | Profil, visi misi, timeline sejarah, struktur pengurus |
| `program.html` | Empat pilar program + jadwal kegiatan |
| `berita.html` | Daftar berita dengan filter kategori |
| `artikel.html?id=1` | Halaman artikel (isi dari `js/articles.js`, 6 artikel) |
| `kontak.html` | Informasi kontak + formulir pesan |
| `kebijakan.html` | Kebijakan privasi & syarat ketentuan |

## Struktur file

```
index.html, daftar-media.html, ...   # halaman
css/style.css                        # desain sistem + responsif + komponen halaman
js/main.js                           # header, menu mobile, reveal, counter, nav aktif
js/pages.js                          # filter direktori/berita, validasi form, render artikel & detail media
js/media.js                          # data 50 media anggota
js/articles.js                       # data 6 artikel
assets/apmoi-logo.png                # logo asli hasil unduh
assets/apmoi-logo-transparent.png    # logo tanpa background (dipakai di header/footer)
```

## Menjalankan

```bash
python3 -m http.server 8080
```

Buka `http://localhost:8080`.

## Fitur yang berfungsi

- **Pencarian & filter media** — ketik nama/kategori/provinsi, pilih filter, tombol Reset; jumlah hasil dihitung langsung.
- **Detail media** — klik "Lihat detail" pada kartu media.
- **Filter berita** — pilih kategori pada halaman Berita.
- **Formulir** — validasi required/email/URL/minimal karakter, pesan error per field, kode pendaftaran otomatis, simpan ke `localStorage`, tampilkan konfirmasi sukses.
- **Artikel** — konten dimuat sesuai `?id=` pada URL, lengkap dengan artikel terkait & tombol bagikan (Facebook/X/LinkedIn).
- **Navigasi** — menu mobile drawer, active state mengikuti halaman, smooth scroll anchor.
- **Logo resmi** — dipakai di header & footer; background putih dihapus agar fleksibel di atas hero navy.

## Kustomisasi

- **Warna:** variabel di `:root` pada `css/style.css`.
- **Font:** Google Fonts di `<head>` + `font-family` pada `body`.
- **Data media:** edit `js/media.js` (direktori & detail otomatis mengikuti).
- **Artikel:** edit `js/articles.js`.
- **Persyaratan & konten:** langsung di `persyaratan.html`, `program.html`, dll.
- **Logo:** ganti `assets/apmoi-logo-transparent.png`.

## PWA / Install di HP

Website ini sudah mendukung **Progressive Web App**:
- `manifest.webmanifest` — nama, warna, ikon, dan shortcut (Daftar Media, Persyaratan, Pendaftaran)
- `sw.js` — cache aset inti supaya tetap bisa dibuka saat offline
- `assets/icon-192.png` & `assets/icon-512.png` — ikon otomatis dari logo APMOI

Cara pasang di Android: buka URL di Chrome → menu ⋮ → **"Add to Home screen"** / **"Install app"**.

## Alamat produksi (permanen, gratis)

**https://fernandoalbert.github.io/apmoi-web/**

- Aktif via GitHub Pages, source: branch `main`, folder `/` (root).
- Setiap push ke `main` otomatis meng-update website.
- HTTPS sudah aktif; PWA bisa di-install langsung dari alamat ini.
- Domain `apmoi.id` bisa dipasang kemudian lewat **Settings → Pages → Custom domain** tanpa mengubah kode.

## Catatan

Angka statistik, biaya iuran, nama media, dan pengurus adalah **data contoh**. Alamat website media di `js/media.js` juga bersifat ilustratif. Ganti dengan data resmi APMOI sebelum dipublikasikan.
