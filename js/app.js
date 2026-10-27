(() => {
  "use strict";

  const D = SpinEatData;
  const HISTORY_LIMIT = 30;
  const MAX_SLOTS = 8; // 檯面最多幾格；候選更多時，每次隨機挑幾個上台
  const LAND_PAUSE_MS = 450; // 落格後停一下再顯示結果
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
  // 系統要求減少動態效果、而且設定頁沒選「一律播放」時，抽選直接落格
  const calm = () => reduceMotion.matches && settings.motion !== "always";
  // 抽法跟著主題：冰果室彈珠台、夜市戳戳樂、廟口求籤；三種共用候選、結果與紀錄，只換演出
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
    slots: [], // 目前在檯面上的項目
    lit: -1, // 落中的格子
    spinning: false,
    current: null,
    justAte: false, // 剛按「就吃這個」，七天紀錄的今天要蓋章
  };
  let emptyFixRun = null; // 台上空了時，「放寬」按鈕要做的事

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    serial: $("serial"),
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
    canvas: $("board"),
    temple: $("temple"),
    poke: $("poke"),
    boardWrap: document.querySelector(".board-wrap"),
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
    resultSerial: $("result-serial"),
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
  const ctx = el.canvas.getContext("2d");
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
  // 只顯示這個主題的那一種；彈珠台被藏起來時量不到寬度，換回來要重新排版
  function syncStage() {
    const kind = drawKind();
    const wasHidden = el.canvas.hidden;
    el.canvas.hidden = kind !== "pinball";
    el.temple.hidden = kind !== "fortune";
    el.poke.hidden = kind !== "poke";
    if (kind === "pinball" && wasHidden) layout();
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

  const formatSerial = (n) => String(n).padStart(4, "0");

  function renderSerial() {
    el.serial.textContent = formatSerial((settings.draws || 0) + 1);
  }

  // ---------- 檯面上的格子 ----------
  function sample(list, k) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, k);
  }

  // 候選不多時全部上台；太多時隨機挑 MAX_SLOTS 個，抽中的那個一定在台上
  function dealSlots(winner) {
    const items = state.candidates;
    if (items.length <= MAX_SLOTS) return items.slice();
    if (!winner) return sample(items, MAX_SLOTS);
    return sample([winner, ...sample(items.filter((i) => i !== winner), MAX_SLOTS - 1)], MAX_SLOTS);
  }

  // ---------- 彈珠台 ----------
  const board = {
    w: 0,
    h: 0,
    pins: [],
    colors: {},
    ball: null,
    raf: 0,
    finish: null, // 下落中時，呼叫它可以直接落格
    nudge: null, // 下落中時，呼叫它可以拍台推珠子一把
    litAt: -Infinity, // 落格的時間，中獎燈從這時開始閃
    idleRaf: 0,
  };
  const FLASH_MS = 320; // 中獎燈閃兩下的長度，落在落格後的停頓裡
  const GLOW_MS = 260; // 釘子被碰到後亮著的時間
  const WOBBLE_MS = 360; // 釘子被碰到後抖動的時間

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    board.colors = {
      pin: v("--pin"),
      pinHi: v("--pin-hi"),
      label: v("--label"),
      lit: v("--lit"),
      litInk: v("--lit-ink"),
      ballHi: v("--ball-hi"),
      ballLo: v("--ball-lo"),
      ballShadow: v("--ball-shadow"),
      ballTrail: v("--ball-trail"),
      font: v("--font-board"),
      litGlow: parseFloat(v("--lit-glow")) || 0,
    };
  }

  function layout() {
    const w = el.canvas.clientWidth;
    if (!w) return;
    const h = Math.round(w * 0.86);
    const dpr = window.devicePixelRatio || 1;
    el.canvas.width = Math.round(w * dpr);
    el.canvas.height = Math.round(h * dpr);
    el.canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const u = w / 343;
    const pad = 14 * u;
    const slotTop = h * 0.6;
    const top = 30 * u;
    const rows = 6;
    const gapY = (slotTop - top - 24 * u) / (rows - 1);
    const cols = 9;
    const gapX = (w - pad * 2) / cols;
    const pins = [];
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? gapX / 2 : 0;
      for (let c = 0; c <= cols; c++) {
        const x = pad + c * gapX + off;
        if (x < pad + 4 * u || x > w - pad - 4 * u) continue;
        pins.push({ x, y: top + r * gapY, hit: -1e9, wob: { t0: -1e9, dx: 0, dy: 0, a: 0 } });
      }
    }
    Object.assign(board, { w, h, u, pad, slotTop, base: h - 10 * u, pins });
    draw();
  }

  function slotWidth() {
    return (board.w - board.pad * 2) / Math.max(1, state.slots.length);
  }

  // 漸層要漸到「同色、全透明」，用 transparent 會漸出一圈灰邊
  const clearOf = (rgba) => rgba.replace(/,\s*[\d.]+\)\s*$/, ", 0)");

  // 釘子像釘在木板上：被碰到時沿著受力方向快速抖幾下，很快就停
  function wobbleOffset(p, now) {
    const t = now - p.wob.t0;
    if (t < 0 || t >= WOBBLE_MS) return 0;
    return p.wob.a * Math.exp(-t / 85) * Math.sin((t / 70) * Math.PI * 2);
  }

  function pinsBusy(now) {
    return board.pins.some((p) => now - p.hit < GLOW_MS || now - p.wob.t0 < WOBBLE_MS);
  }

  // 拍台：手指附近的釘子被震得往外抖，越近抖得越大
  function wobbleAround(x, y, now) {
    const reach = 70 * board.u;
    for (const p of board.pins) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy);
      if (d >= reach) continue;
      p.wob = { t0: now, dx: d ? dx / d : 0, dy: d ? dy / d : 1, a: 2.2 * board.u * (1 - d / reach) };
    }
  }

  function draw(now = performance.now()) {
    const { w, h, u, pad, slotTop, base, pins, colors } = board;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = state.slots.length;
    if (n === 0) return;

    // 釘子：被碰到時亮一下、抖一下
    for (const p of pins) {
      const t = Math.min(1, Math.max(0, 1 - (now - p.hit) / GLOW_MS));
      const r = (2.4 + t * 1.6) * u;
      const s = wobbleOffset(p, now);
      const x = p.x + p.wob.dx * s;
      const y = p.y + p.wob.dy * s;
      if (t > 0) {
        ctx.globalAlpha = t * 0.45;
        ctx.fillStyle = colors.pinHi;
        ctx.beginPath();
        ctx.arc(x, y, r + 5 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = t > 0 ? colors.pinHi : colors.pin;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 格子
    const sw = slotWidth();
    // 落格時像中獎燈一樣亮、暗、亮、暗，然後一直亮著
    const sinceLit = now - board.litAt;
    const litOn = sinceLit >= FLASH_MS || Math.floor(sinceLit / 80) % 2 === 0;
    if (state.lit >= 0) {
      ctx.globalAlpha = litOn ? 1 : 0.35;
      ctx.fillStyle = colors.lit;
      if (colors.litGlow) {
        ctx.shadowColor = colors.lit;
        ctx.shadowBlur = colors.litGlow * u * (litOn ? 1 : 0.4);
      }
      ctx.fillRect(pad + state.lit * sw, slotTop, sw, base - slotTop);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = colors.pin;
    ctx.lineWidth = Math.max(1, 1.2 * u);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const x = pad + i * sw;
      ctx.moveTo(x, slotTop);
      ctx.lineTo(x, base);
    }
    ctx.moveTo(pad, base);
    ctx.lineTo(w - pad, base);
    ctx.stroke();

    // 格內：直書名稱
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fs = Math.min(16 * u, sw * 0.44);
    const step = fs * 1.14;
    const inset = fs * 0.6;
    const room = base - slotTop - inset * 2;
    const maxChars = Math.max(1, Math.floor(room / step));
    for (let i = 0; i < n; i++) {
      const item = state.slots[i];
      const cx = pad + i * sw + sw / 2;
      let chars = [...item.name];
      if (chars.length > maxChars) chars = [...chars.slice(0, maxChars - 1), "︙"];
      ctx.font = `700 ${fs}px ${colors.font}`;
      ctx.fillStyle = i === state.lit && litOn ? colors.litInk : colors.label;
      let y = slotTop + inset + (room - chars.length * step) / 2 + step / 2;
      for (const ch of chars) {
        ctx.fillText(ch, cx, y);
        y += step;
      }
    }

    // 珠子：速度快時拖出一道殘影，檯面上有一小塊接觸影子
    const ball = board.ball;
    if (ball) {
      const tail = ball.tail;
      if (tail && Math.hypot(ball.x - tail.x, ball.y - tail.y) > ball.r * 0.8) {
        const tg = ctx.createLinearGradient(tail.x, tail.y, ball.x, ball.y);
        tg.addColorStop(0, clearOf(colors.ballTrail));
        tg.addColorStop(1, colors.ballTrail);
        ctx.strokeStyle = tg;
        ctx.lineWidth = ball.r * 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(ball.x, ball.y);
        ctx.stroke();
      }
      const sx = ball.x + ball.r * 0.35;
      const sy = ball.y + ball.r * 0.55;
      const sg = ctx.createRadialGradient(sx, sy, ball.r * 0.3, sx, sy, ball.r * 1.45);
      sg.addColorStop(0, colors.ballShadow);
      sg.addColorStop(1, clearOf(colors.ballShadow));
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, sy, ball.r * 1.45, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(ball.x - ball.r * 0.4, ball.y - ball.r * 0.4, 1, ball.x, ball.y, ball.r);
      g.addColorStop(0, colors.ballHi);
      g.addColorStop(1, colors.ballLo);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 抽中的格子先決定（每個候選機率相同），再在背景模擬自然下落，
  // 找到一條剛好落進那一格的軌跡後依時間播放，所以畫面上的路線完全符合物理
  const FRAME_MS = 1000 / 60;
  const MAX_FRAMES = 96; // 只採用 1.6 秒內落格的軌跡
  const MAX_TRIES = 600;

  // 從 start（沒給就從頂端隨機放珠）模擬最多 frames 格，回傳每一格的位置與速度
  function simulate(start, frames) {
    const { w, u, pad, slotTop, base, pins } = board;
    const n = state.slots.length;
    const sw = slotWidth();
    const r = 6 * u;
    const hitR = r + 2.6 * u;
    const gravity = 0.12 * u;
    const b = start
      ? { x: start.x, y: start.y, vx: start.vx, vy: start.vy }
      : { x: w / 2 + (Math.random() - 0.5) * w * 0.5, y: 8 * u, vx: (Math.random() - 0.5) * 1.2 * u, vy: 0 };
    const path = [];
    const hits = []; // [畫格, 釘子編號]
    let slot = start ? start.slot : -1;
    for (let f = 0; f < frames; f++) {
      for (let s = 0; s < 2; s++) {
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;
        pins.forEach((p, idx) => {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > 0 && d < hitR) {
            const nx = dx / d;
            const ny = dy / d;
            const dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              b.vx -= 1.5 * dot * nx;
              b.vy -= 1.5 * dot * ny;
              hits.push([f, idx]);
            }
            b.x = p.x + nx * hitR;
            b.y = p.y + ny * hitR;
            b.vx += (Math.random() - 0.5) * 0.6 * u;
          }
        });
        if (slot < 0) {
          if (b.x < pad + r) {
            b.x = pad + r;
            b.vx = Math.abs(b.vx) * 0.6;
          }
          if (b.x > w - pad - r) {
            b.x = w - pad - r;
            b.vx = -Math.abs(b.vx) * 0.6;
          }
          if (b.y > slotTop) slot = Math.max(0, Math.min(n - 1, Math.floor((b.x - pad) / sw)));
        } else {
          // 進了格子就在兩側隔板之間彈
          const lo = pad + slot * sw + r;
          const hi = pad + (slot + 1) * sw - r;
          if (b.x < lo) {
            b.x = lo;
            b.vx = Math.abs(b.vx) * 0.4;
          }
          if (b.x > hi) {
            b.x = hi;
            b.vx = -Math.abs(b.vx) * 0.4;
          }
          if (b.y >= base - r) {
            path.push({ x: b.x, y: base - r, vx: b.vx, vy: b.vy, slot });
            return { path, hits, slot, r };
          }
        }
      }
      path.push({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, slot });
    }
    return null; // 太慢，不採用
  }

  function planDrop(target, start = () => null, frames = MAX_FRAMES, tries = MAX_TRIES, accept = () => true) {
    for (let i = 0; i < tries; i++) {
      const run = simulate(start(), frames);
      if (run && run.slot === target && accept(run)) return run;
    }
    return null;
  }

  // ---------- 檯面的實體感：整塊檯面掛在一個阻尼彈簧上 ----------
  const jolt = { x: 0, y: 0, vx: 0, vy: 0, raf: 0, last: 0 };
  const JOLT_W = 2 * Math.PI * 11; // 約 11Hz，像一台沉的木頭機台，不像果凍
  const JOLT_DAMP = 0.3;

  // dx、dy 是這一下大約會晃出去的距離（px）
  function kick(dx, dy) {
    if (calm()) return;
    jolt.vx += dx * JOLT_W;
    jolt.vy += dy * JOLT_W;
    if (jolt.raf) return;
    jolt.last = performance.now();
    jolt.raf = requestAnimationFrame(function tick(now) {
      // 分成小步積分，掉幀時彈簧也不會爆掉
      let dt = Math.min(0.05, (now - jolt.last) / 1000);
      jolt.last = now;
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        for (const k of ["x", "y"]) {
          const v = "v" + k;
          jolt[v] += (-JOLT_W * JOLT_W * jolt[k] - 2 * JOLT_DAMP * JOLT_W * jolt[v]) * h;
          jolt[k] += jolt[v] * h;
        }
        dt -= h;
      }
      if (Math.hypot(jolt.x, jolt.y) < 0.05 && Math.hypot(jolt.vx, jolt.vy) < 2) {
        Object.assign(jolt, { x: 0, y: 0, vx: 0, vy: 0, raf: 0 });
        el.boardWrap.style.transform = "";
        return;
      }
      el.boardWrap.style.transform = `translate(${jolt.x.toFixed(2)}px, ${jolt.y.toFixed(2)}px)`;
      jolt.raf = requestAnimationFrame(tick);
    });
  }

  // 沒在下落時拍台，只有釘子抖一下、檯面晃一下
  function settlePins() {
    if (board.idleRaf) return;
    board.idleRaf = requestAnimationFrame(function tick(now) {
      draw(now);
      board.idleRaf = pinsBusy(now) ? requestAnimationFrame(tick) : 0;
    });
  }

  let lastSlap = 0;
  function slap(x, y) {
    const now = performance.now();
    if (calm() || now - lastSlap < 140) return;
    lastSlap = now;
    if (board.nudge) return board.nudge(x, y);
    if (state.spinning || state.slots.length === 0) return;
    wobbleAround(x, y, now);
    kick(Math.sign(board.w / 2 - x) * 1.5, 1);
    settlePins();
  }

  function drop(target, onLand) {
    let run = planDrop(target);
    const t0 = performance.now();
    let done = false;
    let hitCursor = 0;
    let shown = 0; // 目前畫到第幾格

    function land() {
      if (done) return;
      done = true;
      cancelAnimationFrame(board.raf);
      board.finish = null;
      board.nudge = null;
      window.removeEventListener("devicemotion", onMotion);
      if (run) {
        const end = run.path[run.path.length - 1];
        board.ball = { x: end.x, y: end.y, r: run.r };
        // 珠子砸到格底，整台跟著往下沉一下；落得越快沉得越多
        kick(0, Math.min(3, 0.6 + (end.vy / board.u) * 0.5));
      }
      state.lit = target;
      board.litAt = performance.now();
      // 手機上輕震一下，像珠子落進格子的手感
      if (navigator.vibrate) navigator.vibrate(15);
      // 讓最後被碰到的釘子光暈自然消退，中獎燈閃完
      (function fade(now) {
        draw(now);
        if (now - board.litAt < FLASH_MS || pinsBusy(now)) {
          board.raf = requestAnimationFrame(fade);
        }
      })(performance.now());
      onLand();
    }
    board.finish = land;
    // 極少數情況找不到軌跡，就直接落格
    if (!run) return land();

    // 拍台：從手指那一側把珠子往另一邊推，再從珠子現在的位置和速度重新找一條
    // 仍然落進同一格、而且不超過原本時間上限的軌跡；找不到就只有檯面晃，珠子照原路走
    function nudge(tx, ty) {
      const now = performance.now();
      const { u } = board;
      const cur = run.path[shown];
      const dir = Math.sign(cur.x - tx) || (Math.random() < 0.5 ? -1 : 1);
      wobbleAround(tx, ty, now);
      kick(dir * 3.5, 1.5);
      if (navigator.vibrate) navigator.vibrate(10);
      const left = MAX_FRAMES - shown - 1;
      if (cur.slot >= 0 || left < 8) return;
      const jitter = () => 0.75 + Math.random() * 0.5;
      for (const force of [1, 0.55, 0.25]) {
        const next = planDrop(
          target,
          () => ({ ...cur, vx: cur.vx + dir * 1.7 * u * force * jitter(), vy: cur.vy - 1.2 * u * force * jitter() }),
          left,
          120,
          // 推了就要看得出被推：前幾格得真的往那一邊跑，不能馬上被釘子彈回來
          (r) => (r.path[Math.min(5, r.path.length - 1)].x - cur.x) * dir > 4 * u * force
        );
        if (!next) continue;
        const kept = run.hits.filter(([f]) => f <= shown);
        run = {
          ...run,
          path: run.path.slice(0, shown + 1).concat(next.path),
          hits: kept.concat(next.hits.map(([f, idx]) => [f + shown + 1, idx])),
        };
        hitCursor = kept.length;
        return;
      }
    }
    board.nudge = nudge;

    // 支援的手機（不需要額外授權的）也可以直接搖手機拍台
    function onMotion(e) {
      const ax = e.acceleration && e.acceleration.x;
      if (!ax || Math.abs(ax) < 12) return;
      const cur = run.path[shown];
      // 手機往右甩，珠子因為慣性相對往左跑，等於從右側拍台
      slap(cur.x + Math.sign(ax) * 30 * board.u, cur.y);
    }
    window.addEventListener("devicemotion", onMotion);

    function step(now) {
      // rAF 給的時間戳可能比 t0 還早一點，不能讓 f 變成負的
      const f = Math.max(0, Math.floor((now - t0) / FRAME_MS));
      if (f >= run.path.length - 1) return land();
      while (hitCursor < run.hits.length && run.hits[hitCursor][0] <= f) {
        const [hf, idx] = run.hits[hitCursor];
        const p = board.pins[idx];
        const v = run.path[hf];
        const speed = Math.hypot(v.vx, v.vy) || 1;
        p.hit = now;
        p.wob = { t0: now, dx: v.vx / speed, dy: v.vy / speed, a: 1.4 * board.u };
        hitCursor++;
      }
      shown = f;
      board.ball = { ...run.path[f], r: run.r, tail: run.path[Math.max(0, f - 4)] };
      draw(now);
      board.raf = requestAnimationFrame(step);
    }
    board.raf = requestAnimationFrame(step);
  }

  // cell：戳戳樂時被點的那一格；按按鈕抽時不帶
  function spin(cell = null) {
    if (state.spinning || state.candidates.length === 0) return;
    state.spinning = true;
    state.lit = -1;
    setControlsDisabled(true);

    const winner = state.candidates[Math.floor(Math.random() * state.candidates.length)];
    state.slots = dealSlots(winner);
    const target = state.slots.indexOf(winner);
    settings.draws = (settings.draws || 0) + 1;
    D.saveSettings(settings);

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
    if (drawKind() === "poke") {
      if (!poke.left()) poke.renew();
      if (!calm()) el.count.textContent = "再按一次按鈕直接戳下去";
      poke.poke(winner, cell, calm()).then((i) => {
        const place = { label: `戳開第 ${i + 1} 格`, map: { kind: "sheet", cells: poke.states() } };
        setTimeout(() => finished(place), pause());
      });
      return;
    }

    const place = { label: `落在第 ${target + 1} 格`, map: { kind: "slots", lit: target } };

    if (calm()) {
      board.ball = null;
      state.lit = target;
      draw();
      setTimeout(() => finished(place), 200);
      return;
    }
    el.count.textContent = "拍一下檯面可以推珠子・再按一次按鈕直接落格";
    drop(target, () => setTimeout(() => finished(place), LAND_PAUSE_MS));
  }

  // 下落中再按一次按鈕，就直接落格；求籤時直接出籤
  function skipDrop() {
    const kind = drawKind();
    if (kind === "fortune") fortune.skip();
    else if (kind === "poke") poke.skip();
    else if (board.finish) board.finish();
  }

  function setControlsDisabled(disabled) {
    el.spinBtn.disabled = state.candidates.length === 0;
    el.spinBtn.setAttribute("aria-busy", String(disabled));
    el.filters.inert = disabled;
    el.modeSwitch.inert = disabled;
  }

  // ---------- 結果 ----------
  // 結果畫面上方的小地圖：彈珠台是一排格子、戳戳樂是整張紙板、求籤是抽到的那支籤
  function renderMap(map) {
    el.resultLane.className = `lane lane-${map.kind}`;
    if (map.kind === "qian") {
      const li = document.createElement("li");
      li.textContent = map.label;
      el.resultLane.replaceChildren(li);
      return;
    }
    const states = map.kind === "sheet" ? map.cells : state.slots.map((_, i) => (i === map.lit ? "lit" : "open"));
    el.resultLane.replaceChildren(
      ...states.map((s) => {
        const li = document.createElement("li");
        if (s !== "open") li.className = s;
        return li;
      })
    );
  }

  // place：{ label: 落在第幾格、戳開第幾格或第幾籤, map: 小地圖，見 renderMap }
  function showResult(item, place) {
    state.current = item;
    const num = document.createElement("span");
    num.className = "serial-num";
    num.textContent = formatSerial(settings.draws);
    const slot = document.createElement("span");
    slot.className = "result-slot";
    slot.textContent = place.label;
    el.resultSerial.replaceChildren("第", num, "抽", slot);
    renderMap(place.map);
    el.resultName.textContent = item.name;
    const mealLabel = MEALS.find((m) => m.id === state.meal).label;
    el.resultMeta.textContent = [item.typeText, D.PRICE_LABELS[item.price], mealLabel].filter(Boolean).join("・");

    const avoided = avoidedNames();
    el.resultWhy.textContent =
      (state.candidates.length === 1
        ? { fortune: "籤筒裡只剩這一支了", poke: "只剩這一個候選了" }[drawKind()] || "台上只剩這一個了"
        : `從 ${state.candidates.length} 個候選中抽出`) +
      (avoided.length ? `・已避開${avoided.slice(0, 2).join("、")}${avoided.length > 2 ? "等" : ""}` : "");

    if (item.store) {
      el.resultMap.href = D.mapsUrl(item.store);
      el.resultMapText.textContent = item.store.address || "在 Google 地圖搜尋";
      el.resultMap.hidden = false;
    } else {
      el.resultMap.hidden = true;
    }

    el.result.classList.remove("is-in");
    el.result.showModal();
    void el.result.offsetWidth; // 重新觸發進場動畫
    el.result.classList.add("is-in");
    el.acceptBtn.focus();
  }

  // 這次因為最近吃過而沒有上台的項目
  function avoidedNames() {
    const recent = recentKeys();
    const seen = new Set();
    return state.history
      .filter((h) => recent.has(h.key) && !seen.has(h.key) && seen.add(h.key))
      .filter((h) => allItems().some((i) => i.key === h.key && i.meals.includes(state.meal)))
      .map(historyName);
  }

  function closeResult() {
    if (el.result.open) el.result.close();
  }

  // 「再抽一次」會在關閉事件觸發前就開始下一次下落，這時不能重設檯面
  function onResultClosed() {
    state.current = null;
    if (state.spinning) return;
    refresh();
    // 連最後一個也略過時，主按鈕是停用的，焦點改給「全部放回台上」
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
    // 讓人知道它記住了：排除開著時，說出這一餐多久內不會再上台
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
  // 台上空了的時候，找出放寬哪一個條件就有得抽，給一個按了就能繼續的按鈕
  function emptyFix() {
    if (state.rejected.size && computeCandidates({ rejected: true }).length) {
      return {
        text: `這一輪抽到的 ${state.rejected.size} 個都略過了`,
        label: "全部放回台上",
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
      state.slots = dealSlots();
      state.lit = -1;
      board.ball = null;
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
    renderSerial();
    renderWeek();
    renderHistory();

    const n = state.candidates.length;
    renderEmptyState(n);
    const notes = [];
    if (n > MAX_SLOTS && drawKind() === "pinball") notes.push(`每次隨機 ${MAX_SLOTS} 個上台`);
    if (settings.excludeOn) {
      const recent = recentKeys();
      const excluded = allItems().filter((item) => recent.has(item.key) && item.meals.includes(state.meal)).length;
      if (excluded) notes.push(`已排除 ${excluded} 個最近吃過的`);
    }
    if (state.rejected.size) notes.push(`略過 ${state.rejected.size} 個`);
    el.count.textContent = `${n} 個候選${notes.length ? "・" + notes.join("・") : ""}`;
    el.canvas.setAttribute(
      "aria-label",
      n ? `彈珠台，台上 ${state.slots.length} 格：${state.slots.map((s) => s.name).join("、")}` : "彈珠台，目前沒有候選"
    );
    fortune.setSticks(n);
    el.temple.setAttribute("aria-label", n ? `籤筒，裡面 ${n} 支籤` : "籤筒，目前沒有候選");
    el.poke.setAttribute("aria-label", n ? `戳戳樂，還有 ${poke.left()} 格沒戳` : "戳戳樂，目前沒有候選");
    setControlsDisabled(state.spinning);
    draw();
  }

  // ---------- 事件 ----------
  el.modeSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) setMode(btn.dataset.mode);
  });
  el.spinBtn.addEventListener("click", () => (state.spinning ? skipDrop() : spin()));
  // 拍台用 pointerdown，手指一碰到就有反應，不用等放開
  el.canvas.addEventListener("pointerdown", (e) => {
    const rect = el.canvas.getBoundingClientRect();
    slap(e.clientX - rect.left, e.clientY - rect.top);
  });
  // 點籤筒就求籤；正在出籤時不理會，免得連點變成跳過
  el.temple.addEventListener("pointerdown", (e) => {
    if (e.button === 0 && !state.spinning && !el.result.open) spin();
  });
  // 搖一搖手機也能求籤（不需授權就能讀加速度的手機）；門檻跟彈珠台甩手機拍台一樣
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
    // 放寬後台上有東西了，焦點交給主按鈕；只是打開條件面板的話，焦點已經移過去
    if (el.boardEmpty.hidden) el.spinBtn.focus();
  });
  el.acceptBtn.addEventListener("click", accept);
  el.respinBtn.addEventListener("click", respin);
  el.closeResult.addEventListener("click", closeResult);
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
    readColors();
    if (!state.spinning) refresh();
  });
  window.addEventListener("resize", layout);
  setInterval(renderGreeting, 30 * 1000);

  readColors();
  renderGreeting();
  refresh();
  layout();
  // 網頁字型載入後，檯面上的字要重畫一次；中文字型是分片載入的，之後每補到一批字形都再畫一次
  document.fonts?.ready.then(() => draw());
  document.fonts?.addEventListener("loadingdone", () => draw());
})();
