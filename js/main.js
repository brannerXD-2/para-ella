/* =========================================================
   Para Camila — interacciones
   Índice: utilidades · efectos · candado · sobre · carta
           (máquina de escribir, reveal, capítulos, scroll,
           tarjetas, mazo, nota, rasca, frenchies, pregunta,
           toques, contador)
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Configuración ---------- */
  // Fecha secreta: 6 de febrero de 2024 (meses base 0 → febrero = 1)
  const SECRET = { day: 6, month: 1, year: 2024 };
  const START_DATE = new Date(2024, 1, 6);

  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const WRONG_HINTS = [
    "Mmm… casi. Piénsalo otra vez.",
    "Esa no es, mi amor.",
    "Pista: fue en 2024.",
    "Pista: el mes de San Valentín.",
    "Última pista: una semana antes del 14."
  ];

  // Partículas: [ícono del sprite, color]
  const PALETTE = {
    love:   [["heart", "#ff8fc7"], ["heart", "#ff4d6d"], ["sparkle", "#d9b8ff"], ["strawberry"]],
    kuromi: [["heart", "#d9b8ff"], ["sparkle", "#ff8fc7"], ["moon", "#9b6bd3"], ["sparkle", "#fff"]],
    kitty:  [["heart", "#e8344e"], ["bow", "#e8344e"], ["heart", "#ff9ebb"], ["sparkle", "#ffb3c7"]],
    dream:  [["sparkle", "#9b6bd3"], ["heart", "#ff8fc7"], ["sparkle", "#f0a030"]],
    amber:  [["sparkle", "#f0a030"], ["sparkle", "#ffe0b0"], ["heart", "#ff8fc7"]],
    paws:   [["paw", "#9b6bd3"], ["heart", "#ff4d6d"], ["paw", "#ff8fc7"]]
  };

  /* ---------- Utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buzz = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };
  const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // Crea un <span> con un ícono SVG del sprite
  function particle(className, [icon, color]) {
    const el = document.createElement("span");
    el.className = className;
    if (color) el.style.setProperty("--c", color);
    el.innerHTML = `<svg><use href="#i-${icon}"/></svg>`;
    return el;
  }

  /* =========================================================
     Efectos
     ========================================================= */
  const fx = $("#fx");

  function burst(x, y, count = 18, palette = PALETTE.love) {
    for (let i = 0; i < count; i++) {
      const el = particle("sparkle", pick(palette));
      const angle = (Math.PI * 2 * i) / count + rand(-.2, .2);
      const dist = rand(80, 180);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--y", `${Math.sin(angle) * dist}px`);
      el.style.setProperty("--r", `${rand(-180, 180)}deg`);
      el.style.setProperty("--size", `${rand(14, 24)}px`);
      fx.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  function riseHearts(x, y, count = 1, palette = PALETTE.love, height = 120) {
    for (let i = 0; i < count; i++) {
      const el = particle("pop-heart", pick(palette));
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--x", `${rand(-60, 60)}px`);
      el.style.setProperty("--h", `${rand(height * .7, height * 1.3)}px`);
      el.style.setProperty("--r", `${rand(-40, 40)}deg`);
      el.style.setProperty("--size", `${rand(14, 24)}px`);
      el.style.animationDelay = `${i * 50}ms`;
      fx.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  function startFloaters() {
    if (reduceMotion) return;
    const layer = $(".floaters");

    const spawn = () => {
      if (document.hidden || layer.childElementCount > 14) return;
      const el = particle("floater", pick(PALETTE.love));
      el.style.left = `${rand(0, 100)}vw`;
      el.style.setProperty("--size", `${rand(12, 22)}px`);
      el.style.setProperty("--dur", `${rand(10, 18)}s`);
      el.style.setProperty("--drift", `${rand(-50, 50)}px`);
      layer.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    };

    for (let i = 0; i < 5; i++) setTimeout(spawn, i * 500);
    setInterval(spawn, 1500);
  }

  // Si una imagen no existe en assets/img, se oculta (o muestra su respaldo) sin romper el diseño
  function setupOptionalImages() {
    $$("img[data-optional]").forEach((img) => {
      const hide = () => {
        img.style.display = "none";
        const fallback = img.dataset.fallback && $(img.dataset.fallback);
        if (fallback) fallback.removeAttribute("hidden"); // funciona también en <svg>
      };
      if (img.complete && img.naturalWidth === 0) hide();
      img.addEventListener("error", hide);
    });
  }

  /* =========================================================
     1. Candado
     ========================================================= */
  function setupLock() {
    const day = $("#day");
    const month = $("#month");
    const year = $("#year");
    const hint = $("#lockHint");
    const card = $(".lock__card");
    let attempts = 0;

    day.append(new Option("—", ""));
    for (let d = 1; d <= 31; d++) day.append(new Option(d, d));
    month.append(new Option("—", ""));
    MONTHS.forEach((m, i) => month.append(new Option(m, i)));
    year.append(new Option("—", ""));
    for (let y = 2020; y <= 2027; y++) year.append(new Option(y, y));

    $("#lockForm").addEventListener("submit", (e) => {
      e.preventDefault();

      if (!day.value || month.value === "" || !year.value) {
        hint.textContent = "Elige día, mes y año, mi vida.";
        return;
      }

      const ok =
        Number(day.value) === SECRET.day &&
        Number(month.value) === SECRET.month &&
        Number(year.value) === SECRET.year;

      if (ok) return unlock();

      hint.textContent = WRONG_HINTS[Math.min(attempts++, WRONG_HINTS.length - 1)];
      card.classList.remove("is-wrong");
      void card.offsetWidth; // reinicia la animación
      card.classList.add("is-wrong");
      buzz(120);
    });
  }

  function unlock() {
    const lock = $("#lock");
    const hint = $("#lockHint");
    hint.style.color = "var(--k-purple)";
    hint.textContent = "Ese día empezó todo.";
    lock.classList.add("is-open");
    const c = centerOf($(".lock__icon"));
    burst(c.x, c.y, 22);
    buzz(40);

    setTimeout(() => {
      lock.classList.add("is-leaving");
      showEnvelope();
    }, 1100);
    setTimeout(() => lock.remove(), 1900);
  }

  /* =========================================================
     2. Sobre
     ========================================================= */
  function showEnvelope() {
    const stage = $("#envelopeStage");
    const envelope = $("#envelope");
    stage.hidden = false;

    envelope.addEventListener("click", () => {
      envelope.classList.add("is-open");
      $(".envelope-stage__text").textContent = "Para ti, Camila";
      buzz(30);

      setTimeout(() => {
        const r = envelope.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top, 26);
      }, 600);
      setTimeout(() => {
        stage.classList.add("is-leaving");
        openLetter();
      }, 2300);
      setTimeout(() => stage.remove(), 3200);
    }, { once: true });
  }

  /* =========================================================
     Candados entre capítulos
     ========================================================= */
  let gates = null;
  // Cada sección avisa su avance: reportProgress(capítulo, cuántas tareas lleva)
  const reportProgress = (i, n) => { if (gates) gates.report(i, n); };

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-shown"), 3200);
  }

  function createGates() {
    const ORDER = ["intro", "orgullo", "amo", "sueno", "pronto", "futuro"];
    const NAMES = ["", "Capítulo uno", "Capítulo dos", "Capítulo tres", "Capítulo cuatro", "Capítulo cinco"];
    // Qué hay que hacer en cada capítulo para abrir el siguiente
    const TASKS = [
      { text: "Termina de leer la carta de arriba.", target: ".intro__paper", total: 1 },
      { text: "Toca las 4 tarjetas de orgullo para leerlas.", target: ".pride-grid", total: 4 },
      { text: "Pasa las 6 tarjetas de «Lo que amo de ti».", target: "#deck", total: 6 },
      { text: "Abre la nota «Ábrelo cuando dudes de ti».", target: "#noteToggle", total: 1 },
      { text: "Desliza el dedo sobre la tarjeta para descubrir el mensaje.", target: "#scratchBox", total: 1 }
    ];
    const LAST = TASKS.length;
    const KEY = "para-camila-progreso";

    const gate = $("#gate");
    const ui = {
      kicker: $("#gateKicker"), title: $("#gateTitle"), task: $("#gateTask"),
      fill: $("#gateFill"), count: $("#gateCount"), hint: $("#gateHint"),
      open: $("#gateOpen"), help: $("#gateHelp")
    };
    const progress = TASKS.map(() => 0);
    let unlocked = 0; // cuántos capítulos (después de la intro) están abiertos

    // El avance se guarda en este navegador; ?reiniciar en la URL lo borra
    try {
      if (/[?&]reiniciar/.test(location.search)) localStorage.removeItem(KEY);
      unlocked = clamp(parseInt(localStorage.getItem(KEY), 10) || 0, 0, LAST);
    } catch (e) { /* modo privado: se empieza desde cero */ }

    const save = () => {
      try { localStorage.setItem(KEY, String(unlocked)); } catch (e) { /* sin almacenamiento */ }
    };

    const apply = () => {
      ORDER.forEach((id, k) => { if (k > 0) $(`#${id}`).classList.toggle("is-gated", k > unlocked); });
      $("#footer").classList.toggle("is-gated", unlocked < LAST);
      $$(".chapters__dot").forEach((dot, k) => dot.classList.toggle("is-locked", k > unlocked));
    };

    const render = () => {
      if (unlocked >= LAST) {
        gate.hidden = true;
        return;
      }
      gate.hidden = false;
      $(`#${ORDER[unlocked]}`).after(gate);

      const t = TASKS[unlocked];
      const n = Math.min(progress[unlocked], t.total);
      const ready = n >= t.total;
      const next = NAMES[unlocked + 1];

      gate.classList.toggle("is-ready", ready);
      ui.kicker.textContent = next;
      ui.title.textContent = ready ? "¡Lo lograste!" : "Todavía está cerrado";
      ui.task.textContent = ready ? `Ya puedes abrir el ${next.toLowerCase()}.` : t.text;
      ui.fill.style.setProperty("--g", (n / t.total).toFixed(3));
      ui.count.textContent = t.total > 1 ? `${n} de ${t.total}` : (ready ? "Completado" : "Pendiente");
      ui.hint.hidden = ready;
      ui.open.hidden = !ready;
      ui.open.textContent = `Abrir el ${next.toLowerCase()}`;
      ui.help.hidden = unlocked !== 0;
    };

    const report = (i, n) => {
      if (n <= progress[i]) return;
      progress[i] = n;
      if (i !== unlocked) return;
      const wasReady = gate.classList.contains("is-ready");
      render();
      if (!wasReady && gate.classList.contains("is-ready")) {
        showToast(`¡${NAMES[i + 1]} desbloqueado! Baja para abrirlo.`);
        buzz([30, 40, 30]);
      }
    };

    const focusGate = () => gate.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });

    ui.open.addEventListener("click", () => {
      if (!gate.classList.contains("is-ready") || gate.classList.contains("is-opening")) return;
      gate.classList.add("is-opening");
      const c = centerOf($(".gate__lock", gate));
      burst(c.x, c.y, 24);
      buzz([40, 60, 40]);

      setTimeout(() => {
        gate.classList.remove("is-opening");
        unlocked++;
        save();
        apply();
        render();
        $(`#${ORDER[unlocked]}`).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }, 750);
    });

    // "¿Dónde? Llévame": sube hasta la tarea pendiente y la ilumina
    ui.hint.addEventListener("click", () => {
      const target = $(TASKS[unlocked].target);
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      target.classList.remove("is-hinted");
      void target.offsetWidth;
      target.classList.add("is-hinted");
      setTimeout(() => target.classList.remove("is-hinted"), 3200);
    });

    apply();
    render();
    return { report, focusGate, isUnlocked: (k) => k <= unlocked };
  }

  /* =========================================================
     3. Carta
     ========================================================= */
  function openLetter() {
    $("#letter").hidden = false;
    $("#progress").hidden = false;
    $("#chapters").hidden = false;
    document.body.classList.remove("is-locked");
    window.scrollTo(0, 0);

    $("#todayDate").textContent = new Date().toLocaleDateString("es-CO", {
      day: "numeric", month: "long", year: "numeric"
    });

    gates = createGates();
    setupTypewriter();
    setupReveal();
    setupChapters();
    setupScrollEffects();
    setupPrideTiles();
    setupStickers();
    setupDeck();
    setupDreamNote();
    setupScratch();
    setupFrenchies();
    setupQuestion();
    setupTapHearts();
    setupDaysCounter();
    $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Máquina de escribir ---------- */
  function setupTypewriter() {
    const lines = $$("[data-type]");
    const hint = $(".intro__scroll");
    let skip = false;

    // Tocar el papel completa el texto de una vez
    $(".intro__paper").addEventListener("click", () => { skip = true; });

    const typeLine = (el) => new Promise((resolve) => {
      const chars = [...el.dataset.type];
      let i = 0;
      el.classList.add("is-typing");

      const step = () => {
        if (skip || reduceMotion) i = chars.length;
        el.textContent = chars.slice(0, ++i).join("");
        if (i < chars.length) {
          setTimeout(step, /[.,:]/.test(chars[i - 1]) ? 260 : 32);
        } else {
          el.classList.remove("is-typing");
          resolve();
        }
      };
      step();
    });

    (async () => {
      await new Promise((r) => setTimeout(r, 700));
      for (const line of lines) {
        await typeLine(line);
        if (!skip) await new Promise((r) => setTimeout(r, 350));
      }
      hint.classList.add("is-shown");
      reportProgress(0, 1);
    })();
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function setupReveal() {
    const items = $$(".reveal");

    items.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* ---------- Navegación por capítulos ---------- */
  function setupChapters() {
    const dots = $$(".chapters__dot");

    // Un capítulo bloqueado no se puede abrir desde la barra: se explica por qué
    dots.forEach((dot, k) => {
      dot.addEventListener("click", (e) => {
        if (gates.isUnlocked(k)) return;
        e.preventDefault();
        showToast("Ese capítulo aún está cerrado. Completa el anterior para abrirlo.");
        gates.focusGate();
        buzz(60);
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        dots.forEach((d) => d.classList.toggle("is-active", d.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    $$("[data-chapter]").forEach((s) => io.observe(s));
  }

  /* ---------- Progreso y parallax (un solo listener) ---------- */
  function setupScrollEffects() {
    const progress = $("#progress");
    const nav = $("#chapters");
    const parallax = $$("[data-parallax]");
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      progress.style.setProperty("--p", p.toFixed(4));
      nav.classList.toggle("is-shown", window.scrollY > vh * 0.5);

      if (!reduceMotion) {
        parallax.forEach((el) => {
          const r = el.getBoundingClientRect();
          const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
          el.style.transform = `translateY(${offset.toFixed(1)}px) rotate(${(offset * 0.12).toFixed(2)}deg)`;
        });
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- Tarjetas de orgullo que salen a la pantalla (Kuromi) ---------- */
  function setupPrideTiles() {
    const tiles = $$(".pride-tile");
    const modal = $("#prideModal");
    const card = $("#prideModalCard");
    const title = $("#prideModalTitle");
    const text = $("#prideModalText");
    const icon = $("#prideModalIcon");
    const dots = $("#prideModalDots");
    const nextBtn = $("#prideModalNext");
    const fill = $("#meterFill");
    const meterText = $("#meterText");
    const levels = ["abre las tarjetas", "mucho", "muchísimo", "demasiado", "infinito"];
    const seen = new Set();
    const EASE = "cubic-bezier(.34, 1.3, .64, 1)";
    let current = -1;
    let origin = null;

    tiles.forEach(() => dots.appendChild(document.createElement("span")));

    const updateMeter = () => {
      fill.style.setProperty("--fill", `${5 + (seen.size / tiles.length) * 95}%`);
      meterText.textContent = levels[seen.size];
    };

    const markSeen = (i) => {
      if (seen.has(i)) return;
      seen.add(i);
      tiles[i].classList.add("is-seen");
      updateMeter();
      reportProgress(1, seen.size);
    };

    const fillCard = (i) => {
      const tile = tiles[i];
      current = i;
      title.textContent = $(".pride-tile__title", tile).textContent;
      text.textContent = $(".pride-tile__text", tile).textContent.replace(/\s+/g, " ").trim();
      icon.setAttribute("href", `#${tile.dataset.icon}`);
      [...dots.children].forEach((d, j) => d.classList.toggle("is-active", j === i));
      markSeen(i);
    };

    // Anima la tarjeta desde/hacia la posición de su baldosa (técnica FLIP)
    const flipFrom = (tile) => {
      const from = tile.getBoundingClientRect();
      const to = card.getBoundingClientRect();
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const s = from.width / to.width;
      return `translate(${dx}px, ${dy}px) scale(${s})`;
    };

    const open = (i) => {
      origin = tiles[i];
      modal.hidden = false;
      document.body.classList.add("modal-open");
      fillCard(i);
      if (!reduceMotion) {
        card.animate(
          [{ transform: flipFrom(origin), opacity: .3 }, { transform: "none", opacity: 1 }],
          { duration: 650, easing: EASE }
        );
      }
      setTimeout(() => {
        const r = card.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + 90, 14, PALETTE.kuromi);
      }, 420);
      buzz(20);
      $(".pride-modal__close", modal).focus({ preventScroll: true });
    };

    const close = () => {
      if (modal.hidden || modal.classList.contains("is-closing")) return;
      modal.classList.add("is-closing");
      const target = tiles[current] || origin;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        modal.hidden = true;
        modal.classList.remove("is-closing");
        document.body.classList.remove("modal-open");
        target.focus({ preventScroll: true });
        if (seen.size === tiles.length && !modal.dataset.celebrated) {
          modal.dataset.celebrated = "1";
          const c = centerOf(fill);
          burst(c.x, c.y, 22, PALETTE.kuromi);
          buzz([30, 40, 30]);
        }
      };
      if (reduceMotion) return finish();
      setTimeout(finish, 500); // respaldo por si la animación no termina
      card.animate(
        [{ transform: "none", opacity: 1 }, { transform: flipFrom(target), opacity: 0 }],
        { duration: 380, easing: "cubic-bezier(.4, 0, .2, 1)" }
      ).onfinish = finish;
    };

    const go = (dir) => {
      const i = (current + dir + tiles.length) % tiles.length;
      card.style.setProperty("--dir", dir);
      card.classList.remove("is-swapping");
      void card.offsetWidth; // reinicia la animación
      card.classList.add("is-swapping");
      fillCard(i);
      buzz(10);
    };

    tiles.forEach((tile, i) => tile.addEventListener("click", () => open(i)));
    nextBtn.addEventListener("click", () => go(1));
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });

    // Deslizar la tarjeta para pasar a la siguiente o volver
    let startX = null;
    card.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    card.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- Mazo deslizable (Hello Kitty) ---------- */
  function setupDeck() {
    const cards = $$(".swipe-card");
    const count = $("#deckCount");
    const nextBtn = $("#deckNext");
    const THRESHOLD = 80;
    let current = 0;

    const layout = () => {
      cards.forEach((card, i) => {
        const depth = i - current;
        if (depth < 0) return;
        card.classList.remove("is-gone");
        card.style.setProperty("--i", Math.min(depth, 3));
        card.style.setProperty("--dx", "0px");
        card.style.setProperty("--dy", "0px");
        card.style.setProperty("--rot", "0deg");
        card.style.setProperty("--tilt", depth === 0 ? "0deg" : `${depth % 2 ? 4 : -4}deg`);
        if (depth > 3) card.dataset.depth = "hidden";
        else delete card.dataset.depth;
      });
      count.textContent = current < cards.length ? `${current + 1} / ${cards.length}` : "Fin";
      nextBtn.hidden = current >= cards.length;
    };

    const throwCard = (dir = 1) => {
      const card = cards[current];
      if (!card) return;
      card.style.setProperty("--dx", `${dir * window.innerWidth}px`);
      card.style.setProperty("--rot", `${dir * 30}deg`);
      card.classList.add("is-gone");
      const c = centerOf(card);
      riseHearts(c.x, c.y, 5, current === 0 ? PALETTE.amber : PALETTE.kitty);
      buzz(20);
      current++;
      layout();
      reportProgress(2, current);
    };

    cards.forEach((card) => {
      let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, moved = false;

      card.addEventListener("pointerdown", (e) => {
        if (card !== cards[current]) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        dx = dy = 0;
        card.setPointerCapture(e.pointerId);
        card.classList.add("is-dragging");
      });

      card.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        dx = e.clientX - startX;
        dy = e.clientY - startY;
        if (Math.abs(dx) > 6) moved = true;
        card.style.setProperty("--dx", `${dx}px`);
        card.style.setProperty("--dy", `${dy * 0.3}px`);
        card.style.setProperty("--rot", `${dx * 0.07}deg`);
      });

      const end = () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove("is-dragging");

        if (Math.abs(dx) > THRESHOLD) {
          throwCard(Math.sign(dx));
        } else {
          card.style.setProperty("--dx", "0px");
          card.style.setProperty("--dy", "0px");
          card.style.setProperty("--rot", "0deg");
          if (!moved) {
            card.classList.toggle("is-flipped");
            buzz(10);
          }
        }
      };

      card.addEventListener("pointerup", end);
      card.addEventListener("pointercancel", () => { moved = true; end(); });
    });

    nextBtn.addEventListener("click", () => throwCard(1));
    $("#deckReset").addEventListener("click", () => {
      current = 0;
      cards.forEach((c) => c.classList.remove("is-flipped"));
      layout();
    });

    layout();
  }

  /* ---------- Nota "ábrelo cuando dudes" ---------- */
  function setupDreamNote() {
    const toggle = $("#noteToggle");
    const note = $("#dreamNote");
    const label = $(".note-toggle__label", toggle);

    toggle.addEventListener("click", () => {
      const open = note.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Guárdalo en tu corazón" : "Ábrelo cuando dudes de ti";
      if (open) {
        const c = centerOf(toggle);
        burst(c.x, c.y, 14, PALETTE.dream);
        buzz(20);
        reportProgress(3, 1);
      }
    });
  }

  /* ---------- Rasca y descubre ---------- */
  function setupScratch() {
    const box = $("#scratchBox");
    const canvas = $("#scratchCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let done = false;
    let strokes = 0;
    let last = null;

    // Estrella de 4 puntas dibujada en el canvas
    const star = (x, y, r) => {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };

    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = box.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#3a2150");
      g.addColorStop(.55, "#9b6bd3");
      g.addColorStop(1, "#f0a030");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255, 240, 210, .55)";
      for (let i = 0; i < 26; i++) star(rand(0, width), rand(0, height), rand(2, 6));

      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "600 20px Fredoka, sans-serif";
      ctx.fillText("Desliza aquí", width / 2, height / 2 + 7);
    };

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const scratchAt = (p) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 42;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo((last || p).x, (last || p).y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };

    const checkCleared = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 40) {
        total++;
        if (data[i] === 0) clear++;
      }
      if (clear / total > 0.5) finish();
    };

    const finish = () => {
      if (done) return;
      done = true;
      box.classList.add("is-done");
      const c = centerOf(box);
      burst(c.x, c.y, 22, PALETTE.amber);
      buzz([30, 50, 30]);
      reportProgress(4, 1);
    };

    canvas.addEventListener("pointerdown", (e) => {
      drawing = true;
      last = null;
      canvas.setPointerCapture(e.pointerId);
      scratchAt(point(e));
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!drawing || done) return;
      scratchAt(point(e));
      if (++strokes % 12 === 0) checkCleared();
    });

    const stop = () => {
      drawing = false;
      last = null;
      if (!done) checkCleared();
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);

    // Se pinta cuando las fuentes están listas y cada vez que la caja cambia de tamaño
    // (por ejemplo, al desbloquear el capítulo, que antes estaba oculto)
    let lastWidth = 0;
    const repaint = () => {
      const w = box.clientWidth;
      if (done || !w || w === lastWidth) return;
      lastWidth = w;
      paint();
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(repaint);
    if ("ResizeObserver" in window) new ResizeObserver(repaint).observe(box);
    else window.addEventListener("resize", repaint);
  }

  /* ---------- Mylo y Tammy ---------- */
  function setupFrenchies() {
    $$(".frenchie").forEach((dog) => {
      let timer;
      dog.addEventListener("click", () => {
        dog.classList.remove("is-talking");
        void dog.offsetWidth;
        dog.classList.add("is-talking");
        const c = centerOf($(".frenchie__avatar", dog));
        riseHearts(c.x, c.y, 3, PALETTE.paws);
        buzz(15);
        clearTimeout(timer);
        timer = setTimeout(() => dog.classList.remove("is-talking"), 3000);
      });
    });
  }

  /* ---------- Pregunta final (el "No" se escapa) ---------- */
  function setupQuestion() {
    const wrap = $("#question");
    const buttons = $("#questionButtons");
    const yes = $("#yesBtn");
    const no = $("#noBtn");
    const answer = $("#questionAnswer");
    const noTexts = ["¿Segura?", "Piénsalo bien", "Mmm, no", "No se puede", "Intenta con el otro"];
    let tries = 0;

    const escape = (e) => {
      e.preventDefault();
      tries++;
      // offsetLeft/Top ignoran transform → posición original del botón
      const w = buttons.clientWidth;
      const nw = no.offsetWidth, nh = no.offsetHeight;
      const yesBox = { x: yes.offsetLeft - 12, y: yes.offsetTop - 12, w: yes.offsetWidth * 1.6 + 24, h: yes.offsetHeight + 24 };
      let x = 0, y = 0;
      for (let i = 0; i < 20; i++) {
        x = rand(0, Math.max(0, w - nw));
        y = no.offsetTop + rand(-80, 80);
        const overlaps = x < yesBox.x + yesBox.w && x + nw > yesBox.x && y < yesBox.y + yesBox.h && y + nh > yesBox.y;
        if (!overlaps) break;
      }
      no.style.transform = `translate(${x - no.offsetLeft}px, ${y - no.offsetTop}px) rotate(${rand(-15, 15)}deg)`;
      no.textContent = noTexts[Math.min(tries - 1, noTexts.length - 1)];
      yes.style.setProperty("--grow", (1 + tries * 0.12).toFixed(2));
      buzz(15);
      if (tries >= noTexts.length + 1) {
        no.style.opacity = "0";
        no.style.pointerEvents = "none";
      }
    };

    no.addEventListener("pointerdown", escape);
    // Teclado (detail === 0); el toque ya lo maneja pointerdown
    no.addEventListener("click", (e) => { if (e.detail === 0) escape(e); else e.preventDefault(); });

    yes.addEventListener("click", () => {
      wrap.classList.add("is-answered");
      answer.textContent = "Sabía que dirías que sí. Te amo, Camila.";
      const c = centerOf(answer);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => burst(c.x + rand(-60, 60), c.y + rand(-40, 40), 22), i * 250);
      }
      riseHearts(window.innerWidth / 2, window.innerHeight, 16, PALETTE.love, 500);
      buzz([50, 80, 50, 80, 120]);
    });
  }

  /* ---------- Stickers: rebotan y sueltan destellos al tocarlos ---------- */
  function setupStickers() {
    $$(".sticker").forEach((sticker) => {
      sticker.addEventListener("click", () => {
        sticker.classList.remove("is-popped");
        void sticker.offsetWidth; // reinicia la animación
        sticker.classList.add("is-popped");
        const c = centerOf(sticker);
        burst(c.x, c.y, 10, sticker.closest(".kuromi") ? PALETTE.kuromi : PALETTE.kitty);
        buzz(15);
      });
    });
  }

  /* ---------- Corazoncitos al tocar cualquier parte ---------- */
  function setupTapHearts() {
    $("#letter").addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, canvas, .swipe-card, select, .sticker")) return;
      riseHearts(e.clientX, e.clientY, 1);
    });
  }

  /* ---------- Contador de días ---------- */
  function setupDaysCounter() {
    const days = Math.floor((Date.now() - START_DATE.getTime()) / 86400000);
    $("#daysCounter").textContent = `${days.toLocaleString("es-CO")} días desde que empezó nuestra historia`;
  }

  /* =========================================================
     0. Pantalla de carga: precarga imágenes y fuentes
     ========================================================= */
  function runLoader() {
    const loader = $("#loader");
    const bar = $("#loaderBar");
    const percent = $("#loaderPercent");
    const text = $("#loaderText");
    const messages = [
      "Preparando algo especial para ti",
      "Juntando estrellas",
      "Buscando las palabras correctas",
      "Casi listo, mi amor"
    ];

    const sources = [...new Set($$("img[src]").map((img) => img.src))];
    const total = sources.length + 1; // + fuentes
    let loaded = 0;

    const tick = () => {
      loaded++;
      const p = loaded / total;
      bar.style.setProperty("--load", p.toFixed(3));
      percent.textContent = `${Math.round(p * 100)}%`;
    };

    const tasks = sources.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    }).then(tick));
    tasks.push((document.fonts ? document.fonts.ready : Promise.resolve()).then(tick));

    let m = 0;
    const rotate = setInterval(() => {
      text.classList.add("is-changing");
      setTimeout(() => {
        m = (m + 1) % messages.length;
        text.textContent = messages[m];
        text.classList.remove("is-changing");
      }, 400);
    }, 1900);

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const ready = Promise.all([Promise.all(tasks), wait(reduceMotion ? 300 : 2800)]);

    // Nunca se queda atascada: como máximo 9 s aunque falle la red
    return Promise.race([ready, wait(9000)])
      .then(() => {
        clearInterval(rotate);
        bar.style.setProperty("--load", "1");
        percent.textContent = "100%";
        return wait(500);
      })
      .then(() => {
        loader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        setTimeout(() => loader.remove(), 900);
      });
  }

  /* ---------- Inicio ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    setupOptionalImages();
    startFloaters();
    setupLock();
    runLoader();
  });
})();
