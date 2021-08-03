/*
  Curves可爾姿女性30分鐘環狀運動

  取得城市列表 api: https://www.curves.com.tw/get_data.php (contries)
  爬頁面訊訊: https://www.curves.com.tw/store.php?city=33&area=-1
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

  const { data: { countries } } = await axios.get('https://www.curves.com.tw/get_data.php');

  for (let i = 0; i < countries.length; i += 1) {
    const country = countries[i];
    const url = `https://www.curves.com.tw/store.php?city=${country.id}&area=-1`;
    // eslint-disable-next-line
    const $ = await fetchPageHtml(url);
    $('.storeList li').each((j, e) => {
      const name = $(e).find('.title').text();
      let [address, phone] = $(e).find('.content').text().trim()
        .split('\n');

      if (name === '高雄瑞豐店') address = `${address.replace('2F ', '')}2樓`;

      list.push({
        name,
        address: trimStartZipCode(address).trim(),
        phone: phone.replace(/TEL/ig, '').trim(),
        brand_group: 'Curves',
        category1: '運動',
        category2: '健身房',
      });
    });
  }

  return list;
}

module.exports = run;
