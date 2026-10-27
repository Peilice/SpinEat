---
name: SpinEat
description: 今天吃什麼？白天到廟口求一支籤，晚上去夜市戳一格紙板。
colors:
  temple-ground: "#eee2c6"
  temple-slab: "#e2d2ae"
  temple-text: "#3d1f12"
  temple-muted: "#6b3f25"
  temple-display: "#962415"
  temple-mark: "#a3291a"
  temple-surface: "#fbf5e7"
  temple-input: "#fffaf0"
  temple-board: "#8c2216"
  temple-label: "#fbecc9"
  temple-lit: "#f0bd45"
  temple-btn: "#4a1d12"
  temple-btn-ink: "#f3d27a"
  temple-gold: "#d9a83e"
  temple-lantern: "#c8301f"
  temple-tube: "#4a2414"
  temple-tube-band: "#e7bf5f"
  temple-stick: "#ecd49c"
  temple-bamboo: "#dcb97f"
  temple-lacquer: "#b52a1c"
  temple-danger: "#a3372b"
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
    fontSize: "clamp(2.75rem, 14vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0.02em"
  action:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.2rem"
    fontWeight: 900
    letterSpacing: "0.12em"
  title:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.125rem"
    fontWeight: 700
  body:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.02em"
  small:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  meta:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
  dialog:
    fontFamily: "Noto Serif TC, Noto Sans TC, serif"
    fontSize: "1.25rem"
    fontWeight: 700
  stamp:
    fontFamily: "Iansui, Noto Sans TC, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  plaque: "3px"
  field: "8px"
  button: "10px"
  surface-temple: "10px"
  surface-neon: "14px"
  go-button: "14px"
  dialog: "16px"
  board-neon: "18px"
  pill: "999px"
spacing:
  hairline-inset: "6px"
  stack: "14px"
  gutter: "16px"
  result-gutter: "24px"
  column: "480px"
components:
  go-button-temple:
    backgroundColor: "{colors.temple-btn}"
    textColor: "{colors.temple-btn-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.go-button}"
    height: "58px"
  go-button-neon:
    backgroundColor: "{colors.neon-button}"
    textColor: "{colors.neon-pink-pale}"
    typography: "{typography.action}"
    rounded: "{rounded.go-button}"
    height: "58px"
  button-primary-temple:
    backgroundColor: "{colors.temple-btn}"
    textColor: "{colors.temple-btn-ink}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-primary-neon:
    backgroundColor: "{colors.neon-button}"
    textColor: "{colors.neon-pink-pale}"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-accept-temple:
    backgroundColor: "{colors.temple-lit}"
    textColor: "{colors.temple-text}"
    rounded: "{rounded.button}"
    height: "56px"
  plaque-temple:
    backgroundColor: "{colors.temple-btn}"
    textColor: "{colors.temple-btn-ink}"
    rounded: "{rounded.plaque}"
    padding: "2px 10px"
  chip-temple:
    backgroundColor: "{colors.temple-surface}"
    textColor: "{colors.temple-text}"
    typography: "{typography.label}"
    rounded: "{rounded.plaque}"
    padding: "3px 11px"
  chip-temple-selected:
    backgroundColor: "{colors.temple-board}"
    textColor: "{colors.temple-label}"
  chip-neon:
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  panel-temple:
    backgroundColor: "{colors.temple-surface}"
    textColor: "{colors.temple-text}"
    rounded: "{rounded.surface-temple}"
    padding: "16px"
  panel-neon:
    backgroundColor: "{colors.neon-panel}"
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.surface-neon}"
    padding: "16px"
  input-text:
    backgroundColor: "{colors.temple-input}"
    textColor: "{colors.temple-text}"
    rounded: "{rounded.field}"
    padding: "8px 10px"
---

# Design System: SpinEat

## Overview

**Creative North Star: "抽到的那一張"**

這一餐不是轉出來的數字，而是一件拿在手上的實物：白天在廟口搖籤筒，跳出一支竹籤；晚上在夜市戳破一格紙板，洞裡抽出一張紙條。整套系統圍繞「拿到那一張」的瞬間建構：舞台佔據畫面中段，抽中後結果畫面就是那張籤詩或中獎紙條，料理名稱放到最大。它刻意拒絕這類工具的預設長相（彩虹扇形轉盤擺在白色卡片上）。

