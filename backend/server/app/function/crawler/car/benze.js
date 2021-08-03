/**
 * BENZE
 *
 * 好像所有分店資訊透過一個網址就可讀取，但是偶爾會發生資料回傳不完全的狀況，因此可能需要額外確認。
 */

const axios = require('axios');

const runpage = async (page, type = 'SALES') => {
  // const url = 'https://api.corpinter.net/dlc/dms/v2/dealers/search?strictGeo=true&marketCode=TW&localeLanguage=true&configurationExternalId=Dlp&searchProfileName=DLp_tw&distance=25km&fields=baseInfo.externalId,baseInfo.name1,baseInfo.name2,baseInfo.name3,baseInfo.name4,baseInfo.name5,brands,address,functions.activityCode';
  const url = `https://api.corpinter.net/dlc/dms/v2/dealers/search?strictGeo=true&marketCode=TW&localeLanguage=true&configurationExternalId=Dlp&searchProfileName=DLp_tw&distance=25km&fields=*&filters=functions.activityCode=${type}`;

  const rs = await axios.get(url, {
    headers: { 'x-apikey': '45ab9277-3014-4c9e-b059-6c0542ad9484' },
    params: { page },
  });

  const d = rs.data.results || [];
  // console.log(`${d.length}/${rs.data.total}, ${page}`);

  if (d.length === 0) {
    return d;
  }
  const rs2 = await runpage(page + 1, type);
  return [...d, ...rs2];
};

const run = async () => {
  const dealers = await runpage(1, 'SALES');
  const services = await runpage(1, 'SERVICE');
  const used = await runpage(1, 'USED-VEHICLES-TRADE');

  const data = [];
  [dealers, services, used].forEach((v0) => {
    v0.forEach((v) => {
      const name = v.brands[0].businessName.trim();
      const _addrArray = v.address.line1.trim().split(' ');
      const _addrNum = _addrArray.shift();
      _addrArray.push(_addrNum);
      let address = v.address.city + _addrArray.join('');
      address = address.split('臺').join('台').trim();
      const lat = v.address.latitude;
      const lon = v.address.longitude;
      const { phone } = v.contact;

      const found = data.find((f) => f.name === name);
      if (found) return;

      data.push({
        name,
        address,
        phone,
        lat,
        lon,
        brand_group: '賓士',
        category1: '專業零售通路',
        category2: '汽車展示中心',
      });
    });
  });

  console.log(data.length);
  return data;
  // return [];
};

module.exports = run;
