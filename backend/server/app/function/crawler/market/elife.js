/**
 * 全國電子
 *
 * 有分台灣各區的分店頁面，各區統整在一個頁面上，直接爬回來解析就好。
 * 無經緯度資訊。
 */

const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');

const getZone = async (url) => {
  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);
  const nodes = $('#storeform table tr');
  const data = [];
  nodes.each((i, ele) => {
    const ds = $(ele).find('.g101');
    let name = ds.eq(2).text().trim();
    const address = ds.eq(3).text().trim();
    const phone = ds.eq(4).text().trim();

    if (name === '中華二門市') {
      if (address.indexOf('台南') === 0) name = `台南${name}`;
    }
    if (name === '中山門市') {
      if (address.indexOf('台中市') === 0) name = `台中${name}`;
    }
    if (name === '成功門市') {
      if (address.indexOf('南投') === 0) name = `南投${name}`;
      if (address.indexOf('高雄') === 0) name = `高雄${name}`;
    }

    data.push({
      name,
      address,
      phone,
      brand_group: '全國電子',
      category1: '綜合零售通路',
      category2: '3C家電',
    });
  });
  return data.filter((f) => f.name);
};

const runPages = (urls) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(urls, async (_url) => {
    const rrs = await getZone(`https://www.elifemall.com.tw/allnewweb/${_url}`);
    data = [...data, ...rrs];
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const url = 'https://www.elifemall.com.tw/allnewweb/store.php';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const areaNodes = $('#area > ul > a');
  const urls = areaNodes.map((i, ele) => $(ele).attr('href')).get();

  const data = await runPages(urls);
  return data;
};

module.exports = run;