兩個主題共用同一副骨架，只換 `css/style.css` 裡的變數與少數裝飾，**而且每個主題配一種抽法**：「廟口朱紅」是求籤、「夜市霓虹」是戳戳樂（使用者 2026-10-27 決定由主題決定抽法，不另設「抽選方式」；同日移除老派冰果室主題與彈珠台）。依時間自動切換：05:00–17:59 廟口、18:00–04:59 夜市；設定頁可手動固定其中一個，舊設定存成冰果室時回到自動（`js/theme.js`，每分鐘與切回分頁時重新判斷；`SpinEatTheme.draw()` 回傳目前主題的抽法，抽到一半換主題時等這一輪結束才換舞台）。廟口是預設主題，也是白天的廟埕：米色長條石板地、頂端朱紅橫樑掛一排紅燈籠、朱紅供桌、檀木底金字的匾額式按鈕與招牌。夜市霓虹是靛紫夜空、散景光暈、頂端一串下垂的彩色燈泡，紙板外圈纏桃紅條紋膠帶、中獎紙條是會發光的萊姆綠，按鈕是深紫底配桃紅霓虹外框，從不用亮色實底。

密度偏手機單欄：內容欄最寬 480px，桌面上置中，左右空間交給背景（石埕或散景）延伸。所有裝飾都是 CSS、內嵌 SVG 或 data URI SVG 遮罩即時產生，不出貨任何點陣圖。使用者明確避開的方向：太幼稚、太冷、動畫拖慢速度、模板感、廉價感、沉悶色調、亮眼刺目的按鈕；料理 emoji 已依使用者決定全數移除。

**Key Characteristics:**
- 舞台是唯一的主角：廟口是朱紅供桌與籤筒，夜市是 24 格戳戳樂紙板，兩者同尺寸
- 兩個主題、同一副骨架、各配一種抽法，依時段自動切換
- 結果畫面是抽到的實物（籤詩／中獎紙條），由料理名稱獨佔，只留「就吃這個」與「再抽一次」
- 抽選約 1–1.6 秒內完成、再按一次按鈕即跳過；減少動態效果時直接出結果
- 結果在按下的那一刻就以等機率決定，舞台只負責演出
- 按「就吃這個」後七天紀錄的今天蓋上章，讓人看見它記住了
- 裝飾全部由程式產生，無點陣圖

## Colors

兩套調色盤共用同一組語意變數（`--ground`、`--board`、`--lit`、`--btn`、`--mark` 等）；新畫面一律引用變數，不要直接寫色碼。只屬於某一種抽法的變數（廟口的 `--tube`、`--stick`、`--lacquer`，夜市的 `--pin`、`--glow`）只定義在該主題。

### Primary
- **廟口朱紅**（temple-board `#8c2216`，`--board`／`--beam`）：供桌、結果畫面底色、頂端橫樑、選中標籤與核取方塊色、`theme-color`。招呼語用略亮的 `#962415`（`--display`），`--mark` 與 `--focus` 是 `#a3291a`／`#8c2216`。
- **匾額金**（`--gold` `#d9a83e`、`--btn-ink` `#f3d27a`）與**檀木**（`--btn` `#4a1d12`）：廟口的按鈕、招牌、「有求必應」小匾額，一律是檀木底、金字、金色細框；供桌外圈也是金邊加檀木框。
- **夜市檯面靛藍**（neon-board）：夜市的紙板底與結果畫面底色。
- **霓虹桃紅**（neon-pink，`--pin`／`--glow`／`--mark`／`--focus`）：戳戳樂招牌字、紙板膠帶條紋、瞄準格外框；按鈕霓虹外框、選中分頁底線。

### Secondary
- **中獎金**（temple-lit `#f0bd45`）：廟口的 `--lit`，只用在「就吃這個」與文字選取色。
- **萊姆螢光綠**（neon-lime）：夜市的 `--lit`，戳中那格的紙條、結果畫面的中獎紙條，帶同色光暈。

