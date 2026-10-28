(() => {
  "use strict";

  const D = SpinEatData;
  const HISTORY_LIMIT = 30;
  const LAND_PAUSE_MS = 450; // 出籤或戳開後停一下再顯示結果
  const WEEKDAYS = "日一二三四五六";

  // ---------- 日期 ----------
  // 兩個 YYYY-MM-DD 日期相差幾天
  function daysBetween(a, b) {
    const [y1, m1, d1] = a.split("-").map(Number);
    const [y2, m2, d2] = b.split("-").map(Number);
    return Math.round((Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2)) / 86400000);
  }

  function dateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function defaultMealByTime() {
    const h = new Date().getHours();
    if (h >= 5 && h < 10) return "breakfast";
    if (h >= 10 && h < 15) return "lunch";
    if (h >= 15 && h < 21) return "dinner";
    return "late";
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- 狀態 ----------
  const settings = D.getSettings();
  // 系統要求減少動態效果、而且設定頁沒選「一律播放」時，抽選直接出結果
  const calm = () => reduceMotion.matches && settings.motion !== "always";
  // 抽法跟著主題：夜市戳戳樂、廟口求籤；兩種共用候選、結果與紀錄，只換演出
  // 自動模式跨時段時主題會換，所以每次都即時問，不在載入時記住
  const drawKind = () => SpinEatTheme.draw();
  const state = {
    meal: defaultMealByTime(),
    prices: new Set(), // 空集合代表不限
    types: new Set(), // 空集合代表全部；料理模式存類型名稱，店家模式存標籤 id
    history: D.getHistory(),
    foods: D.getFoods(),
    tags: D.getTags(),
    stores: D.getStores(),
    rejected: new Set(), // 這一輪按「再抽一次」略過的項目 key
    candidates: [],
    spinning: false,
    current: null,
    justAte: false, // 剛按「就吃這個」，七天紀錄的今天要蓋章
  };
  let emptyFixRun = null; // 沒有候選時，「放寬」按鈕要做的事

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    greeting: $("greeting"),
    modeSwitch: $("mode-switch"),
    filters: $("filters"),
    filterSummary: $("filter-summary"),
    mealChips: $("meal-chips"),
    priceChips: $("price-chips"),
    typeLabel: $("type-label"),
    typeChips: $("type-chips"),
    excludeRecent: $("exclude-recent"),
    excludeDays: $("exclude-days"),
    temple: $("temple"),
    poke: $("poke"),
    boardEmpty: $("board-empty"),
    boardEmptyText: $("board-empty-text"),
    boardEmptyLink: $("board-empty-link"),
    boardEmptyAction: $("board-empty-action"),
    count: $("candidate-count"),
    spinBtn: $("spin-btn"),
    week: $("week"),
    weekLegend: $("week-legend"),
    historyCount: $("history-count"),
    historyList: $("history-list"),
    clearHistory: $("clear-history"),
    result: $("result"),
    resultPlace: $("result-place"),
    resultDecor: $("result-decor"),
    resultLane: $("result-lane"),
    resultName: $("result-name"),
    resultMeta: $("result-meta"),
    resultWhy: $("result-why"),
    resultMap: $("result-map"),
    resultMapText: $("result-map-text"),
    acceptBtn: $("accept-btn"),
    respinBtn: $("respin-btn"),
    closeResult: $("close-result"),
    toast: $("toast"),
  };
  const fortune = SpinEatFortune.create(el.temple);
  const poke = SpinEatPoke.create(el.poke);

  // ---------- 抽選項目 ----------
  // 把料理和店家統一成同樣的格式：{ key, name, emoji, price, typeText, store? }
  function foodItems() {
    return state.foods.filter((f) => f.enabled).map((f) => ({
      key: `food:${f.id}`,
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
        emoji: "",
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

  // ignore 可以暫時不看某些條件，用來判斷「放寬哪一個就有得抽」
  function computeCandidates(ignore = {}) {
    const recent = ignore.recent ? new Set() : recentKeys();
    return allItems().filter(
      (item) =>
        item.meals.includes(state.meal) &&
        (ignore.filters || state.prices.size === 0 || state.prices.has(item.price)) &&
        (ignore.filters || state.types.size === 0 || item.types.some((t) => state.types.has(t))) &&
        !recent.has(item.key) &&
        (ignore.rejected || !state.rejected.has(item.key))
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

  function typeOptions() {
    return settings.mode === "store"
      ? state.tags.map((t) => ({ value: t.id, label: t.name }))
      : D.foodTypes(state.foods.filter((f) => f.enabled)).map((t) => ({ value: t, label: t }));
  }

  // 收合時顯示的一行摘要
  function renderSummary() {
    const meal = MEALS.find((m) => m.id === state.meal).label;
    const prices = [...state.prices].sort();
    const price =
      prices.length === 0
        ? "不限預算"
        : prices.length === 2 && prices[1] - prices[0] === 1
          ? `${D.PRICE_LABELS[prices[0]]}–${D.PRICE_LABELS[prices[1]]}`
          : prices.map((p) => D.PRICE_LABELS[p]).join("、");
    const noun = settings.mode === "store" ? "標籤" : "類型";
    const selectedTypes = typeOptions().filter((o) => state.types.has(o.value));
    const types =
      selectedTypes.length === 0
        ? `全部${noun}`
        : selectedTypes.length <= 2
          ? selectedTypes.map((o) => o.label).join("、")
          : `${selectedTypes.length} 個${noun}`;
    const exclude = settings.excludeOn ? `排除 ${settings.excludeDays} 天` : "不排除";
    el.filterSummary.replaceChildren(
      ...[meal, price, types, exclude].map((text) => {
        const span = document.createElement("span");
        span.className = "chip chip-static";
        span.textContent = text;
        return span;
      })
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
    el.typeLabel.textContent = settings.mode === "store" ? "標籤" : "類型";
    renderMultiChips(el.typeChips, "全部", typeOptions(), state.types);

    el.excludeRecent.checked = settings.excludeOn;
    el.excludeDays.value = String(settings.excludeDays);
    el.excludeDays.disabled = !settings.excludeOn;
    renderSummary();
  }

  function onFilterChange() {
    state.rejected.clear();
    poke.renew();
    refresh();
  }

  function setMode(mode) {
    if (state.spinning || settings.mode === mode) return;
    settings.mode = mode;
    D.saveSettings(settings);
    state.types.clear();
    renderGreeting();
    onFilterChange();
  }

  // ---------- 抽選舞台 ----------
  // 只顯示這個主題的那一種
  function syncStage() {
    const kind = drawKind();
    el.temple.hidden = kind !== "fortune";
    el.poke.hidden = kind !== "poke";
  }

  // ---------- 招呼與序號 ----------
  const GREETINGS = {
    breakfast: "早安，",
    lunch: "午餐時間到了，",
    dinner: "晚餐時間到了，",
    late: "肚子餓了嗎？",
  };

  function renderGreeting() {
    const meal = defaultMealByTime();
    const question =
      settings.mode === "store"
        ? meal === "late" ? "宵夜去哪一家？" : "去哪一家？"
        : meal === "breakfast" ? "早餐吃什麼？" : meal === "late" ? "宵夜吃什麼？" : "今天吃什麼？";
    el.greeting.replaceChildren(GREETINGS[meal], document.createElement("br"), question);
  }

  // cell：戳戳樂時被點的那一格；按按鈕抽時不帶
  function spin(cell = null) {
    if (state.spinning || state.candidates.length === 0) return;
    state.spinning = true;
    setControlsDisabled(true);

    const winner = state.candidates[Math.floor(Math.random() * state.candidates.length)];

    const finished = (place) => {
      state.spinning = false;
      setControlsDisabled(false);
      showResult(winner, place);
    };

    const pause = () => (calm() ? 200 : LAND_PAUSE_MS);
    if (drawKind() === "fortune") {
      // 籤號就是它在候選裡的順序
      const no = state.candidates.indexOf(winner) + 1;
      const label = `第${SpinEatFortune.numeral(no)}籤`;
      const place = { label, map: { kind: "qian", label } };
      if (!calm()) el.count.textContent = "再按一次按鈕直接出籤";
      fortune.draw(winner, no, calm()).then(() => setTimeout(() => finished(place), pause()));
      return;
    }
    if (!poke.left()) poke.renew();
    if (!calm()) el.count.textContent = "再按一次按鈕直接戳下去";
    poke.poke(winner, cell, calm()).then((i) => {
      const place = { label: `戳開第 ${i + 1} 格`, map: { kind: "sheet", cells: poke.states() } };
      setTimeout(() => finished(place), pause());
    });
  }

  // 抽到一半再按一次按鈕，求籤直接出籤、戳戳樂直接戳開
  function skipDraw() {
    if (drawKind() === "fortune") fortune.skip();
    else poke.skip();
  }

  function setControlsDisabled(disabled) {
    el.spinBtn.disabled = state.candidates.length === 0;
    el.spinBtn.setAttribute("aria-busy", String(disabled));
    el.filters.inert = disabled;
    el.modeSwitch.inert = disabled;
  }

  // ---------- 結果 ----------
  // 結果畫面上方的小地圖：戳戳樂是整張紙板、求籤是抽到的那支籤
  function renderMap(map) {
    el.resultLane.className = `lane lane-${map.kind}`;
    if (map.kind === "qian") {
      const li = document.createElement("li");
      li.textContent = map.label;
      el.resultLane.replaceChildren(li);
      return;
    }
    el.resultLane.replaceChildren(
      ...map.cells.map((s) => {
        const li = document.createElement("li");
        if (s !== "open") li.className = s;
        return li;
      })
    );
  }

  // 結果畫面蓋住了首頁的橫樑燈籠／燈泡串，直接借首頁已畫好的那一份；夜市再借背景的光暈
  function renderDecor() {
    const eave = document.querySelector(".awning");
    const glow = document.querySelector(".backdrop");
    el.resultDecor.querySelector(".result-eave").innerHTML = eave ? eave.innerHTML : "";
    el.resultDecor.querySelector(".result-glow").innerHTML = glow && drawKind() === "poke" ? glow.innerHTML : "";
  }

  // place：{ label: 戳開第幾格或第幾籤, map: 小地圖，見 renderMap }
  function showResult(item, place) {
    state.current = item;
    el.resultPlace.textContent = place.label;
    renderMap(place.map);
    renderDecor();
    el.resultName.textContent = item.name;
    const mealLabel = MEALS.find((m) => m.id === state.meal).label;
    // 籤詩、紙條上的小表格：類型／預算／餐別，沒有值的那欄不畫
    el.resultMeta.replaceChildren(
      ...[["類型", item.typeText], ["預算", D.PRICE_LABELS[item.price]], ["餐別", mealLabel]]
        .filter(([, v]) => v)
        .map(([k, v]) => {
          const cell = document.createElement("div");
          const dt = document.createElement("dt");
          const dd = document.createElement("dd");
          dt.textContent = k;
          dd.textContent = v;
          cell.append(dt, dd);
          return cell;
        })
    );

    const avoided = avoidedNames();
    el.resultWhy.textContent =
      (state.candidates.length === 1
        ? drawKind() === "fortune" ? "籤筒裡只剩這一支了" : "只剩這一個候選了"
        : `從 ${state.candidates.length} 個候選中抽出`) +
      (avoided.length ? `・已避開${avoided.slice(0, 2).join("、")}${avoided.length > 2 ? "等" : ""}` : "");

    if (item.store) {
      el.resultMap.href = D.mapsUrl(item.store);
      el.resultMapText.textContent = item.store.address || "在 Google 地圖搜尋";
    } else {
      el.resultMap.href = D.nearbyUrl(item.name, freshPosition());
      el.resultMapText.textContent = `找附近的${item.name}`;
    }
    el.resultMap.hidden = false;

    el.result.classList.remove("is-in");
    el.result.showModal();
    void el.result.offsetWidth; // 重新觸發進場動畫
    el.result.classList.add("is-in");
    el.acceptBtn.focus();
  }

  // 這次因為最近吃過而沒有列入候選的項目
  function avoidedNames() {
    const recent = recentKeys();
    const seen = new Set();
    return state.history
      .filter((h) => recent.has(h.key) && !seen.has(h.key) && seen.add(h.key))
      .filter((h) => allItems().some((i) => i.key === h.key && i.meals.includes(state.meal)))
      .map(historyName);
  }

  // ---------- 找附近 ----------
  // 定位只在使用者按「找附近」時才問，座標只放在記憶體裡，不寫進 localStorage
  const POSITION_TTL = 5 * 60 * 1000;
  let lastPosition = null; // { coords, at }
  let locating = false;

  function freshPosition() {
    return lastPosition && Date.now() - lastPosition.at < POSITION_TTL ? lastPosition.coords : null;
  }

  function locate() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastPosition = { coords: pos.coords, at: Date.now() };
          resolve(pos.coords);
        },
        () => resolve(null), // 拒絕或逾時就交給 Google 地圖自己定位
        { enableHighAccuracy: false, timeout: 8000, maximumAge: POSITION_TTL }
      );
    });
  }

  // 料理還沒有新座標時，先同步開一個分頁（等定位完才開會被擋），拿到座標再導過去
  async function openNearby(e) {
    const item = state.current;
    if (!item || item.store || freshPosition()) return; // 店家或已有座標：照連結原本的網址走
    e.preventDefault();
    if (locating) return;
    locating = true;
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    const label = el.resultMapText.textContent;
    el.resultMapText.textContent = "定位中…";
    const url = D.nearbyUrl(item.name, await locate());
    locating = false;
    el.resultMapText.textContent = label;
    el.resultMap.href = url;
    if (tab) tab.location.href = url;
    else location.href = url;
  }

  function closeResult() {
    if (el.result.open) el.result.close();
  }

  // 「再抽一次」會在關閉事件觸發前就開始下一次抽選，這時不能重設籤筒或紙板
  function onResultClosed() {
    state.current = null;
    if (state.spinning) return;
    refresh();
    // 連最後一個也略過時，主按鈕是停用的，焦點改給「全部放回候選」
    (el.boardEmpty.hidden || el.boardEmptyAction.hidden ? el.spinBtn : el.boardEmptyAction).focus();
  }

  function accept() {
    const item = state.current;
    if (!item) return;
    state.history.unshift({ key: item.key, name: item.name, emoji: item.emoji, meal: state.meal, date: D.todayStr() });
    state.history = state.history.slice(0, HISTORY_LIMIT);
    D.saveHistory(state.history);
    state.rejected.clear();
    poke.renew();
    state.justAte = true;
    closeResult();
    // 讓人知道它記住了：排除開著時，說出這一餐多久內不會再抽到
    showToast(
      settings.excludeOn
        ? `記下了！${settings.excludeDays} 天內不會再抽到「${item.name}」`
        : `記下了「${item.name}」，祝用餐愉快！`
    );
  }

  function respin() {
    if (state.current) state.rejected.add(state.current.key);
    closeResult();
    refresh();
    spin();
  }

  // ---------- 紀錄 ----------
  function formatDate(str) {
    const diff = daysBetween(D.todayStr(), str);
    if (diff === 0) return "今天";
    if (diff === 1) return "昨天";
    if (diff === 2) return "前天";
    return str.slice(5).replace("-", "/");
  }

  // 店家或料理改名後，紀錄跟著顯示新名稱
  function historyName(h) {
    const list = h.key.startsWith("store:") ? state.stores : state.foods;
    const prefix = h.key.startsWith("store:") ? "store:" : "food:";
    return list.find((x) => `${prefix}${x.id}` === h.key)?.name ?? h.name;
  }

  // 今天往回七天，每天一格；排除範圍內的格子會標出來
  function renderWeek() {
    const today = new Date();
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const ds = dateStr(d);
      const eaten = state.history.filter((h) => h.date === ds).map(historyName);
      const excluded = settings.excludeOn && i < settings.excludeDays;
      const li = document.createElement("li");
      li.className = "day" + (excluded ? " is-excluded" : "") + (i === 0 && state.justAte ? " is-stamped" : "");
      const label = document.createElement("span");
      label.className = "day-label";
      label.textContent = i === 0 ? "今" : i === 1 ? "昨" : WEEKDAYS[d.getDay()];
      const food = document.createElement("span");
      food.className = "day-food";
      food.textContent = eaten[0] || "";
      li.append(label, food);
      li.setAttribute(
        "aria-label",
        `${i === 0 ? "今天" : i === 1 ? "昨天" : `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`}：` +
          (eaten.length ? eaten.join("、") : "沒有紀錄") +
          (excluded ? "，在排除範圍內" : "")
      );
      cells.push(li);
    }
    el.week.replaceChildren(...cells);
    state.justAte = false;
    el.weekLegend.textContent = settings.excludeOn ? `標線＝排除最近 ${settings.excludeDays} 天` : "目前不排除";
  }

  function renderHistory() {
    el.historyCount.textContent = state.history.length ? `（${state.history.length}）` : "";
    if (state.history.length === 0) {
      const li = document.createElement("li");
      li.className = "history-empty";
      li.textContent = "還沒有紀錄，抽一次並按「就吃這個」吧！";
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
        name.textContent = displayName;
        const right = document.createElement("span");
        right.className = "history-right";
        const meal = MEALS.find((m) => m.id === h.meal);
        const date = document.createElement("span");
        date.className = "history-date";
        date.textContent = `${formatDate(h.date)}${meal ? " " + meal.label : ""}`;
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-text history-del";
        del.textContent = "刪除";
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
  // 沒有候選的時候，找出放寬哪一個條件就有得抽，給一個按了就能繼續的按鈕
  function emptyFix() {
    if (state.rejected.size && computeCandidates({ rejected: true }).length) {
      return {
        text: `這一輪抽到的 ${state.rejected.size} 個都略過了`,
        label: "全部放回候選",
        run: onFilterChange,
      };
    }
    if (settings.excludeOn && computeCandidates({ recent: true }).length) {
      return {
        text: `符合條件的，最近 ${settings.excludeDays} 天都吃過了`,
        label: "不排除最近吃過的",
        run: () => {
          settings.excludeOn = false;
          D.saveSettings(settings);
          onFilterChange();
        },
      };
    }
    if ((state.prices.size || state.types.size) && computeCandidates({ filters: true }).length) {
      return {
        text: "沒有同時符合預算和類型的選項",
        label: "放寬預算和類型",
        run: () => {
          state.prices.clear();
          state.types.clear();
          onFilterChange();
        },
      };
    }
    return {
      text: "沒有符合條件的選項，試著放寬篩選吧",
      label: "調整條件",
      run: () => {
        el.filters.open = true;
        el.mealChips.querySelector("[aria-checked='true']")?.focus();
      },
    };
  }

  function renderEmptyState(n) {
    el.boardEmpty.hidden = n > 0;
    if (n > 0) return;
    // 清單本身就沒有可抽的項目，只能去設定頁處理
    const isStore = settings.mode === "store";
    const source = isStore ? state.stores : state.foods;
    const noItems = source.filter((s) => s.enabled).length === 0;
    const fix = noItems ? null : emptyFix();
    el.boardEmptyText.textContent = noItems
      ? source.length === 0
        ? isStore ? "還沒有店家，先新增幾家常去的店吧！" : "料理清單是空的"
        : isStore ? "所有店家都停用了" : "所有料理都停用了"
      : fix.text;
    el.boardEmptyLink.hidden = !noItems;
    el.boardEmptyLink.textContent =
      isStore && state.stores.length === 0 ? "前往設定新增店家" : isStore ? "前往設定管理店家" : "前往設定管理料理";
    el.boardEmptyLink.href = isStore ? "settings.html#stores" : "settings.html#foods";
    el.boardEmptyAction.hidden = noItems;
    el.boardEmptyAction.textContent = fix ? fix.label : "";
    emptyFixRun = fix && fix.run;
  }

  function refresh() {
    state.candidates = computeCandidates();
    if (!state.spinning) {
      fortune.reset();
      poke.settle();
      syncStage();
    }

    // 篩選按鈕會重建，先記住焦點位置，重建後還原
    const focused = document.activeElement;
    const focusGroup = focused && focused.classList.contains("chip") ? focused.parentElement : null;
    const focusIndex = focusGroup ? [...focusGroup.children].indexOf(focused) : -1;
    renderFilters();
    if (focusGroup) focusGroup.children[focusIndex]?.focus();
    renderWeek();
    renderHistory();

    const n = state.candidates.length;
    renderEmptyState(n);
    const notes = [];
    if (settings.excludeOn) {
      const recent = recentKeys();
      const excluded = allItems().filter((item) => recent.has(item.key) && item.meals.includes(state.meal)).length;
      if (excluded) notes.push(`已排除 ${excluded} 個最近吃過的`);
    }
    if (state.rejected.size) notes.push(`略過 ${state.rejected.size} 個`);
    el.count.textContent = `${n} 個候選${notes.length ? "・" + notes.join("・") : ""}`;
    fortune.setSticks(n);
    el.temple.setAttribute("aria-label", n ? `籤筒，裡面 ${n} 支籤` : "籤筒，目前沒有候選");
    el.poke.setAttribute("aria-label", n ? `戳戳樂，還有 ${poke.left()} 格沒戳` : "戳戳樂，目前沒有候選");
    setControlsDisabled(state.spinning);
  }

  // ---------- 事件 ----------
  el.modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) setMode(btn.dataset.mode);
  });
  el.spinBtn.addEventListener("click", () => (state.spinning ? skipDraw() : spin()));
  // 點籤筒就求籤；正在出籤時不理會，免得連點變成跳過
  el.temple.addEventListener("pointerdown", (e) => {
    if (e.button === 0 && !state.spinning && !el.result.open) spin();
  });
  // 搖一搖手機也能求籤（不需授權就能讀加速度的手機）
  window.addEventListener("devicemotion", (e) => {
    const a = e.acceleration;
    if (!a || drawKind() !== "fortune" || state.spinning || el.result.open || document.hidden) return;
    if (Math.hypot(a.x || 0, a.y || 0) > 12) spin();
  });
  // 戳戳樂：手指一碰到沒戳過的格子就戳，不用等放開
  el.poke.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || state.spinning || el.result.open) return;
    const i = poke.cellIndex(e.target);
    if (i >= 0 && poke.isOpen(i)) spin(i);
  });
  el.boardEmptyAction.addEventListener("click", () => {
    if (!emptyFixRun) return;
    emptyFixRun();
    // 放寬後有候選了，焦點交給主按鈕；只是打開條件面板的話，焦點已經移過去
    if (el.boardEmpty.hidden) el.spinBtn.focus();
  });
  el.acceptBtn.addEventListener("click", accept);
  el.respinBtn.addEventListener("click", respin);
  el.closeResult.addEventListener("click", closeResult);
  el.resultMap.addEventListener("click", openNearby);
  el.result.addEventListener("close", onResultClosed);
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
  // 換主題也換抽法；抽到一半就等這一輪結束，關掉結果畫面時 refresh 會換
  document.addEventListener("spineat:theme", () => {
    if (!state.spinning) refresh();
  });
  setInterval(renderGreeting, 30 * 1000);

  renderGreeting();
  refresh();
})();
