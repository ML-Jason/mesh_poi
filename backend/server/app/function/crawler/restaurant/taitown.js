/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * 瓦城 Tai town
 *
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
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
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  await page.goto('https://www.thaitown.com.tw/tw/store', { timeout: 30000, waitUntil: 'networkidle2' });

  const pageContent = await page.content();

  const $ = cheerio.load(pageContent);
  const data = [];

  $('.index__store-wrapper___3QiWV div').each((i, e) => {
    const name = $(e).find('.index__store-name___2UVhX').text().trim();
    const address = $(e).find('.index__address___12SSt').text();
    const phone = $(e).find('.index__info-wrapper___1P5U9 .index__info-item___UzeI8 a').eq(0).text();
    if (name) {
      if (address.substring(0, 3) === '上海市') return;
      data.push({
        name,
        address,
        phone,
        brand_group: '瓦城',
        category1: '餐飲',
        category2: '泰式餐廳',
      });
    }
  });
  closeConnection({ browser, page });
  return data;
};

module.exports = run;
