/* ============================================================
   APMOI — theme interactions
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Header shadow on scroll ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Suntik tautan & badge verifikasi ---------- */
  (() => {
    const navEl = document.getElementById("nav");
    if (navEl && !navEl.querySelector('[data-nav="verifikasi"]')) {
      const link = document.createElement("a");
      link.href = "verifikasi.html";
      link.className = "nav-link verify-link";
      link.dataset.nav = "verifikasi";
      link.textContent = "✓ Verifikasi";
      navEl.appendChild(link);
    }

    const footerTentang = Array.from(document.querySelectorAll(".footer-col")).find(
      (col) => col.querySelector("h4") && /tentang/i.test(col.querySelector("h4").textContent)
    );
    if (footerTentang && !footerTentang.querySelector('a[href="verifikasi.html"]')) {
      const a = document.createElement("a");
      a.href = "verifikasi.html";
      a.textContent = "Status Verifikasi";
      footerTentang.appendChild(a);
    }

    if (document.body.dataset.page !== "verifikasi" && !document.querySelector(".verify-badge")) {
      const badge = document.createElement("a");
      badge.href = "verifikasi.html";
      badge.className = "verify-badge";
      badge.setAttribute("aria-label", "Lihat status verifikasi situs APMOI");
      badge.innerHTML = '<span class="vb-check" aria-hidden="true">✓</span> Terverifikasi';
      document.body.appendChild(badge);
    }
  })();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll(".nav-link");

  const closeMenu = () => {
    nav.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
  });

  /* ---------- Active link sesuai halaman ---------- */
  const page = document.body.dataset.page || "";
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === page);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();

        const update = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((counter) => counterObserver.observe(counter));
});
