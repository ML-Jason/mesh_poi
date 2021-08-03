/*
  英倫產後護理之家

  https://ltca.mohw.gov.tw/opn

  GET https://ltca.mohw.gov.tw/OPN/QueryDep
    params: {
      data: {"nhaseq":"2","area_code":"","bas_agency_id":"","bas_name":"藍田","evaresult":"","bas_status":"02"},
      page: 1,
      start: 0,
      limit: 25
    }
*/
const axios = require('axios');

async function run() {
  const { data } = await axios.get('https://ltca.mohw.gov.tw/OPN/QueryDep', {
    params: {
      data: {
        nhaseq: '2',
        area_code: '',
        bas_agency_id: '',
        bas_name: '英倫',
        evaresult: '',
        bas_status: '02',
      },
      page: 1,
      start: 0,
      limit: 25,
    },
  });

  const list = data.data.map(({ map }) => ({
    name: map.bas_name,
    address: map.addr,
    phone: map.bas_tel_no,
    brand_group: '英倫產後護理之家',
    category1: '生活服務',
    category2: '月子中心',
  }));

  return list;
}

module.exports = run;
