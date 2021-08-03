const POIs = require('~server/app/model/poi_stages');
const categoryAll = require('./category_stage_all');
const vcheck = require('~server/module/vartool/vcheck');

const call = async ({ category1, category2 } = {}) => {
  const _c1 = vcheck.str(category1);
  const _c2 = vcheck.str(category2);
  // const _match = { brand_group: { $nin: [null, ''] } };
  const _match = { deleted: { $ne: true } };
  if (_c1) _match.category1 = _c1;
  if (_c2) _match.category2 = _c2;

  const _groupId = { brand: '$brand_group' };
  if (_c1) _groupId.c1 = '$category1';
  if (_c2) _groupId.c2 = '$category2';

  const rs = await POIs.aggregate([
    {
      $match: _match,
    },
    {
      $group: {
        // _id: { brand: '$brand_group', c1: '$category1', c2: '$category2' },
        _id: _groupId,
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        name: '$_id.brand',
        category1: '$_id.c1',
        category2: '$_id.c2',
        count: 1,
      },
    },
    {
      $sort: { name: -1 },
    },
  ]);

  const _cAll = await categoryAll(false);

  const _data = [];
  _cAll.forEach((v1) => {
    if (_c2) {
      v1.children.forEach((v2) => {
        const _f = rs.filter((f) => f.category1 === v1.name && f.category2 === v2.name);
        if (_f.length > 0) _data.push(..._f);
      });
    } else {
      const _f = rs.filter((f) => f.category1 === v1.name);
      if (_f.length > 0) _data.push(..._f);
    }
  });

  return _data.map((v) => {
    const _d = { ...v };
    if (_d.name === '') _d.name = '無品牌';
    return _d;
  });
};

module.exports = call;
