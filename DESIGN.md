---
name: SpinEat
description: 今天吃什麼？問一下就知道：白天在廟口求一支籤，晚上在夜市戳一格紙板。
colors:
  temple-ground: "#e9dab9"
  temple-slab: "#dccb9f"
  temple-text: "#3d1f12"
  temple-muted: "#6b3f25"
  temple-display: "#962415"
  temple-mark: "#a3291a"
  temple-surface: "#f5ebd2"
  temple-surface-muted: "#6e4329"
  temple-input: "#faf2df"
  temple-board: "#86281b"
  temple-label: "#fbecc9"
  temple-label-muted: "#f0cfa8"
  temple-lit: "#f0bd45"
  temple-btn: "#4a1d12"
  temple-btn-ink: "#e8c97c"
  temple-gold: "#c99c48"
  temple-lantern: "#b9402b"
  temple-tube: "#4a2414"
  temple-tube-rim: "#2e150b"
  temple-tube-band: "#d6b064"
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
  neon-label-muted: "#c9c2f0"
  neon-danger: "#ff8a98"
typography:
  result:
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
    fontSize: "clamp(2.75rem, 14vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "0.02em"
  display:
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
    fontSize: "clamp(1.5rem, 6.4vw, 1.75rem)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "0.02em"
  action:
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
    fontSize: "1.2rem"
    fontWeight: 900
    letterSpacing: "0.12em"
  dialog:
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
    fontSize: "1.25rem"
    fontWeight: 700
  title:
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
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
    fontFamily: "Noto Serif TC, Noto Sans TC, PingFang TC, serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  meta:
    fontFamily: "Noto Sans TC, PingFang TC, Microsoft JhengHei, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
  stamp:
    fontFamily: "Iansui, Noto Sans TC, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  plaque: "3px"
  field: "8px"
  surface-temple: "10px"
  button: "10px"
  surface-neon: "14px"
  go-button: "14px"
  dialog: "16px"
  board-neon: "18px"
  pill: "999px"
spacing:
  hairline-inset: "6px"
  stack: "14px"
  gutter: "16px"
  panel: "16px"
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
  button-accept-temple:
    backgroundColor: "{colors.temple-lit}"
    textColor: "{colors.temple-text}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: "56px"
  button-accept-neon:
    backgroundColor: "{colors.neon-button}"
    textColor: "{colors.neon-pink-pale}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: "56px"
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
    rounded: "{rounded.plaque}"
  chip-neon:
    textColor: "{colors.neon-moon}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "3px 11px"
  chip-neon-selected:
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.pill}"
  panel-temple:
    backgroundColor: "{colors.temple-surface}"
    textColor: "{colors.temple-text}"
    rounded: "{rounded.surface-temple}"
    padding: "{spacing.panel}"
  panel-neon:
    backgroundColor: "{colors.neon-panel}"
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.surface-neon}"
    padding: "{spacing.panel}"
  input-temple:
    backgroundColor: "{colors.temple-input}"
    textColor: "{colors.temple-text}"
    rounded: "{rounded.field}"
    padding: "8px 10px"
  input-neon:
    backgroundColor: "{colors.neon-night}"
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.field}"
    padding: "8px 10px"
  stage-temple:
    backgroundColor: "{colors.temple-board}"
    textColor: "{colors.temple-label}"
    rounded: "{rounded.surface-temple}"
  stage-neon:
    backgroundColor: "{colors.neon-board}"
    textColor: "{colors.neon-moon}"
    rounded: "{rounded.board-neon}"
---

# Design System: SpinEat

## Overview

**Creative North Star: "問一下就知道"**

SpinEat 把「今天吃什麼」變成一個問了就有答案的小儀式。白天像在廟口搖籤筒，跳出一支竹籤；晚上像在夜市戳破一格紙板，洞裡抽出一張紙條。兩種問法都源自台灣人本來就會做的事，所以不用教：看到籤筒就知道要搖，看到紙板就知道要戳。儀式要有期待感，但它是為了「快點得到答案」服務的。整段抽選約在 1.6 秒內演完，再按一次就跳過，結果在按下的那一刻就以等機率決定，舞台只負責演出。

