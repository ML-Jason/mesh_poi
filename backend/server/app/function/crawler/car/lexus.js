/**
 * LEXUS
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');

const run = async () => {
  const url = 'https://www.lexus.com.tw/WS_Owners.asmx/GetLocation';

  const d = { ORGKINDID: '02' };
  const rs = await axios.post(url,
    JSON.stringify(d), {
      headers: { 'Content-Type': 'application/json' },
    // data: { ORGKINDID: '02' },
    });
  const rsd = JSON.parse(rs.data.d).DATA;
  const data = rsd.map((v) => ({
    name: v.BRANCHFULLNM,
    address: v.ADDR,
    lat: v.LATITUDE,
    lon: v.LONGITUDE,
    phone: v.TEL,
    brand_group: 'LEXUS',
    category1: '專業零售通路',
    category2: '汽車展示中心',
  }));
  // console.log(data);

  return data;
};

module.exports = run;
