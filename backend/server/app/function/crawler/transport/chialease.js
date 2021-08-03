/*
  中租租車

  https://www.rentalcar.com.tw/Location

  取頁面上的 global variable: StationList
*/
const puppeteer = require('puppeteer');

const openConnection = async () => {
  const launchOptions = {
    headless: true,
    // headless: false,
    slowMo: 50,
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

const fixAddress = (address) => address.replace(/<br\/?>/gmi, '');

const run = async () => {
  const url = 'https://www.rentalcar.com.tw/Location';
  const { browser, page } = await openConnection();
  const list = [];

  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.goto(url, { timeout: 30000, waitUntil: 'networkidle0' });

    const stationList = await page.evaluate(() => window.StationList);

    stationList.forEach((city) => {
      city.StationList
        .filter((s) => s.ADDRESS.indexOf('【預約接送點】') < 0)
        .forEach((s) => {
          list.push({
            name: s.STATION_NME.trim(),
            address: fixAddress(s.ADDRESS).trim(),
            phone: s.TEL,
            lat: s.LGD,
            lon: s.LTD,
            brand_group: '中租租車',
            category1: '交通運輸',
            category2: '租車營業據點',
          });
        });
    });
  } finally {
    closeConnection({ browser, page });
  }

  return list;
};

module.exports = run;
