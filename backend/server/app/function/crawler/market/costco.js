/**
 * Costco
 *
 * 所有分店資訊透過一個網址就可讀取。
 * ! 官網的經緯度似乎也有問題...
 */

// const XLSX = require('xlsx');
const axios = require('axios');
// const stagePOI = require('~root/server/app/function/crawler/stagePOI');

const run = async () => {
  const url = 'https://www.costco.com.tw/store-finder/search?q=%E8%87%BA%E7%81%A3&page=0';

  const rs = await axios.get(url);

  const data = rs.data.data.map((v) => {
    const d = {};
    d.name = v.displayName;
    // d.city = v.town.replace('臺', '台');
    // if (d.name === '北台中店') d.city = '台中市';
    d.address = `${v.town.replace('臺', '台')}${v.line1}`;
    d.phone = v.phone;
    d.lat = v.latitude;
    d.lon = v.longitude;
    d.brand_group = '好市多';
    d.category1 = '綜合零售通路';
    d.category2 = '量販';
    return d;
  });

  return data;
};

module.exports = run;
