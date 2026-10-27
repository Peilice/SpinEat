---
name: SpinEat
description: 今天吃甚麼？一顆珠子落格，決定這一餐。
colors:
  icefruit-tile-wall: "#dcc58a"
  icefruit-tile-deep: "#c8ab68"
  icefruit-tile-cream: "#f2e8cc"
  icefruit-peacock: "#44716c"
  icefruit-terracotta: "#d98b6a"
  icefruit-espresso: "#3a2b1a"
  icefruit-umber: "#5e4628"
  icefruit-sign-brown: "#7c3e25"
  icefruit-paper: "#fbf6ea"
  icefruit-paper-muted: "#6b5233"
  icefruit-input: "#fffdf7"
  icefruit-btn-ink: "#f2e3b3"
  icefruit-danger: "#a3372b"
  neon-night: "#1b1546"
  neon-panel: "#241d5a"
  neon-board: "#2b2270"
  neon-button: "#2f2680"
  neon-pink: "#ff5c9a"
  neon-pink-pale: "#ffd1e3"
  neon-lime: "#d8ff3c"
  neon-moon: "#f4efff"
  neon-lilac: "#b1aadf"
  neon-danger: "#ff8a98"
typography:
  display:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "clamp(1.5rem, 6.4vw, 1.75rem)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "0.02em"
  result:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "clamp(3rem, 17vw, 5.25rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "0.02em"
  serial:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.75rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
    fontFeature: "tnum"
  action:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.2rem"
    fontWeight: 900
    letterSpacing: "0.12em"
  title:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.05rem"
    fontWeight: 700
  body:
    fontFamily: "Noto Sans TC, system-ui, -apple-system, Segoe UI, Microsoft JhengHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  tag: "6px"
  field: "8px"
  button: "10px"
  surface-icefruit: "12px"
  surface-neon: "14px"
  board-neon: "18px"
  board-arch: "44px 44px 10px 10px"
  pill: "999px"
spacing:
  hairline-inset: "6px"
  stack: "14px"
  gutter: "16px"
  result-gutter: "24px"
  column: "480px"
components:
  go-button-icefruit:
    backgroundColor: "{colors.icefruit-espresso}"
    textColor: "{colors.icefruit-btn-ink}"
    typography: "{typography.action}"
    rounded: "14px"
    height: "58px"
  go-button-neon:
    backgroundColor: "{colors.neon-button}"
    textColor: "{colors.neon-pink-pale}"
    typography: "{typography.action}"
    rounded: "14px"
    height: "58px"
  button-primary:
    backgroundColor: "{colors.icefruit-espresso}"
    textColor: "{colors.icefruit-btn-ink}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-primary-neon:
    backgroundColor: "{colors.neon-button}"
    textColor: "{colors.neon-pink-pale}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-accept-icefruit:
    backgroundColor: "{colors.icefruit-terracotta}"
    textColor: "{colors.icefruit-espresso}"
    rounded: "{rounded.button}"
    height: "56px"
  chip-icefruit:
    backgroundColor: "{colors.icefruit-paper}"
    textColor: "{colors.icefruit-espresso}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "3px 11px"
  chip-icefruit-selected:
    backgroundColor: "{colors.icefruit-peacock}"
    textColor: "{colors.icefruit-tile-cream}"
  chip-neon:
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  panel-icefruit:
    backgroundColor: "{colors.icefruit-paper}"
    textColor: "{colors.icefruit-espresso}"
    rounded: "{rounded.surface-icefruit}"
    padding: "16px"
  panel-neon:
    backgroundColor: "{colors.neon-panel}"
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.surface-neon}"
    padding: "16px"
  input-text:
    backgroundColor: "{colors.icefruit-input}"
    textColor: "{colors.icefruit-espresso}"
    rounded: "{rounded.field}"
    padding: "8px 10px"
---

# Design System: SpinEat

## Overview

**Creative North Star: "夜市彈珠台"**

