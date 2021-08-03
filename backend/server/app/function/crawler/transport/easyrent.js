/*
  和運租車

  https://www.easyrent.com.tw/location.html

  POST https://www.easyrent.com.tw/EasyrentService2019/api/Exec/locationQry
    data: {
      Token: ''
    }
*/
const axios = require('axios');

function fixAddress(address) {
  return address.replace(/\(配合防疫政策.*\)/, '');
}

async function run() {
  try {
    const { data } = await axios({
      method: 'post',
      url: 'https://www.easyrent.com.tw/EasyrentService2019/api/Exec/locationQry',
      data: {
        Token: '',
      },
    });
    const list = data.DATA.Table1
      .filter((d) => d.STATYPE === 'C')
      .map((d) => ({
        name: d.STANAME,
        address: fixAddress(d.ADDRESS_CN),
        phone: d.STATEL,
        lat: d.LON,
        lon: d.LAT,
        brand_group: '和運租車',
        category1: '交通運輸',
        category2: '租車營業據點',
      }));

    return list;
  } catch (error) {
    console.log('error:', error);
    return [];
  }
}

module.exports = run;
