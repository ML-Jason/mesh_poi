/**
 * Gogoro
 *
 * 所有分店資訊透過一個網址就可讀取。
 */
const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://proxy.bach.gogoro.com/https://docs.google.com/spreadsheets/d/e/2PACX-1vTqYaeaddnGbrXy2nWD2gumIW5P3jhczhKOpRm0MM9A3STTxa5f37WhcIK7zjG1tPc-GC25VBQ85rWW/pub?gid=0&single=true&output=csv&host=www.gogoro.com';
  const rs = await axios.get(url, {
    headers: { origin: 'https://www.gogoro.com' },
  });
  let nameI = 0;
  let addI = 0;
  let latI = 0;
  let lngI = 0;
  let phoneI = 0;

  const data = rs.data.split('\r\n').map((v, i) => {
    const d = v.split(',');
    if (i === 0) {
      d.forEach((v2, i2) => {
        if (v2 === 'Store Name') nameI = i2;
        if (v2 === 'Address') addI = i2;
        if (v2 === 'lat') latI = i2;
        if (v2 === 'lng') lngI = i2;
        if (v2 === 'Store Phone') phoneI = i2;
      });
      return {};
    }
    return {
      name: vcheck.str(d[nameI]),
      address: d[addI],
      lat: d[latI],
      lon: d[lngI],
      phone: d[phoneI],
      brand_group: 'Gogoro',
      category1: '專業零售通路',
      category2: '機車原廠授權據點',
    };
  }).filter((f) => vcheck.str(f.name) !== '');
  // console.log(data);
  return data;
};

module.exports = run;
