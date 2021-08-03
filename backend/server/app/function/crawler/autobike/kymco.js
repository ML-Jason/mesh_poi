/**
 * 光陽機車
 *
 * 從官網頁面分縣市一個一個爬回來。
 */

const axios = require('axios');
const async = require('async');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');
// const vcheck = require('~server/module/vartool/vcheck');

const runpages = (cities) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(cities, 1, async (city) => {
    const url = `https://www.kymco.com.tw/locations/authorized/${encodeURIComponent(city)}`;

    const rs = await axios.get(url);
    const $ = cheerio.load(rs.data);

    const trs = $('table.locations-list__table > tbody > tr');
    trs.each((i, ele) => {
      const tds = $(ele).find('td');
      const name = vcheck.toSBC(tds.eq(0).text().trim());
      const address = vcheck.toSBC(tds.eq(1).text().trim()).replace(/^\d*/, '');
      const phone = vcheck.str(tds.eq(2).text().trim());
      data.push({
        name,
        address,
        phone,
        brand_group: '光陽機車',
        category1: '專業零售通路',
        category2: '機車原廠授權據點',
      });
    });
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const url = 'https://www.kymco.com.tw/locations/';
  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const cities = [];
  const cityblocks = $('ul.cities');
  cityblocks.each((index) => {
    const citylis = cityblocks.eq(index).find('li');
    citylis.each((i2) => {
      cities.push(citylis.eq(i2).attr('data-city').trim());
    });
  });
  // console.log(cities);

  const data = await runpages(cities);
  // console.log(data[0]);
  // console.log(data.length);

  return data;
};

module.exports = run;
