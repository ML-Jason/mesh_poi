/**
 * Honda
 *
 * 資訊都在頁面的dom上
 *
 */
const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.honda-taiwan.com.tw/Auto/Dealer';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const tps = $('.service-storeInfo.storeInfo');
  const items = tps.eq(0).find('.row.infoBlock-tr');
  const data = [];
  items.each((i, ele) => {
    if (i === 0) return;
    const name = $(ele).find('.infoBlock-local').text();
    const address = $(ele).find('.infoBlock-add').contents().eq(0)
      .text()
      .trim();
    const phone = $(ele).find('.infoBlock-phone').text();
    const d = {
      name,
      address,
      phone,
      brand_group: 'HONDA',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    };
    data.push(d);
  });

  return data;
};

module.exports = run;
