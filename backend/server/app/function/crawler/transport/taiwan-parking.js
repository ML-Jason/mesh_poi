/*
  台灣聯通

  http://www.taiwan-parking.com.tw/viewParkList.do

  直接爬 DOM
*/
const axios = require('axios');
const cheerio = require('cheerio');
const trimStartZipCode = require('../../utils/trimStartZipCode');

async function fetchPageHtml(url) {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
}

async function run() {
  const list = [];
  const $ = await fetchPageHtml('http://www.taiwan-parking.com.tw/viewParkList.do');

  $('tr span:contains(場名)').each((i, e) => {
    const tbody = $(e).closest('tbody');

    $(tbody).find('tr').each((i2, e2) => {
      if (i2 === 0) return;

      const tds = $(e2).find('td');
      const name = $(tds).eq(0).find('a').text();
      const address = trimStartZipCode($(tds).eq(1).text());

      list.push({
        name,
        address,
        brand_group: '台灣聯通',
        category1: '交通運輸',
        category2: '停車場',
      });
    });
  });

  return list;
}

module.exports = run;
