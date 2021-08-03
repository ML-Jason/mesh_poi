/**
 * JASONS
 *
 * 這比較麻煩，所以只能用puppeteer每個區域去點擊。
 */

const cheerio = require('cheerio');
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

const sleep = (time) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, time);
});

const nextPage = async ({
  browser, page, zoneCount, zoneIndex,
}) => {
  if (zoneCount < zoneIndex) return [];
  const button = await page.$(`#btnStore a:nth-child(${zoneIndex})`);
  await button.evaluate((e) => e.click());

  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  let _data = [];

  $('div#store.sec.sec3 div.swiper-container div.swiper-wrapper div.swiper-slide').each((i, e) => {
    const name = $(e).find('h3').html()
      .replace(/(<p>.*)/, '')
      .replace(/(<br>)/, '')
      .trim();
    const address = $(e).find('h3 > p').text()
      .replace(/(^\d+)/, '')
      .replace(/\(.*\)/, '')
      .replace(/  /, '')
      .trim();
    const phone = $(e).find('.storeContact > p.phone').text().trim();

    _data.push({
      name,
      address,
      phone,
      brand_group: 'JASONS',
      category1: '綜合零售通路',
      category2: '超市',
    });
  });

  const _d2 = await nextPage({
    browser, page, zoneCount, zoneIndex: (zoneIndex + 1),
  });
  _data = [..._data, ..._d2];

  return _data;
};

const runPages = ({
  browser, page, zoneCount,
}) => new Promise((resolve, reject) => {
  const index = 1;
  nextPage({
    browser, page, zoneCount, zoneIndex: index,
  }).then((d) => {
    resolve(d);
  }).catch((e) => {
    reject(e);
  });
});

const run = async () => {
  const { browser, page } = await openConnection();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
  let _data = [];
  try {
    await page.goto('http://www.jasons.com.tw/', { timeout: 30000, waitUntil: 'networkidle2' });

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const zoneCount = $('#btnStore a').length;

    _data = await runPages({
      browser, page, zoneCount,
    });
    closeConnection({ browser, page });

    return _data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
