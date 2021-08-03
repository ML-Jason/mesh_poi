/**
 * 家樂福
 *
 * 所有店的資訊可透過一支api取得。
 * 需要注意的是家樂福有分'量販'或'超市'，是由store_type_name這個欄位定義
 *
 */

// const XLSX = require('xlsx');
const axios = require('axios');
// const stagePOI = require('~root/server/app/function/crawler/stagePOI');

const run = async () => {
  const url = 'https://www.carrefour.com.tw/console/api/v1/stores?is24h=&page_size=all';
  const rs = await axios.get(url);

  const stores = rs.data.data.rows;

  // console.log(stores);

  const data = stores.map((v) => {
    const d = {};
    d.address = v.address.trim().replace(/^(\d|\(|\))*/, '').trim();
    if (d.address === '中港路336號') d.address = '新北市新莊區中港路336號';
    if (d.address === '雙鳳路59號') d.address = '新北市新莊區雙鳳路59號';
    if (d.address.indexOf('台中市北區台中市北區') === 0) d.address = d.address.replace('台中市北區台中市北區', '台中市北區');
    if (d.address === '台中市北屯區平田里13鄰興安路一段288號') d.address = '台中市北屯區興安路一段288號';
    if (d.address === '桃園市八德區介壽路一段728號B2') d.address = '桃園市八德區介壽路一段728號B2樓';
    d.phone = v.contact_tel;
    d.name = v.name;
    d.lat = v.latitude;
    d.lon = v.longitude;
    // d.store_type_name = v.store_type_name; // 有'量販'或'超市'
    d.brand_group = `家樂福${v.store_type_name}`;
    d.category1 = '綜合零售通路';
    d.category2 = v.store_type_name;
    return d;
  });

  const data1 = data.filter((f) => f.brand_group === '家樂福量販');
  const data2 = data.filter((f) => f.brand_group === '家樂福超市');

  // const fields = 'category,group,name,address,lat,lon'.split(',');
  // const wb = XLSX.utils.book_new();
  // const ws_data = [fields];
  // for (let i = 0; i < data.length; i += 1) {
  //   const dw = [];
  //   dw.push(data[i].category);
  //   dw.push(data[i].group);
  //   dw.push(data[i].name);
  //   dw.push(data[i].address);
  //   dw.push(data[i].lat || '');
  //   dw.push(data[i].lon || '');
  //   ws_data.push(dw);
  // }
  // const ws = XLSX.utils.aoa_to_sheet(ws_data);
  // XLSX.utils.book_append_sheet(wb, ws, '家樂福');

  // XLSX.writeFile(wb, './server/data/market/家樂福.xlsx');
  // console.log('write excel done');
  // await stagePOI(data1);
  // await stagePOI(data2);

  return { data: [data1, data2] };
};

module.exports = run;
