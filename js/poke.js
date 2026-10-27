// 戳戳樂：一張 24 格的紙板，戳破一格，洞裡的紙條就是這一餐
// 戳哪一格由人選，抽中哪一個在戳下去時才以等機率決定，紙板只負責演出
// 戳過的洞會留著，換一張紙板（換條件、按「就吃這個」、戳滿了）才補回來
const SpinEatPoke = (() => {
  "use strict";

  const CELLS = 24; // 6 欄 × 4 列
  const AIM_STEP_MS = 70; // 「幫我決定！」時手指在格子間跳的節奏
  const AIM_STEPS = 5;
  const TEAR_MS = 560; // 紙破開、紙條彈出來

  function create(root) {
    const grid = root.querySelector(".poke-grid");
    const cells = [];
    for (let i = 0; i < CELLS; i++) {
      const cell = document.createElement("div");
      cell.className = "poke-cell";
      cell.dataset.i = i;
      const hole = document.createElement("span");
      hole.className = "poke-hole";
      const slip = document.createElement("span");
      slip.className = "poke-slip";
      const foil = document.createElement("span");
      foil.className = "poke-foil";
      foil.textContent = i + 1;
      cell.append(hole, slip, foil);
      grid.append(cell);
      cells.push(cell);
    }

    let rushing = false; // 跳過之後，這一輪後面的動畫也不再播
    let wake = null; // 正在等的計時，跳過時直接叫醒

    function wait(ms) {
      if (rushing) return Promise.resolve();
      return new Promise((resolve) => {
        const t = setTimeout(done, ms);
        function done() {
          clearTimeout(t);
          wake = null;
          resolve();
        }
        wake = done;
      });
    }

    const isOpen = (i) => !cells[i].classList.contains("is-poked");
    const openCells = () => cells.filter((c) => !c.classList.contains("is-poked"));

    function renew() {
      for (const c of cells) {
        c.className = "poke-cell";
        c.querySelector(".poke-slip").textContent = "";
      }
    }

    // 結果畫面關掉後，這次戳中的那格熄燈，留下戳過的洞
    function settle() {
      for (const c of cells) c.classList.remove("is-lit", "is-aim", "is-tearing");
    }

    function skip() {
      rushing = true;
      if (wake) wake();
    }

    // index 是被點的那一格；按按鈕抽時是 null，由手指在幾格間晃一下再戳
    async function poke(item, index, calm) {
      rushing = calm;
      const pool = openCells();
      if (index == null) {
        const target = pool[Math.floor(Math.random() * pool.length)];
        index = +target.dataset.i;
        for (let k = 0; k < AIM_STEPS && !rushing; k++) {
          const c = k === AIM_STEPS - 1 ? target : pool[Math.floor(Math.random() * pool.length)];
          pool.forEach((p) => p.classList.remove("is-aim"));
          c.classList.add("is-aim");
          await wait(AIM_STEP_MS);
        }
        pool.forEach((p) => p.classList.remove("is-aim"));
      }
      const cell = cells[index];
      cell.querySelector(".poke-slip").textContent = item.name;
      cell.classList.add("is-poked", "is-lit");
      if (!rushing) {
        cell.classList.add("is-tearing");
        if (navigator.vibrate) navigator.vibrate(15);
      }
      await wait(TEAR_MS);
      cell.classList.remove("is-tearing");
      return index;
    }

    // 點到哪一格；沒點在格子上回傳 -1
    function cellIndex(target) {
      const cell = target.closest(".poke-cell");
      return cell ? +cell.dataset.i : -1;
    }

    // 整張紙板目前的樣子，給結果畫面畫小地圖：open／poked／lit
    const states = () =>
      cells.map((c) => (c.classList.contains("is-lit") ? "lit" : c.classList.contains("is-poked") ? "poked" : "open"));

    return { poke, skip, renew, settle, isOpen, cellIndex, states, left: () => openCells().length };
  }

  return { create };
})();