兩個主題共用同一副骨架，只換 `css/style.css` 的語意變數與少數裝飾，每個主題對應一種問法：「廟口朱紅」是求籤，「夜市霓虹」是戳戳樂。05:00–17:59 自動用廟口，18:00–04:59 自動用夜市，設定頁也可以固定其中一個（`js/theme.js` 每分鐘、以及切回分頁時重新判斷；抽到一半換主題時，等這一輪結束才換舞台）。廟口是白天的廟埕：米色長條石板地，頂端是朱紅橫樑掛一排紅燈籠，舞台是朱紅供桌，按鈕和招牌是檀木底金字的匾額。夜市是靛紫夜空，有散景光暈，頂端掛一串下垂的彩色燈泡，舞台是纏著桃紅條紋膠帶的紙板，按鈕是深紫底配霓虹桃紅框。

畫面上每個元素都屬於場景：條件標籤在廟口是籤條，在夜市是霓虹膠囊；底部導覽在廟口壓一道朱紅頂線；結果畫面借用首頁的橫樑或燈泡串，讓人感覺還站在同一個地方。密度是手機單欄，桌面上置中，左右空間留給石埕或散景延伸。背景、燈籠、燈泡、籤、封紙都由 CSS、內嵌 SVG 或 data URI 遮罩即時產生。

**Key Characteristics:**
- 一問一答：按下就決定結果，舞台演出約 1.6 秒，隨時可以跳過
- 兩個場景、同一副骨架：白天廟口求籤，晚上夜市戳戳樂，依時段切換
- 舞台是視覺主角，兩個主題的舞台同尺寸（寬高比 1 : 0.86），換主題時版面不跳動
- 結果是拿在手上的一件東西：籤詩或中獎紙條，料理名稱放到最大
- 每個元件都帶場景的材質，沒有中性的「通用元件」
- 回饋放在本來就會發生的時刻（出籤、戳破、接受、蓋章），並說出實際作用

## Colors

兩套調色盤共用同一組語意變數（`--ground`、`--surface`、`--board`、`--lit`、`--btn`、`--mark`、`--focus` 等），元件一律引用變數，主題自然成立。只屬於某一種問法的變數只定義在該主題：廟口的 `--tube`、`--stick`、`--bamboo-tone`、`--lacquer`、`--gold`，夜市的 `--pin`、`--glow`。

### Primary
- **供桌朱紅**（temple-board，`--board`／`--beam`）：廟口的舞台底色、結果畫面底色、頂端橫樑、選中的條件標籤、核取方塊、`theme-color`。舞台與結果畫面上方疊一層略亮的 `#a12a1b` 放射漸層，像頂光打在供桌上。
- **春聯朱**（temple-display）與 **廟門朱**（temple-mark）：招呼語與籤詩上的料理名用春聯朱；分頁底線、排除範圍標線、目前頁的導覽用廟門朱。
- **戳戳樂檯面**（neon-board）：夜市的紙板底與結果畫面底色。
- **招牌霓虹**（neon-pink，`--pin`／`--glow`／`--mark`／`--focus`）：「戳戳樂」招牌字、膠帶條紋、瞄準格的光圈、按鈕的霓虹框、選中分頁底線。

### Secondary
- **匾額檀木**（temple-btn）與 **匾額金字**（temple-btn-ink）：廟口所有按鈕與招牌的底色和字色。
- **神龕金邊**（temple-gold）：匾額內框、供桌外圈、籤詩邊框；只畫線，不畫大面積。
- **攤車深紫**（neon-button）與 **霓虹餘光**（neon-pink-pale）：夜市所有按鈕的底色和字色。

### Tertiary
- **光明燈金**（temple-lit）與 **中獎螢光**（neon-lime）：兩個主題的 `--lit`，是中獎專用色（見下方 Named Rules）。
- **籤具**：籤筒檀木（temple-tube）、筒口（temple-tube-rim）、籤筒金箍（temple-tube-band）、竹籤本色（temple-bamboo）、籤紙米黃（temple-stick，也是籤詩的紙色）、籤頭朱漆（temple-lacquer）；籤號用朱墨 `--stick-no`（等於供桌朱紅）。燈籠紅（temple-lantern）只畫在橫樑燈籠上。
- **戳戳樂封紙**：桃紅點點 `#e8467f`、橘黃斜線 `#f0a338`、青色格子 `#2fb5e0`、素紫（攤車深紫漸層）；膠帶條紋是招牌霓虹與 `#f4dbe8`。普通紙條是 `#d6cfee` 底、`#2b2270` 字。這些顏色只出現在紙板上。
- **夜市燈泡**（#ff5c9a、#d8ff3c、#7a6bff、#ff9a3c、#3cf0ff）：只用在程式產生的散景光點與燈泡串。

