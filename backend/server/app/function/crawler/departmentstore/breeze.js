/**
 * 微風
 *
 * 只能爬dom
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

const nextBranch = async ({
  browser, page, branches, branchIndex,
}) => {
  if (branches.length <= branchIndex) return [];
  const url = branches[branchIndex];

  await page.goto(url.value, { timeout: 30000, waitUntil: 'networkidle2' });
  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  let _data = [];

  const name = $('span.project-name').text().trim();
  const address = $('.project-details p:nth-child(2)').text()
    .replace(/\(.*\)/, '')
    .trim()
    .replace(/(^\d+)/, '');
  const phone = $('div.project-details > p:last-child').text()
    .replace(/(聯絡我們：\n.*)/, '')
    .replace(/(客服電話：)/, '')
    .trim();

  _data.push({
    name,
    address,
    phone,
    brand_group: '微風',
    category1: '綜合零售通路',
    category2: '百貨公司',
  });

  await sleep(500);

  const _d2 = await nextBranch({
    browser, page, branches, branchIndex: branchIndex + 1,
  });
  _data = [..._data, ..._d2];
  return _data;
};

const runBranches = ({
  browser, page, branches,
}) => new Promise((resolve, reject) => {
  const index = 0;
  nextBranch({
    browser, page, branches, branchIndex: index,
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
  const url = 'https://www.breezecenter.com/branches/001';
  try {
    await page.goto(url, { timeout: 30000, waitUntil: 'networkidle2' });

    const pagecontent = await page.content();
    const $ = cheerio.load(pagecontent);

    const branches = [];
    branches.push({
      name: $('span.project-name').text().trim(),
      value: url,
    });
    const branchSelect = $('ul.dropdown-menu').eq(0).find('li');
    branchSelect.each((i, ele) => {
      branches.push({
        name: $(ele).text().trim(),
        value: $(ele).children('a').attr('href'),
      });
    });

    _data = await runBranches({
      browser, page, branches,
    });
    closeConnection({ browser, page });

    return _data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
