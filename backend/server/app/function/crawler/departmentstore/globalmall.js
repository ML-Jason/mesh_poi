/**
 * Global Mall
 * 爬dom
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.twglobalmall.com/web/global/information.html';

  const rs = await axios.get(url);

  // console.log(rs.data);
  const $ = cheerio.load(rs.data);

  const data = [];
  $('.shop-box').each((i, e) => {
    const name = $(e).find('p:first-child').text().trim();
    const address = $(e).children('div:nth-child(2)').children(' span:nth-child(2)').text()
      .replace(/\(.*\)/, '')
      .replace(/(^\d+)/, '')
      .trim();
    const phone = $(e).children('div:nth-child(3)').children(' span:nth-child(2)').text().trim();

    data.push({
      name,
      address,
      phone,
      brand_group: 'Global Mall',
      category1: '綜合零售通路',
      category2: '百貨公司',
    });
  });
  return data;
};

module.exports = run;