### Neutral
- **廟埕石板**（temple-ground）：廟口的牆面；**深色石板**（temple-slab）隨機散落，石縫是 16% 褐色 2px 線，一排 56px、錯縫鋪設。
- **廟柱深褐**（temple-text）與 **廊下褐**（temple-muted）：廟口的主要與次要文字；面板裡的次要文字用略亮的 temple-surface-muted。
- **籤詩紙**（temple-surface）：廟口的面板、條件標籤、底部導覽、對話框；**香案白**（temple-input）是輸入框。
- **燭光米**（temple-label）與 temple-label-muted：寫在供桌朱紅上的字。
- **夜市天空**（neon-night）：夜市的牆面、輸入框與 `theme-color`；**攤位帆布**（neon-panel）是面板與對話框。
- **月光**（neon-moon）、**夜霧丁香**（neon-lilac）、neon-label-muted：夜市的主要、次要文字，以及檯面上的次要字。
- **警示色**：廟口 temple-danger、夜市 neon-danger，只用於刪除與表單錯誤。

### Named Rules
**中獎才發光原則。** `--lit`（光明燈金／中獎螢光）只屬於抽中的那一張：戳中那格的紙條、結果畫面的中獎紙條、廟口的「就吃這個」，以及接受後七天紀錄「今」格褪掉的蓋章底色和文字選取色。其他按鈕、標籤或提示都不准用。

**霓虹不實心原則。** 夜市的按鈕永遠是攤車深紫底，加 1.5px 招牌霓虹內框和柔和外光暈。桃紅不當大面積實底，膠帶條紋例外，因為它只是 6px 的外框。

**金只畫線原則。** 廟口的金色是匾額與神龕的框線和字。大面積底色只能是供桌朱紅、匾額檀木或籤詩紙；唯一的金色實底是「就吃這個」，它屬於中獎才發光原則。

## Typography

**Display Font:** Noto Serif TC 700／900（廟口）、Noto Sans TC 900（夜市），透過 `--font-display` 依主題切換
**Body Font:** Noto Sans TC 400／700（後備 PingFang TC、Microsoft JhengHei、system-ui）
**Hand Font:** Iansui（芫荽），只用在戳戳樂「剩 N 格」印章

**Character:** 廟口的明體粗字像匾額和籤詩上的刻字；夜市換成黑體粗字，搭配霓虹光暈，像攤位手寫招牌被燈照亮。元件只引用 `--font-display`，不必自己判斷主題。

**載入：** Google Fonts 只載 Noto Sans TC 400／700／900 與 Noto Serif TC 700／900（`display=swap`）；Iansui 只在首頁以 `text=` 子集載入「剩格0123456789」。明體沒有 400，所以用 `--font-display` 的元件只能在 700 和 900 之間做粗細對比（例如分頁：未選中 700，選中 900）。

### Hierarchy
字級階梯有五個共用變數：`--fs-meta`、`--fs-small`、`--fs-body`、`--fs-title`、`--fs-dialog`，相鄰兩階至少差 2px。新元件一律引用，不寫字面值；需要再分層時改顏色或粗細，不新增字級。Result、Display、Action 是階梯外的招牌角色，各自只用在指定位置。

