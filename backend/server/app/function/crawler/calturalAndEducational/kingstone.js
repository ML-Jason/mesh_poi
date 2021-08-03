/**
 * 金石堂
 * 有API可以用，但是吐html，所以還是要爬dom
 * 電話在下一層網址有，因為非必須欄位，就沒有爬了
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.kingstone.com.tw/Stores/getStoreList';
  const headers = {
    Accept: 'text/html, */*; q=0.01',
    Origin: 'https://www.kingstone.com.tw',
    Referer: 'https://www.kingstone.com.tw/stores/',
    'X-Requested-With': 'XMLHttpRequest',
  };
  const rs = await axios.post(url, {}, { headers });

  // console.log(rs.data);
  const $ = cheerio.load(rs.data);

  const data = [];
  const nameSelector = $('.siNameAdd > .siName');
  const addressSelector = $('.siNameAdd > .siAdd');
  $('li').not('.sSearchResultFail').each((i) => {
    const name = nameSelector.eq(i).text().trim();
    const address = addressSelector.eq(i).text().replace('│', '').replace(/\(.*\)/, '')
      .trim();

    data.push({
      name,
      address,
      brand_group: '金石堂',
      category1: '專業零售通路',
      category2: '文教零售',
    });
  });

  return data;
};

module.exports = run;
