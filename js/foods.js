// 內建食物清單
// type：料理類型；meals：適合的餐別；price：1=$ 2=$$ 3=$$$
const MEALS = [
  { id: "breakfast", label: "早餐" },
  { id: "lunch", label: "午餐" },
  { id: "dinner", label: "晚餐" },
  { id: "late", label: "宵夜" },
];

const TYPES = ["中式", "小吃", "麵食", "日式", "韓式", "西式", "速食", "南洋", "火鍋", "輕食"];

const FOODS = [
  // 早餐
  { name: "蛋餅", emoji: "🥚", type: "中式", meals: ["breakfast"], price: 1 },
  { name: "飯糰", emoji: "🍙", type: "中式", meals: ["breakfast"], price: 1 },
  { name: "燒餅油條", emoji: "🥖", type: "中式", meals: ["breakfast"], price: 1 },
  { name: "蘿蔔糕", emoji: "🧈", type: "中式", meals: ["breakfast"], price: 1 },
  { name: "鹹豆漿", emoji: "🥣", type: "中式", meals: ["breakfast", "late"], price: 1 },
  { name: "總匯三明治", emoji: "🥪", type: "西式", meals: ["breakfast", "lunch"], price: 1 },
  { name: "鐵板麵", emoji: "🍝", type: "西式", meals: ["breakfast"], price: 1 },
  { name: "貝果", emoji: "🥯", type: "輕食", meals: ["breakfast"], price: 2 },
  { name: "早午餐", emoji: "🍳", type: "西式", meals: ["breakfast", "lunch"], price: 3 },

  // 午晚餐：中式與小吃
  { name: "滷肉飯", emoji: "🍚", type: "小吃", meals: ["lunch", "dinner", "late"], price: 1 },
  { name: "雞肉飯", emoji: "🐔", type: "小吃", meals: ["lunch", "dinner"], price: 1 },
  { name: "便當", emoji: "🍱", type: "中式", meals: ["lunch", "dinner"], price: 1 },
  { name: "自助餐", emoji: "🥬", type: "中式", meals: ["lunch", "dinner"], price: 1 },
  { name: "水餃", emoji: "🥟", type: "麵食", meals: ["lunch", "dinner", "late"], price: 1 },
  { name: "鍋貼", emoji: "🥟", type: "麵食", meals: ["lunch", "dinner"], price: 1 },
  { name: "牛肉麵", emoji: "🍜", type: "麵食", meals: ["lunch", "dinner"], price: 2 },
  { name: "陽春麵", emoji: "🍜", type: "麵食", meals: ["lunch", "dinner", "late"], price: 1 },
  { name: "炒飯", emoji: "🍛", type: "中式", meals: ["lunch", "dinner", "late"], price: 1 },
  { name: "熱炒", emoji: "🔥", type: "中式", meals: ["dinner", "late"], price: 2 },
  { name: "港式燒臘", emoji: "🦆", type: "中式", meals: ["lunch", "dinner"], price: 2 },
  { name: "滷味", emoji: "🍢", type: "小吃", meals: ["dinner", "late"], price: 1 },
  { name: "鹽酥雞", emoji: "🍗", type: "小吃", meals: ["late"], price: 1 },
  { name: "蚵仔煎", emoji: "🦪", type: "小吃", meals: ["dinner", "late"], price: 1 },
  { name: "肉圓", emoji: "🥮", type: "小吃", meals: ["lunch", "late"], price: 1 },
  { name: "臭豆腐", emoji: "🧆", type: "小吃", meals: ["late"], price: 1 },
  { name: "清粥小菜", emoji: "🥣", type: "中式", meals: ["breakfast", "late"], price: 1 },

  // 日韓
  { name: "拉麵", emoji: "🍜", type: "日式", meals: ["lunch", "dinner", "late"], price: 2 },
  { name: "丼飯", emoji: "🍚", type: "日式", meals: ["lunch", "dinner"], price: 2 },
  { name: "壽司", emoji: "🍣", type: "日式", meals: ["lunch", "dinner"], price: 2 },
  { name: "咖哩飯", emoji: "🍛", type: "日式", meals: ["lunch", "dinner"], price: 2 },
  { name: "烏龍麵", emoji: "🍲", type: "日式", meals: ["lunch", "dinner"], price: 2 },
  { name: "燒肉", emoji: "🥩", type: "日式", meals: ["dinner"], price: 3 },
  { name: "韓式拌飯", emoji: "🥗", type: "韓式", meals: ["lunch", "dinner"], price: 2 },
  { name: "韓式炸雞", emoji: "🍗", type: "韓式", meals: ["dinner", "late"], price: 2 },
  { name: "部隊鍋", emoji: "🍲", type: "韓式", meals: ["dinner"], price: 2 },

  // 西式、速食
  { name: "義大利麵", emoji: "🍝", type: "西式", meals: ["lunch", "dinner"], price: 2 },
  { name: "牛排", emoji: "🥩", type: "西式", meals: ["dinner"], price: 3 },
  { name: "披薩", emoji: "🍕", type: "西式", meals: ["lunch", "dinner", "late"], price: 2 },
  { name: "漢堡", emoji: "🍔", type: "速食", meals: ["lunch", "dinner", "late"], price: 1 },
  { name: "炸雞", emoji: "🍗", type: "速食", meals: ["lunch", "dinner"], price: 1 },
  { name: "潛艇堡", emoji: "🥖", type: "速食", meals: ["lunch", "dinner"], price: 1 },

  // 南洋、火鍋、輕食
  { name: "泰式料理", emoji: "🌶️", type: "南洋", meals: ["lunch", "dinner"], price: 2 },
  { name: "越南河粉", emoji: "🍜", type: "南洋", meals: ["lunch", "dinner"], price: 2 },
  { name: "海南雞飯", emoji: "🍗", type: "南洋", meals: ["lunch", "dinner"], price: 2 },
  { name: "印度咖哩", emoji: "🍛", type: "南洋", meals: ["lunch", "dinner"], price: 2 },
  { name: "小火鍋", emoji: "🍲", type: "火鍋", meals: ["lunch", "dinner"], price: 2 },
  { name: "麻辣鍋", emoji: "🌶️", type: "火鍋", meals: ["dinner", "late"], price: 3 },
  { name: "薑母鴨", emoji: "🦆", type: "火鍋", meals: ["dinner", "late"], price: 2 },
  { name: "沙拉", emoji: "🥗", type: "輕食", meals: ["lunch", "dinner"], price: 2 },
  { name: "健康餐盒", emoji: "🥦", type: "輕食", meals: ["lunch", "dinner"], price: 2 },
];
