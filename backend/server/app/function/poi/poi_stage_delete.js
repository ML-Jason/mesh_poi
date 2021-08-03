const POIStages = require('~server/app/model/poi_stages');
const vcheck = require('~server/module/vartool/vcheck');

const call = async (poi_id) => {
  const _id = vcheck.mongoID(poi_id);
  if (!_id) return;
  await POIStages.deleteOne({ _id });
};

module.exports = call;
