/* ============================================================
   季津纬 · 设计作品集 2026 — Web Edition
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. boot ---------- */
  const bootNum = $("#bootNum");
  function boot() {
    const dur = RM ? 120 : 1200, t0 = performance.now();
    (function tick(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      if (bootNum) bootNum.textContent = String(Math.round(p * 100)).padStart(2, "0");
      if (p < 1) requestAnimationFrame(tick);
      else {
        document.body.classList.remove("lock");
        document.body.classList.add("ready");
        revealScan();
      }
    })(t0);
  }
  document.body.classList.add("lock");
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1400))]).then(boot);
  } else setTimeout(boot, 300);

  /* ---------- 2. split text ---------- */
  $$("[data-split]").forEach(el => {
    const walk = node => {
      Array.prototype.slice.call(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split("").forEach(ch => {
            const s = document.createElement("span");
            s.className = "sp";
            s.textContent = ch === " " ? "\u00A0" : ch;
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
        else if (n.nodeType === 1 && n.tagName === "BR") {
          const br = document.createElement("br");
          n.parentNode.replaceChild(br, n);
        }
      });
    };
    walk(el);
    $$(".sp", el).forEach((s, i) => s.style.setProperty("--i", String(i % 24)));
  });

  /* ---------- 3. reveal ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -12% 0px", threshold: .06 })
    : null;
  function observeAll() {
    $$(".rv,.rv-s,[data-split]").forEach(el => { if (!el.classList.contains("on")) io ? io.observe(el) : el.classList.add("on"); });
  }
  function revealScan() { observeAll(); }
  observeAll();

  /* ---------- 4. cursor ---------- */
  const cur = $("#cur"), curTxt = $(".cur-txt", cur || document);
  if (cur) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cur.classList.remove("hide"); }, { passive: true });
    (function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      cur.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    })();
    const setTxt = t => { if (curTxt) curTxt.textContent = t || ""; };
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-cursor],a,button,.flip,.idx-it");
      if (!t) return;
      cur.classList.add("big");
      setTxt(t.getAttribute("data-cursor") || (t.closest(".idx-it") ? "查看" : ""));
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest("[data-cursor],a,button,.flip,.idx-it")) { cur.classList.remove("big"); setTxt(""); }
    });
  }

  /* ---------- 5. scroll progress + rail ---------- */
  const barFill = $("#barFill"), railFill = $("#railFill"), blob = $("#blob");
  const railLinks = $$(".rail a");
  let rootAcc = "";
  const secs = $$("[data-ch]");
  const topBar = $(".top");
  let lastY = scrollY;
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = clamp(scrollY / (h || 1), 0, 1);
    if (topBar) {
      const y = scrollY;
      if (y > 280 && y > lastY + 3) topBar.classList.add("hide");
      else if (y < lastY - 3 || y <= 280) topBar.classList.remove("hide");
      lastY = y;
    }
    if (barFill) barFill.style.width = (p * 100) + "%";
    if (railFill) railFill.style.height = (p * 100) + "%";
    if (blob && !RM) {
      blob.style.transform = `translate3d(0,calc(-50% + ${scrollY * -.14}px),0)`;
    }
    let act = -1, acc = null;
    secs.forEach(s => {
      if (s.getBoundingClientRect().top <= innerHeight * .42) {
        act = +s.dataset.ch;
        if (s.style.getPropertyValue("--acc")) acc = s.style.getPropertyValue("--acc").trim();
      }
    });
    if (acc) {
      if (acc !== rootAcc) { rootAcc = acc; document.documentElement.style.setProperty("--acc", acc); }
    }
    railLinks.forEach(a => a.classList.toggle("on", +a.dataset.rail === act));
    hsecs.forEach(hs => hs.update());
  }
  let raf = false;
  function scrollHandler() { if (!raf) { raf = true; requestAnimationFrame(() => { raf = false; onScroll(); }); } }
  addEventListener("scroll", scrollHandler, { passive: true });

  /* ---------- 6. blob face follows pointer ---------- */
  (function () {
    const face = $("#blobFace"); if (!face || RM) return;
    const parts = Array.prototype.slice.call(face.children);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("mousemove", e => {
      const r = blob.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tx = clamp(dx * 16, -16, 16); ty = clamp(dy * 12, -12, 12);
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      parts.forEach(p => p.setAttribute("transform", `translate(${cx.toFixed(2)} ${cy.toFixed(2)})`));
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- 7. index hover preview ---------- */
  (function () {
    const peek = $("#peek"), img = peek && $("img", peek);
    if (!peek) return;
    let px = 0, py = 0, tx = 0, ty = 0, on = false;
    $$(".idx-it").forEach(it => {
      it.addEventListener("mouseenter", () => {
        const src = it.dataset.peek; if (src) img.src = src;
        peek.classList.add("on"); on = true;
      });
      it.addEventListener("mouseleave", () => { peek.classList.remove("on"); on = false; });
    });
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      px += (tx - px) * .12; py += (ty - py) * .12;
      peek.style.left = px + "px"; peek.style.top = py + "px";
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- 8. horizontal scroll sections ---------- */
  const hsecs = [];
  function buildHsec(el) {
    const track = $(".htrack", el); if (!track) return;
    let max = 0;
    const measure = () => { max = Math.max(0, track.scrollWidth - innerWidth); };
    const api = {
      el, track, measure,
      update() {
        if (innerWidth <= 1000) { track.style.transform = ""; return; }
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - innerHeight;
        if (total <= 0) return;
        const p = clamp(-r.top / total, 0, 1);
        track.style.transform = `translate3d(${-(p * max).toFixed(1)}px,0,0)`;
      }
    };
    measure(); setTimeout(measure, 600);
    hsecs.push(api);
    return api;
  }
  $$("[data-hscroll]").forEach(buildHsec);

  /* ---------- 9. counters ---------- */
  (function () {
    const io2 = "IntersectionObserver" in window ? new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
        const t0 = performance.now(), dur = RM ? 0 : 1500;
        (function tick(now) {
          const p = dur ? clamp((now - t0) / dur, 0, 1) : 1;
          const e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * e2).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = to.toFixed(dec);
        })(t0);
        io2.unobserve(el);
      });
    }, { threshold: .5 }) : null;
    $$("[data-count]").forEach(el => io2 ? io2.observe(el) : el.textContent = el.dataset.count);
  })();

  /* ---------- 10. galleries ---------- */
  const LUPAI = "assets/lupai/", RP = "assets/rp/", HYD = "assets/hyd/";

  function figs(list, cls) {
    return list.map(it => `<figure${it[2] ? ' class="wide"' : ""}><img src="${it[0]}" alt="${it[1]}" loading="lazy" decoding="async">` +
      (it[3] === false ? "" : `<figcaption>${it[1]}</figcaption>`) + `</figure>`).join("");
  }

  /* expressions */
  const exprTrack = $("#exprTrack");
  if (exprTrack) {
    const mk = (pre, label) => Array.from({ length: 16 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return [`${LUPAI}${pre}-${n}.webp`, `${label} ${n}`, false];
    });
    const draw = kind => {
      exprTrack.innerHTML = figs(mk(kind, kind === "expr2d" ? "平面表情" : "立体表情"), kind);
    };
    draw("expr2d");
    const tabs = $("#exprTabs");
    if (tabs) tabs.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", tabs).forEach(x => x.classList.toggle("on", x === b));
      draw(b.dataset.tab === "3d" ? "expr3d" : "expr2d");
      const api = hsecs.find(h => h.el.contains(exprTrack));
      if (api) { api.measure(); api.update(); }
    });
  }

  /* patterns */
  const patTrack = $("#patTrack");
  if (patTrack) {
    patTrack.className = "htrack htrack-pat";
    patTrack.innerHTML = figs([
      [LUPAI + "pat-1.webp", "线条纹样 · 紫底白线"],
      [LUPAI + "pat-16.webp", "线条纹样 · 白底紫线"],
      [LUPAI + "pat-50.webp", "线条纹样 · 黑底"],
      [LUPAI + "pat-2.webp", "鹿角放射纹样"],
      [LUPAI + "pat-40.webp", "鹿头底纹"],
      [LUPAI + "pat-41.webp", "主视觉组合 · 纹样 + 鹿头 + WYSS 字标"]
    ].map(x => [x[0], x[1], false]));
  }

  /* applications */
  const apps = $("#apps");
  if (apps) {
    apps.innerHTML = [
      [LUPAI + "mock-108.webp", "宣传册", "Editorial · 内页版式沿用同一套网格"],
      [LUPAI + "mock-100.webp", "名片 / 信封 / 信纸", "Stationery"],
      [LUPAI + "mock-106.webp", "文具组合", "Stationery set"],
      [LUPAI + "mock-102.webp", "文件夹 / 档案套", "Folder · dark"],
      [LUPAI + "mock-109.webp", "工作证 / 挂绳", "Badge & lanyard"],
      [LUPAI + "mock-110.webp", "笔盒", "Pencil case"],
      [LUPAI + "mock-101.webp", "帆布袋", "Tote bag"],
      [LUPAI + "mock-107.webp", "徽章", "Pin badge"],
      [LUPAI + "mock-103.webp", "室内立柱屏 / 易拉宝", "Indoor standee"],
      [LUPAI + "mock-104.webp", "户外大屏", "Outdoor LED"],
      [LUPAI + "mock-105.webp", "卷轴海报 / 挂轴", "Scroll poster"]
    ].map(a => `<li><img src="${a[0]}" alt="${a[1]} 应用物料" loading="lazy" decoding="async"><b>${a[1]}</b><i class="mono">${a[2]}</i></li>`).join("");
  }

  /* UI screens */
  const uiTrack = $("#uiTrack");
  if (uiTrack) {
    const items = [
      [HYD + "ui/ui-overview.webp", "完整界面清单与用户动线", true],
      [HYD + "ui/ui-splash.webp", "启动页"],
      [HYD + "ui/ui-onboard-1.webp", "引导 01"],
      [HYD + "ui/ui-onboard-2.webp", "引导 02"],
      [HYD + "ui/ui-onboard-3.webp", "引导 03"],
      [HYD + "ui/ui-login.webp", "登录"],
      [HYD + "ui/ui-home.webp", "主页 · 鹤叔说反诈"],
      [HYD + "ui/ui-talk.webp", "说反诈"],
      [HYD + "ui/ui-remind.webp", "鹤叔提个醒"],
      [HYD + "ui/ui-voice.webp", "语音助手"],
      [HYD + "ui/ui-community.webp", "社区"],
      [HYD + "ui/ui-events.webp", "最新活动"],
      [HYD + "ui/ui-me.webp", "我"]
    ];
    uiTrack.className = "htrack htrack-ui";
    uiTrack.innerHTML = items.map(it =>
      `<figure${it[2] ? ' class="wide"' : ""}><img src="${it[0]}" alt="${it[1]}" loading="lazy" decoding="async"><figcaption>${it[1]}</figcaption></figure>`
    ).join("");
  }

  /* certificates */
  const certs = $("#certs");
  if (certs) {
    certs.className = "certs";
    certs.innerHTML = [
      [HYD + "award/cert-1.webp", "中国大学生网络文化节 · 省级优秀（教育部主办）"],
      [HYD + "award/cert-2.webp", "CADA 日本概念艺术设计赛 · 银奖 ×2"],
      [HYD + "award/cert-3.webp", "2025 G-CROSS AWARD · Bronze Award"],
      [HYD + "award/cert-4.webp", "香港视觉艺术奖 · 铜奖"],
      [HYD + "award/cert-5.webp", "其他获奖证书（部分）"]
    ].map(c => `<figure><img src="${c[0]}" alt="${c[1]}" loading="lazy" decoding="async"><figcaption>${c[1]}</figcaption></figure>`).join("");
  }

  /* ---------- 11. swatch copy ---------- */
  document.addEventListener("click", e => {
    const btn = e.target.closest(".sw button"); if (!btn) return;
    const hex = btn.dataset.hex;
    const done = () => {
      const li = btn.closest(".sw");
      li.classList.add("copied");
      const u = $("u", btn); if (u) { const t = u.textContent; u.textContent = "已复制"; setTimeout(() => { u.textContent = t; li.classList.remove("copied"); }, 1400); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(hex).then(done, done);
    else done();
  });

  /* ---------- 12. flip cards on touch ---------- */
  $$(".flip").forEach(f => f.addEventListener("click", () => f.classList.toggle("on")));

  /* ---------- 13. resize ---------- */
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { hsecs.forEach(h => h.measure()); onScroll(); }, 180); });
  addEventListener("load", () => { hsecs.forEach(h => h.measure()); onScroll(); });
  onScroll();
  revealScan();
})();