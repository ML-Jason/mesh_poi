/**
 * 金興發
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
  browser, page,
}) => {
  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  let _data = [];

  $('ul.branch-list li').each((i, e) => {
    const name = $(e).find('div.box div.text-box div.name').text().trim();
    const description = $(e).find('.box .text-box .description').text()
      .replace(/(：)/gm, ':')
      .trim();
    let address = '';
    let phone = '';

    try {
      address = description.match(/地址:(.*)/)[1]
        .replace(/(^\d+)/, '')
        .replace(/\(.*\)/, '')
        .trim();
      phone = description.match(/電話:(.*)/)[1].trim();
    } catch (e) {
      closeConnection({ browser, page });
      throw e;
    }

    _data.push({
      name,
      address,
      phone,
      brand_group: '金興發',
      category1: '綜合零售通路',
      category2: '五金生活百貨',
    });
  });

  await sleep(1000);

  const nextUrl = $('a.controls.next').attr('href');

  if (page.url() !== nextUrl) {
    await page.goto(nextUrl, { timeout: 30000, waitUntil: 'networkidle2' });

    const _d2 = await nextPage({
      browser, page,
    });
    _data = [..._data, ..._d2];
  }

  return _data;
};

const runPages = ({
  browser, page,
}) => new Promise((resolve, reject) => {
  nextPage({
    browser, page,
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
    await page.goto('https://www.jsf.com.tw/branch/all/1.htm', { timeout: 30000, waitUntil: 'networkidle2' });

    _data = await runPages({
      browser, page,
    });
    closeConnection({ browser, page });

    return _data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
