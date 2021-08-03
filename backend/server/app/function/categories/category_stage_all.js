const POIs = require('~root/server/app/model/poi_stages');

const categories = [
  {
    name: '綜合零售通路',
    children: [
      { name: '便利超商' },
      { name: '百貨公司' },
      { name: '超市' },
      { name: '量販' },
      { name: '五金生活百貨' },
      { name: '購物中心' },
      { name: '3C家電' },
      { name: '藥妝通路' },
      { name: '居家用品' },
      { name: '家具家飾' },
    ],
  },
  {
    name: '專業零售通路',
    children: [
      { name: '服飾配件' },
      { name: '鞋包配件' },
      { name: '銀樓珠寶店' },
      { name: '寵物用品' },
      { name: '祭祀用品' },
      { name: '中藥零售' },
      { name: '西藥零售' },
      { name: '醫療器材' },
      { name: '文教零售' },
      { name: '鐘錶店' },
      { name: '眼鏡店' },
      { name: '電玩專賣店' },
      { name: '中古汽車零售店' },
      { name: '汽車展示中心' },
      { name: '汽車保養廠' },
      { name: '機車原廠授權據點' },
      { name: '運動用品' },
      { name: '戶外運動' },
      { name: '綜合型運動用品' },
      { name: '自行車店' },
      { name: '伴手禮店' },
    ],
  },
  {
    name: '醫療產業',
    children: [
      { name: '醫院' },
      { name: '基層診所' },
      { name: '醫美診所' },
      { name: '中醫診所' },
      { name: '牙醫診所' },
      { name: '眼科診所' },
      { name: '婦產科診所' },
      { name: '健檢中心' },
    ],
  },
  {
    name: '金融保險',
    children: [
      { name: '銀行' },
      { name: '保險' },
      { name: '證券' },
      { name: '郵局' },
      { name: '投資典當' },
    ],
  },
  {
    name: '房地產',
    children: [
      { name: '建案' },
      { name: '房屋仲介' },
    ],
  },
  {
    name: '餐飲',
    children: [
      { name: '中式餐廳' },
      { name: '西式餐廳' },
      { name: '日式餐廳' },
      { name: '法式餐廳' },
      { name: '韓式餐廳' },
      { name: '港式餐廳' },
      { name: '泰式餐廳' },
      { name: '蔬食餐廳' },
      { name: '自助餐廳' },
      { name: '火鍋店' },
      { name: '燒肉店' },
      { name: '熱炒店' },
      { name: '甜點店' },
      { name: '手搖飲店' },
      { name: '連鎖咖啡店' },
      { name: '獨立咖啡店' },
      { name: '酒吧' },
      { name: '其他餐飲業' },
      { name: '速食類' },
    ],
  },
  {
    name: '身體美容',
    children: [
      { name: '髮廊' },
      { name: '複合美容服務店' },
      { name: '美睫美甲店' },
      { name: '紋繡店' },
      { name: '刺青店' },
    ],
  },
  {
    name: '生活服務',
    children: [
      { name: '自助洗衣店' },
      { name: '傳統洗衣店' },
      { name: '充電站' },
      { name: '加油站' },
      { name: '國道服務區' },
      { name: '月子中心' },
      { name: '安養中心' },
      { name: '生命產業' },
    ],
  },
  {
    name: '交通運輸',
    children: [
      { name: '機場航空站' },
      { name: '台鐵車站' },
      { name: '高鐵車站' },
      { name: '捷運車站' },
      { name: '轉運站' },
      { name: '公共自行車租賃系統站點' },
      { name: '停車場' },
      { name: '租車營業據點' },
    ],
  },
  {
    name: '觀光旅遊',
    children: [
      { name: '飯店' },
      { name: '旅館' },
      { name: '旅行社' },
      { name: '遊樂園' },
      { name: '民宿' },
      { name: '文創景點' },
      { name: '夜市型商圈' },
      { name: '複合型商圈' },
      { name: '免稅店' },
      { name: '國家公園' },
      { name: '國家風景區' },
    ],
  },
  {
    name: '運動',
    children: [
      { name: '球類場館' },
      { name: '健身房' },
      { name: '瑜珈韻律' },
      { name: '游泳相關' },
      { name: '武術搏擊' },
      { name: '室外體育場館' },
      { name: '競技及休閒運動場館' },
      { name: '多功能體育館' },
    ],
  },
  {
    name: '藝文',
    children: [
      { name: '國定古蹟' },
      { name: '博物館' },
      { name: '美術館' },
      { name: '表演藝術中心' },
      { name: '工商展覽場所' },
      { name: '複合式場所' },
    ],
  },
  {
    name: '教育',
    children: [
      { name: '大專院校' },
      { name: '高中' },
      { name: '國中' },
      { name: '小學' },
      { name: '幼兒園' },
      { name: '補習班' },
      { name: '安親班' },
      { name: '留學服務' },
      { name: '才藝教室' },
      { name: '駕訓班' },
    ],
  },
  {
    name: '休閒娛樂',
    children: [
      { name: '電子遊戲場' },
      { name: '電影院' },
      { name: 'KTV' },
      { name: '水域遊憩場館' },
      { name: '動物園' },
      { name: '兒童遊戲場' },
      { name: '夜店' },
      { name: '舞場舞廳' },
      { name: '桌遊店' },
      { name: '密室逃脫店' },
      { name: '網咖' },
      { name: '按摩店' },
      { name: '溫泉湯屋' },
      { name: '釣蝦場' },
      { name: '棋牌' },
      { name: 'MTV' },
      { name: '漫畫租書店' },
      { name: '特色體驗' },
    ],
  },
  {
    name: '宗教',
    children: [
      { name: '佛道教廟宇' },
      { name: '一貫道' },
      { name: '清真寺' },
      { name: '教會' },
      { name: '教堂' },
    ],
  },

  {
    name: 'FocusMedia',
    children: [
      { name: '社區大樓' },
      { name: '商業大樓' },
    ],
  },
];

const call = async () => {
  const rs = await POIs.aggregate([
    { $match: { deleted: { $ne: true } } },
    {
      $group: {
        _id: {
          category1: '$category1',
          category2: '$category2',
        },
        count: { $sum: 1 },
      },
    },
  ]);
  const _categories = [];
  categories.forEach((v1) => {
    const d1 = {
      name: v1.name,
      id: v1.id,
      count: 0,
      children: [],
    };
    v1.children.forEach((v2) => {
      const d2 = { name: v2.name, id: v2.id, count: 0 };
      const c2found = rs.find((f) => f._id.category1 === v1.name && f._id.category2 === v2.name);
      if (c2found) {
        d2.count = c2found.count;
        d1.count += c2found.count;
      }
      if (d2.count > 0) d1.children.push(d2);
    });
    if (d1.count > 0) _categories.push(d1);
  });
  // console.log(_categories);
  return _categories;
};

module.exports = call;

// const test = async () => {
//   const rs = await call();
//   console.log(rs);
// };
// test();