### Tertiary
- **求籤器物色**：籤筒檀木 `--tube` `#4a2414`、筒口 `--tube-rim` `#2e150b`、金箍 `--tube-band` `#e7bf5f`；竹籤本色 `--bamboo-tone` `#dcb97f`、籤紙米色 `--stick` `#ecd49c`、籤頭朱漆 `--lacquer` `#b52a1c`、朱墨籤號 `--stick-no` `#8c2216`；燈籠 `--lantern` `#c8301f`。
- **戳戳樂色紙**：桃紅點點 `#e8467f`、橘黃斜線 `#f0a338`、青色格子 `#2fb5e0`、素紫（`--btn` 漸層）；膠帶條紋是桃紅與 `#f4dbe8`。只用在封紙與膠帶，不進入介面元件。
- **夜市燈泡色組**（#ff5c9a、#d8ff3c、#7a6bff、#ff9a3c、#3cf0ff）：只用於程式產生的散景光點與燈泡串。

### Neutral
- **石埕米色**（temple-ground `#eee2c6`）：廟口的牆面（`--ground`）；深一點的石板 `--slab` `#e2d2ae` 隨機散落，石縫是 16% 褐色 2px 線、56px 一排錯縫長石。
- **檀木深褐**（temple-text `#3d1f12`）：廟口主要文字；次要文字 `#6b3f25`。
- **籤紙米白**（temple-surface `#fbf5e7`）：廟口的面板、標籤、底部導覽與對話框底色，輸入框用 `#fffaf0`。
- **靛紫夜空**（neon-night）：夜市的牆面、輸入框底色與 `theme-color`；**夜市面板**（neon-panel）是面板與底部導覽。
- **月光白**（neon-moon）與**丁香灰紫**（neon-lilac）：夜市的主要文字與次要文字。
- **危險色**：廟口 `#a3372b`、夜市 neon-danger，只用於刪除與表單錯誤。

### Named Rules
**中獎才發光原則。** 中獎色（金／萊姆綠）只屬於抽中的那一張（戳中那格的紙條、結果畫面的中獎紙條）和接受結果的動作（含接受後七天紀錄「今」格短暫褪掉的蓋章底色）；它不當作一般強調色、不放在其他按鈕或標籤上。

**霓虹不實心原則。** 夜市的按鈕永遠是深紫底（neon-button）配 1.5px 桃紅內框與柔和外光暈；桃紅不作為大面積實底（膠帶條紋例外，它只是 6px 外框）。

**匾額原則。** 廟口的強調用匾額語言（檀木底、金字、金色細框）；朱紅只作供桌、橫樑、籤詩橫帶與選中狀態的大面積底色，金色不當文字以外的大面積底色（「就吃這個」除外）。

## Typography

**Display Font:** Noto Serif TC 900（廟口）／Noto Sans TC 900（夜市），後備 serif／system-ui
**Body Font:** Noto Sans TC（後備 PingFang TC、Microsoft JhengHei、system-ui）
**Hand Font:** Iansui（芫荽），只用在戳戳樂的剩餘格數印章（`--hand`）

**Character:** 廟口的明體粗字像匾額與籤詩；夜市換成黑體粗字，搭配霓虹光暈。字體透過 `--font-display` 依主題切換，元件不需各自判斷。

**載入：** Google Fonts 只載 Noto Sans TC 400／700／900 與 Noto Serif TC 700／900，`display=swap`；Iansui 只在首頁以 `text=` 子集載入「剩格0123456789」。明體沒有 400，凡是用 `--font-display` 的元件只能在 700 與 900 之間做粗細對比（例如分頁：未選中 700、選中 900）。

### 字級階梯
五個變數，兩個主題共用，新元件一律引用、不寫字面值：`--fs-meta` 0.75rem、`--fs-small` 0.875rem、`--fs-body` 1rem、`--fs-title` 1.125rem、`--fs-dialog` 1.25rem。相鄰兩階至少差 2px；要再分層級時換顏色（`--muted`）或粗細，不另開字級。以下 Result、Display、Action 是階梯外的招牌角色，各自只用在指定位置。

