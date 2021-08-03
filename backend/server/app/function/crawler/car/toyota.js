/**
 * TOYOTA
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');
const FormData = require('form-data');

const run = async () => {
  const url = 'https://www.toyota.com.tw/api/location.ashx';
  const form = new FormData();
  form.append('TYPE', 1);

  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  const data = rs.data.DATA.map((v) => {
    const address = v.ADDR.split(' ').join('').split('臺').join('台');
    const name = v.TITLE;
    const phone = v.TEL;
    const lat = v.LAT;
    const lon = v.LNG;
    const d = {
      name,
      address,
      lat,
      lon,
      phone,
      brand_group: 'TOYOTA',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    };
    return d;
  });

  return data;
};

module.exports = run;
