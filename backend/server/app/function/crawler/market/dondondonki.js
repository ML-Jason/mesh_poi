const axios = require('axios');
const cheerio = require('cheerio');

const config = {
  url: 'https://www.dondondonki.com/tw/',
};

const fetchPageHtml = async (url) => {
  const rs = await axios.get(url);
  return cheerio.load(rs.data);
};

const getItems = ($) => {
  const data = [];

  $('#storeinfoBox ul li dt').each((i, e) => {
    const text = $(e).text();
    if (text === '店舖名稱') {
      const info = {
        brand_group: '唐吉軻德',
        category1: '綜合零售通路',
        category2: '藥妝通路',
      };
      const infoMap = { 店舖名稱: 'name', 地址: 'address', 聯絡電話: 'phone' };
      $(e).parent().parent().find('dt')
        .each((j, ee) => {
          const t = $(ee).text();
          if (infoMap[t]) {
            info[infoMap[t]] = $(ee).parent().find('dd').text()
              .trim();
          }
        });
      data.push(info);
    }
  });

  return data;
};

const run = async () => {
  const $ = await fetchPageHtml(config.url);
  const items = getItems($);

  return items;
};

module.exports = run;
