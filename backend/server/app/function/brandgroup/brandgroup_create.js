const BrandGroups = require('~server/app/model/brand_groups');
const vutils = require('~server/module/vartool/vutils');
const vcheck = require('~server/module/vartool/vcheck');

const newBrandID = async () => {
  let _brand_id = vutils.newID(10);
  const _f = await BrandGroups.findOne({ brand_id: _brand_id }).select('brand_id').lean().exec();
  if (_f) _brand_id = await newBrandID();
  return _brand_id;
};

const call = async ({ name, category1, category2 }) => {
  const _name = vcheck.str(name);
  const _c1 = vcheck.str(category1);
  const _c2 = vcheck.str(category2);
  // if (!_name) throw new Error('請輸入品牌名稱');
  if (!_c1 || !_c2) throw new Error('分類為必須欄位');

  const _found = await BrandGroups.findOne({ name: _name, category1: _c1, category2: _c2 }).lean().exec();
  if (_found) return _found;

  const _id = await newBrandID();
  const _update = {
    name: _name,
    brand_id: _id,
    category1: _c1,
    category2: _c2,
    created_at: Date.now(),
  };
  await BrandGroups.create(_update);

  return _update;
};

module.exports = call;
