/**
 * 好樂迪
 *
 * 從選單取得分店頁面，各個頁面去爬。
 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const async = require('async');

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

const runPages = (urls, page) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(urls, 1, async (url) => {
    const _url = `https://www.holiday.com.tw${url}`;
    await page.goto(_url, { timeout: 30000, waitUntil: 'networkidle2' });
    await sleep(300);

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const _dom = $('div#room-info.row tr');
    const d = {
      name: $('h1#pageTitleh1').text().trim().split('臺')
        .join('台'),
      address: _dom.eq(2).find('td').eq(2).text()
        .trim()
        .split('臺')
        .join('台'),
      phone: _dom.eq(1).find('td').eq(2).text()
        .trim()
        .split('臺')
        .join('台'),
      brand_group: '好樂迪',
      category1: '休閒娛樂',
      category2: 'KTV',
    };
    // console.log(d);
    data.push(d);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const call = async () => {
  const { browser, page } = await openConnection();
  const url = 'https://www.holiday.com.tw/index.aspx';
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  try {
    await page.goto(url, { timeout: 30000, waitUntil: 'networkidle2' });
    await sleep(500);

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const _urls = [];

    const _l0 = $('ul#ulStoreArea > li.sub-menu');
    _l0.each((i, ele) => {
      const _l1 = $(ele).find('ul > li');
      _l1.each((i2, ele2) => {
        _urls.push($(ele2).find('a').attr('href'));
      });
    });

    // console.log(_urls);
    // console.log(_urls.length);
    const data = await runPages(_urls, page);

    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = call;
