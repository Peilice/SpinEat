// 主題：依時間自動切換（白天廟口、晚上夜市霓虹），或在設定頁固定其中一個
// 每個主題配一種抽法：廟口求籤、夜市戳戳樂
// 放在 <head> 同步載入，避免頁面先閃過另一個主題
const SpinEatTheme = (() => {
  "use strict";

  const DAY_START = 5; // 05:00 起是白天，廟口
  const NIGHT_START = 18; // 18:00 起是晚上，夜市
  const THEMES = ["neon", "temple"];
  const THEME_COLOR = { neon: "#1b1546", temple: "#8c2216" };
  const DRAWS = { neon: "poke", temple: "fortune" };

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem("spineat.settings") || "{}");
    } catch {
      return {};
    }
  }

  function preference() {
    const { appearance } = readSettings();
    return THEMES.includes(appearance) ? appearance : "auto";
  }

  function resolve(pref = preference(), now = new Date()) {
    if (THEMES.includes(pref)) return pref;
    const h = now.getHours();
    return h >= DAY_START && h < NIGHT_START ? "temple" : "neon";
  }

  // ---------- 背景圖樣 ----------
  // 固定種子的亂數，讓每次載入的石板和光暈位置都一樣
  function seeded(seed) {
    return () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  }

  function neonBackdrop() {
    const rnd = seeded(11);
    const colors = ["#ff5c9a", "#d8ff3c", "#7a6bff", "#ff9a3c", "#3cf0ff"];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.round(10 + w / 90);
    let s = "";
    for (let k = 0; k < count; k++) {
      // 一半的光點落在畫面左右兩側，寬螢幕上中欄以外也有夜市的光
      const side = k % 2 ? rnd() * 0.3 : 0.7 + rnd() * 0.3;
      const x = (k % 4 < 2 ? side : rnd()) * w;
      s += `<circle cx="${x.toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(30 + rnd() * 70).toFixed(0)}" fill="${colors[k % colors.length]}" opacity="${(0.2 + rnd() * 0.12).toFixed(2)}" filter="url(#bokeh)"/>`;
    }
    return `<svg width="${w}" height="${h}" aria-hidden="true"><defs><filter id="bokeh" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="22"/></filter></defs>${s}</svg>`;
  }

  // 廟埕的石板：一排排錯縫的長石，深淺略有不同
  function templeBackdrop() {
    const rnd = seeded(5);
    const rowH = 56;
    const W = Math.max(840, window.innerWidth);
    const H = Math.max(1120, window.innerHeight);
    let s = "";
    for (let y = 0; y < H; y += rowH) {
      let x = -Math.floor(rnd() * 80);
      while (x < W) {
        const w = 90 + Math.floor(rnd() * 4) * 22;
        const shade = rnd();
        if (shade < 0.35) s += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${rowH - 2}" fill="var(--slab)" opacity="${shade < 0.15 ? 0.55 : 0.32}"/>`;
        s += `<path d="M${x} ${y}V${y + rowH}" stroke="var(--grout)" stroke-width="2"/>`;
        x += w;
      }
      s += `<path d="M0 ${y}H${W}" stroke="var(--grout)" stroke-width="2"/>`;
    }
    return `<svg width="${W}" height="${H}" aria-hidden="true">${s}</svg>`;
  }

  // 廟口的朱紅橫樑，下面掛一排紅燈籠；依實際寬度排，間距固定
  function templeEave(width) {
    let s =
      `<rect x="0" y="0" width="${width}" height="26" fill="var(--beam)"/>` +
      `<rect x="0" y="4" width="${width}" height="1.5" fill="var(--gold)"/>` +
      `<rect x="0" y="20" width="${width}" height="1.5" fill="var(--gold)"/>` +
      `<rect x="0" y="26" width="${width}" height="3" fill="var(--beam-shade)"/>`;
    const count = Math.max(3, Math.round(width / 130));
    for (let k = 0; k < count; k++) {
      const x = ((k + 0.5) * width) / count;
      const drop = k % 2 ? 6 : 0; // 高低錯開，不要排成一直線
      const cy = 46 + drop;
      s +=
        `<path d="M${x} 29V${cy - 15}" stroke="var(--gold)" stroke-width="1.2"/>` +
        `<rect x="${x - 6}" y="${cy - 17}" width="12" height="4" rx="1" fill="var(--gold)"/>` +
        `<ellipse cx="${x}" cy="${cy}" rx="13" ry="14" fill="var(--lantern)"/>` +
        `<path d="M${x - 6} ${cy - 13}Q${x - 10} ${cy} ${x - 6} ${cy + 13}M${x + 6} ${cy - 13}Q${x + 10} ${cy} ${x + 6} ${cy + 13}M${x} ${cy - 14}V${cy + 14}" stroke="var(--lantern-rib)" stroke-width="1" fill="none"/>` +
        `<ellipse cx="${x - 4}" cy="${cy - 5}" rx="3.5" ry="5" fill="#fff" opacity=".18"/>` +
        `<rect x="${x - 6}" y="${cy + 13}" width="12" height="4" rx="1" fill="var(--gold)"/>` +
        `<path d="M${x - 2} ${cy + 17}V${cy + 25}M${x} ${cy + 17}V${cy + 27}M${x + 2} ${cy + 17}V${cy + 25}" stroke="var(--gold)" stroke-width="1"/>`;
    }
    return `<svg width="${width}" height="76" aria-hidden="true">${s}</svg>`;
  }

  // 依實際寬度畫一串下垂的燈泡，避免寬螢幕上被拉扁
  const BULB_COLORS = ["#ff5c9a", "#d8ff3c", "#7a6bff", "#ff9a3c", "#3cf0ff"];
  function bulbString(width) {
    const sag = Math.min(28, 14 + width * 0.03);
    const count = Math.max(8, Math.round(width / 34));
    let s = `<path d="M-10 4 Q ${width / 2} ${4 + sag * 2} ${width + 10} 4" stroke="#f4efff" stroke-opacity=".3" stroke-width="1.2" fill="none"/>`;
    for (let k = 1; k < count; k++) {
      const t = k / count;
      const x = -10 + t * (width + 20);
      const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * (4 + sag * 2) + t * t * 4 + 6;
      const c = BULB_COLORS[k % BULB_COLORS.length];
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${c}" opacity=".35" filter="url(#glow)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${c}"/>`;
    }
    return `<svg width="${width}" height="64" aria-hidden="true"><defs><filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="4"/></filter></defs>${s}</svg>`;
  }

  function renderAwning() {
    const el = document.querySelector(".awning");
    if (!el) return;
    const theme = document.documentElement.dataset.theme;
    const width = document.documentElement.clientWidth;
    const key = `${theme}:${width}`;
    if (el.dataset.key === key) return;
    el.dataset.key = key;
    el.innerHTML = theme === "neon" ? bulbString(width) : templeEave(width);
  }

  function renderBackdrop(theme) {
    const el = document.querySelector(".backdrop");
    if (!el) return;
    // 夜市的散景和廟口的石板依視口尺寸產生，尺寸改變時要重畫
    const key = `${theme}:${window.innerWidth}x${window.innerHeight}`;
    if (el.dataset.key === key) return;
    el.dataset.key = key;
    el.innerHTML = theme === "neon" ? neonBackdrop() : templeBackdrop();
  }

  function renderDecor(theme) {
    renderBackdrop(theme);
    renderAwning();
  }

  // ---------- 套用 ----------
  function apply() {
    const theme = resolve();
    const root = document.documentElement;
    const changed = root.dataset.theme !== theme;
    root.dataset.theme = theme;
    // 「一律播放」時，CSS 裡依減少動態效果關掉的動畫也照常播放
    root.dataset.motion = readSettings().motion === "always" ? "always" : "system";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[theme];
    if (document.body) renderDecor(theme);
    if (changed) document.dispatchEvent(new CustomEvent("spineat:theme", { detail: theme }));
    return theme;
  }

  apply();
  document.addEventListener("DOMContentLoaded", () => renderDecor(document.documentElement.dataset.theme));
  window.addEventListener("resize", () => renderDecor(document.documentElement.dataset.theme));
  // 自動模式下，跨過 5 點或 18 點時要跟著換
  setInterval(apply, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) apply();
  });

  // 現在的主題用哪一種抽法
  const draw = () => DRAWS[document.documentElement.dataset.theme] || "fortune";

  return { DAY_START, NIGHT_START, apply, resolve, draw };
})();
