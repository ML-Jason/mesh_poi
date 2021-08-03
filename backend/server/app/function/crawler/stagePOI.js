const async = require('async');
const POIs = require('~server/app/model/pois');
const POIStages = require('~server/app/model/poi_stages');
const POIUnstages = require('~server/app/model/poi_unstages');
const vcheck = require('~server/module/vartool/vcheck');
const getCityDistrict = require('~server/app/function/utils/getCityDistrict');
const geocode = require('~server/app/function/utils/geocode');
const categoryAll = require('~server/app/function/categories/category_all');
// const createErrorLog = require('~server/app/function/errorlog/create_errorlog');

const parseGeo = (list) => new Promise((resolve, reject) => {
  const data = [];
  async.eachLimit(list, 1, async (itm) => {
    const _d = { ...itm, address: vcheck.toSBC(itm.address) };
    try {
      const _crs = getCityDistrict(_d.address);
      _d.city = _crs.city;
      _d.district = _crs.district;
      _d.address = _crs.address;
    } catch (e) {
      // await createErrorLog({
      //   title: 'stage_poi 縣市區域取出失敗',
      //   message: `${_d.brand_group}-${_d.name}-${_d.address}`,
      // });
    }

    try {
      const _lat = vcheck.number(_d.lat);
      const _lon = vcheck.number(_d.lon);
      if (Number.isNaN(_lat) || Number.isNaN(_lon)) throw new Error('經緯度必須是數字');
      if (_lat < -90 || _lat > 90) throw new Error('緯度數值異常');
      if (_lon < -180 || _lon > 180) throw new Error('經度數值異常');
      _d.lat = _lat;
      _d.lon = _lon;
    } catch (e) {
      delete _d.lat;
      delete _d.lon;
    }
    if (!_d.lat || !_d.lon) {
      const _latlng = await geocode(_d.address);
      if (_latlng.lat && _latlng.lon) {
        _d.lat = _latlng.lat;
        _d.lon = _latlng.lon;
      }
    }
    if (_d.lat && _d.lon) {
      _d.loc = {
        type: 'Point',
        coordinates: [_d.lon, _d.lat],
      };
    } else {
      // await createErrorLog({
      //   title: 'stage_poi 經緯度異常',
      //   message: `${_d.brand_group}-${_d.name}-${_d.address}`,
      // });
    }
    data.push(_d);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  });
});

const updatePOI = (list) => new Promise((resolve, reject) => {
  console.log(`update poi: ${list.length}`);
  async.eachLimit(list, 1, async (itm) => {
    if (itm.phone) await POIs.updateOne({ poi_id: itm.poi_id }, { phone: itm.phone });
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
});

const call = async (list) => {
  if (list.length === 0) return [];

  // 取得品牌、大分類、小分類，並且確認是否所有的資料都一樣
  const brand_group = list[0].brand_group || '';
  if (brand_group === '') throw new Error('品牌不可為空值');
  const { category1, category2 } = list[0];
  const nameList = list.map((v) => {
    if (v.brand_group !== brand_group) throw new Error('品牌要一致');
    if (category1 !== v.category1) throw new Error('大分類要一致');
    if (category2 !== v.category2) throw new Error('小分類要一致');
    return v.name;
  });

  const _cAll = await categoryAll(false);
  const _c1 = _cAll.find((f) => f.name === category1);
  if (!_c1) throw new Error('錯誤的大分類');
  const _c2 = _c1.children.find((f) => f.name === category2);
  if (!_c2) throw new Error('錯誤的小分類');

  if (!category1 || !category2) throw new Error('沒有分類');

  const condition = {
    name: nameList,
    category1,
    category2,
    brand_group,
    deleted: { $ne: true },
  };
  // if (brand_group !== '') {
  //   condition.brand_group = brand_group;
  //   // condition.brand_group = ['', null];
  // }

  // 取得有在正式POIs裡的資料
  const rs = await POIs.find(condition).select('poi_id name phone').lean().exec();
  const map1 = {};
  rs.forEach((v) => {
    map1[v.name] = { poi_id: v.poi_id, phone: v.phone || '' };
  });

  // 檢查是否需要更新資料
  const needUpdates = [];
  list.forEach((v) => {
    if (map1[v.name]) {
      const _phone = v.phone || '';
      if (_phone && _phone !== map1[v.name].phone) {
        // console.log(`${v.name}:${map1[v.name].phone} -> ${v.phone}`);
        needUpdates.push({ poi_id: map1[v.name].poi_id, phone: _phone });
      }
    }
  });
  if (needUpdates.length > 0) await updatePOI(needUpdates);

  // 檢查疑似需要被移除的POI
  condition.name = { $nin: nameList };
  const rsNo = await POIs.find(condition).lean().exec();
  const removeIDs = rsNo.map((v) => v.poi_id);
  if (removeIDs.length > 0) {
    const inRemoves = await POIUnstages.find({ poi_id: removeIDs }).select('poi_id').lean().exec();
    const removes = rsNo
      .map((v) => {
        const _d = { ...v };
        delete _d.created_at;
        return _d;
      })
      .filter((v) => {
        const _f = inRemoves.find((f2) => f2.poi_id === v.poi_id);
        if (_f) return false;
        return true;
      });
    if (removes.length > 0) {
      console.log(`unstage poi: ${removes.length}`);
      await POIUnstages.insertMany(removes);
    }
  }

  // 把已經在正式POIs裡的資料從列表移除
  const _list1 = list.filter((f1) => {
    if (map1[f1.name]) return false;
    return true;
  });

  // 檢查是否已經在POIStages裡
  // const name_list2 = _list1.map((v) => v.name);
  condition.name = nameList;
  const rs2 = await POIStages.find(condition).select('name').lean().exec();
  const map2 = {};
  rs2.forEach((v) => { map2[v.name] = true; });
  // 把已經在POIStages裡的資料從列表移除
  const _list2 = _list1.filter((f1) => {
    if (map2[f1.name]) return false;
    return true;
  });

  if (_list2.length === 0) return [];

  // 取出縣市區域，如果沒有經緯度，就去抓取經緯度
  const updates = await parseGeo(_list2);

  console.log(`stage POIs: ${updates.length}`);
  await POIStages.insertMany(updates);

  return updates;
};

module.exports = call;

// const seriesUpdates = (pois) => new Promise((resolve, reject) => {
//   async.eachSeries(pois, async (poi) => {
//     const name = poi.name.replace('台', '臺');
//     console.log(name);
//     await POIs.updateOne({
//       poi_id: poi.poi_id,
//     }, { name });
//   }, (err) => {
//     if (err) {
//       reject(err);
//       return;
//     }
//     resolve();
//   });
// });

// const fix = async () => {
//   const all = await POIs.find({ brand_group: '臺灣新光商業銀行' }).lean().exec();

//   await seriesUpdates(all);
//   console.log('fix done');
// };
// fix();
