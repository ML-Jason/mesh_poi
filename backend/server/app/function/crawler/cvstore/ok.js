const cheerio = require('cheerio');
const async = require('async');
const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');
const zipcode = require('~server/module/zipcode/tw');

/**
 * OK超商
 *
 * 有一個網址可以依照縣市取得分店資訊。
 * 因此依序把縣市帶入就可。
 *
 */

const runStores = (codes) => new Promise((resolve, reject) => {
  const data = [];
  async.eachSeries(codes, async (code) => {
    const url = 'https://www.okmart.com.tw/convenient_shopSearch_ShopResult.aspx';
    const rs = await axios.get(url, {
      params: { id: code },
    });
    const $ = cheerio.load(rs.data);

    const name = vcheck.toSBC($('h1').contents().eq(0).text()).split('臺').join('台');
    const address = vcheck.toSBC($('ul > li').eq(0)
      .text()).replace('門市地址:', '');
    const phone = vcheck.toSBC($('ul > li').eq(1).text()).replace('門市電話:', '');

    data.push({
      name,
      address,
      phone,
      brand_group: 'OK',
      category1: '綜合零售通路',
      category2: '便利超商',
    });
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const runCities = (cities) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(cities, async (city) => {
    console.log(`run ${city}`);
    const url = 'https://www.okmart.com.tw/convenient_shopSearch_Result.aspx';
    const rs = await axios.get(url, {
      params: { city },
    });

    const $ = cheerio.load(rs.data);
    const list = $('ul > li');
    const codes = [];
    list.each((i, ele) => {
      const code = $(ele).find('a').attr('href').split("'")[1]
        .split("',")[0];
      codes.push(code);
    });
    const data2 = await runStores(codes);
    data = [...data, ...data2];
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const cities = zipcode.map((v) => v.name);
  const data = await runCities(cities);

  return data;
};

module.exports = run;
