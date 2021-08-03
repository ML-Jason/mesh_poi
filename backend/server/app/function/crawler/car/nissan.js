/**
 * Nissan
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://new.nissan.com.tw/nissan/Buy/location-list';

  const form = new FormData();
  form.append('type', 'sales');
  form.append('cityId', '[all]');

  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  const $ = cheerio.load(rs.data);
  const trs = $('tbody > tr.item');

  const data = [];
  trs.each((index, ele) => {
    let name = $(ele).children('td').eq(0).text()
      .trim();
    name += $(ele).children('td').eq(1).text()
      .trim();
    const address = $(ele).children('td').eq(3).text()
      .split(' ')
      .join('');
    const phone = $(ele).children('td').eq(4).text()
      .trim();

    data.push({
      name,
      address,
      phone,
      brand_group: 'NISSAN',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    });
  });

  return data;
};

module.exports = run;
