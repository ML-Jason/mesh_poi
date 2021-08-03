/* eslint global-require: 0 */
const async = require('async');
const stagePOI = require('~root/server/app/function/crawler/stagePOI');
const createErrorLog = require('~server/app/function/errorlog/create_errorlog');
const vcheck = require('~server/module/vartool/vcheck');

const callers = {
  // wellcare: require('./medical/wellcare'),
  // haagendazs: require('./dessert/haagendazs'),
  // kingstone: require('./calturalAndEducational/kingstone'), //需要重寫
  // aurora: require('./market/aurora'),
  // tomods: require('./market/tomods'),
  // decathlon: require('./sports/decathlon'),
  // taitown: require('./restaurant/taitown'),
  // momentum: require('./sports/momentum'),
  // nitori: require('./houseware/nitori'),
  // tatung3c: require('./market/tatung3c'),
  // hyundai: require('./car/hyundai'),
  // daiso: require('./market/daiso'),
  // subway: require('./fastfood/subway'),
  // rolex: require('./watch/rolex'),
  // dintaifung: require('./restaurant/dintaifung'),
  // uniqlo: require('./apparel/uniqlo'),
  // cosmed: require('./market/cosmed'),
  // costco: require('./market/costco'),
  // carrefour: require('./market/carrefour'),
  // 愛買: require('./market/feamart'),
  // 大潤發: require('./market/rtmart'),
  // 全聯: require('./market/pxmart'),
  // 頂好Wellcome: require('./market/wellcome'),
  // 全國電子: require('./market/elife'),
  // 寶雅: require('./market/poya'),
  // 燦坤: require('./market/tk3c'),
  // 屈臣氏: require('./market/watsons'),
  // 小北百貨: require('./market/showba'),
  // 光南大批發: require('./market/knn'),
  // 金興發: require('./market/jsf'),
  // JASONS: require('./market/jasons'),

  // 好樂迪: require('./ktv/holiday'),
  // 錢櫃: require('./ktv/partyworld'),

  // Audi: require('./car/audi'),
  // 賓士: require('./car/benze'),
  // BMW: require('./car/bmw'),
  // FORD: require('./car/ford'),
  // 三菱: require('./car/mitsubishi'),
  // HONDA: require('./car/honda'),
  // LEXUS: require('./car/lexus'),
  // LUXGEN: require('./car/luxgen'),
  // MAZDA: require('./car/mazda'),
  // NISSAN: require('./car/nissan'),
  // Porsche: require('./car/porsche'),
  // SUBARU: require('./car/subaru'),
  // TOYOTA: require('./car/toyota'),
  // Volvo: require('./car/volvo'),

  // 全家: require('./cvstore/familymart'),
  // '7-ELEVEN': require('./cvstore/sevent'),
  // 萊爾富: require('./cvstore/hilife'),
  // OK: require('./cvstore/ok'),

  // 麥當勞: require('./fastfood/macdonald'),
  // 肯德基: require('./fastfood/kfc'),

  // 誠品: require('./departmentstore/eslite'),
  // 新光三越: require('./departmentstore/shinkong'),
  // 遠東百貨: require('./departmentstore/fareast'),
  // 遠東SOGO: require('./departmentstore/sogo'),
  // 微風: require('./departmentstore/breeze'),
  // CityLink: require('./departmentstore/citylink'),
  // GlobalMall: require('./departmentstore/globalmall'),

  // Gogoro: require('./autobike/gogoro'),
  // 光陽機車: require('./autobike/kymco'),
  // 三陽機車: require('./autobike/sym'),
  // 山葉機車: require('./autobike/yamaha'),

  // 本土銀行: require('./bank/banks'),

  // 國賓影城: require('./theater/ambassador'),
  // 新光影城: require('./theater/skcinemas'),
  // 威秀影城: require('./theater/viewshow'),

  // 松本清: require('./market/matsumotokiyoshi'),
  // 日藥本舖: require('./market/jpmed'),
  // 唐吉軻德: require('./market/dondondonki'),

  // 金石堂: require('./calturalAndEducational/kingstone'),
  // 墊腳石: require('./calturalAndEducational/steppingstone'),
  // 蔦屋書店: require('./calturalAndEducational/tsutaya'),
  // 三民書局: require('./calturalAndEducational/sanmin'),

  // 'World Gym世界健身俱樂部': require('./sports/worldgym'),
  // 健身工廠: require('./sports/fitnessfactory'),
  // Curves: require('./sports/curves'),
  // BeingFit: require('./sports/beingfit'),
  // 成吉思汗健身俱樂部: require('./sports/mmagym'),

  // 格上租車: require('./transport/car-plus'),
  // 和運租車: require('./transport/easyrent'),
  // 中租租車: require('./transport/chialease'),
  // 中興嘟嘟房: require('./transport/dodohome'),
  // 台灣聯通: require('./transport/taiwan-parking'),
  // 永固24TPS: require('./transport/24tps'),

  // 藍田產後護理之家: require('./life/lantan'),
  // 禾馨產後護理之家: require('./life/dianthus'),
  // 英倫產後護理之家: require('./life/yinglunbaby'),
  // 璽恩產後護理之家: require('./life/shinebc'),
  // 新嬰悦產後護理之家: require('./life/infantjoy'),
};

// 進行資料比對
const runStagePOI = (datas) => new Promise((resolve, reject) => {
  async.eachLimit(datas, 1, async (data) => {
    if (data.length === 0) throw new Error('資料是空的');
    const _data = data.map((v) => {
      const _d = { ...v };
      _d.name = vcheck.toSBC(v.name).trim();
      _d.address = vcheck.toSBC(v.address).trim().split('臺').join('台');
      return _d;
    });
    await stagePOI(_data);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
});

const call = () => new Promise((resolve) => {
  // 依序執行每個爬蟲
  async.eachLimit(Object.keys(callers), 1, async (itm) => {
    try {
      console.log(`${itm} start`);
      const caller = callers[itm];
      const data = await caller();

      if (Array.isArray(data)) {
        await runStagePOI([data]);
      } else {
        await runStagePOI(data.data);
      }
      console.log(`${itm} done`);
    } catch (e) {
      console.log(e);
      await createErrorLog({
        title: `${itm}爬蟲失敗`,
        message: e.message,
      });
    }
  }, (err) => {
    if (err) console.log(err);
    console.log('爬蟲結束');
    resolve();
  });
});

module.exports = call;

call();
