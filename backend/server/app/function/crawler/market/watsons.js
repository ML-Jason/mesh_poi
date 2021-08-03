/**
 * 屈臣氏
 *
 * 一個頁面分頁取回
 */
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const vcheck = require('~server/module/vartool/vcheck');

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

const runPage = async (pagenum = 1, { page, browser }) => {
  const url = `https://www.watsons.com.tw/store-finder/getPartialStore?currentPage=${pagenum}&town=&district=&features=&keyword=`;
  let data = [];
  await page.goto(url, { timeout: 30000, waitUntil: 'networkidle2' });
  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);
  // const _page = await axios.get(url, {
  //   headers: {
  //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
  //   },
  // });

  // const $ = cheerio.load(_page.data);
  const _boxs = $('.mobile-map-address-box > .storeDetail');
  _boxs.each((i, ele) => {
    const name = vcheck.toSBC($(ele).find('.address-details > .h1 > font').text());
    const address = vcheck.toSBC($(ele).find('.address-details > .h2 > .shopStreetName').text());
    const phone = vcheck.str($(ele).find('.address-details > .h2 > a').text());
    const lat = vcheck.number($(ele).attr('data-lat')) || '';
    const lon = vcheck.number($(ele).attr('data-lng')) || '';

    data.push({
      name,
      address,
      phone,
      lat,
      lon,
      brand_group: '屈臣氏',
      category1: '綜合零售通路',
      category2: '藥妝通路',
    });
  });
  // console.log(`${pagenum}: ${_boxs.length}`);

  if (_boxs.length > 0) {
    const _tmp = await runPage(pagenum + 1, { page, browser });
    data = [...data, ..._tmp];
  }
  return data;
};

const call = async () => {
  const { browser, page } = await openConnection();
  let data = [];
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');

    data = await runPage(1, { page, browser });

    closeConnection({ browser, page });
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }

  return data;
};

module.exports = call;
