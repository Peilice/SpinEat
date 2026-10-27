// 戳戳樂：一張 24 格的紙板，戳破一格，洞裡的紙條就是這一餐
// 戳哪一格由人選，抽中哪一個在戳下去時才以等機率決定，紙板只負責演出
// 戳過的洞留著一圈破紙，換一張紙板（換條件、按「就吃這個」、戳滿了）才補回來
const SpinEatPoke = (() => {
  "use strict";

  const CELLS = 24; // 6 欄 × 4 列
  const AIM_STEP_MS = 70; // 「幫我決定！」時手指在格子間跳的節奏
  const AIM_STEPS = 5;
  const TEAR_MS = 560; // 紙破開、紙條彈出來
  const BITS = 5; // 戳破時噴出來的紙屑
  const PAPERS = 4; // 封紙的色紙種類，樣式在 CSS 的 data-paper

  // 戳破後留在洞口的殘紙：外圈是整圈封紙，中間挖掉一塊鋸齒狀的破口，每格的破法都不一樣
  function tearMask() {
    const n = 11 + Math.floor(Math.random() * 4);
    const turn = Math.random() * Math.PI * 2;
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = turn + (k / n) * Math.PI * 2;
      const r = k % 2 ? 24 + Math.random() * 8 : 34 + Math.random() * 9;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`);
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill-rule='evenodd' d='M0 50a50 50 0 1 0 100 0a50 50 0 1 0-100 0ZM${pts.join("L")}Z'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  function create(root) {
    const grid = root.querySelector(".poke-grid");
    const stamp = root.querySelector(".poke-left");
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

    // 每換一張紙板，殘紙的破法和紙條歪的角度都重抽
    function shuffleLook(c) {
      c.style.setProperty("--tear", tearMask());
      c.style.setProperty("--tilt", `${(Math.random() * 10 - 5).toFixed(1)}deg`);
    }
    cells.forEach(shuffleLook);

    // 每換一張紙板重新貼色紙，左邊和上面那格不貼同一種
    function shufflePapers() {
      cells.forEach((c, i) => {
        const near = [i % 6 ? cells[i - 1].dataset.paper : null, i >= 6 ? cells[i - 6].dataset.paper : null];
        let p;
        do p = String(Math.floor(Math.random() * PAPERS));
        while (near.includes(p));
        c.dataset.paper = p;
      });
    }
    shufflePapers();

    // 戳破的瞬間噴出幾片紙屑，往外飛再往下掉
    function burst(cell) {
      for (let k = 0; k < BITS; k++) {
        const bit = document.createElement("span");
        bit.className = "poke-bit";
        const a = (k / BITS) * Math.PI * 2 + Math.random() * 0.8;
        const d = 18 + Math.random() * 16;
        bit.style.setProperty("--dx", `${(Math.cos(a) * d).toFixed(1)}px`);
        bit.style.setProperty("--dy", `${(Math.sin(a) * d - 10).toFixed(1)}px`);
        bit.style.setProperty("--r", `${Math.round(Math.random() * 360 - 180)}deg`);
        cell.append(bit);
        setTimeout(() => bit.remove(), 600);
      }
    }

    const isOpen = (i) => !cells[i].classList.contains("is-poked");
    const openCells = () => cells.filter((c) => !c.classList.contains("is-poked"));

    const stampLeft = () => (stamp.textContent = openCells().length);

    function renew() {
      for (const c of cells) {
        c.className = "poke-cell";
        c.querySelector(".poke-slip").textContent = "";
        shuffleLook(c);
      }
      shufflePapers();
      stampLeft();
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
      stampLeft();
      if (!rushing) {
        cell.classList.add("is-tearing");
        burst(cell);
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