### Hierarchy
- **Result**（900, clamp(2.75rem, 14vw, 4.5rem), 1.1）：結果畫面的料理名稱，全系統最大的字，只出現在這裡。
- **Display**（900, clamp(1.5rem, 6.4vw, 1.75rem), 1.25, 0.02em）：首頁招呼語、設定頁標題，`text-wrap: balance`。
- **Action**（900, 1.2rem, 字距 0.12em；廟口 0.2em）：「幫我決定！」主按鈕；結果畫面兩顆按鈕用 `--fs-title`、0.08em。
- **Title**（700, `--fs-title`）：面板標題、籤詩橫帶「第○籤」；對話框標題與戳戳樂招牌用 `--fs-dialog`；分頁與「這七天」用 `--fs-body`。
- **Body**（400, `--fs-body`, 1.6）：一般內容、輸入框、外觀選項名稱。
- **Small**（400, `--fs-small`）：說明（`.panel-note` 行高 1.7）、欄位標籤、紀錄列、候選數、提示訊息、次要與文字按鈕、封紙格號。
- **Label**（700, `--fs-small`）：條件標籤與表單勾選標籤。
- **Meta**（400, `--fs-meta`）：七天格、日期、徽章、底部導覽、圖例、戳戳樂紙條、籤號；這是最小字級，不再往下縮。
- **Stage 字**：求籤的籤上直書料理名 `--fs-dialog`（超過四個字或窄版供桌降一階），籤號朱墨 `--fs-meta`；戳戳樂紙條 700 `--fs-meta`、行高 1.15，中獎那張 900。

### Named Rules
**數字不放大原則。** 候選數、天數、剩餘格數等數字都用小字說明，不放大。

**直書出籤原則。** 竹籤上的字一律直書（`writing-mode: vertical-rl`、`text-orientation: upright`），料理名寫在籤頭下、籤號落在籤尾；籤寬固定，名稱太長時降字級，不加寬籤身。

**中文排版原則。** 標題類（招呼語、結果料理名、籤上料理名、面板與對話框標題）開 `font-feature-settings: "palt"`，全形標點收成半寬；說明文字用 `text-wrap: pretty`，避免最後一行只剩一個字。內文字距廟口 0.02em、夜市深底淺字 0.03em（`--track`）；七天格歸零以塞進窄格。計數、日期、格號用等寬數字。

## Layout

手機直式單欄：`.app` 最寬 480px、左右 16px 邊距、區塊間距 14px，桌面上置中，背景延伸至全視窗。頂部保留裝飾空間（廟口 92px 給 76px 高的橫樑燈籠、夜市 60px 給燈泡串），底部保留 104px 給固定的底部導覽，並都加上 safe-area。

首頁由上而下：招呼語（左）與 SpinEat 招牌（右）→「料理／我的店家」分頁 → 一行條件標籤（可展開調整）→ 抽選舞台（供桌或紙板，寬高比都是 1 : 0.86，換主題時版面不跳）→ 候選數量說明 → 拇指位置的主按鈕 → 七天紀錄列 → 全部紀錄。標題、分頁、紀錄等文字區塊統一內縮 6px，與舞台外框對齊。

七天紀錄是 7 等分格線（同一基線、固定尺寸），最近 N 天的排除範圍以頂端 2.5px `--mark` 標線表示；按「就吃這個」回來後，「今」格蓋章（見〈七天紀錄蓋章〉）。結果畫面是全螢幕對話框，內距 24px：右上只有「返回」，中段是抽到的那一張（見〈結果畫面〉），下面是說明列與地圖連結，按鈕放在拇指區。

## Elevation & Depth

兩個主題的深度語言不同。廟口是木作與金邊的深度：匾額類元素用多層 inset 金框（`inset 0 0 0 1.5px gold, inset 0 0 0 3px 底色, inset 0 0 0 4px gold`）加柔和落影，供桌是金邊＋檀木框＋柔和落影，籤用 `filter: drop-shadow` 落影（形狀由遮罩剪出，`box-shadow` 會畫成方框）；不用錯位硬陰影。夜市是發光式的深度：元件靠桃紅內框與外光暈從夜空中浮起，背景是模糊的散景光點。

