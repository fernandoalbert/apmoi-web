#!/usr/bin/env python3
"""Selesaikan perpindahan identitas Fernando -> apmoi setelah username GitHub diubah.

Jalankan:
    GITHUB_TOKEN=... python3 selesaikan_apmoi.py

Skrip ini:
  1. Memastikan username GitHub `apmoi` sudah aktif.
  2. Mengganti semua teks fernandoalbert di dokumen/site.
  3. Mengubah remote git ke akun apmoi.
  4. Menaikkan versi cache service worker.
  5. Commit + push.
  6. Memverifikasi halaman produksi di alamat baru.
"""
import os
import re
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
OLD_USER = "fernandoalbert"
NEW_USER = "apmoi"
NEW_URL = f"https://{NEW_USER}.github.io/apmoi-web/"


def run(cmd, check=True, capture=False):
    print(f"$ {' '.join(cmd)}")
    result = subprocess.run(
        cmd, cwd=ROOT, text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )
    if check and result.returncode != 0:
        if capture:
            print(result.stdout)
        sys.exit(f"Gagal: {' '.join(cmd)}")
    return result.stdout if capture else ""


def api_get(path):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={"Authorization": f"Bearer {TOKEN}",
                 "Accept": "application/vnd.github+json",
                 "User-Agent": "apmoi-deploy"},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            return response.status, __import__("json").load(response)
    except urllib.error.HTTPError as error:
        return error.code, {}


def main():
    if not TOKEN:
        sys.exit("GITHUB_TOKEN belum diisi.")

    status, account = api_get("/user")
    login = account.get("login")
    print(f"Akun token saat ini: {login} (HTTP {status})")
    if login != NEW_USER:
        sys.exit(
            "Username belum berubah. Buka https://github.com/settings/account -> "
            "Change username -> apmoi, lalu jalankan lagi skrip ini."
        )

    status, target = api_get(f"/users/{NEW_USER}")
    print(f"/users/{NEW_USER}: HTTP {status}")

    files = ["README.md", "DEPLOY.md", "verifikasi.html", "set_google_verification.py"]
    for name in files:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
        updated = text.replace(OLD_USER, NEW_USER)
        if updated != text:
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(updated)
            print(f"Diperbarui: {name}")

    sw_path = os.path.join(ROOT, "sw.js")
    with open(sw_path, encoding="utf-8") as handle:
        sw = handle.read()
    match = re.search(r"apmoi-v(\d+)", sw)
    if match:
        new_version = f"apmoi-v{int(match.group(1)) + 1}"
        sw = sw.replace(match.group(0), new_version, 1)
        with open(sw_path, "w", encoding="utf-8") as handle:
            handle.write(sw)
        print(f"Cache PWA: {new_version}")

    run(["git", "remote", "set-url", "origin",
         f"https://github.com/{NEW_USER}/apmoi-web.git"])
    run(["git", "add", "-A"])
    status_text = run(["git", "status", "--short"], capture=True)
    if not status_text.strip():
        print("Tidak ada perubahan untuk di-commit.")
    else:
        run(["git", "commit", "-m",
             f"Ganti identitas Fernando menjadi apmoi & alamat produksi {NEW_USER}.github.io"])
        run(["git", "push", "origin", "main"])

    print("Menunggu GitHub Pages menyebar...")
    paths = ["", "manifest.webmanifest", "sw.js", "verifikasi.html",
             "daftar-media.html", "persyaratan.html"]
    for suffix in paths:
        url = NEW_URL + suffix
        ok = False
        for attempt in range(8):
            try:
                with urllib.request.urlopen(url, timeout=20) as response:
                    if response.status == 200:
                        ok = True
                        break
            except Exception:
                pass
            time.sleep(4)
        print(f"{'OK  ' if ok else 'GAGAL'} {url}")
    print("\nSelesai. Buka di HP: " + NEW_URL)


if __name__ == "__main__":
    main()