- **Result**（900，clamp(2.75rem, 14vw, 4.5rem)，1.1）：結果畫面的料理名稱，全系統最大的字，只出現在這裡。
- **Display**（900，clamp(1.5rem, 6.4vw, 1.75rem)，1.25）：首頁招呼語、設定頁標題，`text-wrap: balance`。
- **Action**（900，1.2rem，字距 0.12em；廟口 0.2em）：「幫我決定！」主按鈕。
- **Dialog**（700，`--fs-dialog`）：對話框標題、「戳戳樂」招牌、竹籤上直書的料理名。
- **Title**（700，`--fs-title`）：面板標題、籤詩橫帶「第○籤」；結果畫面兩顆按鈕也用這一階，字重 900、字距 0.08em。
- **Body**（400，`--fs-body`，1.6）：一般內容、輸入框、分頁、「這七天」標題、外觀選項名稱。
- **Small**（400，`--fs-small`）：說明（`.panel-note` 行高 1.7）、欄位標籤、紀錄列、候選數、提示訊息、次要與文字按鈕、封紙格號。
- **Label**（700，`--fs-small`，display 字體）：廟口的條件標籤。
- **Meta**（400，`--fs-meta`，1.3）：七天格、日期、徽章、底部導覽、圖例、戳戳樂紙條、籤號。這是最小字級，不再往下縮。

### Named Rules
**直書出籤原則。** 竹籤上的字一律直書（`writing-mode: vertical-rl`、`text-orientation: upright`），料理名寫在籤頭下，籤號落在籤尾。籤寬固定；名稱超過四個字或供桌變窄時降一階字級，不加寬籤身。

**數字不放大原則。** 候選數、天數、剩餘格數都用小字說明，用等寬數字（`tabular-nums`），不做成大數字。

**中文排版原則。** 標題類（招呼語、結果料理名、籤上料理名、面板與對話框標題）開 `font-feature-settings: "palt"`，全形標點收成半寬。說明文字用 `text-wrap: pretty`，避免最後一行只剩一個字。內文字距廟口 0.02em，夜市深底淺字 0.03em（`--track`）；七天格字距歸零，才塞得進窄格。

## Layout

手機直式單欄：`.app` 最寬 480px（column），左右 16px（gutter），區塊間距 14px（stack），桌面上置中，背景延伸至全視窗。頂部替場景裝飾留空間：廟口 92px，放 76px 高的橫樑燈籠；夜市 60px，放燈泡串。底部留 104px 給固定的底部導覽。兩邊都加上 safe-area。

首頁由上而下：招呼語（左）與 SpinEat 招牌（右）→「料理／我的店家」分頁 → 一行條件標籤（點開可調整）→ 舞台（供桌或紙板，寬高比 1 : 0.86）→ 候選數量說明 → 拇指位置的主按鈕 → 七天紀錄列 → 全部紀錄。標題、分頁、條件、紀錄等文字區塊統一內縮 6px（hairline-inset），對齊舞台外框。

七天紀錄是 7 等分的格線（同一基線、最小高 46px），排除範圍以頂端 2.5px `--mark` 標線表示。結果畫面是全螢幕對話框：內距 24px（result-gutter），內容欄同樣最寬 480px；右上只有「返回」，中段是抽到的那一張，下面是說明列與地圖連結，兩顆按鈕在拇指區。設定頁同一欄寬，標題下方是「料理／店家／偏好」三個分頁，一次只顯示一個分頁（網址帶 `#foods`／`#stores`／`#prefs`，預設料理）。分頁列和料理分頁的搜尋框、類型篩選鈕一起黏在頂端（`.settings-bar`，`--ground` 底，左右各外推 16px 蓋滿欄寬）。料理與店家分頁由上而下是：篩選鈕 → 清單上方一列（左邊數量、右邊新增按鈕）→ 清單面板；偏好分頁是外觀、抽選動畫、資料備份三塊面板。面板內距 16px。廟口的籤在供桌容器寬 380px 以下時縮小一號（container query），這是全系統唯一的寬度斷點；其餘一律靠 `clamp()` 和流動寬度調整。

## Elevation & Depth

**只有器物有體積。** 介面本身是平的：面板、條件標籤、列表、輸入框、底部導覽都只靠 1px 低透明度細線（`--surface-line`）分層，不加陰影。會投下陰影或自己發光的，只有場景裡的「器物」：舞台（供桌、紙板）、匾額（招牌、主按鈕、「有求必應」）、籤、紙條、結果按鈕，以及浮在上面的對話框與提示訊息。

**廟口整體仿舊。** 廟口的配色整組往泛黃、褪色推（石埕、籤詩紙、供桌朱紅、金線都比原色暗一點），整個畫面再用 `body::after` 以 `mix-blend-mode: multiply` 蓋一層舊紙：細紙纖維、大塊淡黃斑、四角暗角。結果畫面在 top layer，由 `.result::after` 另外蓋一次。multiply 只會把顏色壓舊，深色字不會變淡。夜市不套用。