### Shadow Vocabulary
- **匾額**（`inset 0 0 0 1.5px var(--gold), inset 0 0 0 3px var(--btn), inset 0 0 0 4px var(--gold), 0 3px 8px rgba(61,31,18,.22)`）：廟口的 SpinEat 招牌；「有求必應」小匾額同一做法、落影加深到 `0 6px 12px`。
- **匾額按鈕**（`inset 0 0 0 3px var(--btn), inset 0 0 0 4.5px var(--gold), 0 6px 14px rgba(61,31,18,.25)`）：廟口主按鈕；一般主要按鈕只留 1.5px 金色內框。
- **供桌**（`0 0 0 3px var(--gold), 0 0 0 5px var(--btn), 0 12px 22px rgba(61,31,18,.24)`）：廟口舞台，裡面再加一道 9px 內縮、40% 金色細線。
- **竹籤**（`filter: drop-shadow(2px 8px 6px rgba(46,21,11,.45))`）：出籤與結果畫面的那支籤。
- **接受按鈕**（`inset 0 0 0 3px var(--lit), inset 0 0 0 4.5px var(--btn), 0 8px 18px rgba(46,21,11,.35)`）：廟口「就吃這個」。
- **霓虹按鈕**（`box-shadow: inset 0 0 0 1.5px var(--glow), 0 0 18px rgba(255,92,154,.25)`，懸停 26px／.4）：夜市主按鈕。
- **紙板**（`0 12px 32px rgba(0,0,0,.35)`）：夜市戳戳樂；瞄準格外加 `0 0 16px` 桃紅光暈。
- **中獎紙條**（`filter: drop-shadow(0 0 22px rgba(216,255,60,.35)) drop-shadow(0 14px 16px rgba(0,0,0,.45))`）：夜市結果畫面，掛在外層才不會被撕痕遮罩切掉。
- **浮層**（`0 18px 48px rgba(0,0,0,.35)`）：店家對話框；提示訊息用 `0 8px 20px rgba(0,0,0,.25)`。

### Named Rules
**遮罩形狀用 drop-shadow 原則。** 凡是用 `mask` 剪出輪廓的元素（竹籤、撕痕紙條、殘紙），陰影與光暈一律放在外層的 `filter: drop-shadow`，不要用 `box-shadow`。

## Shapes

廟口偏方正：條件標籤與招牌是 3px 直角的籤條與匾額，面板與供桌 10px。夜市偏柔和：標籤是膠囊形（999px），面板 14px，紙板 18px。共用的按鈕圓角 10px、主按鈕 14px、輸入框 8px、對話框 16px。容器邊框用低透明度細線（`--surface-line`）；廟口底部導覽改為 2px 朱紅頂線。

竹籤的籤頭是一個 40×80 的葫蘆輪廓 SVG（`--qian-head`），竹身另以一塊 90% 寬的矩形遮罩接上；窄版供桌（容器寬 380px 以下）籤縮成 34×66。戳戳樂的洞與封紙是以格高 74% 為直徑的正圓，戳破後的殘紙是每格各自隨機產生的鋸齒環形遮罩（`--tear`）。圖示一律是 24px 網格、1.8 線寬、圓端點的內嵌描邊 SVG。

## Components

### Buttons
- **主按鈕「幫我決定！」：** 高 58px、圓角 14px、全寬，`--btn` 底配 `--btn-ink` 字。廟口加 3px＋4.5px 金色內框的匾額做法；夜市加 1.5px 桃紅內框與外光暈。按下縮放 0.98，停用時透明度 0.45。
- **一般主要按鈕：** 圓角 10px、內距 10px 20px、700 字重；小尺寸 6px 14px／`--fs-small`。廟口帶 1.5px 金色內框，夜市帶 1.5px 桃紅內框。
- **次要按鈕：** 透明底、1.5px currentColor 邊框；夜市改用低透明度線。
- **文字按鈕：** `--muted` 色、懸停變 `--text` 並加底線；刪除用危險色。
- **結果畫面：**「就吃這個」在廟口是中獎金底、檀木內框加落影，夜市是霓虹按鈕；「再抽一次」是半透明淺色邊框的次要按鈕。兩顆都高 56px。

