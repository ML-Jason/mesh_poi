/**
 * 頂好超市
 *
 * 有一個網址可以回傳所有分店資料，只是需要分頁。
 * 經緯度隱藏在另開google map的按鈕連結上，解析取出即可。
 */

const cheerio = require('cheerio');
const FormData = require('form-data');
const axios = require('axios');

let data = [];

const runPage = async (page, cb) => {
  const url = 'http://www.wellcome.com.tw/CHT/Home/Search';
  const form = new FormData();
  form.append('commandid', 'SearchStore');
  form.append('page', page);
  form.append('flag', 1);
  form.append('strLanguag', 'CHT');
  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  const $ = cheerio.load(rs.data);
  // 取得總數
  // const totalcount = Number($('h3 > span').text());
  const nodes = $('.result > dl');
  nodes.each((i, ele) => {
    const name = $(ele).children('dt').text();
    const address = $(ele).children('address').text().replace('地址：', '');
    // 解析經緯度
    const onclick = $(ele).children('address').attr('onclick');
    const latlon = onclick.split('?q=')[1].split("'")[0].split('%2c');
    const lat = latlon[0].replace('+', '');
    const lon = latlon[1].replace('+', '');
    data.push({
      name,
      address,
      lat,
      lon,
      brand_group: '頂好Wellcome',
      category1: '綜合零售通路',
      category2: '超市',
    });
  });
  // console.log(`${data.length}/${totalcount}`);
  // console.log(nodes.length);
  // if (data.length >= totalcount) {
  if (nodes.length < 12) {
    cb(data);
  } else {
    runPage(page + 1, cb);
  }
};

const run = () => new Promise((resolve) => {
  data = [];
  runPage(1, (d) => {
    resolve(d);
  });
});

module.exports = run;
