const POIs = require('~server/app/model/pois');
const vcheck = require('~server/module/vartool/vcheck');
const PoiOpLogs = require('~server/app/model/poi_op_logs');

const call = async (poi_id, res) => {
  const _poi_id = vcheck.str(poi_id);
  if (!_poi_id) throw new Error('錯誤的參數');

  // await POIs.deleteOne({ poi_id: _poi_id });
  await POIs.updateOne({ poi_id }, { deleted: true, updated_at: Date.now() });

  const _log = {
    email: res.locals.__jwtPayload.email,
    poi_id,
    operation: 'delete',
    created_at: Date.now(),
  };
  await PoiOpLogs.create(_log);
};

module.exports = call;
