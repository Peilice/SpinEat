(() => {
  "use strict";

  const STORAGE_KEYS = {
    history: "spineat.history",
    settings: "spineat.settings",
  };
  const PRICE_LABELS = { 1: "$", 2: "$$", 3: "$$$" };
  const WHEEL_COLORS = ["#ff8a3d", "#ffc94a", "#ff6b6b", "#7bc47f", "#4fb3d9", "#b78ae0"];
  const SPIN_DURATION = 4500;
  const HISTORY_LIMIT = 30;

  // ---------- 儲存 ----------
  // localStorage 在無痕模式等情況可能無法使用，失敗時就退回預設值
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 無法儲存時忽略，頁面仍可正常使用
    }
  }

  // ---------- 日期 ----------
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // 兩個 YYYY-MM-DD 日期相差幾天
  function daysBetween(a, b) {
    const [y1, m1, d1] = a.split("-").map(Number);
    const [y2, m2, d2] = b.split("-").map(Number);
    return Math.round((Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2)) / 86400000);
  }

  function defaultMealByTime() {
    const h = new Date().getHours();
    if (h >= 5 && h < 10) return "breakfast";
    if (h >= 10 && h < 15) return "lunch";
    if (h >= 15 && h < 21) return "dinner";
    return "late";
  }

  // ---------- 狀態 ----------
  const settings = load(STORAGE_KEYS.settings, { excludeOn: true, excludeDays: 3 });
  const state = {
    meal: defaultMealByTime(),
    prices: new Set(), // 空集合代表不限
    types: new Set(), // 空集合代表全部
    history: load(STORAGE_KEYS.history, []),
    rejected: new Set(), // 這一輪按「再抽一次」略過的項目
    candidates: [],
    rotation: 0,
    spinning: false,
    current: null,
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    filters: document.querySelector(".filters"),
    mealChips: $("meal-chips"),
    priceChips: $("price-chips"),
    typeChips: $("type-chips"),
    excludeRecent: $("exclude-recent"),
    excludeDays: $("exclude-days"),
    canvas: $("wheel"),
    wheelEmpty: $("wheel-empty"),
    count: $("candidate-count"),
    spinBtn: $("spin-btn"),
    result: $("result"),
    resultEmoji: $("result-emoji"),
    resultName: $("result-name"),
    resultMeta: $("result-meta"),
    acceptBtn: $("accept-btn"),
    respinBtn: $("respin-btn"),
    historyList: $("history-list"),
    clearHistory: $("clear-history"),
    toast: $("toast"),
  };
  const ctx = el.canvas.getContext("2d");

  // ---------- 篩選 ----------
  function recentNames() {
    if (!settings.excludeOn) return new Set();
    const today = todayStr();
    return new Set(
      state.history
        .filter((h) => daysBetween(today, h.date) < settings.excludeDays)
        .map((h) => h.name)
    );
  }

  function computeCandidates() {
    const recent = recentNames();
    return FOODS.filter(
      (f) =>
        f.meals.includes(state.meal) &&
        (state.prices.size === 0 || state.prices.has(f.price)) &&
        (state.types.size === 0 || state.types.has(f.type)) &&
        !recent.has(f.name) &&
        !state.rejected.has(f.name)
    );
  }

  function makeChip(label, pressed, onClick, role) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    if (role === "radio") {
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(pressed));
    } else {
      btn.setAttribute("aria-pressed", String(pressed));
    }
    btn.addEventListener("click", onClick);
    return btn;
  }

  // 多選篩選：點「全部」清空，點個別項目切換
  function renderMultiChips(container, allLabel, options, selected) {
    container.replaceChildren(
      makeChip(allLabel, selected.size === 0, () => {
        selected.clear();
        onFilterChange();
      }),
      ...options.map(({ value, label }) =>
        makeChip(label, selected.has(value), () => {
          selected.has(value) ? selected.delete(value) : selected.add(value);
          if (selected.size === options.length) selected.clear();
          onFilterChange();
        })
      )
    );
  }

  function renderFilters() {
    el.mealChips.replaceChildren(
      ...MEALS.map((m) =>
        makeChip(
          m.label,
          state.meal === m.id,
          () => {
            state.meal = m.id;
            onFilterChange();
          },
          "radio"
        )
      )
    );
    renderMultiChips(
      el.priceChips,
      "不限",
      [1, 2, 3].map((p) => ({ value: p, label: PRICE_LABELS[p] })),
      state.prices
    );
    renderMultiChips(
      el.typeChips,
      "全部",
      TYPES.map((t) => ({ value: t, label: t })),
      state.types
    );
    el.excludeRecent.checked = settings.excludeOn;
    el.excludeDays.value = String(settings.excludeDays);
    el.excludeDays.disabled = !settings.excludeOn;
  }

  function onFilterChange() {
    state.rejected.clear();
    hideResult();
    refresh();
  }

  // ---------- 轉盤 ----------
  function resizeCanvas() {
    const size = el.canvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    el.canvas.width = Math.round(size * dpr);
    el.canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel();
  }

  function segmentColor(i, n) {
    let c = i % WHEEL_COLORS.length;
    // 避免最後一格和第一格同色相鄰
    if (i === n - 1 && n > 1 && c === 0) c = 2;
    return WHEEL_COLORS[c];
  }

  function drawWheel() {
    const size = el.canvas.clientWidth;
    const items = state.candidates;
    const n = items.length;
    const r = size / 2;
    ctx.clearRect(0, 0, size, size);
    if (n === 0 || size < 20) return;

    const seg = (Math.PI * 2) / n;
    const fontSize = Math.max(10, Math.min(18, Math.floor(size / (n > 16 ? 26 : 20))));

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(state.rotation);

    for (let i = 0; i < n; i++) {
      const start = i * seg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r - 2, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = segmentColor(i, n);
      ctx.fill();
      if (n > 1) {
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 文字沿半徑方向排列
      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#2d2a26";
      ctx.font = `600 ${fontSize}px system-ui, "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
      const label = n > 24 ? items[i].name : `${items[i].name} ${items[i].emoji}`;
      ctx.fillText(label, r - 14, 0, r * 0.7);
      ctx.restore();
    }
    ctx.restore();

    // 中心圓
    ctx.beginPath();
    ctx.arc(r, r, size * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e8590c";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function spin() {
    const items = state.candidates;
    if (state.spinning || items.length === 0) return;

    state.spinning = true;
    hideResult();
    setControlsDisabled(true);

    const n = items.length;
    const seg = (Math.PI * 2) / n;
    const winner = Math.floor(Math.random() * n);

    // 指針在正上方（-90°）。讓得獎格的中心（加上一點隨機偏移）停在指針下
    const jitter = (Math.random() - 0.5) * seg * 0.7;
    const targetMod = -Math.PI / 2 - (winner * seg + seg / 2) - jitter;
    const full = Math.PI * 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minTurns = reduceMotion ? 1 : 5;
    const duration = reduceMotion ? 800 : SPIN_DURATION;

    const start = state.rotation;
    let target = targetMod + Math.ceil((start - targetMod) / full) * full;
    target += minTurns * full;

    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      state.rotation = start + (target - start) * easeOutCubic(t);
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        state.rotation = target % full;
        state.spinning = false;
        setControlsDisabled(false);
        showResult(items[winner]);
      }
    }
    requestAnimationFrame(frame);
  }

  function setControlsDisabled(disabled) {
    el.spinBtn.disabled = disabled || state.candidates.length === 0;
    el.filters.inert = disabled;
  }

  // ---------- 結果 ----------
  function showResult(food) {
    state.current = food;
    el.resultEmoji.textContent = food.emoji;
    el.resultName.textContent = food.name;
    const mealLabel = MEALS.find((m) => m.id === state.meal).label;
    el.resultMeta.textContent = `${food.type} · ${PRICE_LABELS[food.price]} · ${mealLabel}`;
    el.result.hidden = false;
    el.result.style.animation = "none";
    void el.result.offsetWidth; // 重新觸發彈出動畫
    el.result.style.animation = "";
  }

  function hideResult() {
    state.current = null;
    el.result.hidden = true;
  }

  function accept() {
    const food = state.current;
    if (!food) return;
    state.history.unshift({ name: food.name, emoji: food.emoji, meal: state.meal, date: todayStr() });
    state.history = state.history.slice(0, HISTORY_LIMIT);
    save(STORAGE_KEYS.history, state.history);
    state.rejected.clear();
    hideResult();
    refresh();
    showToast(`就決定吃 ${food.name} 了！祝用餐愉快 😋`);
  }

  function respin() {
    if (state.current) state.rejected.add(state.current.name);
    hideResult();
    refresh();
    spin();
  }

  // ---------- 紀錄 ----------
  function formatDate(dateStr) {
    const diff = daysBetween(todayStr(), dateStr);
    if (diff === 0) return "今天";
    if (diff === 1) return "昨天";
    if (diff === 2) return "前天";
    return dateStr.slice(5).replace("-", "/");
  }

  function renderHistory() {
    if (state.history.length === 0) {
      const li = document.createElement("li");
      li.className = "history-empty";
      li.textContent = "還沒有紀錄，轉一下並按「就吃這個」吧！";
      el.historyList.replaceChildren(li);
      el.clearHistory.hidden = true;
      return;
    }
    el.clearHistory.hidden = false;
    el.historyList.replaceChildren(
      ...state.history.map((h, idx) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = `${h.emoji} ${h.name}`;
        const right = document.createElement("span");
        const meal = MEALS.find((m) => m.id === h.meal);
        const date = document.createElement("span");
        date.className = "history-date";
        date.textContent = `${formatDate(h.date)}${meal ? " " + meal.label : ""}`;
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-text history-del";
        del.textContent = "✕";
        del.setAttribute("aria-label", `刪除 ${h.name} 這筆紀錄`);
        del.addEventListener("click", () => {
          state.history.splice(idx, 1);
          save(STORAGE_KEYS.history, state.history);
          refresh();
        });
        right.append(date, del);
        li.append(name, right);
        return li;
      })
    );
  }

  // ---------- 提示 ----------
  let toastTimer;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2500);
  }

  // ---------- 整體更新 ----------
  function refresh() {
    state.candidates = computeCandidates();

    // 篩選按鈕會重建，先記住焦點位置，重建後還原
    const focused = document.activeElement;
    const focusGroup = focused && focused.classList.contains("chip") ? focused.parentElement : null;
    const focusIndex = focusGroup ? [...focusGroup.children].indexOf(focused) : -1;
    renderFilters();
    if (focusGroup) focusGroup.children[focusIndex]?.focus();

    renderHistory();

    const n = state.candidates.length;
    el.wheelEmpty.hidden = n > 0;
    const notes = [];
    if (settings.excludeOn) {
      const excluded = FOODS.filter((f) => recentNames().has(f.name)).length;
      if (excluded) notes.push(`已排除最近吃過 ${excluded} 項`);
    }
    if (state.rejected.size) notes.push(`略過 ${state.rejected.size} 項`);
    el.count.textContent = `共 ${n} 個選項${notes.length ? "（" + notes.join("，") + "）" : ""}`;
    setControlsDisabled(state.spinning);
    drawWheel();
  }

  // ---------- 事件 ----------
  el.spinBtn.addEventListener("click", spin);
  el.acceptBtn.addEventListener("click", accept);
  el.respinBtn.addEventListener("click", respin);
  el.excludeRecent.addEventListener("change", () => {
    settings.excludeOn = el.excludeRecent.checked;
    save(STORAGE_KEYS.settings, settings);
    onFilterChange();
  });
  el.excludeDays.addEventListener("change", () => {
    settings.excludeDays = Number(el.excludeDays.value);
    save(STORAGE_KEYS.settings, settings);
    onFilterChange();
  });
  el.clearHistory.addEventListener("click", () => {
    if (!confirm("確定要清除所有吃過紀錄嗎？")) return;
    state.history = [];
    save(STORAGE_KEYS.history, state.history);
    refresh();
  });
  window.addEventListener("resize", resizeCanvas);

  refresh();
  resizeCanvas();
})();
