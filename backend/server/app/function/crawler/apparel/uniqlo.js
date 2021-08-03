/**
 * Uniqlo
 *
 * https://www.uniqlo.com/tw/stores 有全部門是的資訊，html格式不統一，直接抓外層div用文字處理拿到數據。
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.uniqlo.com/tw/stores/';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const data = [];

  $('.shop-list-block div').each((i, e) => {
    const info = ($(e).text().trim());

    data.push({
      name: info.split(/[\n]+/)[0],
      phone: info.split(/[\n]+/)[1].trim().replace('電話：', ''),
      address: info.split(/[\n]+/)[2].trim().replace('地址：', '').replace(/^\d*/, '').trim(),
      brand_group: 'Uniqlo',
      category1: '專業零售通路',
      category2: '服飾配件',
    });
  });
  return data;
};

module.exports = run;
