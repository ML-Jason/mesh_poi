/**
 * 墊腳石
 * 從墊腳石購物網抓取門市資料回來（因為有API可以直接拿)
 *
 */

const axios = require('axios');

const run = async () => {
  const url = 'https://webapi.91app.com/webapi/LocationV2/GetLocationList?startIndex=0&maxCount=100&r=null&isEnableRetailStore=false&lang=zh-TW&shopId=32014';

  const rs = await axios.get(url);

  // console.log(rs.data.Data.List);

  // eslint-disable-next-line array-callback-return
  const data = rs.data.Data.List.map((v) => {
    const lat = v.Latitude;
    const lon = v.Longitude;
    const name = v.Name;
    const address = v.Address;
    const phone = `${v.TelPrepend}-${v.Tel}`;

    return {
      lat,
      lon,
      name,
      address,
      phone,
      brand_group: '墊腳石',
      category1: '專業零售通路',
      category2: '文教零售',
    };
  });

  return data;
};

module.exports = run;
