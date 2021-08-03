/**
 * 大潤發
 *
 * 分店資訊直接render在頁面上，用axios抓回來分析就好。
 * 沒有經緯度。
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  const url = 'https://news.rt-mart.com.tw/main/%E5%88%86%E5%BA%97%E8%B3%87%E8%A8%8A-61';

  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const nodes = $('section[data-sectiontype="TextBox"]');

  const data = [];
  nodes.each((i, ele) => {
    const nameNode = $(ele).find('p.inner strong.bold');
    if (nameNode.length === 1) {
      const name = $(ele).find('p.inner strong.bold').text();
      const addressNode = $(ele).find('.caption');
      const address = $(addressNode).find('span > span').first().text()
        .replace('地址：', '');

      data.push({
        name,
        address,
        brand_group: '大潤發',
        category1: '綜合零售通路',
        category2: '量販',
      });
    }
  });

  return data;
};

module.exports = run;
