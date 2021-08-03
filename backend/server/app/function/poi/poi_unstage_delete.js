const POIUnStages = require('~server/app/model/poi_unstages');
const vcheck = require('~server/module/vartool/vcheck');

const call = async (poi_id) => {
  const _id = vcheck.str(poi_id);
  if (!_id) return;
  await POIUnStages.deleteOne({ poi_id: _id });
};

module.exports = call;
