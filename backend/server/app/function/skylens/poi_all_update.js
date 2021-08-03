const axios = require('axios');
const dayjs = require('dayjs');
const POIs = require('~server/app/model/pois');
const config = require('~server/config');

const pagesize = 1000;
const runPage = async (page = 1) => {
  // 只取最近兩天有更新的資料
  const _d0 = dayjs.tz().subtract(2, 'day');

  const _all = await POIs
    .find({ updated_at: { $gte: _d0 } })
    .skip((page - 1) * pagesize)
    .limit(pagesize)
    .sort('-_id')
    .lean()
    .exec();

  console.log(`${page}:${_all.length}`);

  if (_all.length === 0) return;

  const pois = _all.map((v) => {
    const [lon, lat] = v.loc.coordinates;
    const _d = {
      poi_id: v.poi_id,
      name: v.name,
      brand_group: v.brand_group || '',
      category1: v.category1,
      category2: v.category2,
      address: v.address,
      city: v.city,
      district: v.district,
      phone: v.phone,
      lat,
      lon,
      created_at: (new Date(v.created_at)).getTime(),
      updated_at: (new Date(v.updated_at)).getTime(),
      deleted: v.deleted || false,
    };
    return _d;
  });

  await axios.request({
    // url: 'http://localhost:8010/api/2.0/poi/poi_all_update',
    // url: 'https://skylens.meshplus.com.tw/api/2.0/poi/poi_all_update',
    url: 'https://skylens.hinet.net/api/2.0/poi/poi_all_update',
    method: 'post',
    data: {
      token: config.SKYLENS_SECRET,
      pois,
      page,
    },
  });

  await axios.request({
    // url: 'http://localhost:8010/api/2.0/poi/poi_all_update',
    url: 'https://skylens.meshplus.com.tw/api/2.0/poi/poi_all_update',
    method: 'post',
    data: {
      token: config.SKYLENS_SECRET,
      pois,
      page,
    },
  });

  if (_all.length < pagesize) return;
  await runPage(page + 1);
};

const removeDeleted = async () => {
  const _t = dayjs().subtract(1, 'month');
  const _f = await POIs.find({ deleted: true, updated_at: { $lte: _t.toDate() } });
  console.log(_f);
};

const call = async () => {
  try {
    console.log('removing deleted');
    await removeDeleted();
    console.log('start poi_all_update.js');
    await runPage();
    console.log('finish poi_all_update.js');
  } catch (e) {
    console.log(e);
    if (e.repsonse && e.response.data && e.response.data.message) throw new Error(e.response.data.message);
    throw e;
  }
};

module.exports = call;
