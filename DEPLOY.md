# Cara Menjalankan & Mempublikasikan APMOI

## 0. Status produksi saat ini

Website sudah **online permanen** di:

```
https://fernandoalbert.github.io/apmoi-web/
```

- GitHub Pages aktif dari branch `main`, path `/` (root).
- Setiap push ke `main` langsung deploy otomatis.
- HTTPS aktif, PWA installable, tanpa perlu beli domain.

## 1. Server lokal / LAN

```bash
./start-server.sh 8080
```

Default bind `0.0.0.0`, jadi bisa diakses dari perangkat lain dalam jaringan yang sama:

```
http://<IP-LAN-kamu>:8080
```

Cek IP LAN: `hostname -I` (Linux) atau `ipconfig` (Windows).

## 2. Online gratis permanen (paling mudah)

### Opsi A — Netlify (drag & drop)
1. Buka https://app.netlify.com/drop
2. Masuk (GitHub/Google/email)
3. Tarik (drag) **seluruh folder proyek ini** ke halaman tersebut
4. Selesai — dapat URL `https://nama-acak.netlify.app`

File `netlify.toml` sudah disiapkan.

### Opsi B — Vercel
```bash
npm i -g vercel
vercel --prod
```
Ikuti prompt. File `vercel.json` sudah disiapkan.

### Opsi C — GitHub Pages (gratis, domain `*.github.io`)
1. Buat repository baru di GitHub, misalnya `apmoi-web`
2. Push semua file ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Tema website APMOI"
   git branch -M main
   git remote add origin https://github.com/USERNAME/apmoi-web.git
   git push -u origin main
   ```
3. Di repository → **Settings → Pages → Build and deployment**
   - Source: **GitHub Actions**
4. Workflow `.github/workflows/deploy.yml` akan otomatis deploy ke
   `https://USERNAME.github.io/apmoi-web/`

File `.nojekyll` sudah disiapkan agar folder tidak diabaikan.

## 3. Server sendiri (Docker + Nginx)

```bash
docker build -t apmoi-web .
docker run -d -p 8080:80 --name apmoi apmoi-web
```

Buka `http://IP-SERVER:8080`. Untuk produksi, pasang reverse proxy + SSL
(Certbot) di depan Nginx.

## 4. Domain sendiri

Setelah dapat URL hosting, di pengaturan DNS domain `apmoi.id`:

| Type | Name | Value |
| --- | --- | --- |
| A / ALIAS | `@` | IP hosting |
| CNAME | `www` | hostname hosting |

Lalu tambahkan domain tersebut di dashboard hosting (Netlify/Vercel) dan aktifkan HTTPS gratis.

## Verifikasi Google Search Console

1. Buka https://search.google.com/search-console → **Add property**
2. Pilih **URL prefix** → masukkan:
   ```
   https://fernandoalbert.github.io/apmoi-web/
   ```
3. Pilih metode **HTML tag** → copy nilai `content="..."` dari meta tag yang diberikan Google
4. Jalankan:
   ```bash
   python3 set_google_verification.py KODE_DARI_GOOGLE
   ```
   Skrip ini otomatis:
   - memasang `<meta name="google-site-verification" content="...">` di semua halaman
   - membuat file `googleKODE.html` di root
   - commit + push ke GitHub Pages (set `GITHUB_TOKEN` dulu)
5. Klik **Verify** di Search Console.

## Catatan

- Semua halaman bersifat **statis** — tidak butuh database atau PHP.
- Link artikel memakai query string: `artikel.html?id=1`.
- Data media ada di `js/media.js`, artikel di `js/articles.js`.
- Formulir saat ini menyimpan data ke `localStorage` browser pengunjung (demo).
  Untuk produksi, hubungkan ke backend/API atau layanan form (Formspree, Netlify Forms, dll.).
