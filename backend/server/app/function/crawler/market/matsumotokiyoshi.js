const axios = require('axios');
const cheerio = require('cheerio');

const config = {
  url: 'https://www.matsumotokiyoshi-tw.com/shopinfo',
};

const fetchPageHtml = async (url) => {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
};

const getItems = ($) => {
  const names = [];
  const addrs = [];
  const tels = [];
  $('._2bafp h4 span span').each((i, e) => {
    names.push($(e).text());
  });

  $('._2bafp p span span').each((i, e) => {
    const text = $(e).text();
    if (text.indexOf('地址：') !== -1) addrs.push(text.replace('地址：', ''));
    if (text.indexOf('電話：') !== -1) tels.push(text.replace('電話：', ''));
  });

  return names.map((name, i) => ({
    name,
    address: addrs[i],
    phone: tels[i],
    brand_group: '松本清',
    category1: '綜合零售通路',
    category2: '藥妝通路',
  }));
};

const run = async () => {
  const $ = await fetchPageHtml(config.url);
  const items = getItems($);

  return items;
};

module.exports = run;
