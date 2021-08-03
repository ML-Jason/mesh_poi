/*
  BeingFit

  直接爬首頁資訊
  https://www.beingfit.com.tw/
*/
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchPageHtml(url) {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
}

async function run() {
  const list = [];
  const $ = await fetchPageHtml('https://www.beingfit.com.tw');
  $('.area-box').each((i, e) => {
    list.push({
      name: $(e).data('title'),
      address: $(e).data('address'),
      phone: $(e).data('tel'),
      brand_group: 'BeingFit',
      category1: '運動',
      category2: '健身房',
    });
  });

  return list;
}

module.exports = run;
