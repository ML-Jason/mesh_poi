/*
SOGO

沒有API，從網址的dom取得資訊。
*/

const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const vcheck = require('~server/module/vartool/vcheck');

const runStores = (stores) => new Promise((resolve, reject) => {
  const data = [];
  async.eachSeries(stores, async (itm) => {
    const url = `https://www.sogo.com.tw${itm.url}`;
    const page = await axios.get(url);
    const $ = cheerio.load(page.data);

    const address = vcheck.str($('.trafficBox p.address').text()).replace(/^\d*/, '');
    const phone = vcheck.str($('.trafficBox p.phone').eq(0).text()).replace('TEL', '').split('\n').join('')
      .split('(代表號)')
      .join('')
      .split(' ')
      .join('');

    data.push({
      name: itm.name,
      address,
      phone,
      brand_group: '遠東SOGO',
      category1: '綜合零售通路',
      category2: '百貨公司',
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
  const url = 'https://www.sogo.com.tw';
  const page = await axios.get(url);

  const $ = cheerio.load(page.data);

  const _stores = $('.footer .branch.box ul li');
  const _links = [];
  _stores.each((i, ele) => {
    const _name = vcheck.toSBC($(ele).text());
    if (_name === '大陸分店') return;
    const _url = vcheck.str($(ele).children('a').attr('href'));
    _links.push({ name: _name, url: _url });
  });
  const data = await runStores(_links);

  return data;
};

module.exports = run;
