const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');

const call = async () => {
  const url = 'https://www.mcdonalds.com/googleapps/GoogleRestaurantLocAction.do'
    + '?method=searchLocation&latitude=25.0329694&longitude=121.5654177'
    + '&radius=1000&maxResults=1000&country=tw&language=zh-tw&showClosed=&hours24Text=Open%2024%20hr';
  const rs = await axios.request({
    url,
    method: 'get',
    headers: {
      referer: 'https://www.mcdonalds.com/tw/zh-tw/restaurant-locator.html',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    },
  });

  // console.log(rs.data);

  // console.log(rs.data.features.length);
  const _data = rs.data.features.map((v) => {
    const lat = v.geometry.coordinates[1];
    const lon = v.geometry.coordinates[0];
    const _name = vcheck.toSBC(v.properties.name);
    const address = vcheck.toSBC(v.properties.addressLine1);
    const phone = vcheck.toSBC(v.properties.telephone);

    return {
      lat,
      lon,
      name: _name,
      address,
      phone,
      brand_group: '麥當勞',
      category1: '餐飲',
      category2: '速食類',
    };
  });
  // console.log(_data[0]);

  return _data;
};

module.exports = call;