一顆珠子穿過釘陣、落進底部某一格，那一格就是這一餐。整套系統圍繞這個「落格」瞬間建構：檯面佔據畫面中段，底部每個候選一格、格寬固定、格內直書料理名稱；抽中後由結果獨佔整個畫面，料理名稱放到最大。它刻意拒絕這類工具的預設長相（彩虹扇形轉盤擺在白色卡片上）。

兩個主題共用同一副骨架，只換 `css/style.css` 裡的變數與少數裝飾，並依時間自動切換：06:00–17:59 是「老派冰果室」，18:00–05:59 是「夜市霓虹」，設定頁可手動固定其中一個（`js/theme.js`，每分鐘與切回分頁時重新判斷）。冰果室是復古、低彩度的白天：淡芥末黃磁磚牆、孔雀綠檯面、明體招牌字、雙線邊框按鈕、價目牌式的條件標籤，頂端是孔雀綠與米白條紋的波浪遮陽棚。夜市霓虹是靛紫夜空、散景光暈、頂端一串下垂的彩色燈泡，釘子是桃紅、中獎格是會發光的萊姆綠，按鈕是深紫底配桃紅霓虹外框，從不用亮色實底。

密度偏手機單欄：內容欄最寬 480px，桌面上置中，左右空間交給背景（磁磚或散景）延伸。所有裝飾都是 CSS、內嵌 SVG 或 canvas 即時產生，不出貨任何點陣圖。使用者明確避開的方向：太幼稚、太冷、動畫拖慢速度、模板感、廉價感、沉悶色調、亮眼刺目的按鈕；料理 emoji 已依使用者決定全數移除。

**Key Characteristics:**
- 彈珠台檯面是唯一的主角，落格就是決定的瞬間
- 兩個主題、同一副骨架，依時段自動切換
- 抽選序號是畫面上唯一的大數字
- 結果畫面由料理名稱獨佔，只留「就吃這個」與「再抽一次」
- 下落 1.6 秒內完成、再按一次按鈕即跳過；減少動態效果時直接落格
- 檯面是一台有重量的機器：可以拍台推珠子，釘子會抖、落格時整台會沉一下
- 落格時中獎燈閃兩下；按「就吃這個」後七天紀錄的今天蓋上章，讓人看見它記住了
- 裝飾全部由程式產生，無點陣圖

## Colors

兩套調色盤共用同一組語意變數（`--ground`、`--board`、`--pin`、`--lit`、`--btn` 等）；新畫面一律引用變數，不要直接寫色碼。

### Primary
- **孔雀綠檯面**（icefruit-peacock）：冰果室的彈珠台檯面、結果畫面底色、遮陽棚條紋、選中標籤的底色與核取方塊色。
- **夜市檯面靛藍**（neon-board）：夜市的檯面與結果畫面底色。
- **霓虹桃紅**（neon-pink）：夜市的釘子、`--mark`、`--glow`、`--focus`；按鈕霓虹外框、抽選序號、招牌字、選中分頁底線。

### Secondary
- **陶土橘**（icefruit-terracotta）：冰果室的中獎格（`--lit`）與「就吃這個」按鈕底色；也是文字選取色。
- **萊姆螢光綠**（neon-lime）：夜市的中獎格，帶同色光暈（canvas 讀 `--lit-glow: 16`，冰果室為 0 不發光）；只在落格時出現。

### Tertiary
- **招牌赭褐**（icefruit-sign-brown）：冰果室的招呼語、抽選序號（`--display`）與 `--mark`（分頁底線、標籤懸停框、排除範圍標線）。
- **夜市燈泡色組**（#ff5c9a、#d8ff3c、#7a6bff、#ff9a3c、#3cf0ff）：只用於程式產生的散景光點與燈泡串，不進入介面元件。

