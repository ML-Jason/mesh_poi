/*
  World Gym世界健身俱樂部

  api: https://app.worldgymtaiwan.com/zh-tw/api/office_city
*/

const axios = require('axios');

const config = {
  url: 'https://app.worldgymtaiwan.com/zh-tw/api/office_city',
};

const fetchData = async (url) => {
  const { data } = await axios.get(url);
  return data;
};

const run = async () => {
  const data = await fetchData(config.url);
  const list = [];
  data.data.forEach((city) => city.offices.forEach((office) => {
    const address = office.zipcode.split(' ').slice(1).join('') + office.address;
    list.push({
      name: office.name,
      address,
      phone: office.phone,
      lat: office.lat,
      lon: office.lng,
      brand_group: 'World Gym世界健身俱樂部',
      category1: '運動',
      category2: '健身房',
    });
  }));

  return list;
};

module.exports = run;
