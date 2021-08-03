const async = require('async');
const BrandGroups = require('~server/app/model/brand_groups');
const POIs = require('~server/app/model/pois');
const brandgroup_create = require('./brandgroup_create');

const runEach = (brands) => new Promise((resolve, reject) => {
  async.eachLimit(brands, 1, async (brand) => {
    await brandgroup_create(brand);
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
});

const call = async () => {
  const _brandsRS = await POIs.aggregate([
    {
      match: { deleted: false },
    },
    {
      $group: {
        _id: {
          name: '$brand_group',
          category1: '$category1',
          category2: '$category2',
        },
      },
    },
  ]);

  // console.log(_brandsRS);
  // console.log(_brandsRS.length);

  const _brands = _brandsRS.map((v) => v._id);
  const _exists = await BrandGroups.find({
    $or: _brands,
  }).select('name category1 category2').lean().exec();
  const _filtered = _brands.filter((f) => {
    const _f = _exists.find((v) => v.name === f.name && v.category2 === f.category2);
    if (_f) return false;
    return true;
  });
  // console.log(_filtered.length);
  if (_filtered.length > 0) await runEach(_brands);
};

module.exports = call;

call();
