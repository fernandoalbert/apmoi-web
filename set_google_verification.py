#!/usr/bin/env python3
"""Pasang verifikasi Google Search Console ke semua halaman APMOI.

Cara pakai:
    python3 set_google_verification.py KODE_DARI_GOOGLE

Bisa juga menerima meta tag lengkap atau nama file googleXXXX.html.
Kalau GITHUB_TOKEN diset, script langsung commit + push ke GitHub Pages.
"""
import glob
import os
import re
import subprocess
import sys

META_LINE = '<meta name="google-site-verification" content="{}" />'


def ekstrak_kode(raw):
    s = raw.strip()
    m = re.search(r'content=["\']([^"\']+)["\']', s)
    if m:
        return m.group(1).strip()
    m = re.search(r'google([A-Za-z0-9_-]+)\.html', s)
    if m:
        return m.group(1).strip()
    s = s.strip().strip('"\'')
    if not re.fullmatch(r'[A-Za-z0-9_-]{10,}', s):
        sys.exit("ERROR: kode tidak valid. Contoh: abcDEF123_xyz456")
    return s


def pasang(kode):
    meta = META_LINE.format(kode)
    diubah = []
    for path in sorted(glob.glob("*.html")):
        html = open(path, encoding="utf-8").read()
        html = re.sub(
            r'\s*<meta\s+name=["\']google-site-verification["\']\s+content=["\'][^"\']*["\']\s*/?>',
            "",
            html,
            flags=re.I,
        )
        if "</head>" not in html:
            sys.exit(f"ERROR: tidak ada </head> di {path}")
        html = html.replace("</head>", "  " + meta + "\n  </head>", 1)
        open(path, "w", encoding="utf-8").write(html)
        diubah.append(path)

    nama_file = f"google{kode}.html"
    open(nama_file, "w", encoding="utf-8").write(
        f"google-site-verification: {nama_file}\n"
    )
    print(f"Meta tag dipasang di {len(diubah)} halaman")
    print(f"File verifikasi dibuat: {nama_file}")
    return diubah, nama_file


def deploy(kode, nama_file, diubah):
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        print("\nGITHUB_TOKEN tidak diset — commit/push dilewati.")
        return
    repo = "https://x-access-token:" + token + "@github.com/fernandoalbert/apmoi-web.git"
    subprocess.run(["git", "add", "-A", *diubah, nama_file], check=True)
    subprocess.run(
        ["git", "commit", "-q", "-m", "Tambah verifikasi Google Search Console"],
        check=False,
    )
    subprocess.run(
        ["git", "-c", "credential.helper=", "push", "-q", repo, "main"],
        check=True,
    )
    print("Deploy ke GitHub Pages berhasil.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 set_google_verification.py KODE")
    kode = ekstrak_kode(sys.argv[1])
    diubah, nama_file = pasang(kode)
    deploy(kode, nama_file, diubah)
    print("\nSelesai. Klik 'Verify' di Search Console.")
