/*
  格上租車

  POST https://www.car-plus.com.tw/branch/getBranchPage
    Payload {"hidBranchCatID":"","hidStationMode":"","hidCommunications":""}

  只留 catname = 短期租車
*/
const axios = require('axios');
const trimStartZipCode = require('../../utils/trimStartZipCode');

async function run() {
  const { data } = await axios.post('https://www.car-plus.com.tw/branch/getBranchPage', {
    hidBranchCatID: '', hidStationMode: '', hidCommunications: '',
  });

  const list = data
    .filter((d) => d.catname === '短期租車' && d.addr)
    .map((d) => ({
      name: d.branchname.trim(),
      address: trimStartZipCode(d.addr).trim(),
      phone: d.tel.trim(),
      lat: d.lat,
      lon: d.lng,
      brand_group: '格上租車',
      category1: '交通運輸',
      category2: '租車營業據點',
    }));

  return list;
}

module.exports = run;
