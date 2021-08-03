const poiAllUpdate = require('./poi_all_update');
const categoryAllUpdate = require('./poi_categories_update');

const call = async () => {
  console.log('update to skylens');
  await categoryAllUpdate();
  await poiAllUpdate();
};

module.exports = call;
