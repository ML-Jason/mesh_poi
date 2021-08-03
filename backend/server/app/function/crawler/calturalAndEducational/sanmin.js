/**
 * 三民書局
 *
 * 沒有API, 只能爬網頁
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.sanmin.com.tw/home/index/';

  const rs = await axios.get(url);

  // console.log(rs.data);
  const $ = cheerio.load(rs.data);

  const data = [];
  $('footer > div > div.SiteMap > div.contact > div.block > .section').each((i, e) => {
    const name = $(e).children('h4').text().trim();
    const address = $(e).children('p:nth-child(2)').text().trim();
    const phone = $(e).children('p:nth-child(3)').text().replace(/(電話：\n\D\s*)/, '')
      .trim();

    // 只抓取線下實體店
    if (name === '網路書店') {
      return;
    }

    data.push({
      name,
      address,
      phone,
      brand_group: '三民書局',
      category1: '專業零售通路',
      category2: '文教零售',
    });
  });
  // console.log(data);
  // process.exit();
  return data;
};

module.exports = run;
