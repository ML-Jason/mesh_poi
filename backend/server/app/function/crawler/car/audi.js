/**
 * Audi
 *
 * 從頁面分別爬回來
 *
 */
const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');

const runZones = (urls) => new Promise((resolve, reject) => {
  const data = [];

  async.eachSeries(urls, async (itm) => {
    const _url = `https://www.audi.com.tw${itm}`;
    const rs = await axios.get(_url);
    const $ = cheerio.load(rs.data);
    const name = $('h1.nm-module-headline-combined').text().split('臺').join('台')
      .replace(' (試營運中)', '')
      .trim();
    const address = $('.nm-content-paragraph').eq(0).find('.nm-content-paragraph__text-container > .audi-copy-m').text()
      .split('地址:')[1].trim().split('臺').join('台');
    const phone = $('.nm-content-paragraph').eq(0).find('.nm-content-paragraph__text-container > .audi-copy-m').contents()
      .eq(0)
      .text()
      .replace('電話:', '')
      .trim();
    data.push({
      name,
      address,
      brand_group: 'Audi',
      phone,
      category1: '專業零售通路',
      category2: '汽車展示中心',
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
  const url = 'https://www.audi.com.tw/tw/web/zh/customer-area2/dealer.html';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const navs = $('ul#nm-navigation li > a');

  const urls = [];
  navs.each((i) => {
    if (navs.eq(i).text() !== '總覽') {
      urls.push(navs.eq(i).attr('href'));
    }
  });
  const d = await runZones(urls);

  return d;
};

module.exports = run;