### Chips
- **條件標籤：** 廟口是米白籤條（3px 圓角、45% 朱紅細框、明體 700）；夜市是 7% 白底膠囊配細線。懸停時邊框變 `--mark`。
- **選中：** 廟口換成朱紅底、淺米字；夜市為 20% 桃紅底、桃紅框、白字。表單中的勾選標籤（chip-check）沿用相同的選中規則。

### Cards / Containers
- **Corner Style：** `--radius`（廟口 10px、夜市 14px）。
- **Background：** `--surface`。
- **Shadow Strategy：** 無陰影，靠邊框分層。
- **Border：** 1px `--surface-line`。
- **Internal Padding：** 16px（篩選面板 14px），清單列以頂部細線分隔。

### Inputs / Fields
- **Style：** 1px `--surface-line` 邊框、`--input` 底、8px 圓角、8px 10px 內距；欄位標籤 `--fs-small` `--surface-muted`。
- **Focus：** 全域 2px `--focus` 外框、offset 2px。
- **Error：** 危險色文字；核取方塊以 `accent-color` 跟主題（朱紅／桃紅）。

### Navigation
- **分頁：** `--font-display` `--fs-body`，未選中 700、選中 900 加 2.5px `--mark` 底線，下方 1px 分隔線。
- **底部導覽：** 固定在底部、`--surface` 底，廟口 2px 朱紅頂線，夜市 94% 不透明夜空色；項目為 22px 圖示加 `--fs-meta` 標籤，目前頁加粗並轉 `--mark`（夜市轉桃紅）。

### 求籤（廟口的抽法，Signature）
廟口主題的舞台是一張朱紅供桌（`.temple`），由 `js/fortune.js` 負責演出。供桌外圈金邊、檀木框，裡面一道細金線像神龕的框；左上掛「有求必應」小匾額，左下是籤筒（內嵌 SVG，檀木筒、金色箍與「籤」字，最多畫 12 支籤，每支是竹片加縮小版葫蘆朱漆籤頭，下半截藏在筒身後），右邊是供桌上刻出的一道淺槽（深色內陰影加一道金色反光，不用虛線框），寫著「點籤筒求一支籤」。

點籤筒（`pointerdown`）、按主按鈕或搖手機（不需授權的裝置，水平加速度超過 12 m/s²）都會求籤：籤筒以底部為軸晃 650ms，筒裡少一支，一支竹籤從筒口跳出、落到籤位立好（520ms），支援震動的手機輕震 15ms，再停 450ms 進結果畫面，總長約 1.6 秒。出籤後刻槽隱藏，免得從籤頭雕出的缺口露出來。

**竹籤：** 偏褐的竹片（`--bamboo`：兩側圓弧暗邊、中間一道反光、細細的直纖維）；籤頭朱漆雕成葫蘆般起伏的輪廓（`--qian-head` 遮罩），細頸壓暗、鼓起受光（`--lacquer-face`），漆在肩下多塗一截並收一道暗線。料理名直書寫在籤頭下，籤號用朱墨寫在籤尾。

結果在按下時就決定，籤號是它在候選裡的順序（國字，`SpinEatFortune.numeral`）；出籤中再按一次主按鈕直接出籤，說明列改為「再按一次按鈕直接出籤」。不做擲筊：使用者 2026-10-27 選了「求籤，但不要擲筊」。減少動態效果時不晃、不飛，直接亮出籤，停頓縮為 200ms。

### 戳戳樂（夜市的抽法，Signature）
夜市主題的舞台是一張戳戳樂紙板（`.poke-sheet`），由 `js/poke.js` 負責。紙板外圈纏一道 6px 桃紅條紋膠帶；頂端印霓虹桃紅的「戳戳樂」招牌、「挑一格戳下去」，右側斜 -8° 蓋一枚手寫字的印章「剩 N 格」。下面 6×4 共 24 格，每格貼一張色紙封住洞口：桃紅點點、橘黃斜線、青色格子或素紫，每換一張紙板重新隨機貼，左邊和上面那格不貼同一種；萊姆綠留給中獎。封紙印格號、帶 35% 白色細框。

