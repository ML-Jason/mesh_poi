/**
 * 威秀影城
 *
 * 官網有列表
 */

const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://www.vscinemas.com.tw/vsweb/theater/index.aspx';

  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const data = [];
  const ts = $('ul.theaterInfoList > li > .infoArea');
  ts.each((i, ele) => {
    const name = vcheck.toSBC($(ele).find('h2').text());
    const address = vcheck.toSBC($(ele).find('p').eq(0).text()
      .replace('影城地址：', ''));
    const phone = vcheck.toSBC($(ele).find('p').eq(1).text()
      .replace('服務專線：', ''));
    if (name === '台南南紡威秀影城') {
      data.push({
        name: '台南南紡威秀影城(A1)',
        address: '台南市東區中華東路一段366號5樓',
        phone,
        lat: 22.99131190548963,
        lon: 120.23332844496416,
        brand_group: '威秀影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
      data.push({
        name: '台南南紡威秀影城(A2)',
        address: '台南市東區中華東路一段358號B1樓',
        phone,
        lat: 22.99232592239204,
        lon: 120.23343628590555,
        brand_group: '威秀影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
    } else {
      data.push({
        name,
        address,
        phone,
        brand_group: '威秀影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
    }
  });

  return data;
};

module.exports = run;