### Neutral
- **淡芥末磁磚**（icefruit-tile-wall）：冰果室的牆面（`--ground`）與 `theme-color`；深磁磚（icefruit-tile-deep）與米白磁磚（icefruit-tile-cream）是隨機散落的磁磚與米白釘子，磁磚縫是半透明米白 2px 線、28px 間距。
- **深咖啡**（icefruit-espresso）：冰果室主要文字、雙線邊框、硬陰影色、主要按鈕底色；**焦糖棕**（icefruit-umber）是次要文字。
- **米白紙面**（icefruit-paper）：冰果室的面板、標籤、底部導覽與對話框底色，輸入框用更白的 icefruit-input。
- **靛紫夜空**（neon-night）：夜市的牆面、輸入框底色與 `theme-color`；**夜市面板**（neon-panel）是面板與底部導覽。
- **月光白**（neon-moon）與**丁香灰紫**（neon-lilac）：夜市的主要文字與次要文字。
- **危險色**：冰果室 icefruit-danger、夜市 neon-danger，只用於刪除與表單錯誤。

### Named Rules
**落格才發光原則。** 中獎色（陶土橘／萊姆綠）只屬於落中的那一格和接受結果的動作（含接受後七天紀錄「今」格短暫褪掉的蓋章底色）；它不當作一般強調色、不放在其他按鈕或標籤上。

**霓虹不實心原則。** 夜市的按鈕永遠是深紫底（neon-button）配 1.5px 桃紅內框與柔和外光暈；桃紅不作為大面積實底。

## Typography

**Display Font:** Noto Serif TC 900（冰果室）／Noto Sans TC 900（夜市），後備 serif／system-ui
**Body Font:** Noto Sans TC（後備 system-ui、-apple-system、Segoe UI、Microsoft JhengHei）
**Board Font:** 冰果室 Noto Serif TC、夜市 Noto Sans TC，canvas 讀 `--font-board`，700 字重

**Character:** 冰果室的明體粗字像老店招牌與價目牌；夜市換成黑體粗字，搭配霓虹光暈。字體透過 `--font-display` 與 `--font-board` 依主題切換，元件不需各自判斷。

### Hierarchy
- **Result**（900, clamp(3rem, 17vw, 5.25rem), 1.08）：結果畫面的料理名稱，全系統最大的字，只出現在這裡。
- **Display**（900, clamp(1.5rem, 6.4vw, 1.75rem), 1.25, 0.02em）：首頁兩行招呼語、設定頁標題，`text-wrap: balance`。
- **Serial**（900, 1.75rem, 1, 等寬數字）：抽選序號「第 0004 抽」，單位字縮到 0.8rem。
- **Action**（900, 1.2rem, 字距 0.12em；冰果室 0.2em）：「幫我決定！」主按鈕；結果畫面兩顆按鈕用 1.05rem、0.08em。
- **Title**（700, 1.05rem）：面板標題；對話框標題 1.2rem，分頁 0.95rem。
- **Body**（400, 1rem, 1.5）：一般內容；清單列 0.9rem。
- **Label**（700, 0.8rem）：條件標籤；說明與次要資訊用 0.75–0.85rem 的 `--muted`。
- **Board slot**（700, 最大 16px，依格寬縮放，行距 1.14）：格內直書料理名稱，超出時以「︙」截斷。

### Named Rules
**唯一大數字原則。** 抽選序號是首頁唯一的大數字；候選數、天數等其他數字都用小字說明，不放大。

**直書落格原則。** 檯面格內的名稱一律直書、一字一行，格寬固定，切換條件時只換文字不換格子。

## Layout

手機直式單欄：`.app` 最寬 480px、左右 16px 邊距、區塊間距 14px，桌面上置中，背景延伸至全視窗。頂部保留裝飾空間（冰果室 64px 給遮陽棚、夜市 60px 給燈泡串），底部保留 104px 給固定的底部導覽，並都加上 safe-area。

首頁由上而下：招呼語（左）與 SpinEat 招牌、抽選序號（右）→「料理／我的店家」分頁 → 一行條件標籤（可展開調整）→ 彈珠台檯面（高度為寬度的 0.86 倍，上 60% 是 6 排交錯釘陣、下方是最多 8 格的候選格）→ 候選數量說明 → 拇指位置的主按鈕 → 七天紀錄列 → 全部紀錄。標題、分頁、紀錄等文字區塊統一內縮 6px，與檯面外框對齊。

