/*
  中興嘟嘟房

  https://www.dodohome.com.tw/p2_map.aspx

  POST https://www.dodohome.com.tw/p2_map.aspx/Search
    data: {"selCountry":"ALL","selService":"","strLat":"","strLng":""}

  但回傳的是 DOM 結構
*/
const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  const list = [];
  const { data } = await axios.post(
    'https://www.dodohome.com.tw/p2_map.aspx/Search',
    {
      selCountry: 'ALL', selService: '', strLat: '', strLng: '',
    },
  );

  const $ = cheerio.load(data.d, null, false);
  $('tbody tr').each((i, e) => {
    const name = $(e).find('.f1').text();
    const address = $(e).find('.f2').text();
    const phone = $(e).find('.f3').text();
    const mapLinkParams = new URL($(e).find('.f6 a').attr('href')).searchParams;
    list.push({
      name,
      address,
      phone,
      lat: mapLinkParams.get('Y'),
      lon: mapLinkParams.get('X'),
      brand_group: '中興嘟嘟房',
      category1: '交通運輸',
      category2: '停車場',
    });
  });

  return list;
}

module.exports = run;
