const vcheck = require('~server/module/vartool/vcheck');
const POIUnStages = require('~root/server/app/model/poi_unstages');
const poiDelete = require('~server/app/function/poi/poi_delete');

const call = async (poi_id, res) => {
  const _poi_id = vcheck.str(poi_id);
  if (!_poi_id) throw new Error('錯誤的參數');

  const _poi = await POIUnStages.findOne({ poi_id: _poi_id }).select('_id').lean().exec();
  if (!_poi) throw new Error('沒有這筆資料');

  await poiDelete(_poi_id, res);
  await POIUnStages.deleteOne({ poi_id: _poi_id });
};

module.exports = call;