七天紀錄是 7 等分格線（同一基線、固定尺寸），最近 N 天的排除範圍以頂端 2.5px `--mark` 標線表示；按「就吃這個」回來後，「今」格蓋章（見〈七天紀錄蓋章〉）。結果畫面是全螢幕對話框，內距 24px：上方是序號與落格位置小地圖（同格數的一排格子、中獎格亮起），料理名稱推到下半部，按鈕放在拇指區。

## Elevation & Depth

兩個主題的深度語言不同。冰果室是印刷招牌式的平面：深度來自 1.5–2px 深咖啡邊框、雙線內框、以及少數元素上的錯位硬陰影；檯面另有米白與深咖啡兩圈外框加一層柔和落影。夜市是發光式的深度：元件靠桃紅內框與外光暈從夜空中浮起，背景是模糊的散景光點。

### Shadow Vocabulary
- **價目牌硬陰影**（`box-shadow: 2px 2px 0 var(--text)`）：冰果室的 SpinEat 招牌與條件標籤。
- **招牌字硬陰影**（`text-shadow: 4px 4px 0 var(--text)`）：冰果室結果畫面的料理名稱；招呼語用淺色 `2px 2px 0 rgba(255,250,235,.7)`。
- **接受按鈕**（`box-shadow: inset 0 0 0 3px var(--text), inset 0 0 0 5px var(--lit), 3px 3px 0 var(--text)`）：冰果室「就吃這個」。
- **檯面外框**（`box-shadow: 0 0 0 4px var(--tile-b), 0 0 0 6px var(--text), 0 10px 18px rgba(58,43,26,.18)`）：冰果室彈珠台。
- **霓虹按鈕**（`box-shadow: inset 0 0 0 1.5px var(--glow), 0 0 18px rgba(255,92,154,.25)`，懸停 26px／.4）：夜市主按鈕。
- **霓虹檯面**（`box-shadow: 0 0 0 1px rgba(255,92,154,.3), 0 12px 32px rgba(0,0,0,.35)`）：夜市彈珠台。
- **浮層**（`0 18px 48px rgba(0,0,0,.35)`）：店家對話框；提示訊息用 `0 8px 20px rgba(0,0,0,.25)`。

### Named Rules
**價目牌陰影原則。** 冰果室的錯位硬陰影是使用者明確保留的復古招牌手法（2026-10-27 回覆「2.保留」），後續修改不得當作預設手法移除。它只屬於招牌、條件標籤、招呼語、「就吃這個」與結果料理名這幾個招牌類元素；不擴散到面板、輸入框或新元件，夜市主題也不使用。

## Shapes

冰果室偏方正：條件標籤與招牌是 6px 小圓角的價目牌，面板 12px，彈珠台頂端是 44px 的拱形、底部 10px。夜市偏柔和：標籤是膠囊形（999px），面板 14px，檯面 18px。共用的按鈕圓角 10px、主按鈕 14px、輸入框 8px、對話框 16px。冰果室的容器一律換成 1.5px 深咖啡實線邊框；夜市使用低透明度細線。

遮陽棚以 25px 條紋加上半圓波浪下緣構成；釘子是圓點、珠子是帶左上高光的放射漸層球。圖示一律是 24px 網格、1.8 線寬、圓端點的內嵌描邊 SVG。

## Components

### Buttons
- **主按鈕「幫我決定！」：** 高 58px、圓角 14px、全寬，`--btn` 底配 `--btn-ink` 字。冰果室加 3px＋5px 雙線內框；夜市加 1.5px 桃紅內框與外光暈。按下縮放 0.98，停用時透明度 0.45。
- **一般主要按鈕：** 圓角 10px、內距 10px 20px、700 字重；小尺寸 6px 14px／0.85rem。夜市同樣帶 1.5px 桃紅內框。
- **次要按鈕：** 透明底、1.5px currentColor 邊框；夜市改用低透明度線。
- **文字按鈕：** `--muted` 色、懸停變 `--text` 並加底線；刪除用危險色。
- **結果畫面：**「就吃這個」在冰果室是陶土橘底、雙線內框加 3px 硬陰影；「再抽一次」是 2px 米白邊框的次要按鈕。兩顆都高 56px。