手指一碰沒戳過的格子就戳（`pointerdown`），按「幫我決定！」則先在幾格之間跳 5 下（每下 70ms）再戳。被瞄準或懸停的那格放大 1.1 倍、整圈桃紅亮起，讓「手指在格子間跳」看得出來。戳下去封紙先凹再彈回（240ms）、噴出 5 片紙屑，中間破開一個鋸齒洞、留一圈殘紙；洞裡冒出一小卷紙條、再攤開橫在洞口（420ms），紙條上寫料理名、各自歪一點；這次戳中的紙條是萊姆綠中獎色並發光。支援震動的手機輕震 15ms，再停 450ms 進結果畫面。

抽中哪一個在戳下去時以等機率決定，格子只決定位置。戳過的洞會留著（顯示被略過的料理），換條件、按「就吃這個」或 24 格戳完時才換一張新紙板，殘紙破法與紙條角度也重抽。抽到一半再按一次主按鈕直接戳下去；減少動態效果時不跳、不破，直接亮出紙條。

### 候選空了
舞台換成空狀態（`.board-empty`，底色 `--board`、形狀跟著舞台），文字說明原因，並附一顆次要按鈕直接放寬「能讓候選變多」的那個條件，依序判斷：這一輪略過的「全部放回候選」→「不排除最近吃過的」（關閉排除設定）→「放寬預算和類型」→ 都不行時「調整條件」打開條件面板。放寬後焦點回到主按鈕。清單本身沒有啟用中的項目時，改為連到設定頁（新增／管理店家或料理）。

### 結果畫面（Signature）
全螢幕對話框，底色就是舞台色（廟口加一層頂端偏亮的朱紅放射漸層）。結果本身是「抽到的那一張實物」，置中放在畫面中段，下面是說明列（「從 N 個候選中抽出・已避開…」）、地圖連結和兩顆按鈕；右上只留「返回」。頂端直接借首頁已畫好的橫樑燈籠／燈泡串（`.result-decor`，由 `renderDecor()` 複製 `.awning`，夜市再複製 `.backdrop` 的光暈），讓結果畫面仍在同一個場景裡。紙上都有一張三欄小表格（類型／預算／餐別，沒有值的欄不畫，`<dl>`），用直線（廟口）或虛線（夜市）分欄。小地圖由 `renderMap` 依抽法畫在 `.lane`。
- **廟口・籤詩：** 米色籤紙（`--stick`，上方略亮）配 1.5px 金邊；頂端是 46px 朱紅橫帶，金字寫「第○籤」，做法跟供桌匾額相同；橫帶下方是 3px 朱紅雙線框。料理名稱用朱紅明體（`--display`）。抽到的那支竹籤（40×190）斜 9° 靠在籤詩右上角後面，露出籤頭和朱墨籤號。四周加一道 40% 金色細線，像神龕的框。
- **夜市・中獎紙條：** 縮小的戳戳樂紙板（6 欄 28px 圓點，暗底、桃紅細框；戳過的洞是暗的，戳中的那格發萊姆綠光）。萊姆綠紙條（`--lit` 底、`--lit-ink` 字）斜 -2.5°，壓在紙板下緣，上緣咬出一排撕痕（`mask`），「戳開第 N 格」與小表格以虛線分隔。這是中獎色唯一允許的大面積用法，因為它就是戳中的那張紙條。
- **進場：** 整體淡入 0.25s。廟口的籤詩由上往下展開（`clip-path`，0.6s，`cubic-bezier(0.16, 1, 0.3, 1)`），籤在 0.4s 時從紙後往上靠上去；夜市的紙條從紙板裡彈出來（0.5s，`cubic-bezier(0.34, 1.56, 0.64, 1)`，以上緣為軸）。減少動態效果時全部取消。
- **只剩一個：** 候選只剩一個時，說明列寫「籤筒裡只剩這一支了」（廟口）或「只剩這一個候選了」（夜市）；連它也按「再抽一次」時，回到首頁後焦點落在「全部放回候選」。

