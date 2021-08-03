/*
新光三越

沒有API，從網址的dom取得資訊。
有些館有分館，要從次選單去判斷。
*/

const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const vcheck = require('~server/module/vartool/vcheck');

const runStores = (links) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(links, async (link) => {
    const url = `https://www.skm.com.tw${link.url}`;
    const _page = await axios.get(url);

    const $ = cheerio.load(_page.data);
    const sub = $('ul.menu-sub.menu-sub-store a');

    if (sub.length > 0 && !link.isChild) {
      const _subs = [];
      sub.each((i, ele) => {
        const _url = `/BranchPages/${vcheck.str($(ele).attr('href'))}`;
        const _name = vcheck.str($(ele).text());
        _subs.push({
          name: `${link.name}${_name}`,
          url: _url,
          isChild: true,
        });
      });
      const _data = await runStores(_subs);
      data = [...data, ..._data];
    } else {
      const phone = vcheck.str($('i.skm-icons-phone').parent('td').text());
      const address = vcheck.str($('i.skm-icons-locate').parent('td').text()).replace(/^\d*/, '');
      data.push({
        name: link.name,
        address,
        phone,
        brand_group: '新光三越',
        category1: '綜合零售通路',
        category2: '百貨公司',
      });
    }
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const url = 'https://www.skm.com.tw/BranchPages/BranchPagesInfo?UUID=4e76109e-f0db-4198-ab3e-63264964844e';
  const page0 = await axios.get(url);

  const $ = cheerio.load(page0.data);

  const _li = $('ul.skm-ul-sub-menu.skm-ul-sub-menu-store td.locate li');
  const _links = [];
  _li.each((i, ele) => {
    const _link = $(ele).children('a').attr('href').replace('BranchPagesHome', 'BranchPagesInfo');
    const _name = $(ele).text();
    _links.push({ url: _link, name: _name });
  });

  const data = await runStores(_links);

  return data;
};

module.exports = run;
