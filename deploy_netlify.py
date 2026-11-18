#!/usr/bin/env python3
"""Deploy tema APMOI ke Netlify lewat API (tanpa butuh netlify-cli).

Cara pakai:
    NETLIFY_AUTH_TOKEN=xxx python3 deploy_netlify.py

Opsional:
    NETLIFY_SITE_NAME=apmoi-id        # nama subdomain yang diinginkan
    NETLIFY_SITE_ID=abc-123           # deploy ulang ke site yang sudah ada
"""
import io
import json
import os
import sys
import urllib.error
import urllib.request
import zipfile

TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "").strip()
if not TOKEN:
    sys.exit("ERROR: NETLIFY_AUTH_TOKEN belum diset.")

API = "https://api.netlify.com/api/v1"
HEADERS = {"Authorization": "Bearer " + TOKEN}


class ApiError(Exception):
    def __init__(self, code, body):
        self.code = code
        self.body = body
        super().__init__(f"HTTP {code}: {body[:600]}")


def api(method, path, data=None, extra_headers=None):
    headers = dict(HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read().decode("utf-8", "replace")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raise ApiError(exc.code, exc.read().decode("utf-8", "replace")) from exc


def build_zip():
    buf = io.BytesIO()
    skip_dirs = {".git", "node_modules", "__pycache__", ".next", "dist"}
    skip_files = {"deploy_netlify.py", "deploy-netlify.sh"}
    count = 0
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for name in files:
                if name in skip_files or name.endswith(".zip"):
                    continue
                full = os.path.join(root, name)
                rel = os.path.relpath(full, ".").replace(os.sep, "/")
                zf.write(full, rel)
                count += 1
    print(f"[1/3] ZIP siap: {count} file, {len(buf.getvalue()):,} bytes")
    return buf.getvalue()


def get_or_create_site():
    site_id = os.environ.get("NETLIFY_SITE_ID", "").strip()
    if site_id:
        print(f"[2/3] Pakai site existing: {site_id}")
        return api("GET", "/sites/" + site_id)

    name = os.environ.get("NETLIFY_SITE_NAME", "apmoi-id").strip()
    print(f"[2/3] Membuat site baru: {name}")
    try:
        return api(
            "POST", "/sites",
            json.dumps({"name": name}).encode("utf-8"),
            {"Content-Type": "application/json"},
        )
    except ApiError as exc:
        if exc.code in (409, 422):
            print(f"      Nama '{name}' dipakai, coba nama acak...")
            return api("POST", "/sites", b"{}", {"Content-Type": "application/json"})
        raise


def main():
    zip_data = build_zip()
    site = get_or_create_site()
    site_id = site["id"]

    print(f"[3/3] Upload deploy ke {site_id} ...")
    deploy = api(
        "POST", f"/sites/{site_id}/deploys",
        zip_data,
        {"Content-Type": "application/zip"},
    )

    result = {
        "site_id": site_id,
        "url": site.get("ssl_url") or site.get("url"),
        "deploy_id": deploy.get("id"),
        "deploy_state": deploy.get("state"),
        "deploy_url": deploy.get("deploy_ssl_url") or deploy.get("deploy_url"),
    }
    print("\n=== DEPLOY BERHASIL ===")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    with open("NETLIFY_DEPLOY_INFO.json", "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, ensure_ascii=False)
    print("\nInfo tersimpan di NETLIFY_DEPLOY_INFO.json")


if __name__ == "__main__":
    try:
        main()
    except ApiError as exc:
        sys.exit(f"GAGAL: {exc}")
