const vcheck = require('~server/module/vartool/vcheck');
const POIs = require('~root/server/app/model/pois');

const call = async ({
  offset, limit, city, district, category1, category2, brand_group, keyword,
}, select = []) => {
  const _city = vcheck.str(city);
  const _district = vcheck.str(district);
  const _category1 = vcheck.str(category1);
  const _category2 = vcheck.str(category2);
  const _brand_group = (vcheck.array(brand_group) || []).map((v) => {
    if (v === '無品牌') return '';
    return v;
  });
  const _keyword = vcheck.str(keyword).split(' ').filter((f) => f);

  const condition = { deleted: false };
  if (_city) condition.city = _city;
  if (_district) condition.district = _district;
  if (_category1) condition.category1 = _category1;
  if (_category2) condition.category2 = _category2;
  if (_brand_group.length > 0) condition.brand_group = _brand_group;
  if (_keyword.length > 0) {
    condition.$or = [];
    _keyword.forEach((v) => {
      condition.$or.push({ brand_group: { $regex: new RegExp(v, 'i') } });
      condition.$or.push({ address: { $regex: new RegExp(v, 'i') } });
      condition.$or.push({ name: { $regex: new RegExp(v, 'i') } });
    });
  }

  const _select = vcheck.array(select) || [];
  if (_select.includes('lat') || _select.includes('lon')) _select.push('loc');
  const rs = await POIs.paginate({
    find: condition, select: _select, offset, limit, sort: '-brand_group -city -district -name -_id',
  });

  return rs;
};

module.exports = call;
