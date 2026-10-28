(() => {
  "use strict";

  const D = SpinEatData;
  const $ = (id) => document.getElementById(id);
  const el = {
    tabs: $("settings-tabs"),
    foodTools: $("food-tools"),
    foodSearch: $("food-search"),
    typeFilter: $("type-filter"),
    foodList: $("food-list"),
    foodSummary: $("food-summary"),
    renameTypeBtn: $("rename-type-btn"),
    typeRenameForm: $("type-rename-form"),
    typeRenameInput: $("type-rename-input"),
    typeRenameCancel: $("type-rename-cancel"),
    addFoodBtn: $("add-food-btn"),
    resetFoodsBtn: $("reset-foods-btn"),
    foodDialog: $("food-dialog"),
    foodDialogTitle: $("food-dialog-title"),
    foodForm: $("food-form"),
    foodFormTypes: $("food-form-types"),
    foodFormMeals: $("food-form-meals"),
    foodFormPrice: $("food-form-price"),
    foodFormError: $("food-form-error"),
    deleteFoodBtn: $("delete-food-btn"),
    cancelFoodBtn: $("cancel-food-btn"),
    tagFilter: $("tag-filter"),
    manageTagsBtn: $("manage-tags-btn"),
    storeSummary: $("store-summary"),
    storeList: $("store-list"),
    addStoreBtn: $("add-store-btn"),
    tagDialog: $("tag-dialog"),
    closeTagBtn: $("close-tag-btn"),
    tagForm: $("tag-form"),
    tagInput: $("tag-input"),
    tagList: $("tag-list"),
    exportBtn: $("export-btn"),
    importInput: $("import-input"),
    dialog: $("store-dialog"),
    dialogTitle: $("store-dialog-title"),
    form: $("store-form"),
    formMeals: $("form-meals"),
    formPrice: $("form-price"),
    formTags: $("form-tags"),
    formError: $("form-error"),
    deleteStoreBtn: $("delete-store-btn"),
    cancelBtn: $("cancel-store-btn"),
    themeOptions: $("theme-options"),
    autoHint: $("auto-hint"),
    motionOptions: $("motion-options"),
    motionHint: $("motion-hint"),
    toast: $("toast"),
  };

  let foods = D.getFoods();
  let tags = D.getTags();
  let stores = D.getStores();
  let editingId = null; // null 代表新增
  let editingFoodId = null;
  // 清單的篩選狀態：搜尋字優先於類型；null 代表全部
  let foodQuery = "";
  let foodType = null;
  let renamingType = false;
  let storeTag = null;

  // ---------- 共用 ----------
  let toastTimer;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2500);
  }

  function persistFoods() {
    if (!D.saveFoods(foods)) showToast("無法儲存，瀏覽器可能封鎖了本機儲存空間");
  }

  function persist() {
    if (!D.saveTags(tags) || !D.saveStores(stores)) {
      showToast("無法儲存，瀏覽器可能封鎖了本機儲存空間");
    }
  }

  // 清單整個重畫後，把鍵盤焦點放回原本那個控制項（靠 id 找回來）
  function keepFocus(render) {
    const id = document.activeElement?.id;
    render();
    if (id) document.getElementById(id)?.focus();
  }

  function makeCheckChip(type, name, value, label, checked) {
    const wrap = document.createElement("label");
    wrap.className = "chip-check";
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.value = value;
    input.checked = checked;
    const span = document.createElement("span");
    span.textContent = label;
    wrap.append(input, span);
    return wrap;
  }

  function badge(text, extraClass = "") {
    const span = document.createElement("span");
    span.className = `badge ${extraClass}`.trim();
    span.textContent = text;
    return span;
  }

  function mealBadges(meals) {
    return MEALS.filter((m) => meals.includes(m.id)).map((m) => badge(m.label, "badge-meal"));
  }

  // 篩選鈕：名稱＋數量，選中的那顆 aria-pressed
  function filterChip(id, label, count, pressed, onPick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.id = id;
    btn.setAttribute("aria-pressed", String(pressed));
    const n = document.createElement("span");
    n.className = "chip-count";
    n.textContent = count;
    btn.append(label, n);
    btn.addEventListener("click", () => keepFocus(onPick));
    return btn;
  }

  // 名稱裡符合搜尋字的部分標出來
  function highlight(text, query) {
    const i = query ? text.indexOf(query) : -1;
    if (i < 0) return [text];
    const mark = document.createElement("mark");
    mark.className = "hit";
    mark.textContent = query;
    return [text.slice(0, i), mark, text.slice(i + query.length)];
  }

  // 店家和料理共用的一列：點名稱打開編輯表單，右邊只留啟用開關
  function itemRow({ id, name, enabled, query = "", badges, extra, onOpen, onToggle }) {
    const li = document.createElement("li");
    li.className = "store-item" + (enabled ? "" : " is-disabled");

    const main = document.createElement("div");
    main.className = "store-main";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "item-open";
    open.id = `open-${id}`;
    const title = document.createElement("span");
    title.className = "store-name";
    const nameText = document.createElement("span");
    nameText.append(...highlight(name, query));
    title.append(nameText);
    if (!enabled) title.append(badge("已停用", "badge-muted"));
    const badgeRow = document.createElement("span");
    badgeRow.className = "badges";
    badgeRow.append(...badges);
    open.append(title, badgeRow);
    open.addEventListener("click", onOpen);
    main.append(open);
    if (extra) main.append(extra);

    const toggle = document.createElement("label");
    toggle.className = "mini-switch";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("role", "switch");
    input.id = `on-${id}`;
    input.checked = enabled;
    input.setAttribute("aria-label", `啟用 ${name}`);
    input.addEventListener("change", () => keepFocus(() => onToggle(input.checked)));
    toggle.append(input);

    li.append(main, toggle);
    return li;
  }

  function emptyNote(text) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = text;
    return li;
  }

  // ---------- 分頁 ----------
  const TABS = ["foods", "stores", "prefs"];
  const tabButtons = [...el.tabs.querySelectorAll('[role="tab"]')];

  function showTab(name, { focus = false } = {}) {
    if (!TABS.includes(name)) name = "foods";
    for (const btn of tabButtons) {
      const selected = btn.dataset.tab === name;
      btn.setAttribute("aria-selected", String(selected));
      btn.tabIndex = selected ? 0 : -1;
      $(btn.getAttribute("aria-controls")).hidden = !selected;
      if (selected && focus) btn.focus();
    }
    el.foodTools.hidden = name !== "foods";
    // 網址帶著分頁，重新整理或從主頁連過來都會停在同一個分頁
    if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
  }

  el.tabs.addEventListener("click", (e) => {
    const btn = e.target.closest('[role="tab"]');
    if (!btn || btn.getAttribute("aria-selected") === "true") return;
    showTab(btn.dataset.tab);
    window.scrollTo(0, 0);
  });

  el.tabs.addEventListener("keydown", (e) => {
    const i = tabButtons.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: tabButtons.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    showTab(tabButtons[(next + tabButtons.length) % tabButtons.length].dataset.tab, { focus: true });
  });

  window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

  // ---------- 料理清單 ----------
  function renderTypeFilter() {
    const types = D.foodTypes(foods);
    if (foodType && !types.includes(foodType)) foodType = null;
    const pressed = (t) => !foodQuery && foodType === t;
    el.typeFilter.replaceChildren(
      filterChip("type-chip-all", "全部", foods.length, pressed(null), () => pickType(null)),
      ...types.map((t) =>
        filterChip(`type-chip-${t}`, t, foods.filter((f) => f.type === t).length, pressed(t), () => pickType(t))
      )
    );
  }

  function pickType(type) {
    foodType = type;
    foodQuery = "";
    el.foodSearch.value = "";
    renamingType = false;
    renderFoods();
  }

  function renderFoods() {
    renderTypeFilter();
    const byType = !foodQuery && foodType;
    const list = foodQuery
      ? foods.filter((f) => f.name.includes(foodQuery))
      : foods.filter((f) => !foodType || f.type === foodType);
    const enabled = list.filter((f) => f.enabled).length;

    if (foodQuery) el.foodSummary.textContent = `找到 ${list.length} 道`;
    else if (byType) el.foodSummary.textContent = `${foodType} ${list.length} 道${list.length > enabled ? `・停用 ${list.length - enabled}` : ""}`;
    else el.foodSummary.textContent = `共 ${foods.length} 道・啟用 ${enabled} 道`;

    el.renameTypeBtn.hidden = !byType || renamingType;
    el.typeRenameForm.hidden = !byType || !renamingType;

    if (foods.length === 0) {
      el.foodList.replaceChildren(emptyNote("清單是空的，按「新增料理」加入，或恢復預設清單。"));
      return;
    }
    if (list.length === 0) {
      el.foodList.replaceChildren(emptyNote(`找不到「${foodQuery}」，可以按「新增料理」加進清單。`));
      return;
    }
    el.foodList.replaceChildren(
      ...list.map((f) =>
        itemRow({
          id: f.id,
          name: f.name,
          enabled: f.enabled,
          query: foodQuery,
          // 已經按類型篩選時，每列不用再重複類型
          badges: [...(byType ? [] : [badge(f.type)]), ...mealBadges(f.meals), badge(D.PRICE_LABELS[f.price], "badge-price")],
          onOpen: () => openFoodDialog(f.id),
          onToggle: (checked) => {
            f.enabled = checked;
            persistFoods();
            renderFoods();
          },
        })
      )
    );
  }

  el.foodSearch.addEventListener("input", () => {
    foodQuery = el.foodSearch.value.trim();
    renamingType = false;
    renderFoods();
  });

  // 改類型名稱會套用到這個類型的所有料理；改成已有的類型就合併過去
  el.renameTypeBtn.addEventListener("click", () => {
    renamingType = true;
    renderFoods();
    el.typeRenameInput.value = foodType;
    el.typeRenameInput.focus();
    el.typeRenameInput.select();
  });

  function closeTypeRename() {
    renamingType = false;
    renderFoods();
    el.renameTypeBtn.focus();
  }

  el.typeRenameCancel.addEventListener("click", closeTypeRename);
  el.typeRenameInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTypeRename();
  });

  el.typeRenameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = foodType;
    const name = el.typeRenameInput.value.trim();
    if (!name) return showToast("類型名稱不能空白");
    if (name === type) return closeTypeRename();
    if (foods.some((f) => f.type === name) && !confirm(`已經有「${name}」類型，要把「${type}」的料理併過去嗎？`)) return;
    foods = foods.map((f) => (f.type === type ? { ...f, type: name } : f));
    foodType = name;
    persistFoods();
    closeTypeRename();
    showToast(`已把「${type}」改為「${name}」`);
  });

  // ---------- 料理表單 ----------
  function openFoodDialog(foodId) {
    editingFoodId = foodId;
    const f = foods.find((x) => x.id === foodId) || {
      name: "",
      type: "",
      meals: ["lunch", "dinner"],
      price: 1,
      enabled: true,
    };
    const fe = el.foodForm.elements;
    el.foodDialogTitle.textContent = foodId ? "編輯料理" : "新增料理";
    fe.name.value = f.name;
    fe.newType.value = "";
    fe.enabled.checked = f.enabled;
    el.foodFormTypes.replaceChildren(
      ...D.foodTypes(foods).map((t) => makeCheckChip("radio", "type", t, t, f.type === t))
    );
    el.foodFormMeals.replaceChildren(
      ...MEALS.map((m) => makeCheckChip("checkbox", "meals", m.id, m.label, f.meals.includes(m.id)))
    );
    el.foodFormPrice.replaceChildren(
      ...[1, 2, 3].map((p) => makeCheckChip("radio", "price", String(p), D.PRICE_LABELS[p], f.price === p))
    );
    el.foodFormError.hidden = true;
    el.deleteFoodBtn.hidden = !foodId;
    el.foodDialog.showModal();
    fe.name.focus();
  }

  function showFoodFormError(message, focusEl) {
    el.foodFormError.textContent = message;
    el.foodFormError.hidden = false;
    focusEl?.focus();
  }

  // 現有類型和新類型只會有一個：選了其中一邊就清掉另一邊
  el.foodFormTypes.addEventListener("change", () => {
    el.foodForm.elements.newType.value = "";
  });
  el.foodForm.elements.newType.addEventListener("input", (e) => {
    if (!e.target.value.trim()) return;
    for (const input of el.foodFormTypes.querySelectorAll("input")) input.checked = false;
  });

  el.foodForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fe = el.foodForm.elements;
    const name = fe.name.value.trim();
    const type = fe.newType.value.trim() || el.foodFormTypes.querySelector("input:checked")?.value;
    const meals = [...el.foodFormMeals.querySelectorAll("input:checked")].map((i) => i.value);
    const priceInput = el.foodFormPrice.querySelector("input:checked");

    if (!name) return showFoodFormError("請輸入料理名稱", fe.name);
    // 同名料理在抽選結果和紀錄上分不出來，所以名稱不能重複
    if (foods.some((f) => f.id !== editingFoodId && f.name === name)) {
      return showFoodFormError(`清單裡已經有「${name}」了`, fe.name);
    }
    if (!type) return showFoodFormError("請選擇或輸入類型", el.foodFormTypes.querySelector("input") || fe.newType);
    if (meals.length === 0) return showFoodFormError("請至少選擇一個餐別", el.foodFormMeals.querySelector("input"));

    const data = {
      name,
      type,
      meals,
      price: priceInput ? Number(priceInput.value) : 1,
      enabled: fe.enabled.checked,
    };
    if (editingFoodId) {
      foods = foods.map((f) => (f.id === editingFoodId ? { ...f, ...data } : f));
    } else {
      foods.push({ id: D.uid(), emoji: "", ...data });
    }
    // 存好之後清單要看得到它：類型篩選不符時切到它的類型
    if (!foodQuery && foodType && foodType !== type) foodType = type;
    persistFoods();
    el.foodDialog.close();
    renderFoods();
    showToast(editingFoodId ? `已更新 ${name}` : `已新增 ${name}`);
  });

  el.deleteFoodBtn.addEventListener("click", () => {
    const f = foods.find((x) => x.id === editingFoodId);
    if (!f || !confirm(`確定要刪除「${f.name}」嗎？`)) return;
    foods = foods.filter((x) => x.id !== f.id);
    persistFoods();
    el.foodDialog.close();
    renderFoods();
    showToast(`已刪除 ${f.name}`);
  });

  el.cancelFoodBtn.addEventListener("click", () => el.foodDialog.close());
  el.addFoodBtn.addEventListener("click", () => openFoodDialog(null));
  el.resetFoodsBtn.addEventListener("click", () => {
    if (!confirm(`要恢復成內建的 ${FOODS.length} 道料理嗎？新增、修改和停用過的料理都會還原。`)) return;
    D.resetFoods();
    foods = D.getFoods();
    pickType(null);
    showToast("已恢復預設料理清單");
  });

  // ---------- 店家列表 ----------
  function tagUsage(tagId) {
    return stores.filter((s) => s.tagIds.includes(tagId)).length;
  }

  function renderTagFilter() {
    if (storeTag && !tags.some((t) => t.id === storeTag)) storeTag = null;
    // 沒有標籤或還沒有店家時，篩選鈕全是 0，沒必要顯示
    el.tagFilter.hidden = tags.length === 0 || stores.length === 0;
    const pick = (id) => () => {
      storeTag = id;
      renderStores();
    };
    el.tagFilter.replaceChildren(
      filterChip("tag-chip-all", "全部", stores.length, !storeTag, pick(null)),
      ...tags.map((t) => filterChip(`tag-chip-${t.id}`, t.name, tagUsage(t.id), storeTag === t.id, pick(t.id)))
    );
  }

  function renderStores() {
    renderTagFilter();
    const tagName = new Map(tags.map((t) => [t.id, t.name]));
    const list = storeTag ? stores.filter((s) => s.tagIds.includes(storeTag)) : stores;
    const enabled = list.filter((s) => s.enabled).length;
    el.storeSummary.textContent = storeTag
      ? `${tagName.get(storeTag)} ${list.length} 家`
      : `共 ${stores.length} 家・啟用 ${enabled} 家`;

    if (stores.length === 0) {
      el.storeList.replaceChildren(emptyNote("還沒有店家，按「新增店家」加入你常去的店吧！"));
      return;
    }
    if (list.length === 0) {
      el.storeList.replaceChildren(emptyNote(`還沒有店家標上「${tagName.get(storeTag)}」。`));
      return;
    }
    el.storeList.replaceChildren(
      ...list.map((s) => {
        let addr = null;
        if (s.address) {
          addr = document.createElement("a");
          addr.className = "store-address";
          addr.href = D.mapsUrl(s);
          addr.target = "_blank";
          addr.rel = "noopener";
          addr.textContent = s.address;
        }
        return itemRow({
          id: s.id,
          name: s.name,
          enabled: s.enabled,
          badges: [
            ...mealBadges(s.meals),
            badge(D.PRICE_LABELS[s.price], "badge-price"),
            ...s.tagIds.filter((id) => tagName.has(id)).map((id) => badge(tagName.get(id))),
          ],
          extra: addr,
          onOpen: () => openDialog(s.id),
          onToggle: (checked) => {
            s.enabled = checked;
            persist();
            renderStores();
          },
        });
      })
    );
  }

  // ---------- 店家表單 ----------
  function openDialog(storeId) {
    editingId = storeId;
    const s = stores.find((x) => x.id === storeId) || {
      name: "",
      address: "",
      meals: ["lunch", "dinner"],
      price: 1,
      tagIds: [],
      enabled: true,
    };
    el.dialogTitle.textContent = storeId ? "編輯店家" : "新增店家";
    el.form.elements.name.value = s.name;
    el.form.elements.address.value = s.address;
    el.form.elements.enabled.checked = s.enabled;
    el.formMeals.replaceChildren(
      ...MEALS.map((m) => makeCheckChip("checkbox", "meals", m.id, m.label, s.meals.includes(m.id)))
    );
    el.formPrice.replaceChildren(
      ...[1, 2, 3].map((p) => makeCheckChip("radio", "price", String(p), D.PRICE_LABELS[p], s.price === p))
    );
    if (tags.length === 0) {
      const note = document.createElement("span");
      note.className = "panel-note";
      note.textContent = "還沒有標籤，可以在店家分頁按「管理標籤」新增。";
      el.formTags.replaceChildren(note);
    } else {
      el.formTags.replaceChildren(
        ...tags.map((t) => makeCheckChip("checkbox", "tags", t.id, t.name, s.tagIds.includes(t.id)))
      );
    }
    el.formError.hidden = true;
    el.deleteStoreBtn.hidden = !storeId;
    el.dialog.showModal();
    el.form.elements.name.focus();
  }

  function showFormError(message, focusEl) {
    el.formError.textContent = message;
    el.formError.hidden = false;
    focusEl?.focus();
  }

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = el.form.elements;
    const name = f.name.value.trim();
    const meals = [...el.formMeals.querySelectorAll("input:checked")].map((i) => i.value);
    const priceInput = el.formPrice.querySelector("input:checked");

    if (!name) return showFormError("請輸入店家名稱", f.name);
    if (meals.length === 0) return showFormError("請至少選擇一個餐別", el.formMeals.querySelector("input"));
    const duplicate = stores.some((s) => s.id !== editingId && s.name === name);
    if (duplicate && !confirm(`已經有一家叫「${name}」的店，確定還要儲存嗎？`)) return;

    const data = {
      name,
      address: f.address.value.trim(),
      meals,
      price: priceInput ? Number(priceInput.value) : 1,
      tagIds: [...el.formTags.querySelectorAll("input:checked")].map((i) => i.value),
      enabled: f.enabled.checked,
    };
    if (editingId) {
      stores = stores.map((s) => (s.id === editingId ? { ...s, ...data } : s));
    } else {
      stores.push({ id: D.uid(), ...data });
    }
    persist();
    el.dialog.close();
    renderStores();
    showToast(editingId ? `已更新 ${name}` : `已新增 ${name}`);
  });

  el.deleteStoreBtn.addEventListener("click", () => {
    const s = stores.find((x) => x.id === editingId);
    if (!s || !confirm(`確定要刪除「${s.name}」嗎？`)) return;
    stores = stores.filter((x) => x.id !== s.id);
    persist();
    el.dialog.close();
    renderStores();
    showToast(`已刪除 ${s.name}`);
  });

  el.cancelBtn.addEventListener("click", () => el.dialog.close());
  el.addStoreBtn.addEventListener("click", () => openDialog(null));

  // ---------- 標籤 ----------
  // 在對話框裡管理；改動會立刻反映到店家清單和篩選鈕
  el.manageTagsBtn.addEventListener("click", () => {
    renderTags();
    el.tagDialog.showModal();
    el.tagInput.focus();
  });
  el.closeTagBtn.addEventListener("click", () => el.tagDialog.close());

  function renderTags() {
    if (tags.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "還沒有標籤";
      el.tagList.replaceChildren(li);
      return;
    }
    el.tagList.replaceChildren(
      ...tags.map((t) => {
        const li = document.createElement("li");
        li.className = "tag-item";

        const input = document.createElement("input");
        input.type = "text";
        input.value = t.name;
        input.maxLength = 12;
        input.setAttribute("aria-label", `標籤名稱：${t.name}`);
        input.addEventListener("change", () => {
          const name = input.value.trim();
          if (!name || tags.some((x) => x.id !== t.id && x.name === name)) {
            input.value = t.name;
            showToast(name ? "已經有同名的標籤了" : "標籤名稱不能空白");
            return;
          }
          t.name = name;
          persist();
          renderStores();
          showToast(`已改名為「${name}」`);
        });

        const count = document.createElement("span");
        count.className = "tag-count";
        count.textContent = `${tagUsage(t.id)} 家`;

        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn-text btn-danger";
        del.textContent = "刪除";
        del.setAttribute("aria-label", `刪除標籤 ${t.name}`);
        del.addEventListener("click", () => {
          const used = tagUsage(t.id);
          const msg = used
            ? `有 ${used} 家店使用「${t.name}」，刪除後會從這些店家移除這個標籤。確定刪除嗎？`
            : `確定刪除標籤「${t.name}」嗎？`;
          if (!confirm(msg)) return;
          D.deleteTag(t.id);
          tags = D.getTags();
          stores = D.getStores();
          renderTags();
          renderStores();
          showToast(`已刪除標籤 ${t.name}`);
        });

        li.append(input, count, del);
        return li;
      })
    );
  }

  el.tagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.tagInput.value.trim();
    if (!name) return;
    if (tags.some((t) => t.name === name)) {
      showToast("已經有同名的標籤了");
      return;
    }
    tags.push({ id: D.uid(), name });
    persist();
    el.tagInput.value = "";
    renderTags();
    renderStores();
    showToast(`已新增標籤 ${name}`);
  });

  // ---------- 外觀 ----------
  const THEME_NAMES = { neon: "夜市霓虹", temple: "廟口朱紅" };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function renderAppearance() {
    const { appearance, motion } = D.getSettings();
    for (const input of el.themeOptions.querySelectorAll("input")) input.checked = input.value === appearance;
    const { DAY_START, NIGHT_START } = SpinEatTheme;
    const hh = (h) => `${String(h).padStart(2, "0")}:00`;
    // 每一段不拆行，避免「夜市霓虹」被折成兩半
    const parts = [[DAY_START, "廟口"], [NIGHT_START, "夜市霓虹"]].map(([h, name], i) => {
      const span = document.createElement("span");
      span.className = "nowrap";
      span.textContent = `${hh(h)} ${name}${i < 1 ? "，" : ""}`;
      return span;
    });
    el.autoHint.replaceChildren(...parts);
    for (const input of el.motionOptions.querySelectorAll("input")) input.checked = input.value === (motion === "always" ? "always" : "system");
    // 直接說出這台裝置現在的狀態，才知道為什麼沒有動畫
    el.motionHint.textContent = reduceMotion.matches
      ? "這台裝置目前開著「減少動態效果」，所以會直接出結果"
      : "這台裝置目前沒有要求減少動態效果，會正常播放";
  }

  reduceMotion.addEventListener("change", renderAppearance);

  el.motionOptions.addEventListener("change", (e) => {
    const settings = D.getSettings();
    settings.motion = e.target.value;
    if (!D.saveSettings(settings)) return showToast("無法儲存，瀏覽器可能封鎖了本機儲存空間");
    SpinEatTheme.apply();
    showToast(settings.motion === "always" ? "抽選動畫改為一律播放" : "抽選動畫改為跟隨系統");
  });

  el.themeOptions.addEventListener("change", (e) => {
    const settings = D.getSettings();
    settings.appearance = e.target.value;
    if (!D.saveSettings(settings)) return showToast("無法儲存，瀏覽器可能封鎖了本機儲存空間");
    const theme = SpinEatTheme.apply();
    showToast(settings.appearance === "auto" ? `已改為依時間自動，現在是${THEME_NAMES[theme]}` : `已固定為${THEME_NAMES[theme]}`);
  });

  // ---------- 備份 ----------
  el.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(D.exportAll(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spineat-backup-${D.todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("已匯出備份檔");
  });

  el.importInput.addEventListener("change", async () => {
    const file = el.importInput.files[0];
    el.importInput.value = "";
    if (!file) return;
    if (!confirm("匯入會覆蓋目前所有的料理清單、標籤、店家與紀錄，確定要繼續嗎？")) return;
    try {
      const result = D.importAll(JSON.parse(await file.text()));
      foods = D.getFoods();
      pickType(null);
      tags = D.getTags();
      stores = D.getStores();
      storeTag = null;
      renderStores();
      renderAppearance();
      SpinEatTheme.apply();
      showToast(`匯入完成：${result.stores} 家店、${result.tags} 個標籤`);
    } catch (err) {
      showToast(`匯入失敗：${err instanceof SyntaxError ? "檔案不是有效的 JSON" : err.message}`);
    }
  });

  showTab(location.hash.slice(1));
  renderAppearance();
  renderFoods();
  renderStores();
})();
