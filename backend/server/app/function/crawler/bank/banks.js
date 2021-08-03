/**
 * 銀行
 *
 * 從央行的api取得
 * 金融機構查詢：https://www.cbc.gov.tw/tw/sp-bank-qform-1.html
 */
const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

const banks = ['臺灣銀行', '臺灣土地銀行', '合作金庫商業銀行', '第一商業銀行', '華南商業銀行', '彰化商業銀行', '上海商業儲蓄銀行', '台北富邦商業銀行', '國泰世華商業銀行',
  '中國輸出入銀行', '高雄銀行', '兆豐國際商業銀行', '全國農業金庫', '花旗(台灣)商業銀行', '王道商業銀行', '臺灣中小企業銀行', '渣打國際商業銀行', '台中商業銀行', '京城商業銀行',
  '滙豐(台灣)商業銀行', '瑞興商業銀行', '華泰商業銀行', '臺灣新光商業銀行', '陽信商業銀行', '板信商業銀行', '三信商業銀行', '聯邦商業銀行', '遠東國際商業銀行', '元大商業銀行',
  '永豐商業銀行', '玉山商業銀行', '凱基商業銀行', '星展(台灣)商業銀行', '台新國際商業銀行', '日盛國際商業銀行', '安泰商業銀行', '中國信託商業銀行'];

const getGroup = (bankname) => {
  const found = banks.find((f) => {
    if (bankname.trim().indexOf(f) === 0) return true;
    return false;
  });
  if (!found) throw new Error(`No such bank group: ${bankname}`);
  return found;
};

const getData = async (type) => {
  const url = 'https://www.cbc.gov.tw/tw/sp-bank-qresult-1.html';

  const form = new FormData();
  form.append('DDLBankType', type);
  form.append('CKBCheckBankType', 1);

  const rs = await axios.post(url, form, {
    headers: { ...form.getHeaders() },
  });

  // console.log(rs.data.Content);
  const $ = cheerio.load(rs.data.Content);
  const nodes = $('table:nth-child(2) tbody tr');
  // console.log(nodes.length);
  const data = [];
  nodes.each((i, ele) => {
    const tds = $(ele).children('td');
    const name = tds.eq(2).text().trim()
      .replace('臺中', '台中')
      .replace('臺北', '台北')
      .replace('臺南', '台南')
      .replace('臺東', '台東');
    const flag = tds.eq(3).text().trim();
    const address = tds.eq(4).text().trim()
      .split('臺')
      .join('台')
      .replace(/^\d*/, '')
      .split(' ')
      .join('');
    const phone = tds.eq(5).text().trim();

    if (flag) {
      data.push({
        name,
        address,
        phone,
        brand_group: getGroup(name),
        category1: '金融保險',
        category2: '銀行',
      });
    }
  });

  return data;
};

const run = async () => {
  const _data = await getData('01本國銀行');
  // await getData('02外國銀行', '外國銀行');
  const dataObj = {};
  _data.forEach((v) => {
    let _d = dataObj[v.brand_group];
    if (_d === undefined || _d === null) {
      _d = { brand_group: v.brand_group, stores: [] };
      dataObj[v.brand_group] = _d;
    }
    _d.stores.push(v);
  });

  const data = Object.keys(dataObj).map((v) => dataObj[v].stores);

  // console.log(data);
  // console.log(data[0]);
  // return [];

  return {
    data,
  };
};

module.exports = run;
