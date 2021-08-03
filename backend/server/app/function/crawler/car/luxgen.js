/**
 * LUXGEN
 *
 * 所有店的資訊儲存在頁面的stores、stations、serviceStations這個三個陣列裡，透過puppeteer取出即可。
 */

const puppeteer = require('puppeteer');
const vcheck = require('~server/module/vartool/vcheck');

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
  // if (process.env.NODE_ENV !== 'development') launchOptions.args.push('--single-process');

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

const run = async () => {
  const { browser, page } = await openConnection();
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.goto('https://www.luxgen-motor.com.tw/Map/Shop', { timeout: 30000, waitUntil: 'networkidle2' });

    const storesArray = await page.evaluate(() => stores); // eslint-disable-line no-undef
    const stationsArray = await page.evaluate(() => stations); // eslint-disable-line no-undef
    const serviceStationsArray = await page.evaluate(() => serviceStations); // eslint-disable-line no-undef

    closeConnection({ browser, page });

    const data = [];
    [storesArray, stationsArray, serviceStationsArray].forEach((s) => {
      s.forEach((v) => {
        const d = {
          name: vcheck.toSBC(v.Name).trim().split('臺').join('台'),
          address: vcheck.toSBC(v.Address).split('臺').join('台').split(' ')
            .join('')
            .replace(/^(\d|\(|\))*/, ''),
          lat: v.Latitude,
          lon: v.Longitude,
          phone: v.Phone,
          brand_group: 'LUXGEN',
          category1: '專業零售通路',
          category2: '汽車展示中心',
        };

        const _f = data.find((f) => f.address === d.address);
        if (_f) return;

        if (d.name.indexOf('體驗站') < 0) data.push(d);
      });
    });

    closeConnection({ browser, page });
    return data;
    // console.log(data);
    // return [];
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
