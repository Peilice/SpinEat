// 共用資料層：料理清單、標籤、店家、吃過紀錄、設定，全部存在 localStorage
const SpinEatData = (() => {
  "use strict";

  const KEYS = {
    foods: "spineat.foods",
    tags: "spineat.tags",
    stores: "spineat.stores",
    history: "spineat.history",
    settings: "spineat.settings",
  };
  const EXPORT_VERSION = 1;
  const DEFAULT_TAGS = ["中式", "小吃", "麵食", "日式", "韓式", "西式", "速食", "南洋", "火鍋", "輕食"];
  // appearance：auto（依時間）／neon／temple
  // motion：system（系統要求減少動態效果時直接出結果）／always（一律播放抽選動畫）
  // 抽法跟著主題，不另外設定
  const DEFAULT_SETTINGS = { excludeOn: true, excludeDays: 3, mode: "food", appearance: "auto", motion: "system" };
  const PRICE_LABELS = { 1: "$", 2: "$$", 3: "$$$" };

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
      return true;
    } catch {
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- 料理清單 ----------
  // 使用者沒改過就沿用 foods.js 的內建清單，這樣內建清單更新時也會跟著更新
  // 內建料理的 id 由內建名稱產生，使用者改名或內建清單調整順序都不會變
  function defaultFoods() {
    return FOODS.map((f) => ({ id: `default:${f.name}`, ...f, enabled: true }));
  }

  function getFoods() {
    return load(KEYS.foods, null) || defaultFoods();
  }

  function saveFoods(foods) {
    return save(KEYS.foods, foods);
  }

  function resetFoods() {
    try {
      localStorage.removeItem(KEYS.foods);
    } catch {
      // 無法存取就當作已經是預設清單
    }
  }

  // 清單中出現的所有類型，內建類型照原本順序排在前面
  function foodTypes(foods) {
    const used = new Set(foods.map((f) => f.type));
    return [...TYPES.filter((t) => used.has(t)), ...[...used].filter((t) => !TYPES.includes(t))];
  }

  function sanitizeFoods(list) {
    const seen = new Set();
    return list
      .filter((f) => f && typeof f.name === "string" && f.name.trim() && typeof f.type === "string" && f.type.trim())
      .map((f) => ({
        id: typeof f.id === "string" ? f.id : uid(),
        name: f.name.trim(),
        emoji: typeof f.emoji === "string" ? f.emoji : "",
        type: f.type.trim(),
        meals: Array.isArray(f.meals) ? f.meals.filter((m) => typeof m === "string") : [],
        price: [1, 2, 3].includes(f.price) ? f.price : 1,
        enabled: f.enabled !== false,
      }))
      .filter((f) => !seen.has(f.name) && seen.add(f.name));
  }

  // ---------- 標籤 ----------
  function getTags() {
    const tags = load(KEYS.tags, null);
    if (tags) return tags;
    // 第一次使用時建立預設標籤
    const seeded = DEFAULT_TAGS.map((name) => ({ id: uid(), name }));
    save(KEYS.tags, seeded);
    return seeded;
  }

  function saveTags(tags) {
    return save(KEYS.tags, tags);
  }

  // 刪除標籤，並從所有店家移除這個標籤
  function deleteTag(tagId) {
    saveTags(getTags().filter((t) => t.id !== tagId));
    saveStores(
      getStores().map((s) => ({ ...s, tagIds: s.tagIds.filter((id) => id !== tagId) }))
    );
  }

  // ---------- 店家 ----------
  function getStores() {
    return load(KEYS.stores, []);
  }

  function saveStores(stores) {
    return save(KEYS.stores, stores);
  }

  // ---------- 紀錄與設定 ----------
  // 舊版紀錄沒有 key，一律視為料理；料理以前用名稱當 key（food:蛋餅），
  // 現在改用 id（food:default:蛋餅），讀取時換成同名料理的 id 並寫回
  function getHistory() {
    const stored = load(KEYS.history, []);
    const foods = getFoods();
    const ids = new Set(foods.map((f) => `food:${f.id}`));
    const idByName = new Map(foods.map((f) => [`food:${f.name}`, `food:${f.id}`]));
    let migrated = false;
    const history = stored.map((h) => {
      const key = h.key || `food:${h.name}`;
      if (ids.has(key) || !idByName.has(key)) return h.key ? h : { ...h, key };
      migrated = true;
      return { ...h, key: idByName.get(key) };
    });
    if (migrated) saveHistory(history);
    return history;
  }

  function saveHistory(history) {
    return save(KEYS.history, history);
  }

  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) };
  }

  function saveSettings(settings) {
    return save(KEYS.settings, settings);
  }

  // ---------- 匯出與匯入 ----------
  function exportAll() {
    return {
      app: "SpinEat",
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      foods: getFoods(),
      tags: getTags(),
      stores: getStores(),
      history: getHistory(),
      settings: getSettings(),
    };
  }

  // 驗證並匯入備份檔，格式不對時丟出錯誤訊息
  function importAll(data) {
    if (!data || data.app !== "SpinEat") throw new Error("這不是 SpinEat 的備份檔");
    if (!Array.isArray(data.tags) || !Array.isArray(data.stores)) throw new Error("備份檔內容不完整");

    const tags = data.tags
      .filter((t) => t && typeof t.id === "string" && typeof t.name === "string")
      .map((t) => ({ id: t.id, name: t.name.trim() }));
    const tagIds = new Set(tags.map((t) => t.id));
    const stores = data.stores
      .filter((s) => s && typeof s.id === "string" && typeof s.name === "string")
      .map((s) => ({
        id: s.id,
        name: s.name.trim(),
        address: typeof s.address === "string" ? s.address.trim() : "",
        meals: Array.isArray(s.meals) ? s.meals.filter((m) => typeof m === "string") : [],
        price: [1, 2, 3].includes(s.price) ? s.price : 1,
        tagIds: Array.isArray(s.tagIds) ? s.tagIds.filter((id) => tagIds.has(id)) : [],
        enabled: s.enabled !== false,
      }));

    saveTags(tags);
    saveStores(stores);
    // 舊版備份沒有料理清單，就保留目前的
    if (Array.isArray(data.foods)) saveFoods(sanitizeFoods(data.foods));
    if (Array.isArray(data.history)) saveHistory(data.history);
    if (data.settings && typeof data.settings === "object") saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    return { tags: tags.length, stores: stores.length };
  }

  // ---------- 共用工具 ----------
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function mapsUrl(store) {
    const query = [store.name, store.address].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return {
    PRICE_LABELS,
    uid,
    getFoods,
    saveFoods,
    resetFoods,
    foodTypes,
    getTags,
    saveTags,
    deleteTag,
    getStores,
    saveStores,
    getHistory,
    saveHistory,
    getSettings,
    saveSettings,
    exportAll,
    importAll,
    todayStr,
    mapsUrl,
  };
})();
