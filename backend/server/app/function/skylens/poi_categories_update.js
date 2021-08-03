const axios = require('axios');
const categoriesAll = require('~server/app/function/categories/category_all');
const config = require('~server/config');

const call = async () => {
  const _cAll = await categoriesAll(false);

  const rs = await axios.request({
    // url: 'http://localhost:8010/api/2.0/poi/categories_update',
    // url: 'https://skylens.meshplus.com.tw/api/2.0/poi/categories_update',
    url: 'https://skylens.hinet.net/api/2.0/poi/categories_update',
    method: 'post',
    data: {
      token: config.SKYLENS_SECRET,
      categories: _cAll,
    },
  });

  await axios.request({
    // url: 'http://localhost:8010/api/2.0/poi/categories_update',
    url: 'https://skylens.meshplus.com.tw/api/2.0/poi/categories_update',
    method: 'post',
    data: {
      token: config.SKYLENS_SECRET,
      categories: _cAll,
    },
  });

  return rs.data;
};

module.exports = call;
