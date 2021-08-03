/**
 * 錢櫃
 *
 * 分店資訊是用post的方式換頁，疑似有檢查session，所以只能用puppeteer去爬。
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
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

const runPages = (stores, page) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(stores, 1, async (sel) => {
    await page.hover('.menu-item-has-children.has-mega-menu');
    await Promise.all([
      page.waitForNavigation({ timeout: 30000, waitUntil: 'networkidle2' }),
      page.click(sel),
    ]);
    await sleep(1000);
    await page.waitForSelector('.menu-item-has-children.has-mega-menu');
    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);
    const name = $('.md_shopDetailData > h2.title').text().trim().split('臺')
      .join('台');
    const address = $('.md_shopDetailData').find('.ddAddr').text().trim()
      .split('臺')
      .join('台');
    const phone = $('.md_shopDetailData').find('.ddTel').text();

    const _d = {
      name,
      address,
      phone,
      brand_group: '錢櫃',
      category1: '休閒娛樂',
      category2: 'KTV',
    };
    // console.log(index);
    // console.log(_d);

    data.push(_d);
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
  const url = 'https://www.cashboxparty.com/index.aspx';
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  try {
    await page.goto(url, { timeout: 30000, waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.waitForSelector('.menu-item-has-children.has-mega-menu');

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const _cols = $('.menu > li.menu-item-has-children:nth-child(2) > .mega-menu > .mega-menu__column');
    const stores = [];
    _cols.each((i, ele) => {
      $(ele).find('.current-menu-item.liStore').each((i2) => {
        stores.push(`.menu > li.menu-item-has-children:nth-child(2) > .mega-menu > .mega-menu__column:nth-child(${i + 1}) > .mega-menu__list > .current-menu-item.liStore:nth-child(${i2 + 1}) > a`);
      });
    });

    const data = await runPages(stores, page);

    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = call;
