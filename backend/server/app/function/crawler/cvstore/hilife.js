/**
 * 萊爾富超商
 *
 * 這比較麻煩，完全沒有api，純粹的server render。
 * 所以只能用puppeteer每個縣市每個區域去點擊。
 */

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const vcheck = require('~server/module/vartool/vcheck');

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

const getZone = async ({ browser, page }) => {
  let data = [];
  const pagecontent = await page.content();
  const $ = cheerio.load(pagecontent);

  // const city = $('.searchResults > h2 > #lblCity').text();
  // const zone = $('.searchResults > h2 > #lblArea').text();
  // console.log(`get ${city}-${zone}`);

  const nodes = $('.searchResults table tr');

  nodes.each((i, ele) => {
    const name = vcheck.toSBC($(ele).children('th:nth-child(2)').text());
    const address = vcheck.toSBC($(ele).find('a').text()).replace(/^\d*/, '');
    const phone = vcheck.toSBC($(ele).find('td').eq(1).text());

    data.push({
      name,
      address,
      phone,
      brand_group: '萊爾富',
      category1: '綜合零售通路',
      category2: '便利超商',
    });
  });
  // console.log(data[data.length - 1]);
  // console.log(data.length);

  const cityOptions = $('#CITY > option');
  const areaOptions = $('#AREA > option');
  let selectedZone = 0;
  areaOptions.each((i, ele) => {
    if ($(ele).attr('selected') === 'selected') selectedZone = i + 1;
  });
  let selectedCity = 0;
  cityOptions.each((i, ele) => {
    if ($(ele).attr('selected') === 'selected') selectedCity = i + 1;
  });

  // console.log(`${selectedZone}/${areaOptions.length}`);
  // console.log(`${selectedCity}/${cityOptions.length}`);
  // console.log(data.length);

  // 區域還沒跑完，換下個區域
  if (selectedZone < areaOptions.length) {
    const nextValue = $(areaOptions[selectedZone]).attr('value');
    page.select('select#AREA', nextValue);
    await page.waitForNavigation({ timeout: 30000, waitUntil: 'networkidle2' });

    const _tmpdata = await getZone({ browser, page });
    data = [...data, ..._tmpdata];
    return data;
  }
  // 換縣市
  if (selectedCity < cityOptions.length) {
    const nextCity = $(cityOptions[selectedCity]).attr('value');
    page.select('select#CITY', nextCity);
    await page.waitForNavigation({ timeout: 30000, waitUntil: 'networkidle2' });

    // getZone({ browser, page });
    const _tmpdata = await getZone({ browser, page });
    data = [...data, ..._tmpdata];
    return data;
  }

  // 都跑完了
  // closeConnection({ browser, page });
  // done();
  return data;
};

const run = async () => {
  const { browser, page } = await openConnection();
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.goto('https://www.hilife.com.tw/storeInquiry_street.aspx', { timeout: 30000, waitUntil: 'networkidle2' });

    const data = await getZone({ browser, page });
    closeConnection({ browser, page });
    // console.log(data.length);
    // console.log(data);

    return data;
  } catch (e) {
    closeConnection({ browser, page });
    throw e;
  }
};

module.exports = run;
