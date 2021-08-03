/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Daiso
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.daiso.com.tw/Inside/Store';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);

  const data = [];

  $('.StoreL_map section ul li').each((i, e) => {
    const name = $(e).find('h1 a').text();
    const address = $(e).find('div p').text();
    const phone = $(e).find('h3').text();
    data.push({
      name,
      address,
      phone,
      brand_group: 'Daiso',
      category1: '綜合零售通路',
      category2: '五金生活百貨',
    });
  });
  return data;
};

module.exports = run;
