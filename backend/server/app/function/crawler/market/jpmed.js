const axios = require('axios');

const config = {
  url: 'https://www.jpmed.com.tw/_zh-TW/ajaxGetStore.ashx?cityid=&areaid=',
};

const fetchData = async (url) => {
  const { data } = await axios.get(url);
  return data;
};

const run = async () => {
  const data = await fetchData(config.url);

  return data.map((d) => ({
    name: d.Title,
    address: d.Address,
    phone: d.Phone,
    brand_group: '日藥本舖',
    category1: '綜合零售通路',
    category2: '藥妝通路',
  }));
};

module.exports = run;
