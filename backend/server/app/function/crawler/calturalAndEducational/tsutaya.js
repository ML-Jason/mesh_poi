/**
 * 蔦屋書店
 *
 * 沒有API, 只能爬網頁
 */

const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'http://tsutaya.com.tw/shop/';

  const rs = await axios.get(url);

  // console.log(rs.data);
  const $ = cheerio.load(rs.data);

  const data = [];
  const nameSelector = $('.shop-data > h4');
  const addressSelector = $('.shop-data > ul > li:nth-child(1) > em');
  const phoneSelector = $('.shop-data > ul > li.data-num > em:nth-child(2) > i');
  $('ul.shop-list > li').each((i) => {
    const name = nameSelector.eq(i).text().trim();
    const address = vcheck.toSBC(addressSelector.eq(i).text())
      .replace(/\(.*\)/, '')
      .trim();
    const phone = phoneSelector.eq(i).text().replace('TSUTAYA BOOKSTORE', '').trim();

    data.push({
      name,
      address,
      phone,
      brand_group: '蔦屋書店',
      category1: '專業零售通路',
      category2: '文教零售',
    });
  });

  return data;
};

module.exports = run;
