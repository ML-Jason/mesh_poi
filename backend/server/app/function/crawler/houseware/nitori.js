/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Nitori
 *
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const areas = ['北部', '中部', '南部', '東部'];
  const data = [];

  for (let area of areas) {
    area = encodeURIComponent(area);
    const rs = await axios.get(`https://www.nitori.com.tw/map/${area}`);

    const $ = cheerio.load(rs.data);

    $('.city .store').each((i, e) => {
      const name = $(e).find('.storeName').text();
      const address = $(e).find('.messageContent .word').eq(0).text();
      const phone = $(e).find('.messageContent .word').eq(1).html()
        .split('<br>')[0];

      data.push({
        name,
        address,
        phone,
        brand_group: '宜得利',
        category1: '綜合零售通路',
        category2: '居家用品',
      });
    });
  }
  return data;
};

module.exports = run;
