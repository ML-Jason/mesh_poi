const POIs = require('~server/app/model/pois');
const vcheck = require('~server/module/vartool/vcheck');
// const twzip = require('~server/module/zipcode/tw');
const categoryAll = require('~server/app/function/categories/category_all');
const vutils = require('~server/module/vartool/vutils');
const getCityDistrict = require('~server/app/function/utils/getCityDistrict');

const PoiOpLogs = require('~server/app/model/poi_op_logs');

// 從地址中取出縣市區域
// const getDistrict = (address) => {
//   let city = '';
//   let district = '';

//   const foundCity = twzip.find((f) => {
//     if (address.indexOf(f.name) === 0) return true;
//     return false;
//   });
//   if (!foundCity) {
//     // console.log(address);
//     throw new Error('不完整的地址(需要正確的縣市名稱)');
//   }

//   const _str = address.replace(foundCity.name, '');
//   const foundDist = foundCity.dist.find((f) => {
//     if (_str.indexOf(f.name) === 0) return true;
//     return false;
//   });
//   if (!foundDist) {
//     // console.log(address);
//     throw new Error('不完整的地址(需要正確的區域名稱)');
//   }

//   city = foundCity.name;
//   district = foundDist.name;

//   return { city, district };
// };

const genePOI_id = async () => {
  let poi_id = vutils.newID();
  const _f = await POIs.findOne({ poi_id }).select('_id').lean().exec();
  if (_f) poi_id = await genePOI_id();
  return poi_id;
};

const call = async ({
  name,
  brand_group,
  category1,
  category2,
  address,
  phone,
  lat,
  lon,
}, res) => {
  const _name = vcheck.str(name);
  if (_name === '') throw new Error('請填寫POI名稱');
  const _brand = vcheck.str(brand_group);
  const _c1 = vcheck.str(category1);
  const _c2 = vcheck.str(category2);
  if (_c1 === '') throw new Error('請選擇大分類');
  if (_c2 === '') throw new Error('請選擇小分類');
  const _addr = vcheck.toSBC(address).split('臺').join('台').split(' ')
    .join('');
  if (_addr === '') throw new Error('請填寫地址');
  const { city, district } = getCityDistrict(_addr);
  const _phone = vcheck.str(phone);
  const _lat = vcheck.number(lat);
  const _lon = vcheck.number(lon);
  if (Number.isNaN(_lat) || Number.isNaN(_lon)) throw new Error('經緯度必須是數字');
  if (_lat < -90 || _lat > 90) throw new Error('緯度數值異常');
  if (_lon < -180 || _lon > 180) throw new Error('經度數值異常');

  const _cAll = await categoryAll(false);
  const _c1f = _cAll.find((f) => f.name === _c1);
  if (!_c1f) throw new Error('錯誤的大分類');
  const _c2f = _c1f.children.find((f) => f.name === _c2);
  if (!_c2f) throw new Error('錯誤的小分類');

  if (_brand !== '') {
    const _same = await POIs.findOne({ name: _name, brand_group: _brand }).select('_id').lean().exec();
    if (_same) throw new Error('相同的品牌下已經存在一樣的POI名稱');
  } else {
    const _same = await POIs.findOne({
      name: _name,
      $or: [
        { brand_group: '' },
        { brand_group: { $exists: false } },
      ],
      category2: _c2,
    }).select('_id').lean().exec();
    if (_same) throw new Error('相同的次分類下已經存在一樣的POI名稱');
  }

  const poi_id = await genePOI_id();

  const updates = {
    poi_id,
    name: _name,
    brand_group: _brand,
    category1: _c1,
    category2: _c2,
    address: _addr,
    phone: _phone,
    city,
    district,
    loc: {
      type: 'Point',
      coordinates: [_lon, _lat],
    },
    created_at: new Date(),
    updated_at: new Date(),
  };
  const _new = new POIs(updates);
  await _new.save();

  const _log = {
    email: res.locals.__jwtPayload.email,
    poi_id,
    operation: 'create',
    poi_name: _name,
    brand_group: _brand,
    category1: _c1,
    category2: _c2,
    created_at: Date.now(),
  };
  await PoiOpLogs.create(_log);

  return updates;
};

module.exports = call;