### 七天紀錄蓋章
按「就吃這個」回到首頁時，「今」格的料理名稱像蓋章一樣印上去：從 1.9 倍、轉 -9° 收回原位（0.45s，`cubic-bezier(0.16, 1, 0.3, 1)`，延遲 0.2s），格子底色從 55% 中獎色在 1.4s 內褪成透明。同時的提示訊息說出記住的效果：排除開啟時「記下了！N 天內不會再抽到「名稱」」，關閉時「記下了「名稱」，祝用餐愉快！」。減少動態效果時不做蓋章動作，只保留底色褪掉。

### 主題外觀選項
設定頁以三列表示（依時間自動／夜市霓虹／廟口朱紅），說明文字只寫抽法（「戳戳樂」「求籤」；自動寫「白天廟口，晚上夜市霓虹」）。每列一個 44px 迷你色票（夜空加霓虹框檯面、石埕加朱紅橫樑與金框供桌、自動是朱紅與夜空兩半斜切），選中時色票外圈 `--mark` 並在右側顯示勾號。

### 抽選動畫選項
外觀面板下方的「抽選動畫」：跟隨系統（預設）／一律播放，沿用同樣的選項列但沒有色票，焦點框畫在文字上。本文件裡所有「減少動態效果時」的規則，都只在系統要求減少動態效果、**而且**選的是「跟隨系統」時才成立；選「一律播放」時，搖籤筒、出籤、瞄準、戳破、結果進場和蓋章都照常播放。`theme.js` 在 `<html>` 標上 `data-motion="always|system"`，CSS 的減少動態效果規則以 `:root:not([data-motion="always"])` 限定，JS 以 `calm()` 判斷。「跟隨系統」的說明文字直接寫出這台裝置目前是否要求減少動態效果，讓人知道沒有動畫的原因（這個選項是因為 iPhone 在使用者以為已關閉時仍回報減少動態效果而加的）。

## Do's and Don'ts

### Do:
- **Do** 所有顏色、字體、圓角都透過主題變數（`--ground`、`--board`、`--lit`、`--font-display`、`--radius` 等）引用，讓兩個主題自動成立。
- **Do** 廟口的強調用匾額語言（檀木底、金字、金色細框）。
- **Do** 把中獎色只留給抽中的那一張與「就吃這個」。
- **Do** 夜市用桃紅內框與光暈表現強調。
- **Do** 遮罩剪出的形狀用 `filter: drop-shadow` 上陰影。
- **Do** 背景與裝飾用 CSS、內嵌 SVG 或 data URI SVG 產生；背景圖樣使用固定種子讓每次載入一致，殘紙與色紙這類「每張紙板不同」的細節才用隨機。
- **Do** 每個動畫都提供減少動態效果的直接結果路徑，抽選過程控制在約 1.6 秒內且可跳過。
- **Do** 圖示用 24px 網格、1.8 線寬的描邊 SVG。
- **Do** 把回饋放在本來就有的時刻（出籤、戳破、接受、候選空了），並讓它說出實際作用，例如提示訊息寫出幾天內不會再抽到。

### Don't:
- **Don't** 使用圓形轉盤或彩虹扇形。
- **Don't** 在籤上、紙條上、結果畫面、按鈕或導覽放 emoji（使用者 2026-10-27 決定拿掉）。
- **Don't** 在夜市主題使用亮色實底按鈕，或讓桃紅成為大面積底色。
- **Don't** 使用錯位硬陰影（那是已移除的冰果室主題的手法）。
- **Don't** 放大數字。
- **Don't** 讓抽選動畫超過約 1.6 秒或無法跳過。
- **Don't** 讓舞台上的操作（點哪一格、搖幾下）改變抽中的機率；結果永遠在按下時以等機率決定。
- **Don't** 加回擲筊或另設「抽選方式」選項；抽法由主題決定。
- **Don't** 為了慶祝效果延長停頓，或替例行點擊加上慶祝；空狀態不要只叫人「放寬條件」而不給按鈕。
- **Don't** 出貨點陣圖裝飾。
