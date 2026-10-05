(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  const flow = document.querySelector(".flow");
  const heroImg = document.querySelector(".hero-bg img");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      if (header) {
        header.classList.toggle("is-solid", y > 24);
        if (!reduceMotion && !header.classList.contains("is-open")) {
          const goingDown = y > lastY && y > 140;
          header.classList.toggle("is-hidden", goingDown);
        }
      }
      if (heroImg && !reduceMotion) {
        heroImg.style.transform = `translate3d(0, ${Math.min(y * 0.24, 130)}px, 0)`;
      }
      lastY = y;
      ticking = false;
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    if (!header || !menuBtn) return;
    header.classList.toggle("is-open", open);
    header.classList.remove("is-hidden");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (menuBtn && header && nav) {
    menuBtn.addEventListener("click", () => {
      setMenu(!header.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  const staggerHeroTitle = () => {
    const title = document.querySelector(".hero-title");
    if (!title || reduceMotion) return;

    const nodes = Array.from(title.childNodes);
    title.textContent = "";
    let delay = 0;

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            title.appendChild(document.createTextNode(part));
            return;
          }
          const span = document.createElement("span");
          span.className = "hero-word";
          span.style.setProperty("--d", `${delay}ms`);
          span.textContent = part;
          title.appendChild(span);
          delay += 68;
        });
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const span = document.createElement("span");
        span.className = "hero-word";
        span.style.setProperty("--d", `${delay}ms`);
        span.appendChild(node.cloneNode(true));
        title.appendChild(span);
        delay += 68;
      }
    });

    title.classList.add("is-staggered");
  };

  staggerHeroTitle();

  const bindPhoneTilt = () => {
    if (reduceMotion || !finePointer) return;
    const phones = document.querySelectorAll(".phone");
    const max = 5.5;

    phones.forEach((phone) => {
      phone.addEventListener("pointermove", (event) => {
        const rect = phone.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        phone.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
        phone.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
      });

      phone.addEventListener("pointerleave", () => {
        phone.style.setProperty("--rx", "0deg");
        phone.style.setProperty("--ry", "0deg");
      });
    });
  };

  bindPhoneTilt();

  const bindChips = () => {
    const chips = Array.from(document.querySelectorAll(".chip[data-chip]"));
    if (!chips.length) return;

    const sections = chips
      .map((chip) => {
        const id = chip.getAttribute("data-chip");
        const el = document.getElementById(id);
        return el ? { chip, el } : null;
      })
      .filter(Boolean);

    const setActive = (activeChip) => {
      chips.forEach((chip) => chip.classList.toggle("is-active", chip === activeChip));
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => setActive(chip));
    });

    if (!("IntersectionObserver" in window) || !sections.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = sections.find((item) => item.el === visible.target);
        if (match) setActive(match.chip);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.12, 0.35, 0.6] }
    );

    sections.forEach(({ el }) => spy.observe(el));
  };

  bindChips();

  const bindAdminGalleryDrag = () => {
    const track = document.querySelector(".admin-gallery-track");
    if (!track) return;

    let active = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (event) => {
      active = true;
      track.classList.add("is-dragging");
      startX = event.clientX;
      scrollLeft = track.scrollLeft;
    };

    const onMove = (event) => {
      if (!active) return;
      const walk = (event.clientX - startX) * 1.15;
      track.scrollLeft = scrollLeft - walk;
    };

    const onUp = () => {
      active = false;
      track.classList.remove("is-dragging");
    };

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  bindAdminGalleryDrag();

  if (!reduceMotion && "IntersectionObserver" in window) {
    const nodes = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          if (flow && (entry.target === flow || flow.contains(entry.target))) {
            flow.classList.add("is-in");
          }
          const parent = entry.target.closest(".showcase, .split, .admin-feature, .admin-grid, .admin, .mosaic");
          if (parent) parent.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach((node) => io.observe(node));
    if (flow) io.observe(flow);
  } else {
    document
      .querySelectorAll(".reveal, .showcase, .split, .flow, .admin, .admin-feature, .admin-grid, .mosaic")
      .forEach((node) => {
        node.classList.add("is-in");
      });
  }
})();
