/**
 * 三葉機車
 *
 * 從官網一個頁面就可以爬回來。
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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

const sleep = (time) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, time);
});

const run = async () => {
  const url = 'https://www.yamaha-motor.com.tw/service.aspx?v=1&km=5&classname=area';

  const { browser, page } = await openConnection();
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.goto(url, { timeout: 30000, waitUntil: 'networkidle0' });

    await sleep(1000);

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const data = [];
    const dblocks = $('#result-list > .store');
    console.log(dblocks.length);

    dblocks.each((i, ele) => {
      const name = $(ele).find('.store-name').text().replace('標章說明', '')
        .trim();
      const addressUnit = $(ele).find('.store-details > li.address > a');
      const address = $(addressUnit).text().split(' ').join('');
      const latlng = ($(addressUnit).attr('href').split('@')[1] || '').split(',');
      const lat = latlng[0] || '';
      const lon = latlng[1] || '';
      const phone = $(ele).find('.store-details > li.phone').text();

      data.push({
        name,
        address,
        phone,
        lat,
        lon,
        brand_group: '山葉機車',
        category1: '專業零售通路',
        category2: '機車原廠授權據點',
      });
    });

    closeConnection({ browser, page });
    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
