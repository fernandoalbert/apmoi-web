/* ============================================================
   APMOI — interaksi halaman (direktori, form, artikel)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 0. Render kartu direktori dari js/media.js ---------- */
  const grid = document.getElementById("directoryGrid");
  if (grid && typeof MEDIA !== "undefined") {
    const opsi = (arr) => arr.map((x) => `<option>${x}</option>`).join("");
    const kategoris = [...new Set(MEDIA.map((m) => m.kategori))];
    const provinsis = [...new Set(MEDIA.map((m) => m.provinsi))];
    const kategoriSelect = document.getElementById("filterKategori");
    const provinsiSelect = document.getElementById("filterProvinsi");
    if (kategoriSelect) kategoriSelect.insertAdjacentHTML("beforeend", opsi(kategoris));
    if (provinsiSelect) provinsiSelect.insertAdjacentHTML("beforeend", opsi(provinsis));

    grid.innerHTML = MEDIA.map((m, i) => `
      <article class="media-card reveal" data-kategori="${m.kategori}" data-provinsi="${m.provinsi}"
        data-search="${(m.nama + " " + m.kategori + " " + m.provinsi + " " + m.deskripsi + " " + m.website).toLowerCase().replace(/"/g, "")}">
        <div class="media-head">
          <div class="media-logo" style="background:${m.warna}">${m.inisial}</div>
          <div><h3>${m.nama}</h3><span class="media-verified">✓ Terverifikasi APMOI</span></div>
        </div>
        <p class="media-desc">${m.deskripsi}</p>
        <div class="media-meta"><span class="badge-soft">${m.kategori}</span><span class="badge-soft gray">📍 ${m.provinsi}</span></div>
        <div class="media-foot">
          <span>${m.platform}<br /><strong>Pembaca: ${m.trafik === "-" ? "Belum dilaporkan" : m.trafik}</strong> · Bergabung ${m.sejak === "-" ? "—" : m.sejak}</span>
          <a href="media-detail.html?id=${i}">Lihat detail →</a>
        </div>
      </article>`).join("");
    const count = document.getElementById("resultCount");
    if (count) count.textContent = MEDIA.length;
    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 1. Direktori media: pencarian + filter ---------- */
  const search = document.getElementById("mediaSearch");
  const kategori = document.getElementById("filterKategori");
  const provinsi = document.getElementById("filterProvinsi");
  const reset = document.getElementById("resetFilter");
  const cards = Array.from(document.querySelectorAll(".media-card"));
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");

  if (search && cards.length) {
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      const k = kategori ? kategori.value : "";
      const p = provinsi ? provinsi.value : "";
      let shown = 0;
      cards.forEach((card) => {
        const haystack = card.dataset.search || card.textContent.toLowerCase();
        const match = (!q || haystack.includes(q)) &&
                      (!k || card.dataset.kategori === k) &&
                      (!p || card.dataset.provinsi === p);
        card.classList.toggle("hidden", !match);
        if (match) shown++;
      });
      if (resultCount) resultCount.textContent = shown;
      if (emptyState) emptyState.style.display = shown ? "none" : "block";
    };
    [search, kategori, provinsi].forEach((el) => el && el.addEventListener("input", apply));
    if (reset) reset.addEventListener("click", () => {
      search.value = "";
      if (kategori) kategori.value = "";
      if (provinsi) provinsi.value = "";
      apply();
      search.focus();
    });
    apply();
  }

  /* ---------- 1b. Filter kategori berita ---------- */
  const newsFilters = document.querySelectorAll(".news-filter");
  const newsCards = document.querySelectorAll(".news-card[data-kategori]");
  if (newsFilters.length && newsCards.length) {
    newsFilters.forEach((btn) => btn.addEventListener("click", () => {
      newsFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const k = btn.dataset.filter;
      newsCards.forEach((card) => card.classList.toggle("hidden", k !== "semua" && card.dataset.kategori !== k));
    }));
  }

  /* ---------- 2. Validasi form + simpan ke localStorage ---------- */
  document.querySelectorAll("form[data-validate]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll("[data-rule]").forEach((input) => {
        const field = input.closest(".field") || input.parentElement;
        const value = (input.value || "").trim();
        let ok = true;

        if (input.dataset.rule.includes("required") && !value) ok = false;
        if (ok && input.dataset.rule.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ok = false;
        if (ok && input.dataset.rule.includes("url") && value && !/^https?:\/\//i.test(value)) ok = false;
        if (ok && input.type === "checkbox" && !input.checked) ok = false;
        if (ok && value && value.length < 3 && input.dataset.rule.includes("min3")) ok = false;

        field.classList.toggle("invalid", !ok);
        const err = field.querySelector(".error-msg");
        if (err && !ok) {
          err.textContent = input.dataset.error || "Field ini wajib diisi.";
        }
        if (!ok && valid) {
          valid = false;
          input.focus();
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      if (!valid) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const key = form.dataset.validate === "pendaftaran" ? "apmoi_pendaftaran" : "apmoi_pesan";
      let id = data.kode || "";
      if (!id) {
        id = "APM-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-6);
      }
      const record = { ...data, kode: id, waktu: new Date().toISOString() };

      try {
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(record);
        localStorage.setItem(key, JSON.stringify(prev));
      } catch (_) { /* localStorage tidak tersedia: tetap lanjut */ }

      const codeEl = document.getElementById("successCode");
      if (codeEl) codeEl.textContent = id;
      const nameEl = document.getElementById("successName");
      if (nameEl) nameEl.textContent = data.nama_media || data.nama || "Anda";
      const success = document.getElementById("formSuccess");
      if (success) {
        success.classList.add("show");
        form.style.display = "none";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    form.querySelectorAll("[data-rule]").forEach((input) => {
      input.addEventListener("input", () => {
        const field = input.closest(".field") || input.parentElement;
        field.classList.remove("invalid");
      });
      input.addEventListener("change", () => {
        const field = input.closest(".field") || input.parentElement;
        field.classList.remove("invalid");
      });
    });
  });

  /* ---------- 3. Detail media: render dari query string ---------- */
  const mediaRoot = document.getElementById("mediaDetailRoot");
  if (mediaRoot && typeof MEDIA !== "undefined") {
    const raw = new URLSearchParams(location.search).get("id") || "0";
    const index = /^\d+$/.test(raw) ? parseInt(raw, 10) : 0;
    const m = MEDIA[index] || MEDIA[0];
    document.title = m.nama + " — Daftar Media APMOI";
    mediaRoot.innerHTML = `
      <div class="detail-main reveal">
        <div class="detail-cover" style="background:${m.warna}">
          <div class="detail-cover-inner"><span class="detail-initial">${m.inisial}</span><h2>${m.nama}</h2><span class="detail-verified">✓ Media Terverifikasi APMOI</span></div>
        </div>
        <div class="detail-body">
          <div class="article-meta"><span class="badge-soft">${m.kategori}</span><span class="badge-soft gray">📍 ${m.provinsi}</span>${m.sejak !== "-" ? `<span>Bergabung sejak ${m.sejak}</span>` : ""}</div>
          <h1>${m.nama}</h1>
          <p class="article-lead">${m.deskripsi}</p>
          <h2>Tentang media</h2>
          <p>${m.nama} adalah media online yang berbasis di ${m.provinsi} dan fokus pada topik ${m.kategori.toLowerCase()}. Media ini merupakan bagian dari ekosistem APMOI dan konsisten menghadirkan informasi yang kredibel bagi pembacanya.</p>
          ${m.trafik !== "-" ? `<p>Dengan jangkauan sekitar ${m.trafik} pembaca per bulan, ${m.nama} terus mengembangkan kapasitas redaksi dan memperluas kehadiran melalui berbagai kanal digital.</p>` : ""}
          <h2>Kanal publikasi</h2>
          <p>Platform yang dikelola: <strong>${m.platform}</strong>.</p>
          <blockquote>“Kredibilitas dan konsistensi menjadi fondasi ${m.nama} dalam melayani pembaca.”</blockquote>
          <div class="article-share">Kunjungi media:
            <a href="${m.website}" target="_blank" rel="noopener">↗</a>
            <a href="kontak.html">✉</a>
          </div>
        </div>
      </div>
      <aside class="detail-side">
        <div class="side-card"><h4>Data Singkat</h4>
          <table class="detail-facts"><tr><th>Kategori</th><td>${m.kategori}</td></tr><tr><th>Provinsi</th><td>${m.provinsi}</td></tr><tr><th>Pembaca/bulan</th><td>${m.trafik === "-" ? "Belum dilaporkan" : m.trafik}</td></tr><tr><th>Bergabung</th><td>${m.sejak === "-" ? "Belum dilaporkan" : m.sejak}</td></tr><tr><th>Status</th><td><span class="badge-soft green">Terverifikasi</span></td></tr></table>
        </div>
        <div class="side-card"><h4>Media Lainnya</h4>
          ${MEDIA.filter((_, i) => i !== index).slice(0, 5).map((other) => `<a class="side-link" href="media-detail.html?id=${MEDIA.indexOf(other)}">${other.nama}</a>`).join("")}
        </div>
        <div class="side-card"><h4>Ingin bergabung?</h4><p style="font-size:.82rem;color:var(--muted);line-height:1.7;margin-bottom:16px">Daftarkan media Anda dan nikmati berbagai program keanggotaan APMOI.</p><a href="pendaftaran.html" class="btn btn-primary btn-sm" style="width:100%">Daftar Sekarang →</a></div>
      </aside>`;
    mediaRoot.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 4. Artikel: render dari query string ---------- */
  const articleRoot = document.getElementById("articleRoot");
  if (articleRoot) {
    const id = new URLSearchParams(location.search).get("id") || "1";
    const article = ARTICLES[id] || ARTICLES["1"];
    document.title = article.judul + " — APMOI";
    articleRoot.innerHTML = `
      <article class="article-body reveal">
        <div class="article-meta">
          <span class="badge-soft ${article.badgeClass}">${article.kategori}</span>
          <span>${article.tanggal}</span><span>•</span><span>${article.readTime} baca</span>
          <span>•</span><span>Oleh ${article.penulis}</span>
        </div>
        <h1>${article.judul}</h1>
        <div class="article-cover" style="background:${article.cover}"></div>
        <p class="article-lead">${article.lead}</p>
        ${article.sections.map((s) => `<h2>${s.h}</h2><p>${s.p}</p>`).join("")}
        <blockquote>${article.quote}</blockquote>
        ${article.closing.map((p) => `<p>${p}</p>`).join("")}
        <div class="article-share">Bagikan:
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">fb</a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(article.judul)}" target="_blank" rel="noopener">x</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">in</a>
        </div>
      </article>
      <aside class="article-side">
        <div class="side-card">
          <h4>Artikel Terkait</h4>
          ${Object.entries(ARTICLES).filter(([key]) => key !== id).slice(0, 4)
            .map(([key, a]) => `<a class="side-link" href="artikel.html?id=${key}">${a.judul}</a>`).join("")}
        </div>
        <div class="side-card">
          <h4>Ingin jadi anggota?</h4>
          <p style="font-size:.82rem;color:var(--muted);line-height:1.7;margin-bottom:16px">Pelajari persyaratan dan daftarkan media Anda bersama APMOI.</p>
          <a href="persyaratan.html" class="btn btn-primary btn-sm" style="width:100%">Lihat Persyaratan →</a>
        </div>
      </aside>`;
    articleRoot.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }
});