### Chips
- **條件標籤：** 冰果室是米白價目牌（6px 圓角、1.5px 深咖啡框、2px 硬陰影、明體 700）；夜市是 7% 白底膠囊配細線。懸停時邊框變 `--mark`。
- **選中：** 冰果室換成孔雀綠底米白字；夜市為 20% 桃紅底、桃紅框、白字。表單中的勾選標籤（chip-check）沿用相同的選中規則。

### Cards / Containers
- **Corner Style：** `--radius`（冰果室 12px、夜市 14px）。
- **Background：** `--surface`。
- **Shadow Strategy：** 無陰影，靠邊框分層。
- **Border：** 冰果室 1.5px 深咖啡實線；夜市 1px `--surface-line`。
- **Internal Padding：** 16px（篩選面板 14px），清單列以頂部細線分隔。

### Inputs / Fields
- **Style：** 1px `--surface-line` 邊框、`--input` 底、8px 圓角、8px 10px 內距；欄位標籤 0.85rem `--surface-muted`。
- **Focus：** 全域 2px `--focus` 外框、offset 2px。
- **Error：** 危險色文字；核取方塊以 `accent-color` 跟主題（孔雀綠／桃紅）。

### Navigation
- **分頁：** 明體 0.95rem，選中時 700 字重加 2.5px `--mark` 底線，下方 1px 分隔線。
- **底部導覽：** 固定在底部、`--surface` 底，冰果室 1.5px 深咖啡頂線，夜市 94% 不透明夜空色；項目為 22px 圖示加 0.75rem 標籤，目前頁加粗（夜市轉桃紅）。

### 彈珠台檯面（Signature）
canvas 繪製、顏色全部讀 CSS 變數。6 排交錯釘陣，珠子碰到釘子時釘子放大並亮起約 260ms；底部最多 8 格，格線與釘子同色，中獎格填入 `--lit`、文字改為 `--lit-ink`。抽中的格子先以等機率決定，再在背景模擬物理、只採用 96 格（約 1.6 秒）內落進該格的軌跡；下落中再按一次主按鈕即直接落格，落格後停 450ms 才進結果畫面。開啟減少動態效果時不播放下落，直接亮格。

**實體手感：** 檯面要像一台沉的木頭機台，不像果凍。
- **拍台：** 下落中點檯面（`pointerdown`，手指一碰就反應）會從手指那一側把珠子往另一邊推，再從珠子當下的位置和速度重新找一條仍落進同一格、前 5 格確實往被推方向走、且不超過 96 格上限的軌跡；推力依序試 100%、55%、25%，都找不到就只有檯面晃、珠子照原路走。結果永遠在按下按鈕時就已決定，拍台只改變過程。不需授權就能讀加速度的手機，甩手機（水平加速度超過 12 m/s²）也算拍台。下落中的說明列改為「拍一下檯面可以推珠子・再按一次按鈕直接落格」。
- **釘子抖動：** 被珠子撞到時沿珠子速度方向、被拍到時從手指往外，以約 14Hz、時間常數 85ms 的阻尼振盪抖 360ms；拍台時手指 70 單位內的釘子越近抖得越大。
- **檯面彈簧：** `.board-wrap` 掛在 11Hz、阻尼比 0.3 的彈簧上（JS 積分、只動 `transform`）。拍台時往遠離手指的方向晃約 3.5px；落格時依落地速度往下沉 0.6–3px；閒置時拍檯面只晃約 1.5px、釘子抖一下。
- **珠子：** 跑快時拖出 4 格長的殘影（`--ball-trail`：冰果室米白、夜市霓虹粉），檯面上有右下方的接觸影子（`--ball-shadow`）。canvas 漸層一律漸到同色透明，不用 `transparent`。
- 減少動態效果時以上全部不做。

