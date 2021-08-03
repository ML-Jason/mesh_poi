/**
 * Momentum
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.momentum.com.tw/stores';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const data = [];

  $('#storeList div div div div').each((i, e) => {
    const name = $(e).find('a[title="read more"] h3').text();
    const phone = $(e).find('ul li.tel').text();
    const address = $(e).find('ul li.map').text();
    if (name) {
      data.push({
        name,
        phone,
        address,
        brand_group: '摩曼頓',
        category1: '專業零售通路',
        category2: '運動用品',
      });
    }
  });
  return data;
};

module.exports = run;
