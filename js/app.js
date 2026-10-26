(() => {
  "use strict";

  const D = SpinEatData;
  const WHEEL_COLORS = ["#ff8a3d", "#ffc94a", "#ff6b6b", "#7bc47f", "#4fb3d9", "#b78ae0"];
  const SPIN_DURATION = 4500;
  const HISTORY_LIMIT = 30;
  const STORE_EMOJI = "🏪";

  // ---------- 日期 ----------
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
  const settings = D.getSettings();
  const state = {
    meal: defaultMealByTime(),
    prices: new Set(), // 空集合代表不限
    types: new Set(), // 空集合代表全部；料理模式存類型名稱，店家模式存標籤 id
    history: D.getHistory(),
    tags: D.getTags(),
    stores: D.getStores(),
    rejected: new Set(), // 這一輪按「再抽一次」略過的項目 key
    candidates: [],
    rotation: 0,
    spinning: false,
    current: null,
  };

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    modeSwitch: $("mode-switch"),
    filters: document.querySelector(".filters"),
    mealChips: $("meal-chips"),
    priceChips: $("price-chips"),
    typeLabel: $("type-label"),
    typeChips: $("type-chips"),
    excludeRecent: $("exclude-recent"),
    excludeDays: $("exclude-days"),
    canvas: $("wheel"),
    wheelEmpty: $("wheel-empty"),
    wheelEmptyText: $("wheel-empty-text"),
    wheelEmptyLink: $("wheel-empty-link"),
    count: $("candidate-count"),
    spinBtn: $("spin-btn"),
    result: $("result"),
    resultEmoji: $("result-emoji"),
    resultName: $("result-name"),
    resultMeta: $("result-meta"),
    resultMap: $("result-map"),
    acceptBtn: $("accept-btn"),
    respinBtn: $("respin-btn"),
    historyList: $("history-list"),
    clearHistory: $("clear-history"),
    toast: $("toast"),
  };
  const ctx = el.canvas.getContext("2d");

  // ---------- 抽選項目 ----------
  // 把料理和店家統一成同樣的格式：{ key, name, emoji, price, typeText, store? }
  function foodItems() {
    return FOODS.map((f) => ({
      key: `food:${f.name}`,
      name: f.name,
      emoji: f.emoji,
      meals: f.meals,
      price: f.price,
      types: [f.type],
      typeText: f.type,
    }));
  }

  function storeItems() {
    const tagName = new Map(state.tags.map((t) => [t.id, t.name]));
    return state.stores
      .filter((s) => s.enabled)
      .map((s) => ({
        key: `store:${s.id}`,
        name: s.name,
        emoji: STORE_EMOJI,
        meals: s.meals,
        price: s.price,
        types: s.tagIds,
        typeText: s.tagIds.map((id) => tagName.get(id)).filter(Boolean).join("、"),
        store: s,
      }));
  }

  function allItems() {
    return settings.mode === "store" ? storeItems() : foodItems();
  }

  // ---------- 篩選 ----------
  function recentKeys() {
    if (!settings.excludeOn) return new Set();
    const today = D.todayStr();
    return new Set(
      state.history
        .filter((h) => daysBetween(today, h.date) < settings.excludeDays)
        .map((h) => h.key)
    );
  }

  function computeCandidates() {
    const recent = recentKeys();
    return allItems().filter(
      (item) =>
        item.meals.includes(state.meal) &&
        (state.prices.size === 0 || state.prices.has(item.price)) &&
        (state.types.size === 0 || item.types.some((t) => state.types.has(t))) &&
        !recent.has(item.key) &&
        !state.rejected.has(item.key)
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
    for (const btn of el.modeSwitch.querySelectorAll("button")) {
      btn.setAttribute("aria-checked", String(btn.dataset.mode === settings.mode));
    }
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
      [1, 2, 3].map((p) => ({ value: p, label: D.PRICE_LABELS[p] })),
      state.prices
    );

    const isStore = settings.mode === "store";
    el.typeLabel.textContent = isStore ? "標籤" : "類型";
    const typeOptions = isStore
      ? state.tags.map((t) => ({ value: t.id, label: t.name }))
      : TYPES.map((t) => ({ value: t, label: t }));
    renderMultiChips(el.typeChips, "全部", typeOptions, state.types);

    el.excludeRecent.checked = settings.excludeOn;
    el.excludeDays.value = String(settings.excludeDays);
    el.excludeDays.disabled = !settings.excludeOn;
  }

  function onFilterChange() {
    state.rejected.clear();
    hideResult();
    refresh();
  }

  function setMode(mode) {
    if (state.spinning || settings.mode === mode) return;
    settings.mode = mode;
    D.saveSettings(settings);
    state.types.clear();
    onFilterChange();
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
    el.modeSwitch.inert = disabled;
  }

  // ---------- 結果 ----------
  function showResult(item) {
    state.current = item;
    el.resultEmoji.textContent = item.emoji;
    el.resultName.textContent = item.name;
    const mealLabel = MEALS.find((m) => m.id === state.meal).label;
    el.resultMeta.textContent = [item.typeText, D.PRICE_LABELS[item.price], mealLabel]
      .filter(Boolean)
      .join(" · ");
    if (item.store) {
      el.resultMap.href = D.mapsUrl(item.store);
      el.resultMap.textContent = item.store.address ? `📍 ${item.store.address}` : "🗺️ 在 Google 地圖搜尋";
      el.resultMap.hidden = false;
    } else {
      el.resultMap.hidden = true;
    }
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
    const item = state.current;
    if (!item) return;
    state.history.unshift({ key: item.key, name: item.name, emoji: item.emoji, meal: state.meal, date: D.todayStr() });
    state.history = state.history.slice(0, HISTORY_LIMIT);
    D.saveHistory(state.history);
    state.rejected.clear();
    hideResult();
    refresh();
    showToast(`就決定吃 ${item.name} 了！祝用餐愉快 😋`);
  }

  function respin() {
    if (state.current) state.rejected.add(state.current.key);
    hideResult();
    refresh();
    spin();
  }

  // ---------- 紀錄 ----------
  function formatDate(dateStr) {
    const diff = daysBetween(D.todayStr(), dateStr);
    if (diff === 0) return "今天";
    if (diff === 1) return "昨天";
    if (diff === 2) return "前天";
    return dateStr.slice(5).replace("-", "/");
  }

  // 店家改名後，紀錄跟著顯示新名稱
  function historyName(h) {
    if (h.key.startsWith("store:")) {
      const store = state.stores.find((s) => `store:${s.id}` === h.key);
      if (store) return store.name;
    }
    return h.name;
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
        const displayName = historyName(h);
        name.textContent = `${h.emoji} ${displayName}`;
        const right = document.createElement("span");
        const meal = MEALS.find((m) => m.id === h.meal);
        const date = document.createElement("span");
        date.className = "history-date";
        date.textContent = `${formatDate(h.date)}${meal ? " " + meal.label : ""}`;
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-text history-del";
        del.textContent = "✕";
        del.setAttribute("aria-label", `刪除 ${displayName} 這筆紀錄`);
        del.addEventListener("click", () => {
          state.history.splice(idx, 1);
          D.saveHistory(state.history);
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
  function renderEmptyState(n) {
    el.wheelEmpty.hidden = n > 0;
    if (n > 0) return;
    const noStores = settings.mode === "store" && state.stores.filter((s) => s.enabled).length === 0;
    el.wheelEmptyText.textContent = noStores
      ? state.stores.length === 0
        ? "還沒有店家，先新增幾家常去的店吧！"
        : "所有店家都停用了"
      : "沒有符合條件的選項，試著放寬篩選吧";
    el.wheelEmptyLink.hidden = !noStores;
    el.wheelEmptyLink.textContent = state.stores.length === 0 ? "前往設定新增店家" : "前往設定管理店家";
  }

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
    renderEmptyState(n);
    const notes = [];
    if (settings.excludeOn) {
      const recent = recentKeys();
      const excluded = allItems().filter((item) => recent.has(item.key)).length;
      if (excluded) notes.push(`已排除最近吃過 ${excluded} 項`);
    }
    if (state.rejected.size) notes.push(`略過 ${state.rejected.size} 項`);
    el.count.textContent = `共 ${n} 個選項${notes.length ? "（" + notes.join("，") + "）" : ""}`;
    setControlsDisabled(state.spinning);
    drawWheel();
  }

  // ---------- 事件 ----------
  el.modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) setMode(btn.dataset.mode);
  });
  el.spinBtn.addEventListener("click", spin);
  el.acceptBtn.addEventListener("click", accept);
  el.respinBtn.addEventListener("click", respin);
  el.excludeRecent.addEventListener("change", () => {
    settings.excludeOn = el.excludeRecent.checked;
    D.saveSettings(settings);
    onFilterChange();
  });
  el.excludeDays.addEventListener("change", () => {
    settings.excludeDays = Number(el.excludeDays.value);
    D.saveSettings(settings);
    onFilterChange();
  });
  el.clearHistory.addEventListener("click", () => {
    if (!confirm("確定要清除所有吃過紀錄嗎？")) return;
    state.history = [];
    D.saveHistory(state.history);
    refresh();
  });
  window.addEventListener("resize", resizeCanvas);

  refresh();
  resizeCanvas();
})();
