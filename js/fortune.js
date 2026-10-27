// 求籤：搖一搖籤筒，跳出一支籤，籤上寫著這一餐
// 抽中哪一個在按下按鈕時就決定好了，籤筒只負責演出
const SpinEatFortune = (() => {
  "use strict";

  const SHAKE_MS = 650;
  const RISE_MS = 520;
  const MAX_STICKS = 12; // 筒裡最多畫幾支籤；候選更多時也只畫這麼多

  // 一到九十九用國字籤號，再大就用阿拉伯數字
  const DIGITS = "〇一二三四五六七八九";
  function numeral(n) {
    if (n >= 100) return String(n);
    const tens = Math.floor(n / 10);
    if (!tens) return DIGITS[n];
    return (tens === 1 ? "" : DIGITS[tens]) + "十" + (n % 10 ? DIGITS[n % 10] : "");
  }

  function create(root) {
    const tube = root.querySelector(".tube");
    const sticks = root.querySelector(".tube-sticks");
    const qian = root.querySelector(".qian");
    const qianNo = root.querySelector(".qian-no");
    const qianName = root.querySelector(".qian-name");
    let running = [];
    let rushing = false; // 跳過之後，這一輪後面的動畫也不再播
    let count = -1;

    function play(node, keyframes, options) {
      if (rushing) return Promise.resolve();
      const a = node.animate(keyframes, options);
      running.push(a);
      return a.finished.catch(() => {}).finally(() => (running = running.filter((x) => x !== a)));
    }

    // 籤插在筒裡只微微散開，下半截藏在筒身後面
    function setSticks(n) {
      n = Math.min(n, MAX_STICKS);
      if (n === count) return;
      count = n;
      let s = "";
      for (let i = 0; i < n; i++) {
        const x = n === 1 ? 60 : 34 + (i * 52) / (n - 1);
        const angle = (i - (n - 1) / 2) * 0.9 + ((i % 3) - 1) * 0.8;
        const top = 10 + ((i * 7) % 5) * 4;
        // 竹片，籤頭一截朱漆雕成跟出籤那支一樣的葫蘆輪廓（縮小版）
      const head = [[2, 3], [1.4, 5], [3.4, 8], [1.8, 10.5], [3.6, 14], [3, 16], [3, 20]];
      const side = (sign) => head.map(([w, y]) => `${(x + sign * w).toFixed(1)} ${top + y}`);
      s += `<g class="tube-stick" transform="rotate(${angle.toFixed(1)} 60 210)">` +
          `<rect class="stick-body" x="${x - 3}" y="${top + 18}" width="6" height="${132 - top}"/>` +
          `<path class="stick-tip" d="M${x} ${top}L${side(1).join("L")}L${side(-1).reverse().join("L")}Z"/></g>`;
      }
      sticks.innerHTML = s;
    }

    function skip() {
      rushing = true;
      running.slice().forEach((a) => a.finish());
    }

    function reset() {
      skip();
      qian.hidden = true;
      for (const s of sticks.children) s.style.opacity = "";
    }

    // calm 時不播動畫，直接亮出籤
    async function draw(item, no, calm) {
      reset();
      rushing = calm;
      await play(
        tube,
        [
          { transform: "rotate(0)" },
          { transform: "rotate(-9deg) translateY(-4px)" },
          { transform: "rotate(8deg)" },
          { transform: "rotate(-7deg) translateY(-3px)" },
          { transform: "rotate(6deg)" },
          { transform: "rotate(-3deg)" },
          { transform: "rotate(0)" },
        ],
        { duration: SHAKE_MS, easing: "ease-in-out" }
      );

      // 筒裡少一支，那一支從筒口跳出來、落到右邊立好
      const pool = [...sticks.children];
      if (pool.length) pool[Math.floor(Math.random() * pool.length)].style.opacity = "0";
      qianNo.textContent = `第${numeral(no)}籤`;
      qianName.textContent = item.name;
      qianName.classList.toggle("is-long", [...item.name].length > 4);
      qian.hidden = false;
      if (!calm && navigator.vibrate) navigator.vibrate(15);
      await play(
        qian,
        [
          { transform: "translate(-150px, 70px) rotate(-30deg) scale(0.35)", opacity: 0 },
          { transform: "translate(-60px, -40px) rotate(-12deg) scale(0.8)", opacity: 1, offset: 0.5 },
          { transform: "none", opacity: 1 },
        ],
        { duration: RISE_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    }

    return { setSticks, draw, skip, reset };
  }

  return { create, numeral };
})();