兩個主題的光源不同。廟口是日光下的木作：深度來自多層金框疊出的雕工，加上往下的柔和褐色落影。夜市是自己發光的霓虹：元件靠桃紅內框與外光暈從夜空中浮起，中獎物帶同色螢光，背景是模糊的散景光點。

### Shadow Vocabulary
- **匾額**（`inset 0 0 0 1.5px var(--gold), inset 0 0 0 3px var(--btn), inset 0 0 0 4px var(--gold), 0 3px 8px rgba(61,31,18,.22)`）：廟口的 SpinEat 招牌；「有求必應」小匾額用同樣的框，落影加深為 `0 6px 12px rgba(46,21,11,.35)`。
- **匾額按鈕**（`inset 0 0 0 3px var(--btn), inset 0 0 0 4.5px var(--gold), 0 6px 14px rgba(61,31,18,.25)`）：廟口主按鈕；一般主要按鈕只留 `inset 0 0 0 1.5px var(--gold)`。
- **供桌**（`0 0 0 3px var(--gold), 0 0 0 5px var(--btn), 0 12px 22px rgba(61,31,18,.24)`）：廟口舞台，裡面再加一道 9px 內縮、40% 金色的細線。
- **竹籤**（`filter: drop-shadow(3px 4px 0 rgba(46,21,11,.32))`）：出籤與結果畫面的那支籤。籤本身是平塗仿舊（`--age-grain` 纖維與黴點、水漬、籤尾手垢、朱漆磨出竹色），影子不模糊，只壓一塊。
- **籤詩**（`0 0 0 1.5px var(--gold), 0 20px 40px rgba(46,21,11,.5)`）：結果畫面的籤紙。
- **接受按鈕**（`inset 0 0 0 3px var(--lit), inset 0 0 0 4.5px var(--btn), 0 8px 18px rgba(46,21,11,.35)`）：廟口「就吃這個」。
- **霓虹按鈕**（`inset 0 0 0 1.5px var(--glow), 0 0 18px rgba(255,92,154,.25)`，懸停 `0 0 26px` .4）：夜市主按鈕；結果畫面的接受按鈕光暈為 .3。
- **紙板**（`0 12px 32px rgba(0,0,0,.35)`）：夜市戳戳樂。瞄準格是 `inset 0 0 0 2px var(--pin), inset 0 0 12px rgba(255,92,154,.45), 0 0 16px rgba(255,92,154,.65)`。
- **中獎紙條**（`filter: drop-shadow(0 0 22px rgba(216,255,60,.35)) drop-shadow(0 14px 16px rgba(0,0,0,.45))`）：夜市結果畫面；戳中那格的小紙條是 `0 0 16px var(--lit)`。
- **浮層**（`0 18px 48px rgba(0,0,0,.35)`）：店家對話框；提示訊息用 `0 8px 20px rgba(0,0,0,.25)`。

### Named Rules
**只有器物有體積原則。** 新增介面元件（面板、列表、表單）時不要加陰影，只用 `--surface-line` 細線；只有場景中的器物可以投影或發光。

**廟口仿舊原則。** 新增廟口元件不要自己再加紙紋或做舊，全畫面的舊紙層會統一處理；顏色一律取已經褪色的語意變數。竹籤這類平面器物可以用 `--age-grain` 補上纖維與黴點。夜市不套用。

**遮罩形狀用 drop-shadow 原則。** 用 `mask` 剪出輪廓的元素（竹籤、撕痕紙條、殘紙），陰影與光暈一律放在外層的 `filter: drop-shadow`，因為 `box-shadow` 會畫成方框或被遮罩切掉。

## Shapes

廟口偏方正：條件標籤與招牌是 3px 的籤條與匾額（plaque），面板與供桌 10px。夜市偏柔和：條件標籤與徽章是膠囊（pill），面板 14px，紙板 18px。共用的形狀有：一般按鈕 10px、主按鈕 14px、輸入框 8px、對話框 16px。容器邊框一律是低透明度的 1px 細線；廟口的底部導覽例外，改成 2px 朱紅頂線。

