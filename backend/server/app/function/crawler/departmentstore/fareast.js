/*
遠百

沒有API，從網址的dom取得資訊。
*/

const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const vcheck = require('~server/module/vartool/vcheck');

const runStores = (stores) => new Promise((resolve, reject) => {
  const data = [];
  async.eachSeries(stores, async (itm) => {
    const url = `https://www.feds.com.tw/${itm.url}/MallInfo?tab=traffic`;
    const page = await axios.get(url);
    const $ = cheerio.load(page.data);

    const phone = vcheck.str($('.main-info .m-accordion:nth-child(1) .m-accordion-bd p:nth-child(2)').contents().eq(1).text());
    const address = vcheck.str($('.main-info .m-accordion:nth-child(2) .m-accordion-bd').text());

    data.push({
      name: itm.name,
      address,
      phone,
      brand_group: '遠東百貨',
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
  const url = 'https://www.feds.com.tw/';
  const page = await axios.get(url);

  const $ = cheerio.load(page.data);

  const _stores = $('.location-selecter ul.location-list li');
  const _links = [];
  _stores.each((i, ele) => {
    if ($(ele).hasClass('title') || $(ele).hasClass('back')) return;
    const _name = vcheck.toSBC($(ele).text());
    const _url = vcheck.str($(ele).children('a').attr('href'));
    _links.push({ name: _name, url: _url });
  });

  const data = await runStores(_links);

  return data;
};

module.exports = run;
