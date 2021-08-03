/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Haagen-Dazs
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
  await page.goto('https://www.wellcare.com.tw/wellcare/tw/store', { timeout: 30000, waitUntil: 'networkidle2' });

  const pageContent = await page.content();
  const $ = cheerio.load(pageContent);
  const data = [];

  $('ul.show-storelist li.store-eachinfo').each((i, e) => {
    const name = $(e).find('p').eq(0).text();
    const address = $(e).find('p').eq(1).text()
      .replace(/^\d*/, '');
    const phone = $(e).find('p').eq(2).text()
      .replace('TEL：', '');
    data.push({
      name,
      address,
      phone,
      brand_group: '維康醫療用品',
      category1: '專業零售通路',
      category2: '醫療器材',
    });
  });
  closeConnection({ browser, page });
  return data;
};

module.exports = run;
