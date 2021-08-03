const cheerio = require('cheerio');
const async = require('async');
const FormData = require('form-data');
const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');

/**
 * 統一超商
 *
 * 有api可以依照縣市以及區域取得分店資料。
 * 要取得地區資訊需要先用縣市代碼去取得該縣市的分區資料，縣市代碼埋設在html頁面上，擷取後簡化為以下sevent_cities陣列。
 *
 * 依序爬取各個縣市的各個區域資料即可。
 * api是使用form-data傳送，回傳的資料是XML，但一樣可以用cheerio解析。
 */

const sevent_cities = [
  '台北市 01', '基隆市 02', '新北市 03', '桃園市 04',
  '新竹市 05', '新竹縣 06', '苗栗縣 07', '台中市 08', '台中縣 09', '彰化縣 10', '南投縣 11', '雲林縣 12',
  '嘉義市 13', '嘉義縣 14', '台南市 15', '台南縣 16', '高雄市 17',
  '高雄縣 18', '屏東縣 19', '宜蘭縣 20', '花蓮縣 21', '台東縣 22',
  '澎湖縣 23', '金門縣 25', '連江縣 24',
];

const runCity = (city, zones) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(zones, 2, async (zone) => {
    const url = 'https://emap.pcsc.com.tw/EMapSDK.aspx';
    const form = new FormData();
    form.append('commandid', 'SearchStore');
    form.append('city', city.split(' ')[0]);
    form.append('town', zone.name);

    const rs = await axios.post(url, form, {
      headers: { ...form.getHeaders() },
    });
    // console.log(rs.data);

    const $ = cheerio.load(rs.data);
    const nodes = $('GeoPosition');
    nodes.each((i, ele) => {
      const name = vcheck.toSBC($(ele).children('POIName').text());
      const address = vcheck.toSBC($(ele).children('Address').text());
      const phone = vcheck.toSBC($(ele).children('Telno').text());
      const x = $(ele).children('X').text();
      let lon = x.split('');
      lon.splice(3, 0, '.');
      lon = lon.join('');
      const y = $(ele).children('Y').text();
      let lat = y.split('');
      lat.splice(2, 0, '.');
      lat = lat.join('');
      data.push({
        name,
        address,
        lat,
        lon,
        phone,
        brand_group: '7-ELEVEN',
        category1: '綜合零售通路',
        category2: '便利超商',
      });
    });
    // console.log(data[data.length - 1]);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});
const getCityZones = async (city) => {
  const url = 'https://emap.pcsc.com.tw/EMapSDK.aspx';
  const form = new FormData();
  form.append('commandid', 'GetTown');
  form.append('cityid', city.split(' ')[1]);

  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });
  const $ = cheerio.load(rs.data);
  const townNodes = $('GeoPosition');
  const towns = [];
  townNodes.each((i, ele) => {
    const townid = $(ele).children('TownID').text();
    const townname = $(ele).children('TownName').text();
    towns.push({ id: townid, name: townname });
  });
  return towns;
};
const runCities = (cities) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(cities, async (city) => {
    const zones = await getCityZones(city);
    const rs = await runCity(city, zones);
    data = [...rs, ...data];
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const data = await runCities(sevent_cities);

  return data;
};

module.exports = run;
