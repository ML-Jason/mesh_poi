/**
 * Porsche
 *
 * 官網一個一個店抓回來。
 */

const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');

const runPages = (pages) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(pages, 1, async (page) => {
    const url = page.link;
    const rs = await axios.get(url);
    const $ = cheerio.load(rs.data);

    let _txt = $('.b-standard-content-wrapper').text();
    if (_txt === '') _txt = $('.b-standard-module-wrapper').text();
    const address = _txt
      .split('地址')[1]
      .split('電話')[0]
      .split('\n')[0]
      .replace(':', '')
      .replace('：', '')
      .split(' ')
      .join('')
      .replace(/^\d*/, '');
    const phone = _txt
      .split('電話')[1]
      .split('傳真')[0]
      .split('\n')[0]
      .replace(':', '')
      .replace('：', '')
      .trim();

    data.push({
      name: page.name,
      address,
      phone,
      brand_group: 'Porsche',
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
  const url = 'https://www.porsche.com/taiwan/zh-tw/aboutporsche/importers/dealer/';

  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const pages = [];
  $('.b-standard-content-wrapper > a').each((i, ele) => {
    const _link = $(ele).attr('href');
    const _name = $(ele).find('span').text().trim();
    pages.push({ link: _link, name: _name });
  });

  const data = await runPages(pages);

  return data;
};

module.exports = run;
