/**
 * 愛買
 *
 * 分店資訊在一個頁面上，雖然有地圖但是無法取得經緯度(地圖是用嵌入的我的地圖)
 */

// const XLSX = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://www.fe-amart.com.tw/index.php/store';

  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const nodes = $('section.store-block .info-item');

  const data = [];
  nodes.each((i, ele) => {
    let name = $(ele).find('.info-left > h3').text().trim();
    let address = $(ele).find('.info-left > p').text().trim();
    name = vcheck.toSBC(name).split('臺').join('台').split(' ')
      .join('');
    address = vcheck.toSBC(address).split('臺').join('台').split(' ')
      .join('')
      .replace(/^(\d|\(|\))*/, '');

    data.push({
      name,
      address,
      brand_group: '愛買',
      category1: '綜合零售通路',
      category2: '量販',
    });
  });

  return data;
};

module.exports = run;