竹籤的籤頭是一個 40×80 的葫蘆輪廓 SVG 遮罩（`--qian-head`：尖頂，細頸與鼓起交替），竹身再以一塊 90% 寬的矩形遮罩接上；窄版供桌上的籤縮成 34×66。還沒出籤時，供桌上刻著一道上圓下方的淺槽（`20px 20px 3px 3px / 13px 13px 3px 3px`）。戳戳樂的洞與封紙是以格高 74% 為直徑的正圓，戳破後的殘紙是每格各自隨機產生的鋸齒環形遮罩（`--tear`）；夜市中獎紙條上緣咬出一排 14px 間距的半圓撕痕。圖示一律是 24px 網格、1.8 線寬、圓端點的內嵌描邊 SVG。

## Components

所有元件都是場景的一部分：它在廟口長成籤條、匾額、籤詩紙，在夜市長成膠帶、霓虹、攤位帆布。沒有跨主題長得一樣的「中性元件」，但每個元件都只透過語意變數與 `[data-theme]` 選擇器切換，不寫死色碼。

### Buttons
- **主按鈕「幫我決定！」：** 高 58px、全寬、圓角 14px（go-button），匾額檀木／攤車深紫底配金字／霓虹餘光字，用 Action 字級。廟口用匾額按鈕的金色雙框，夜市用霓虹按鈕的框與光暈（懸停時光暈放大）。按下縮放 0.98，停用時透明度 0.45。
- **一般主要按鈕：** 圓角 10px、內距 10px 20px、字重 700；小尺寸 6px 14px，用 `--fs-small`。廟口帶 1.5px 金色內框，夜市帶 1.5px 霓虹內框。
- **次要按鈕：** 透明底，1.5px `currentColor` 邊框；夜市改用 `--line` 細線。
- **文字按鈕：** `--muted` 色，懸停時轉 `--text` 並加底線；刪除用警示色。
- **結果按鈕：** 兩顆都高 56px，用 Title 字級、字重 900。「就吃這個」在廟口是光明燈金底配檀木內框，夜市是霓虹按鈕；「再抽一次」是半透明淺色邊框的次要按鈕。

### Chips
- **條件標籤：** 廟口是籤詩紙底的籤條：3px 圓角、45% 朱紅細框、明體 700。夜市是 7% 白底的膠囊，配 `--line` 細框。懸停時邊框轉 `--mark`。
- **選中：** 廟口換成供桌朱紅底、燭光米字；夜市換成 20% 桃紅底、招牌霓虹框、白字。表單裡的勾選標籤（`.chip-check`）在兩個主題都是膠囊形，選中規則相同。
- **徽章：** 膠囊形，`--fs-meta`，細線框；價位徽章用 `currentColor` 框，停用狀態用 `--surface-line` 底。

### Cards / Containers
- **Corner Style：** `--radius`（廟口 10px、夜市 14px）。
- **Background：** `--surface`（籤詩紙／攤位帆布）。
- **Shadow Strategy：** 無，見「只有器物有體積原則」。
- **Border：** 1px `--surface-line`。
- **Internal Padding：** 16px（篩選面板 14px）；清單列以頂部細線分隔，列距 12px。

### Inputs / Fields
- **Style：** 1px `--surface-line` 邊框、`--input` 底（香案白／夜市天空）、8px 圓角、8px 10px 內距；欄位標籤用 `--fs-small` 和 `--surface-muted`。
- **Focus：** 全域 2px `--focus` 外框，offset 2px；游標顏色是 `--mark`。
- **Error：** 警示色文字（`.form-error`、必填星號）。「啟用」一律用開關（`role="switch"` 的核取方塊，40×24px 軌道、18px 旋鈕）：關閉時軌道是 40% `--surface-muted`、旋鈕 `--surface`；開啟時廟口是供桌朱紅軌道配燭光米旋鈕，夜市是招牌霓虹軌道配月光白旋鈕。照「只有器物有體積」原則，旋鈕不加陰影。

