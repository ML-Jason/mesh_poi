/**
 * 三菱
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');
const FormData = require('form-data');

const run = async () => {
  const url = 'https://www.mitsubishi-motors.com.tw/do/locationsdo.php';

  const form = new FormData();
  form.append('surl', 'https://api.5230.com.tw/cmcAPI/index.php/getNodeList/index/nodeType/1');

  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  const finaldata = rs.data.map((v) => {
    const address = v.address.split(' ').join('');
    const name = v.fullname;
    const lat = v.latitude;
    const lon = v.longitude;
    const phone = v.tel;
    const d = {
      name,
      address,
      lat,
      lon,
      phone,
      brand_group: '三菱',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    };
    return d;
  });

  return finaldata;
};

module.exports = run;
