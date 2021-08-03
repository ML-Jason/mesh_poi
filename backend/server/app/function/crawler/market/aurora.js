/**
 * 夏普震旦
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.aurora.com.tw/comm/branch-office';

  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);

  const data = [];

  $('#PageListContainer > div.item').each((i, e) => {
    const name = $(e).find('.title').text();
    const phone = $(e).find('.left div').eq(2).text()
      .replace('電話：', '');
    const address = $(e).find('.left div.address').text().replace('地址：', '')
      .replace('臺灣', '')
      .split(' ')[0];

    data.push({
      name,
      address,
      phone,
      brand_group: '夏普震旦',
      category1: '綜合零售通路',
      category2: '3C家電',
    });
  });

  return data;
};

module.exports = run;
