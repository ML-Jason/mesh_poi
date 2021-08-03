const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const async = require('async');
const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');

/**
 * 全家超商
 *
 * 透過api分別先取得各個縣市的區域，再依照區域透過api去取得該區域的分店資訊。
 * 有時似乎會噴http 500，原因尚不明，目前先在每個query完成後先暫停500ms，以免太過快速存取造成系統噴錯誤。
 */
const openConnection = async () => {
  const launchOptions = {
    headless: true,
    // headless: false,
    // slowMo: 50,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      // '--timeout=30000',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      // '--single-process',
      "--proxy-server='direct://'",
      '--proxy-bypass-list=*',
      '--deterministic-fetch',
    ],
  };
  // --single-process 在windows上跑會出錯，上正式環境再加上去
  if (process.env.NODE_ENV !== 'development') launchOptions.args.push('--single-process');

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  return { browser, page };
};

const closeConnection = async ({ browser, page }) => {
  try {
    if (page) await page.close();
    if (browser) await browser.close();
  } catch (e) {
    /* console.log(e); */
  }
};

const sleep = (time) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, time);
});

const getZone = async (city, zone) => {
  console.log(`${city},${zone}`);
  const url = 'https://api.map.com.tw/net/familyShop.aspx';
  const rs = await axios.get(url, {
    params: {
      searchType: 'ShopList',
      city,
      area: zone,
      type: '',
      road: '',
      fun: 'showStoreList',
      key: '6F30E8BF706D653965BDE302661D1241F8BE9EBC',
    },
    headers: {
      Referer: 'https://www.family.com.tw/',
    },
  });
  // console.log(rs.data);
  let strs = rs.data.replace('showStoreList(', '');
  strs = strs.substr(0, strs.length - 1);
  const data = JSON.parse(strs);

  // console.log(data);
  await sleep(500);

  return data.map((v) => ({
    name: v.NAME,
    phone: v.TEL,
    address: v.addr,
    city,
    zone,
    lat: v.py,
    lon: v.px,
  }));
};

const getZones = (city, zones) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(zones, async (zone) => {
    const rs = await getZone(city, zone);
    data = [...data, ...rs];
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const getCity = async (cityname) => {
  const url = 'https://api.map.com.tw/net/familyShop.aspx';
  const rs = await axios.get(url, {
    params: {
      searchType: 'ShowTownList',
      city: cityname,
      type: '',
      fun: 'storeTownList',
      key: '6F30E8BF706D653965BDE302661D1241F8BE9EBC',
    },
    headers: {
      Referer: 'https://www.family.com.tw/',
    },
  });

  let zoneStr = rs.data.replace('storeTownList(', '');
  zoneStr = zoneStr.substr(0, zoneStr.length - 1);
  const zones = (JSON.parse(zoneStr)).map((v) => v.town);

  const data = await getZones(cityname, zones);
  return data;
};

const runCities = (cities) => new Promise((resolve, reject) => {
  let data = [];
  async.eachSeries(cities, async (cityname) => {
    const rs = await getCity(cityname);
    data = [...data, ...rs];
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const run = async () => {
  const { browser, page } = await openConnection();
  // const uagent = await browser.userAgent();
  // console.log(uagent);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  await page.goto('https://www.family.com.tw/marketing/inquiry.aspx', { timeout: 30000, waitUntil: 'networkidle2' });
  const pagecontent = await page.content();
  closeConnection({ browser, page });

  const $ = cheerio.load(pagecontent);

  const cityBtns = $('#taiwanMap > div');
  const cities = [];
  for (let i = 0; i < cityBtns.length; i += 1) {
    // cities.push($(cityBtns[i]).attr('class').split(' ')[0]);
    cities.push($(cityBtns[i]).text());
  }

  const data = await runCities(cities);
  // console.log(data.length);

  const finaldata = data.map((v) => {
    const d = {
      name: vcheck.toSBC(v.name),
      address: vcheck.toSBC(v.address),
      // city: v.city,
      // district: v.zone,
      phone: vcheck.str(v.phone),
      lat: vcheck.number(v.lat) || '',
      lon: vcheck.number(v.lon) || '',
      brand_group: '全家',
      category1: '綜合零售通路',
      category2: '便利超商',
    };

    // 在新竹晶電店發現經緯度顛倒
    if (d.lat > d.lon) {
      d.lat = vcheck.number(v.lon);
      d.lon = vcheck.number(v.lat);
    }

    // 地址有時會有像是 "(33064)桃園市桃園區三民路３段518號" 這樣的型態，所以要把前面()拿掉
    // d.address = d.address.replace(/^(\d|\(|\))*/, '');

    return d;
  });

  return finaldata;
};

module.exports = run;
