/**
 * 小北百貨
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

const nextCity = async ({
  browser, page, cities, cityIndex,
}) => {
  if (cities.length <= cityIndex) return [];
  const citycode = cities[cityIndex];

  await page.goto(`https://www.showba.com.tw/store_page?menuid=9&city=${citycode.value}&canton=0&q=`, { timeout: 30000, waitUntil: 'networkidle2' });

  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  let _data = [];

  $('.store_detail').each((i, e) => {
    const name = $(e).children('h3').text().trim();
    let address = $(e).children('div.add').text().trim();
    const phone = $(e).children('div.phone').text().trim();

    if (address.search(citycode.name) === -1) {
      address = `${citycode.name}${address}`;
    }

    _data.push({
      name,
      address,
      phone,
      brand_group: '小北百貨',
      category1: '綜合零售通路',
      category2: '五金生活百貨',
    });
  });

  await sleep(1000);

  const _d2 = await nextCity({
    browser, page, cities, cityIndex: cityIndex + 1,
  });
  _data = [..._data, ..._d2];
  return _data;
};

const runCities = ({
  browser, page, cities,
}) => new Promise((resolve, reject) => {
  const index = 0;
  nextCity({
    browser, page, cities, cityIndex: index,
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
    await page.goto('https://www.showba.com.tw/store_page?menuid=9&city=0&canton=0&q=', { timeout: 30000, waitUntil: 'networkidle2' });

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const cities = [];
    const citySelect = $('.quick_search select').eq(0).children('option');
    citySelect.each((i, ele) => {
      if ($(ele).attr('value') === '0') return;
      cities.push({
        name: $(ele).text(),
        value: $(ele).attr('value'),
      });
    });

    _data = await runCities({
      browser, page, cities,
    });
    closeConnection({ browser, page });

    return _data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
