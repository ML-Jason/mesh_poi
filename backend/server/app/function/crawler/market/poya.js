/**
 * 寶雅
 *
 * 所有店的資訊儲存在頁面的store_counties這個陣列裡，透過puppeteer取出即可。
 */

const puppeteer = require('puppeteer');

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
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  await page.goto('https://www.poya.com.tw/store', { timeout: 30000, waitUntil: 'networkidle2' });

  // eslint-disable-next-line no-undef
  const storesArray = await page.evaluate(() => store_counties);

  closeConnection({ browser, page });

  const data = [];
  Object.keys(storesArray).forEach((d0) => {
    const v = storesArray[d0];
    const city = v.name;
    Object.keys(v.districts).forEach((v2) => {
      const zone = v.districts[v2].name;
      v.districts[v2].stores.forEach((v3) => {
        const d = { city, zone };
        d.name = v3.store_name.replace(/\(.*\)/, '');
        d.address = v3.store_address;
        d.lat = v3.store_latitude;
        d.lon = v3.store_longitude;
        d.phone = v3.store_tel;
        d.brand_group = '寶雅';
        d.category1 = '綜合零售通路';
        d.category2 = '藥妝通路';
        data.push(d);
      });
    });
  });

  return data;
};

module.exports = run;
