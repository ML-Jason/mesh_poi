/**
 * Mazda
 *
 * 資訊都在頁面的dom上
 *
 */
const XLSX = require('xlsx');
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

const runPage = async (curerntpage, page) => {
  await page.goto(`https://www.mazda.com.tw/service-site/showroom/?page=${curerntpage}`, { timeout: 30000, waitUntil: 'networkidle2' });

  const faqs = await page.evaluate(() => window.mxp.data[2].props.faqs);

  const data = [];
  faqs.forEach((v) => {
    const name = v.title;
    const $ = cheerio.load(v.content);
    let phone = '';
    let address = '';
    if (name === '東大 羅東所') {
      phone = $('p').eq(1).text().replace('聯絡電話：', '');
      address = $('p').eq(2).text().replace('地址：', '')
        .replace(/\(.*\)/, '')
        .split(' ')
        .join('')
        .trim();
    } else {
      phone = $('p').eq(2).text().replace('聯絡電話：', '');
      address = $('p').eq(3).text().replace('地址：', '')
        .replace(/\(.*\)/, '')
        .split(' ')
        .join('')
        .trim();
    }
    data.push({
      name,
      phone,
      address,
      brand_group: 'MAZDA',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    });
  });

  if (data.length === 0) return [];

  const rs = await runPage(curerntpage + 1, page);

  return [...data, ...rs];
};

const run = async () => {
  const { browser, page } = await openConnection();
  try {
    const data = await runPage(1, page);
    closeConnection({ browser, page });

    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
