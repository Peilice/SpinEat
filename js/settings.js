(() => {
  "use strict";

  const D = SpinEatData;
  const $ = (id) => document.getElementById(id);
  const el = {
    foodGroups: $("food-groups"),
    foodSummary: $("food-summary"),
    addFoodBtn: $("add-food-btn"),
    resetFoodsBtn: $("reset-foods-btn"),
    foodDialog: $("food-dialog"),
    foodDialogTitle: $("food-dialog-title"),
    foodForm: $("food-form"),
    foodFormTypes: $("food-form-types"),
    foodFormMeals: $("food-form-meals"),
    foodFormPrice: $("food-form-price"),
    foodFormError: $("food-form-error"),
    cancelFoodBtn: $("cancel-food-btn"),
    storeList: $("store-list"),
    addStoreBtn: $("add-store-btn"),
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
  const openTypes = new Set(); // 重新渲染料理清單時，保留已展開的類型

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

  // 店家和料理列表共用的右側操作：啟用開關、編輯、刪除
  function itemActions(name, enabled, { onToggle, onEdit, onDelete }) {
    const actions = document.createElement("div");
    actions.className = "store-actions";
    const toggle = document.createElement("label");
    toggle.className = "mini-switch";
    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = enabled;
    toggleInput.setAttribute("aria-label", `啟用 ${name}`);
    toggleInput.addEventListener("change", () => onToggle(toggleInput.checked));
    toggle.append(toggleInput);
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-text";
    editBtn.textContent = "編輯";
    editBtn.setAttribute("aria-label", `編輯 ${name}`);
    editBtn.addEventListener("click", onEdit);
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-text btn-danger";
    delBtn.textContent = "刪除";
    delBtn.setAttribute("aria-label", `刪除 ${name}`);
    delBtn.addEventListener("click", onDelete);
    actions.append(toggle, editBtn, delBtn);
    return actions;
  }

  function mealBadges(meals) {
    return MEALS.filter((m) => meals.includes(m.id)).map((m) => badge(m.label, "badge-meal"));
  }

  // ---------- 料理清單 ----------
  const CHEVRON =
    '<svg class="icon chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function renderFoods() {
    const enabled = foods.filter((f) => f.enabled).length;
    el.foodSummary.textContent = `共 ${foods.length} 道・啟用 ${enabled} 道`;
    if (foods.length === 0) {
      const p = document.createElement("p");
      p.className = "empty-note";
      p.textContent = "清單是空的，按「新增料理」加入，或恢復預設清單。";
      el.foodGroups.replaceChildren(p);
      return;
    }

    el.foodGroups.replaceChildren(
      ...D.foodTypes(foods).map((type) => {
        const items = foods.filter((f) => f.type === type);
        const off = items.filter((f) => !f.enabled).length;

        const group = document.createElement("details");
        group.className = "food-group";
        group.open = openTypes.has(type);
        group.addEventListener("toggle", () => (group.open ? openTypes.add(type) : openTypes.delete(type)));

        const summary = document.createElement("summary");
        const name = document.createElement("span");
        name.className = "food-group-name";
        name.textContent = type;
        const count = document.createElement("span");
        count.className = "food-group-count";
        count.textContent = `${items.length} 道${off ? `・停用 ${off}` : ""}`;
        summary.append(name, count);
        summary.insertAdjacentHTML("beforeend", CHEVRON);

        group.append(summary, renameTypeRow(type), foodList(items));
        return group;
      })
    );
  }

  // 改類型名稱會套用到這個類型的所有料理；改成已有的類型就合併過去
  function renameTypeRow(type) {
    const row = document.createElement("div");
    row.className = "tag-item food-type-row";
    const input = document.createElement("input");
    input.type = "text";
    input.value = type;
    input.maxLength = 8;
    input.id = `type-${D.uid()}`;
    const label = document.createElement("label");
    label.className = "food-type-label";
    label.htmlFor = input.id;
    label.textContent = "類型名稱";
    input.addEventListener("change", () => {
      const name = input.value.trim();
      if (!name || name === type) {
        input.value = type;
        if (!name) showToast("類型名稱不能空白");
        return;
      }
      if (foods.some((f) => f.type === name) && !confirm(`已經有「${name}」類型，要把「${type}」的料理併過去嗎？`)) {
        input.value = type;
        return;
      }
      foods = foods.map((f) => (f.type === type ? { ...f, type: name } : f));
      openTypes.delete(type);
      openTypes.add(name);
      persistFoods();
      renderFoods();
      showToast(`已把「${type}」改為「${name}」`);
    });
    row.append(label, input);
    return row;
  }

  function foodList(items) {
    const ul = document.createElement("ul");
    ul.className = "store-list";
    ul.append(
      ...items.map((f) => {
        const li = document.createElement("li");
        li.className = "store-item" + (f.enabled ? "" : " is-disabled");

        const main = document.createElement("div");
        main.className = "store-main";
        const title = document.createElement("div");
        title.className = "store-name";
        title.textContent = f.name;
        if (!f.enabled) title.append(badge("已停用", "badge-muted"));
        const badges = document.createElement("div");
        badges.className = "badges";
        badges.append(...mealBadges(f.meals), badge(D.PRICE_LABELS[f.price], "badge-price"));
        main.append(title, badges);

        const actions = itemActions(f.name, f.enabled, {
          onToggle: (checked) => {
            f.enabled = checked;
            persistFoods();
            renderFoods();
          },
          onEdit: () => openFoodDialog(f.id),
          onDelete: () => {
            if (!confirm(`確定要刪除「${f.name}」嗎？`)) return;
            foods = foods.filter((x) => x.id !== f.id);
            persistFoods();
            renderFoods();
            showToast(`已刪除 ${f.name}`);
          },
        });

        li.append(main, actions);
        return li;
      })
    );
    return ul;
  }

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
    // 同名料理在彈珠台和紀錄上分不出來，所以名稱不能重複
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
    openTypes.add(type);
    persistFoods();
    el.foodDialog.close();
    renderFoods();
    showToast(editingFoodId ? `已更新 ${name}` : `已新增 ${name}`);
  });

  el.cancelFoodBtn.addEventListener("click", () => el.foodDialog.close());
  el.addFoodBtn.addEventListener("click", () => openFoodDialog(null));
  el.resetFoodsBtn.addEventListener("click", () => {
    if (!confirm(`要恢復成內建的 ${FOODS.length} 道料理嗎？新增、修改和停用過的料理都會還原。`)) return;
    D.resetFoods();
    foods = D.getFoods();
    openTypes.clear();
    renderFoods();
    showToast("已恢復預設料理清單");
  });

  // ---------- 店家列表 ----------
  function renderStores() {
    if (stores.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "還沒有店家，按「新增店家」加入你常去的店吧！";
      el.storeList.replaceChildren(li);
      return;
    }

    const tagName = new Map(tags.map((t) => [t.id, t.name]));
    el.storeList.replaceChildren(
      ...stores.map((s) => {
        const li = document.createElement("li");
        li.className = "store-item" + (s.enabled ? "" : " is-disabled");

        const main = document.createElement("div");
        main.className = "store-main";
        const title = document.createElement("div");
        title.className = "store-name";
        title.textContent = s.name;
        if (!s.enabled) title.append(badge("已停用", "badge-muted"));
        main.append(title);
        if (s.address) {
          const addr = document.createElement("a");
          addr.className = "store-address";
          addr.href = D.mapsUrl(s);
          addr.target = "_blank";
          addr.rel = "noopener";
          addr.textContent = s.address;
          main.append(addr);
        }
        const badges = document.createElement("div");
        badges.className = "badges";
        badges.append(
          ...mealBadges(s.meals),
          badge(D.PRICE_LABELS[s.price], "badge-price"),
          ...s.tagIds.filter((id) => tagName.has(id)).map((id) => badge(tagName.get(id)))
        );
        main.append(badges);

        const actions = itemActions(s.name, s.enabled, {
          onToggle: (checked) => {
            s.enabled = checked;
            persist();
            renderStores();
          },
          onEdit: () => openDialog(s.id),
          onDelete: () => {
            if (!confirm(`確定要刪除「${s.name}」嗎？`)) return;
            stores = stores.filter((x) => x.id !== s.id);
            persist();
            renderStores();
            renderTags();
            showToast(`已刪除 ${s.name}`);
          },
        });

        li.append(main, actions);
        return li;
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
      note.textContent = "還沒有標籤，可以先到下方「分類標籤」新增。";
      el.formTags.replaceChildren(note);
    } else {
      el.formTags.replaceChildren(
        ...tags.map((t) => makeCheckChip("checkbox", "tags", t.id, t.name, s.tagIds.includes(t.id)))
      );
    }
    el.formError.hidden = true;
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
    renderTags();
    showToast(editingId ? `已更新 ${name}` : `已新增 ${name}`);
  });

  el.cancelBtn.addEventListener("click", () => el.dialog.close());
  el.addStoreBtn.addEventListener("click", () => openDialog(null));

  // ---------- 標籤 ----------
  function tagUsage(tagId) {
    return stores.filter((s) => s.tagIds.includes(tagId)).length;
  }

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
    showToast(`已新增標籤 ${name}`);
  });

  // ---------- 外觀 ----------
  const THEME_NAMES = { icefruit: "老派冰果室", neon: "夜市霓虹", temple: "廟口朱紅" };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function renderAppearance() {
    const { appearance, motion } = D.getSettings();
    for (const input of el.themeOptions.querySelectorAll("input")) input.checked = input.value === appearance;
    const { MORNING_START, DAY_START, NIGHT_START } = SpinEatTheme;
    const hh = (h) => `${String(h).padStart(2, "0")}:00`;
    // 每一段不拆行，避免「冰果室」被折成兩半
    const parts = [[MORNING_START, "廟口"], [DAY_START, "冰果室"], [NIGHT_START, "夜市霓虹"]].map(([h, name], i) => {
      const span = document.createElement("span");
      span.className = "nowrap";
      span.textContent = `${hh(h)} ${name}${i < 2 ? "，" : ""}`;
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
      renderFoods();
      tags = D.getTags();
      stores = D.getStores();
      renderTags();
      renderStores();
      renderAppearance();
      SpinEatTheme.apply();
      showToast(`匯入完成：${result.stores} 家店、${result.tags} 個標籤`);
    } catch (err) {
      showToast(`匯入失敗：${err instanceof SyntaxError ? "檔案不是有效的 JSON" : err.message}`);
    }
  });

  renderAppearance();
  renderFoods();
  renderStores();
  renderTags();
})();
