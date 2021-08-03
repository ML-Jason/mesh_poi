/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Subway
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const pages = Array.from(Array(13).keys());
  const data = [];
  for (const page of pages) {
    const url = `https://subway.com.tw/GoWeb2/include/index.php?pageNum_content01=${page}&totalRows_content01=129&Page=2&Cate01=&Cate02=&Cate03=`;
    const rs = await axios.get(url);

    const $ = cheerio.load(rs.data);

    $('table.table tbody tr').each((i, e) => {
      const name = $(e).find('td').eq(1).text()
        .replace('\t', '')
        .trim();
      const address = $(e).find('td').eq(2).text()
        .replace('\t', '')
        .trim();
      const phone = $(e).find('td').eq(4).text()
        .replace('\t', '')
        .trim();
      data.push({
        name,
        address,
        phone,
        brand_group: 'Subway',
        category1: '餐飲',
        category2: '速食類',
      });
    });
  }
  return data;
};

module.exports = run;
