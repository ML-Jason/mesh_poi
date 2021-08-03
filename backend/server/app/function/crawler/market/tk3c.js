/**
 * 燦坤
 *
 * 這比較麻煩，api不好爬，所以只能用puppeteer每個區域去點擊。
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
  await Promise.all([
    page.select('.otherPic > select:nth-child(1)', citycode.value),
    page.waitForResponse((response) => response.url().indexOf('://www.tkec.com.tw/other_store.aspx') >= 0),
  ]);
  // page.select('.otherPic > select:nth-child(1)', citycode.value);
  // await page.waitForResponse((response) => response.url().indexOf('://www.tkec.com.tw/other_store.aspx') >= 0);
  await sleep(300);
  await Promise.all([
    page.select('.otherPic > select:nth-child(2)', '9999'),
    await page.waitForResponse((response) => response.url().indexOf('://www.tkec.com.tw/other_store.aspx') >= 0),
  ]);
  // page.select('.otherPic > select:nth-child(2)', '9999');
  // await page.waitForResponse((response) => response.url().indexOf('://www.tkec.com.tw/other_store.aspx') >= 0);
  await sleep(500);

  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  let _data = [];
  const trs = $('table.sList > tbody > tr.listC');
  trs.each((i) => {
    const name = trs.eq(i).children('td.sList1').text().trim();
    const address = trs.eq(i).find('td.sList2 > span').text().trim();
    const phone = trs.eq(i).find('td.sList3').eq(0).text()
      .trim();
    _data.push({
      name,
      address,
      phone,
      brand_group: '燦坤',
      category1: '綜合零售通路',
      category2: '3C家電',
    });
  });

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
    await page.goto('https://www.tkec.com.tw/other_store.aspx', { timeout: 30000, waitUntil: 'networkidle2' });

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const cities = [];
    const citySelect = $('.otherPic > select').eq(0).children('option');
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
