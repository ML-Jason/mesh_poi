/**
 * BMW
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');

const run = async () => {
  const url = 'https://www.bmw.com.tw/content/dam/bmw/marketTW/bmw_com_tw/dealer-locator-iframe/js/locations.json';

  const rs = await axios.get(url);
  const data = [];
  // ['dealers', 'service', 'usedcars'].forEach((v0) => {
  ['dealers'].forEach((v0) => {
    Object.keys(rs.data[v0]).forEach((k) => {
      const _list = rs.data[v0][k];
      _list.forEach((v) => {
        const _dname = v.name.trim();
        const _f = data.find((f) => f.name === _dname);
        if (_f) return;
        data.push({
          name: _dname,
          address: v.address.replace(/^\d*/, ''),
          phone: v.phone,
          lat: v.lati,
          lon: v.longi,
          brand_group: 'BMW',
          category1: '專業零售通路',
          category2: '汽車展示中心',
        });
      });
    });
  });

  return data;
};

module.exports = run;
