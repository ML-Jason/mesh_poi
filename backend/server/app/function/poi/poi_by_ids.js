const vcheck = require('~server/module/vartool/vcheck');
const POIs = require('~root/server/app/model/pois');

const call = async ({ poi_ids }, select) => {
  const _ids = vcheck.array(poi_ids) || [];
  if (_ids.length === 0) return [];

  if (select.includes('lat') || select.includes('lon')) select.push('loc');
  const rs = await POIs.find({ poi_id: _ids, deleted: false }).select(select).lean().exec();

  return rs;
};

module.exports = call;