**中獎燈：** 落格瞬間，中獎格像彈珠台的中獎燈一樣「亮、暗、亮、暗」各 80ms，共 320ms 後恆亮；暗的時候中獎色降到 35% 透明度、格內文字換回 `--label`。閃燈落在 450ms 停頓之內，不延長抽選。夜市的光暈半徑跟著閃（暗時 40%）。支援震動的手機在落格時輕震 15ms。減少動態效果時不閃、不震，直接恆亮。

**台上空了：** 檯面換成空狀態，文字說明原因，並附一顆次要按鈕直接放寬「能讓台上有東西」的那個條件，依序判斷：這一輪略過的全部放回台上 →「不排除最近吃過的」（關閉排除設定）→「放寬預算和類型」→ 都不行時「調整條件」打開條件面板。放寬後焦點回到主按鈕。「我的店家」沒有啟用中的店家時，改為連到設定頁。

### 結果畫面（Signature）
全螢幕對話框，底色就是檯面色；淡入 0.25s，料理名稱從上方 56px「掉」進來（0.5s，`cubic-bezier(0.16, 1, 0.3, 1)`），減少動態效果時取消。候選只剩一個時，說明列寫「台上只剩這一個了」；連它也按「再抽一次」時，回到首頁後焦點落在「全部放回台上」。

### 七天紀錄蓋章
按「就吃這個」回到首頁時，「今」格的料理名稱像蓋章一樣印上去：從 1.9 倍、轉 -9° 收回原位（0.45s，`cubic-bezier(0.16, 1, 0.3, 1)`，延遲 0.2s），格子底色從 55% 中獎色在 1.4s 內褪成透明。同時的提示訊息說出記住的效果：排除開啟時「記下了！N 天內不會再抽到「名稱」」，關閉時「記下了「名稱」，祝用餐愉快！」。減少動態效果時不做蓋章動作，只保留底色褪掉。

### 主題外觀選項
設定頁以三列表示（依時間自動／老派冰果室／夜市霓虹），每列一個 44px 迷你色票（磁磚牆加拱形檯面、夜空加霓虹框、對角分色），選中時色票外圈 `--mark` 並在右側顯示勾號。

## Do's and Don'ts

### Do:
- **Do** 所有顏色、字體、圓角都透過主題變數（`--ground`、`--board`、`--lit`、`--font-display`、`--radius` 等）引用，讓兩個主題自動成立。
- **Do** 把中獎色只留給落中的格子與「就吃這個」。
- **Do** 冰果室容器用 1.5px 深咖啡實線邊框；夜市用桃紅內框與光暈表現強調。
- **Do** 保留冰果室招牌類元素的錯位硬陰影（使用者 2026-10-27 決定保留）。
- **Do** 背景與裝飾用 CSS、內嵌 SVG 或 canvas 產生，並使用固定種子讓每次載入一致。
- **Do** 每個動畫都提供 `prefers-reduced-motion` 的直接結果路徑，抽選過程控制在約 1.6 秒內且可跳過。
- **Do** 圖示用 24px 網格、1.8 線寬的描邊 SVG。
- **Do** 把回饋放在本來就有的時刻（落格、接受、台上空了），並讓它說出實際作用，例如提示訊息寫出幾天內不會再抽到。

### Don't:
- **Don't** 使用圓形轉盤或彩虹扇形。
- **Don't** 在格內、結果畫面、按鈕或導覽放 emoji（使用者 2026-10-27 決定拿掉）。
- **Don't** 在夜市主題使用亮色實底按鈕，或讓桃紅成為大面積底色。
- **Don't** 把錯位硬陰影擴散到面板、輸入框、新元件，或帶進夜市主題。
- **Don't** 放大抽選序號以外的數字。
- **Don't** 讓抽選動畫超過約 1.6 秒或無法跳過；拍台也不能延長下落。
- **Don't** 讓拍台改變抽中的結果，或把檯面晃到像果凍（拍台約 3.5px、落格最多 3px）。
- **Don't** 為了慶祝效果延長停頓，或替例行點擊加上慶祝；空狀態不要只叫人「放寬條件」而不給按鈕。
- **Don't** 出貨點陣圖裝飾。
