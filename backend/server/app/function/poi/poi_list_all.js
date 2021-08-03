const vcheck = require('~server/module/vartool/vcheck');
const POIs = require('~root/server/app/model/pois');

const call = async ({
  offset = 0, limit = 1000, fields,
}) => {
  let _offset = vcheck.number(offset);
  if (Number.isNaN(_offset)) _offset = 0;
  let _limit = vcheck.number(limit);
  if (Number.isNaN(_limit)) _limit = 1000;
  let _fields = ['poi_id', 'brand_group', 'name', 'address', 'lat', 'lon'];
  if (vcheck.str(fields) !== '') {
    _fields = (vcheck.str(fields)).split(',');
  }

  const rs = await POIs
    .find({ deleted: false })
    .select('-__v -_id')
    .sort('-created_at')
    .skip(_offset)
    .limit(_limit)
    .lean()
    .exec();

  const data = rs.map((v) => {
    const d = { ...v };
    delete d.deleted;
    const lat = v.loc.coordinates[1];
    const lon = v.loc.coordinates[0];
    d.lat = lat;
    d.lon = lon;
    delete d.loc;

    if (_fields.length === 0) return d;

    const out = {};
    _fields.forEach((f) => {
      if (d[f] !== undefined && d[f] !== null) {
        out[f] = d[f];
      }
    });

    return out;
  });

  return data;
};

module.exports = call;
