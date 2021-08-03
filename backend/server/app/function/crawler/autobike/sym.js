/**
 * 三陽機車
 *
 * 從官網頁面分縣市一個一個爬回來。
 */

const axios = require('axios');
const cheerio = require('cheerio');
// const vcheck = require('~server/module/vartool/vcheck');

const runpages = async (page = 1) => {
  const url = `http://tw.sym-global.com/service.php?csn=&townVal=999&store_name=&page=${page}`;

  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const pageNow = Number($('.page > ul.pagein a.now')
    .attr('href')
    .split('&page=')[1]);

  let data = [];
  if (page > pageNow) return [];

  const storetables = $('.storetable > table > tbody > tr > td table > tbody');
  // console.log(storetables.length);
  storetables.each((index) => {
    // console.log(index);
    const name = storetables.eq(index).find('tr:nth-child(1) > td:nth-child(2)').text();
    const address = storetables.eq(index).find('tr:nth-child(3) > td:nth-child(2)').text();
    const phone = storetables.eq(index).find('tr:nth-child(5) > td:nth-child(2)').text();
    data.push({
      name,
      address,
      phone,
      brand_group: '三陽機車',
      category1: '專業零售通路',
      category2: '機車原廠授權據點',
    });
  });

  const data2 = await runpages(page + 1);
  data = [...data, ...data2];

  return data;
};

const run = async () => {
  const data = await runpages();
  return data;
};

module.exports = run;
