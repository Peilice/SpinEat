(() => {
  "use strict";

  const D = SpinEatData;
  const SPIN_DURATION = 3200;
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
    reelIndex: 0, // 捲軸目前停在 candidates 的哪一項
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
    filterSummary: $("filter-summary"),
    machine: document.querySelector(".machine"),
    reelStrip: $("reel-strip"),
    reelEmpty: $("reel-empty"),
    reelEmptyText: $("reel-empty-text"),
    reelEmptyLink: $("reel-empty-link"),
    lever: $("lever"),
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

  // 摘要列：篩選收合時也能一眼看到目前條件
  function renderFilterSummary() {
    const isStore = settings.mode === "store";
    const meal = MEALS.find((m) => m.id === state.meal).label;
    const price = state.prices.size
      ? [...state.prices].sort().map((p) => D.PRICE_LABELS[p]).join(" ")
      : "不限預算";
    const nameOf = isStore ? new Map(state.tags.map((t) => [t.id, t.name])) : null;
    const typeNames = [...state.types].map((t) => (isStore ? nameOf.get(t) : t)).filter(Boolean);
    const types =
      typeNames.length === 0
        ? isStore ? "全部標籤" : "全部類型"
        : typeNames.length <= 2 ? typeNames.join("、") : `${typeNames.length} 個${isStore ? "標籤" : "類型"}`;
    const parts = [meal, price, types];
    if (settings.excludeOn) parts.push(`排除 ${settings.excludeDays} 天內`);
    el.filterSummary.textContent = parts.join(" · ");
  }

  // ---------- 拉霸捲軸 ----------
  // 視窗一次顯示三列，中間那列對準中線的就是抽中的項目
  function reelItem(offset) {
    const n = state.candidates.length;
    return state.candidates[(((state.reelIndex + offset) % n) + n) % n];
  }

  function makeCell(item) {
    const li = document.createElement("li");
    li.className = "reel-cell";
    if (item) {
      const emoji = document.createElement("span");
      emoji.className = "reel-emoji";
      emoji.textContent = item.emoji;
      const name = document.createElement("span");
      name.className = "reel-name";
      name.textContent = item.name;
      li.append(emoji, name);
    }
    return li;
  }

  function renderReel() {
    const n = state.candidates.length;
    el.reelStrip.style.transform = "";
    if (n === 0) {
      el.reelStrip.replaceChildren();
      return;
    }
    state.reelIndex %= n;
    // 只有一個選項時上下留白，避免同一個名字連排三次
    el.reelStrip.replaceChildren(
      makeCell(n > 1 ? reelItem(-1) : null),
      makeCell(reelItem(0)),
      makeCell(n > 1 ? reelItem(1) : null)
    );
  }

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  function spin() {
    const items = state.candidates;
    if (state.spinning || items.length === 0) return;

    state.spinning = true;
    hideResult();
    setControlsDisabled(true);

    const n = items.length;
    const winner = Math.floor(Math.random() * n);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 先捲過至少 minSteps 格，再多捲幾格補到剛好停在 winner
    const minSteps = reduceMotion ? 3 : Math.max(24, Math.min(n * 2, 60));
    const steps = minSteps + ((((winner - state.reelIndex - minSteps) % n) + n) % n);
    const cells = [];
    for (let k = -1; k <= steps + 1; k++) cells.push(makeCell(reelItem(k)));
    el.reelStrip.replaceChildren(...cells);
    const row = cells[0].offsetHeight;
    const duration = reduceMotion ? 600 : SPIN_DURATION;

    el.machine.classList.add("is-spinning");
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      el.reelStrip.style.transform = `translateY(${-easeOutQuart(t) * steps * row}px)`;
      // 高速階段加一點動態模糊，減速後拿掉讓字變清楚
      el.reelStrip.classList.toggle("is-blurred", !reduceMotion && t < 0.5);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        state.reelIndex = winner;
        state.spinning = false;
        el.machine.classList.remove("is-spinning");
        el.reelStrip.classList.remove("is-blurred");
        renderReel();
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
    el.result.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
      li.textContent = "還沒有紀錄，拉一下並按「就吃這個」吧！";
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
    el.reelEmpty.hidden = n > 0;
    if (n > 0) return;
    const noStores = settings.mode === "store" && state.stores.filter((s) => s.enabled).length === 0;
    el.reelEmptyText.textContent = noStores
      ? state.stores.length === 0
        ? "還沒有店家，先新增幾家常去的店吧！"
        : "所有店家都停用了"
      : "沒有符合條件的選項，試著放寬篩選吧";
    el.reelEmptyLink.hidden = !noStores;
    el.reelEmptyLink.textContent = state.stores.length === 0 ? "前往設定新增店家" : "前往設定管理店家";
  }

  function refresh() {
    state.candidates = computeCandidates();

    // 篩選按鈕會重建，先記住焦點位置，重建後還原
    const focused = document.activeElement;
    const focusGroup = focused && focused.classList.contains("chip") ? focused.parentElement : null;
    const focusIndex = focusGroup ? [...focusGroup.children].indexOf(focused) : -1;
    renderFilters();
    renderFilterSummary();
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
    if (!state.spinning) renderReel();
  }

  // ---------- 事件 ----------
  el.modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) setMode(btn.dataset.mode);
  });
  el.spinBtn.addEventListener("click", spin);
  el.lever.addEventListener("click", spin);
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

  refresh();
})();
