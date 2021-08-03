const async = require('async');
const Categories = require('~server/app/model/categories');
const vutils = require('~server/module/vartool/vutils');
const categoryAll = require('~server/app/function/categories/category_all');

const newID = async () => {
  let category_id = vutils.newID(10);
  const _f = await Categories.findOne({ category_id }).select('category_id').lean().exec();
  if (_f) category_id = await newID();
  return category_id;
};

const createC2 = ({ c1_id, c2s }) => new Promise((resolve, reject) => {
  async.eachLimit(c2s, 1, async (c2) => {
    const _found = await Categories.findOne({ name: c2.name, parent: c1_id }).lean().exec();
    let c2_id = '';
    if (!_found) {
      c2_id = await newID();
      await Categories.create({
        name: c2.name,
        category_id: c2_id,
        parent: c1_id,
      });
    }
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
});

const createC1 = (c1s) => new Promise((resolve, reject) => {
  async.eachLimit(c1s, 1, async (c1) => {
    const _found = await Categories.findOne({ name: c1.name, parent: '' }).lean().exec();
    let c1_id = '';
    if (!_found) {
      c1_id = await newID();
      await Categories.create({
        name: c1.name,
        category_id: c1_id,
        parent: '',
      });
    } else {
      c1_id = _found.category_id;
    }
    await createC2({ c1_id, c2s: c1.children });
  }, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
});

const call = async () => {
  const _cAll = await categoryAll(false);
  await createC1(_cAll);
  console.log('create_categories done');
};

module.exports = call;
