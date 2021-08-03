/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Tatung
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const pages = Array.from({ length: 17 }, (_, i) => i + 1);
  const data = [];

  for (const page of pages) {
    const url = `https://www.etungo.com.tw/store_${page}/0/0/0/_.html`;
    const rs = await axios.get(url);

    const $ = cheerio.load(rs.data);

    $('.list2 tbody tr').each((i, e) => {
      const name = $(e).find('td').eq(1).text();
      const address = $(e).find('td').eq(2).text();
      const phone = $(e).find('td').eq(3).text();
      data.push({
        name,
        address,
        phone,
        brand_group: '大同3C',
        category1: '綜合零售通路',
        category2: '3C家電',
      });
    });
  }
  return data;
};

module.exports = run;
