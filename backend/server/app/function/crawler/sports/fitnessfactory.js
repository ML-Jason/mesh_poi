/*
  健身工廠

  https://www.fitnessfactory.com.tw/locations

  選擇地區 > 取得地區 id > https://www.fitnessfactory.com.tw/findLocationsName?id=0 >
  取得分店名 > https://www.fitnessfactory.com.tw/findGoogleMapLocations?id=3
 */

const axios = require('axios');
const cheerio = require('cheerio');

const config = {
  url: 'https://www.fitnessfactory.com.tw/locations',
  findLocationsName: 'https://www.fitnessfactory.com.tw/findLocationsName',
  findGoogleMapLocations: 'https://www.fitnessfactory.com.tw/findGoogleMapLocations',
};

async function fetchPageHtml(url) {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
}

async function run() {
  const list = [];
  const $ = await fetchPageHtml(config.url);

  // 取得地區 id
  const regionIds = [];
  $('#region option').each((i, e) => {
    const text = $(e).text();
    const id = $(e).attr('value');
    if (text !== '請選擇地區') regionIds.push(id);
  });

  for (let i = 0; i < regionIds.length; i += 1) {
    const regionId = regionIds[i];

    // 取得分店名
    // eslint-disable-next-line
    const { data: names } = await axios.get(config.findLocationsName, {
      params: { id: regionId },
    });

    for (let j = 0; j < names.length; j += 1) {
      const name = names[j];

      // 取得分店資訊
      // eslint-disable-next-line
      const { data: locations } = await axios.get(config.findGoogleMapLocations, {
        params: { id: name.id },
      });

      locations.forEach((loc) => {
        list.push({
          name: loc.location,
          address: loc.address,
          phone: loc.phone,
          lat: loc.lat,
          lon: loc.lng,
          brand_group: '健身工廠',
          category1: '運動',
          category2: '健身房',
        });
      });
    }
  }

  return list;
}

module.exports = run;
