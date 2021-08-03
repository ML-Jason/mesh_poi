/*
  永固24TPS

  http://www.24tps.com.tw/ParkZone.aspx

  第一次造訪網站常常看不見列表，不知為何？
  可能跟 cookie 有關？
  所以還是得用 puppeteer
*/
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const trimStartZipCode = require('../../utils/trimStartZipCode');

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

async function run() {
  const url = 'http://www.24tps.com.tw/ParkZone.aspx';
  const { browser, page } = await openConnection();
  const list = [];
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');

    let tryCount = 0;

    while (tryCount < 4) {
      tryCount += 1;

      // eslint-disable-next-line no-await-in-loop
      await page.goto(url, { timeout: 30000, waitUntil: 'networkidle0' });

      // eslint-disable-next-line no-await-in-loop
      const pagecontent = await page.content();
      const $ = cheerio.load(pagecontent);
      const table = $('table table table table td:contains(站)').closest('table');

      if (table.html()) {
        $(table).find('tr').each((i, e) => {
          const tds = $(e).find('td');

          const name = $(tds).eq(0).text().trim();
          const address = trimStartZipCode($(tds).eq(1).text().trim());

          if (address) {
            list.push({
              name,
              address,
              brand_group: '永固24TPS',
              category1: '交通運輸',
              category2: '停車場',
            });
          }
        });
        break;
      }
    }
  } finally {
    closeConnection({ browser, page });
  }

  return list;
}

module.exports = run;
