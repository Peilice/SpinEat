// 主題：依時間自動切換（白天冰果室、晚上夜市霓虹），或在設定頁固定其中一個
// 放在 <head> 同步載入，避免頁面先閃過另一個主題
const SpinEatTheme = (() => {
  "use strict";

  const DAY_START = 6; // 06:00 起是白天
  const NIGHT_START = 18; // 18:00 起是晚上
  const THEMES = ["icefruit", "neon"];
  const THEME_COLOR = { icefruit: "#dcc58a", neon: "#1b1546" };

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
    return h >= DAY_START && h < NIGHT_START ? "icefruit" : "neon";
  }

  // ---------- 背景圖樣 ----------
  // 固定種子的亂數，讓每次載入的磁磚和光暈位置都一樣
  function seeded(seed) {
    return () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  }

  function icefruitBackdrop() {
    const rnd = seeded(7);
    let tiles = "";
    for (let k = 0; k < 60; k++) {
      const x = Math.floor(rnd() * 30) * 28;
      const y = Math.floor(rnd() * 40) * 28;
      const fill = rnd() < 0.55 ? "var(--tile-a)" : "var(--tile-b)";
      tiles += `<rect x="${x + 1}" y="${y + 1}" width="26" height="26" fill="${fill}" opacity="${rnd() < 0.5 ? 0.32 : 0.2}"/>`;
    }
    return `<svg width="840" height="1120" aria-hidden="true">${tiles}</svg>`;
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

  function renderBulbs() {
    const el = document.querySelector(".awning");
    if (!el) return;
    const theme = document.documentElement.dataset.theme;
    const width = document.documentElement.clientWidth;
    const key = `${theme}:${width}`;
    if (el.dataset.key === key) return;
    el.dataset.key = key;
    el.innerHTML = theme === "neon" ? bulbString(width) : "";
  }

  function renderBackdrop(theme) {
    const el = document.querySelector(".backdrop");
    if (!el) return;
    // 夜市的散景依視口尺寸產生，尺寸改變時要重畫
    const key = theme === "neon" ? `neon:${window.innerWidth}x${window.innerHeight}` : theme;
    if (el.dataset.key === key) return;
    el.dataset.key = key;
    el.innerHTML = theme === "neon" ? neonBackdrop() : icefruitBackdrop();
  }

  function renderDecor(theme) {
    renderBackdrop(theme);
    renderBulbs();
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
  // 自動模式下，跨過 6 點或 18 點時要跟著換
  setInterval(apply, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) apply();
  });

  return { DAY_START, NIGHT_START, apply, resolve };
})();
