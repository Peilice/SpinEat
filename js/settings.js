(() => {
  "use strict";

  const D = SpinEatData;
  const $ = (id) => document.getElementById(id);
  const el = {
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
    toast: $("toast"),
  };

  let tags = D.getTags();
  let stores = D.getStores();
  let editingId = null; // null 代表新增

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

  function persist() {
    if (!D.saveTags(tags) || !D.saveStores(stores)) {
      showToast("⚠️ 無法儲存，瀏覽器可能封鎖了本機儲存空間");
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

  // ---------- 店家列表 ----------
  function renderStores() {
    if (stores.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "還沒有店家，按「＋ 新增店家」加入你常去的店吧！";
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
          addr.textContent = `📍 ${s.address}`;
          main.append(addr);
        }
        const badges = document.createElement("div");
        badges.className = "badges";
        badges.append(
          ...MEALS.filter((m) => s.meals.includes(m.id)).map((m) => badge(m.label, "badge-meal")),
          badge(D.PRICE_LABELS[s.price], "badge-price"),
          ...s.tagIds.filter((id) => tagName.has(id)).map((id) => badge(tagName.get(id)))
        );
        main.append(badges);

        const actions = document.createElement("div");
        actions.className = "store-actions";
        const toggle = document.createElement("label");
        toggle.className = "mini-switch";
        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.checked = s.enabled;
        toggleInput.setAttribute("aria-label", `啟用 ${s.name}`);
        toggleInput.addEventListener("change", () => {
          s.enabled = toggleInput.checked;
          persist();
          renderStores();
        });
        toggle.append(toggleInput);
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn-text";
        editBtn.textContent = "編輯";
        editBtn.setAttribute("aria-label", `編輯 ${s.name}`);
        editBtn.addEventListener("click", () => openDialog(s.id));
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-text btn-danger";
        delBtn.textContent = "刪除";
        delBtn.setAttribute("aria-label", `刪除 ${s.name}`);
        delBtn.addEventListener("click", () => {
          if (!confirm(`確定要刪除「${s.name}」嗎？`)) return;
          stores = stores.filter((x) => x.id !== s.id);
          persist();
          renderStores();
          renderTags();
          showToast(`已刪除 ${s.name}`);
        });
        actions.append(toggle, editBtn, delBtn);

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
    if (!confirm("匯入會覆蓋目前所有的標籤、店家與紀錄，確定要繼續嗎？")) return;
    try {
      const result = D.importAll(JSON.parse(await file.text()));
      tags = D.getTags();
      stores = D.getStores();
      renderTags();
      renderStores();
      showToast(`匯入完成：${result.stores} 家店、${result.tags} 個標籤`);
    } catch (err) {
      showToast(`⚠️ 匯入失敗：${err instanceof SyntaxError ? "檔案不是有效的 JSON" : err.message}`);
    }
  });

  renderStores();
  renderTags();
})();
