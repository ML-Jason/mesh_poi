const vcheck = require('~server/module/vartool/vcheck');
const POIStages = require('~root/server/app/model/poi_stages');
const poiCreate = require('~server/app/function/poi/poi_create');

const call = async (poi = {}, res) => {
  const _id = vcheck.mongoID(poi.poi_id);
  if (!_id) throw new Error('錯誤的參數');

  const _staging = await POIStages.findOne({ _id }).lean().exec();
  if (!_staging) throw new Error('沒有這筆資料');

  const updates = {
    name: poi.name || _staging.name,
    brand_group: poi.brand_group || _staging.brand_group,
    category1: poi.category1 || _staging.category1,
    category2: poi.category2 || _staging.category2,
    address: poi.address || _staging.address,
    phone: poi.phone || _staging.phone,
  };
  if (!Number.isNaN(vcheck.number(poi.lat)) && !Number.isNaN(vcheck.number(poi.lon))) {
    updates.lat = vcheck.number(poi.lat);
    updates.lon = vcheck.number(poi.lon);
  } else if (_staging.loc && _staging.loc.coordinates) {
    [updates.lon, updates.lat] = _staging.loc.coordinates;
  }

  const rs = await poiCreate(updates, res);
  await POIStages.deleteOne({ _id });
  return rs;
};

module.exports = call;
