/**
 * Tomod's 特美事
 * 官網沒有提供門市電話
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.tomods.com.tw/stores';

  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const data = [];

  $('#all table.table tbody tr').each((i, e) => {
    const name = $(e).find('td a').text().trim();
    const address = $(e).find('td').eq(1).text()
      .trim();
    data.push({
      name,
      address,
      brand_group: '特美事',
      category1: '綜合零售通路',
      category2: '藥妝通路',
    });
  });
  return data;
};

module.exports = run;
