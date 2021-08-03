/**
 * BENZE
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');

const run = async () => {
  const url = 'https://www.volvocars.com/data/retailer?countryCode=TW&languageCode=ZH&northToSouthSearch=False&capability=&isOxp=False&sc_site=tw';

  const rs = await axios.get(url);

  const data = [];
  rs.data.forEach((v) => {
    const name = v.Name;
    const address = v.AddressLine1.split(' ').join('');
    const phone = v.Phone;
    const lat = v.GeoCode.Latitude;
    const lon = v.GeoCode.Longitude;
    data.push({
      name,
      address,
      phone,
      lat,
      lon,
      brand_group: 'Volvo',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    });
  });

  return data;
};

module.exports = run;
