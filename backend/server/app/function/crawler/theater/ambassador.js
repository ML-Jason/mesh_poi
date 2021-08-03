/**
 * 國賓影城
 *
 * 官網有列表
 */

const axios = require('axios');
const cheerio = require('cheerio');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://www.ambassador.com.tw/home/TheaterList';

  const rs = await axios.get(url);
  const $ = cheerio.load(rs.data);

  const data = [];
  const ts = $('.theater > .cell');
  ts.each((i, ele) => {
    const name = vcheck.toSBC($(ele).find('.theater-info > h6').text());
    const address = vcheck.toSBC($(ele).find('.theater-info > p').eq(0).text());
    const phone = vcheck.toSBC($(ele).find('.theater-info > p').eq(1).text());
    if (name === '台南國賓影城') {
      data.push({
        name: '台南國賓影城(1)',
        address: '台南市東區中華東路一段66號',
        phone,
        lat: 22.996392813849216,
        lon: 120.23426434432311,
        brand_group: '國賓影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
      data.push({
        name: '台南國賓影城(2)',
        address: '台南市東區中華東路一段88號',
        phone,
        lat: 22.9955832529731,
        lon: 120.23410583796026,
        brand_group: '國賓影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
    } else {
      data.push({
        name,
        address,
        phone,
        brand_group: '國賓影城',
        category1: '休閒娛樂',
        category2: '電影院',
      });
    }
  });

  return data;
};

module.exports = run;
