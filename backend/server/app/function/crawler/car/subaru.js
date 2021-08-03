/**
 * SUBARU
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://www.subaru.asia/tw/zh/how-to-buy/showroom-locations';
  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const _ss = $('.locations-item__content');
  const data = [];
  _ss.each((i, ele) => {
    const name = $(ele).find('h3').text().trim();
    let address = $(ele).find('.locations-item__address > span').contents().eq(2)
      .text()
      .split(' ')
      .join('');
    address = vcheck.str(address).replace(/^\d*/, '');
    const phone = $(ele).find('ul.locations-item__info > li:nth-child(2) > span').text().trim();
    data.push({
      name,
      address,
      phone,
      brand_group: 'SUBARU',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    });
  });

  return data;
};

module.exports = run;
