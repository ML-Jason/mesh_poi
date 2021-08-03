/**
 * 誠品
 *
 * 這比較麻煩，api不好爬，所以只能用puppeteer每個區域去點擊。
 */

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

const sleep = (time) => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, time);
});

const nextZone = async ({
  browser, page, zoneIndex, zonePage,
}) => {
  let data = [];
  await sleep(500);

  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);
  const navs = $('ul.eslite-nav-ul > li.nav-item');

  const currentZone = navs.eq(zoneIndex).text();
  const pages = $('ul.pageNumber > li').length;

  // console.log(currentZone);
  // console.log(`${zonePage}/${pages}`);

  const titles = $('.content-title > pre.text');
  const addresses = $('.info-list > .info-list-ul > .info-list-li:nth-child(2) .link-title > pre');
  const phone = $('.info-list > .info-list-ul > .info-list-li:nth-child(1) .link-title > pre');
  titles.each((i) => {
    data.push({
      name: vcheck.toSBC(titles.eq(i).text()),
      address: vcheck.toSBC(addresses.eq(i).text()).replace(/^\d*/, '').split(' ').join('')
        .split('臺')
        .join('台'),
      phone: vcheck.toSBC(phone.eq(i).text()),
      brand_group: '誠品',
      category1: '綜合零售通路',
      category2: '百貨公司',
    });
  });

  if (zonePage < pages) {
    await Promise.all([
      page.click(`ul.pageNumber > li:nth-child(${zonePage + 1})`),
      page.waitForResponse((response) => response.url().indexOf('://www.eslitecorp.com/eslite/mediaAPI') >= 0),
    ]);
    const _data = await nextZone({
      browser, page, zoneIndex, zonePage: zonePage + 1,
    });
    data = [...data, ..._data];
  } else {
    const nextzone = navs.eq(zoneIndex + 1).text();
    if (nextzone.indexOf('台灣') >= 0) {
      await Promise.all([
        page.waitForResponse((response) => response.url().indexOf('//www.eslitecorp.com/eslite/mediaAPI') >= 0),
        page.click(`ul.eslite-nav-ul > li.nav-item:nth-child(${zoneIndex + 2})`),
      ]);
      const _data = await nextZone({
        browser, page, zoneIndex: zoneIndex + 1, zonePage: 1,
      });
      data = [...data, ..._data];
    }
  }
  return data;
};

const run = async () => {
  const { browser, page } = await openConnection();
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.goto('https://www.eslitecorp.com/eslite/index.jsp?site_id=eslite_tw&func_id=931821c115', { timeout: 30000, waitUntil: 'networkidle2' });
    // await page.goto('https://www.eslitecorp.com/eslite/index.jsp?site_id=eslite_tw&func_id=931821c115', { timeout: 30000, waitUntil: 'networkidle2' });

    // await getZone({ browser, page });
    const data = await nextZone({
      browser, page, zoneIndex: 0, zonePage: 1,
    });
    closeConnection({ browser, page });
    // console.log(data);
    console.log(data.length);
    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