### Navigation
- **分頁（`.mode-tabs`）：** 首頁的「料理／我的店家」與設定頁的「料理／店家／偏好」共用。display 字體，`--fs-body`；未選中 700、`--muted`，選中 900、`--text`，加 2.5px `--mark` 底線，下方是一條 1px 分隔線。設定頁用 `role="tab"`，左右方向鍵切換。
- **設定頁篩選鈕：** 沿用條件標籤（`.chip`，`aria-pressed`），名稱後接一個 `--fs-meta` 的數量。排成一列，放不下就橫向捲動、不換行，避免把清單往下推。料理依類型、店家依分類標籤篩選；搜尋字優先於類型，搜尋時從全部料理找，符合的字用 `--mark` 22% 的淡底標出（不用 `--lit`，那是中獎專用）。
- **設定頁清單列：** 名稱與徽章整塊是一顆按鈕，點了打開編輯表單；右側只留啟用開關。刪除收進編輯表單左下角的警示色文字按鈕。分類標籤在「管理標籤」對話框裡新增、改名、刪除。
- **底部導覽：** 固定在底部，`--surface` 底。廟口加 2px 朱紅頂線；夜市是 94% 不透明的夜市天空色。每個項目是 22px 圖示加 `--fs-meta` 標籤，目前頁加粗並轉 `--mark`。

### 求籤（廟口的舞台，Signature）
朱紅供桌（`.temple`，由 `js/fortune.js` 演出）：外圈金邊與檀木框，裡面一道細金線像神龕的框。左上掛「有求必應」小匾額（字距 0.3em）；左下是內嵌 SVG 的籤筒（檀木筒、金箍、「籤」字，最多畫 12 支籤）；右邊是刻槽，寫著「點籤筒求一支籤」。

點籤筒、按主按鈕或搖手機（水平加速度超過 12 m/s²）都會求籤：籤筒以底部為軸晃 650ms，一支竹籤從筒口跳出、落到籤位（520ms，`cubic-bezier(0.16, 1, 0.3, 1)`），手機輕震 15ms，再停 450ms 進入結果畫面。竹籤是平面的舊籤：竹身平塗泛黃竹色，疊上 `--age-grain` 的直纖維與黴點、幾塊水漬，籤尾被手握得最黑；葫蘆形籤頭平塗褪成偏橘的朱砂色，跟供桌朱紅拉開，籤尖與鼓起處磨出竹色，肩下多塗一截並收一道暗線；料理名與籤號的墨色也褪淡一點；籤號是候選序號的國字。出籤中再按一次主按鈕會直接出籤。

### 戳戳樂（夜市的舞台，Signature）
紙板（`.poke-sheet`，由 `js/poke.js` 演出）外圈纏 6px 桃紅條紋膠帶，頂端印霓虹「戳戳樂」招牌、「挑一格戳下去」，右側斜 -8° 蓋一枚 Iansui 手寫「剩 N 格」印章。下面是 6×4 共 24 格，每格貼一張隨機色紙（左邊和上面那格不同），印上格號與 35% 白色細框。

手指碰格子就直接戳；按「幫我決定！」會先在格子間跳 5 下（每下 70ms，瞄準格放大 1.1 倍並亮起霓虹光圈）再戳。戳下去時封紙先凹再彈回（240ms），噴出 5 片紙屑（500ms），中間破一個鋸齒洞；洞裡的紙條捲成一小卷冒出來再攤開（420ms，延遲 140ms），每張各自歪一點角度，中獎那張是中獎螢光並發光。之後手機輕震 15ms，再停 450ms 進入結果畫面。戳過的洞會保留，換條件、接受或 24 格戳完時才換一張新紙板。

### 候選空了
舞台換成同形狀的空狀態（`.board-empty`，`--board` 底），說明原因，並附一顆次要按鈕直接放寬最有用的條件，依序是：「全部放回候選」→「不排除最近吃過的」→「放寬預算和類型」→「調整條件」。放寬後焦點回到主按鈕。

