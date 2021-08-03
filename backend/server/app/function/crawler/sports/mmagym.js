/*
  成吉思汗健身俱樂部

  只有找到 https://zh.wikipedia.org/wiki/成吉思汗健身俱樂部
*/
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchPageHtml(url) {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
}

async function run() {
  const list = [];
  const $ = await fetchPageHtml('https://zh.wikipedia.org/wiki/%E6%88%90%E5%90%89%E6%80%9D%E6%B1%97%E5%81%A5%E8%BA%AB%E4%BF%B1%E6%A8%82%E9%83%A8');

  $('table').each((i, e) => {
    if ($(e).text().indexOf('分店名稱') < 0) return;

    $(e).find('tr').each((j, ee) => {
      if (j === 0) return;

      const tds = $(ee).find('td');

      list.push({
        name: tds.eq(0).text().trim(),
        address: tds.eq(2).text().trim(),
        phone: '',
        brand_group: '成吉思汗健身俱樂部',
        category1: '運動',
        category2: '健身房',
      });
    });
  });

  return list;
}

module.exports = run;
