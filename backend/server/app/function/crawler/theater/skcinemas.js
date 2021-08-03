/**
 * 新光影城
 *
 * 官網一個一個爬
 */

const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://api.skcinemas.com/Content/cinemas.html?1611213283799';

  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const data = [];
  const ts = $('.cinemas > .tab-content > .cinemas-tab-pane > .col-md-22 > .row');
  ts.each((i, ele) => {
    const name = vcheck.toSBC($(ele).find('.col-md-24:nth-child(1) > h3.title').text());
    const address = vcheck.toSBC($(ele).find('.col-md-24:nth-child(1) > p').eq(1).text()
      .replace('地址：', ''));
    const phone = vcheck.toSBC($(ele).find('.col-md-24:nth-child(1) > p').eq(0).text());
    data.push({
      name,
      address,
      phone,
      brand_group: '新光影城',
      category1: '休閒娛樂',
      category2: '電影院',
    });
  });

  return data;
};

module.exports = run;