### 結果畫面（Signature）
全螢幕對話框，底色就是舞台色，頂端複製首頁的橫樑燈籠或燈泡串（夜市再加光暈），所以還在同一個場景裡。中段是抽到的那一張，下面是一張三欄小表格（類型／預算／餐別，用 `<dl>`；廟口用直線分欄，夜市用虛線）。
- **廟口・籤詩：** 籤紙米黃紙面（上方略亮）配 1.5px 金邊；頂端是 46px 供桌朱紅橫帶，金字寫「第○籤」（字距 0.5em），橫帶下方是 3px 朱紅雙線框；料理名用春聯朱。抽到的竹籤（40×190）斜 9° 靠在右上角後面，露出籤頭與籤號。四周加一道 40% 金色神龕細線。
- **夜市・中獎紙條：** 縮小的紙板（6 欄 28px 圓點；戳過的洞是暗的，戳中那格發萊姆綠光），中獎螢光紙條斜 -2.5° 壓在紙板下緣，上緣有撕痕；「戳開第 N 格」與小表格之間用虛線分隔。這是中獎螢光唯一的大面積用法。
- **進場：** 整體淡入 0.25s。籤詩由上往下展開（`clip-path`，0.6s，`cubic-bezier(0.16, 1, 0.3, 1)`），竹籤在 0.4s 時從紙後靠上來（0.45s）；夜市紙條從紙板裡彈出（0.5s，`cubic-bezier(0.34, 1.56, 0.64, 1)`）。

### 七天紀錄蓋章
按「就吃這個」回到首頁後，「今」格的料理名像蓋章一樣印上去：從 1.9 倍、轉 -9° 收回原位（0.45s，`cubic-bezier(0.16, 1, 0.3, 1)`，延遲 0.2s），格子底色從 55% `--lit` 在 1.4s 內褪成透明。同時跳出的提示訊息會說明效果，例如「記下了！N 天內不會再抽到「名稱」」。

### 外觀與抽選動畫選項
設定頁的外觀選項有三列（依時間自動／夜市霓虹／廟口朱紅），每列一個 44px 迷你場景色票：夜空加霓虹框檯面、石埕加朱紅橫樑與金框供桌、自動則是朱紅與夜空斜切兩半。選中時色票外圈 `--mark`，右側出現勾號。下方的「抽選動畫」（跟隨系統／一律播放）用同樣的選項列但沒有色票。所有減少動態效果規則都以 `:root:not([data-motion="always"])` 限定，JS 以 `calm()` 判斷。在需要減少動態效果時：不晃、不跳、不戳破，直接亮出籤或紙條，停頓縮為 200ms，不震動，結果進場與蓋章動作取消，只保留底色褪掉。

## Do's and Don'ts

### Do:
- **Do** 所有顏色、字體、圓角都透過語意變數（`--ground`、`--board`、`--lit`、`--btn`、`--font-display`、`--radius` 等）引用，讓兩個主題自動成立。
- **Do** 讓新元件屬於場景：廟口用籤條、匾額、籤詩紙的語言（檀木底、金字、金框線），夜市用膠囊、霓虹框與光暈。
- **Do** 把抽選演出控制在約 1.6 秒內，並且讓再按一次主按鈕就跳到結果。
- **Do** 在按下的那一刻以等機率決定結果，舞台只負責演出。
- **Do** 每段動畫都提供減少動態效果時的直接路徑，並尊重「一律播放」設定。
- **Do** 讓舞台與空狀態維持寬高比 1 : 0.86，換主題時版面不跳動。
- **Do** 把回饋放在本來就有的時刻（出籤、戳破、接受、候選空了），並說出實際作用。
- **Do** 遮罩剪出的形狀用外層 `filter: drop-shadow` 上陰影。
- **Do** 背景圖樣（石埕、散景、燈籠）用固定種子，每次載入一致；只有「每張紙板不同」的細節（色紙、殘紙、紙條角度）才用隨機。

### Don't:
- **Don't** 另設「抽選方式」選項；抽法由主題決定，廟口求籤、夜市戳戳樂。
- **Don't** 加回擲筊。
- **Don't** 把 `--lit`（光明燈金／中獎螢光）用在中獎物與「就吃這個」以外的地方。
- **Don't** 在夜市使用亮色實底按鈕，或讓桃紅成為大面積底色。
- **Don't** 替面板、列表、表單這類介面元件加陰影；只有器物有體積。
- **Don't** 讓舞台上的操作（點哪一格、搖幾下）影響抽中機率。
- **Don't** 為了慶祝而延長停頓，或替例行點擊加上慶祝效果。
- **Don't** 讓空狀態只叫人「放寬條件」卻不附可以直接操作的按鈕。
- **Don't** 放大數字，或新增五階之外的字級。
