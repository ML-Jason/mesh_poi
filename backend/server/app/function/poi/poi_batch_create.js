const async = require('async');
const POIs = require('~server/app/model/pois');
const POIStages = require('~server/app/model/poi_stages');
const geocode = require('~server/app/function/utils/geocode');
// const getCityDistrict = require('~server/app/function/utils/getCityDistrict');
const vcheck = require('~server/module/vartool/vcheck');
const categoryAll = require('~server/app/function/categories/category_all');

const runOne = async (poi) => {
  try {
    const _cAll = await categoryAll(false);
    const name = vcheck.str(poi.name);
    if (!name) throw new Error('請填寫POI名稱');
    const brand_group = vcheck.str(poi.brand_group);
    const phone = vcheck.str(poi.phone);
    const _c1 = vcheck.str(poi.category1);
    const _c2 = vcheck.str(poi.category2);
    const _c1f = _cAll.find((f) => f.name === _c1);
    if (!_c1f) throw new Error('大類別錯誤');
    const _c2f = _c1f.children.find((f) => f.name === _c2);
    if (!_c2f) throw new Error('小類別錯誤');

    const _pfound = await POIs.findOne({
      name, brand_group, category1: _c1, category2: _c2,
    }).select('poi_id').lean().exec();
    if (_pfound) throw new Error('相同的類別與品牌下已經存在一樣的POI名稱');

    const _pfound2 = await POIStages.findOne({
      name, brand_group, category1: _c1, category2: _c2,
    }).select('_id').lean().exec();
    if (_pfound2) throw new Error('POI異動表裡相同的類別與品牌下已經存在一樣的POI名稱');

    const address = vcheck.toSBC(poi.address).split('臺').join('台').split(' ')
      .join('');
    if (!address) throw new Error('請填寫地址');

    let _lat = vcheck.number(poi.lat);
    let _lon = vcheck.number(poi.lon);
    let loc = null;
    if ((Number.isNaN(_lat) || Number.isNaN(_lon))) {
      const _latlng = await geocode(address);
      if (_latlng.lat && _latlng.lon) {
        _lat = _latlng.lat;
        _lon = _latlng.lon;
      }
    }
    if (!Number.isNaN(_lat) && !Number.isNaN(_lon)) {
      if (_lat < -90 || _lat > 90) throw new Error('緯度數值異常');
      if (_lon < -180 || _lon > 180) throw new Error('經度數值異常');
      loc = {
        type: 'Point',
        coordinates: [_lon, _lat],
      };
    }

    const update = {
      name, brand_group, category1: _c1, category2: _c2, address, phone,
    };
    if (loc) update.loc = loc;
    await POIStages.create(update);

    return { status: 'OK' };
  } catch (e) {
    return {
      status: 'ERROR',
      message: e.message,
    };
  }
};

const checkAll = (list) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(list, 1, async (itm) => {
    const rs = await runOne(itm);
    data.push(rs);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    console.log(data);
    resolve(data);
  });
});

const call = async (pois) => {
  const _list = vcheck.array(pois) || [];
  if (_list.length === 0) return [];

  const data = await checkAll(_list);
  return data;
};

module.exports = call;
