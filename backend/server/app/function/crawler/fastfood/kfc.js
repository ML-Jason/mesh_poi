/**
 * 肯德基
 *
 * 一個API會回傳所有分店
 *
 */
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'https://www.kfcclub.com.tw/ShopSearch/GetShopData';
  const form = new FormData();
  form.append('data', '{"Method":"QueryShopsArea","Addr1":"","Addr2":"","OtherCondition":""}');
  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  const $ = cheerio.load(rs.data);
  const items = $('p');
  const data = [];
  items.each((i, ele) => {
    const d = {
      name: vcheck.toSBC($(ele).attr('name')),
      address: vcheck.toSBC($(ele).attr('addr')).split('臺').join(''),
      lat: $(ele).attr('lat'),
      lon: $(ele).attr('lon'),
      phone: $(ele).attr('phone'),
      brand_group: '肯德基',
      category1: '餐飲',
      category2: '速食類',
    };
    data.push(d);
  });

  return data;
};

module.exports = run;
