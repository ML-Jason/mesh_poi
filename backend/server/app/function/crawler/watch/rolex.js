/**
 * Uniqlo
 *
 * https://www.uniqlo.com/tw/stores 有全部門是的資訊，html格式不統一，直接抓外層div用文字處理拿到數據。
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://www.rolex.com/zh-hant/rolex-dealers/taiwanregion.html#mode=list';
  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const data = [];

  $('#page .aem-container .aem-GridColumn:nth-child(4) section.sc-pYbfr ul.sc-pcjuG li').each((i, e) => {
    const name = $(e).find('p').text();
    const address = $(e).find('address span.sc-fzoxKX.sc-fznMnq.sc-oTzDS.fotNMM').text().replace(/^\d*/, '')
      .split(' ')
      .join('');
    let phone = $(e).find('section ul li:first-child a').attr('href');

    if (address) {
      phone = phone.replace('tel:', '');

      phone.replace('tel', '');
      data.push({
        name,
        address,
        phone,
        brand_group: 'Rolex',
        category1: '專業零售通路',
        category2: '鐘錶店',
      });
    }
  });

  return data;
};

module.exports = run;
