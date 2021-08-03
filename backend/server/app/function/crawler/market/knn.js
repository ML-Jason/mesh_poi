/**
 * 光南大批發
 *
 * 分店資訊在一個頁面上，直接爬dom
 */

const axios = require('axios');
const cheerio = require('cheerio');

const run = async () => {
  // 原始網址為: http://www.knn.com.tw/門市資訊
  const url = 'http://www.knn.com.tw/%E9%96%80%E5%B8%82%E8%B3%87%E8%A8%8A';

  const rs = await axios.get(url);

  const $ = cheerio.load(rs.data);
  const nodes = $('#og-grid > li');

  const data = [];
  nodes.each((i, ele) => {
    const name = $(ele).children('.retail_name').text().trim();
    const address = $(ele).children('.retail_detail:nth-child(3)').text()
      .replace(/(地址:(\W|)\d*)/, '')
      .replace(/\(.*\)/, '')
      .replace(/[^\u4e00-\u9fa50-9]/, '') // 去除非中文和數字的任何文字
      .trim();
    const phone = $(ele).children('.retail_detail:nth-child(4)').text()
      .replace('、', ',')
      .replace(/(傳真:.*)/, '')
      .replace('電話:', '')
      .replace(/(,$)/, '')
      .trim();

    data.push({
      name,
      address,
      phone,
      brand_group: '光南大批發',
      category1: '綜合零售通路',
      category2: '五金生活百貨',
    });
  });
  return data;
};

module.exports = run;
