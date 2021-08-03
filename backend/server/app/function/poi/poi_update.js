const POIs = require('~server/app/model/pois');
const vcheck = require('~server/module/vartool/vcheck');
const categoryAll = require('~server/app/function/categories/category_all');
const getCityDistrict = require('~server/app/function/utils/getCityDistrict');

const call = async ({
  poi_id,
  name,
  brand_group,
  category1,
  category2,
  address,
  phone,
  lat,
  lon,
}) => {
  const _poi_id = vcheck.str(poi_id);
  if (!_poi_id) throw new Error('錯誤的參數');

  const _old = await POIs.findOne({ poi_id: _poi_id, deleted: false }).lean().exec();
  if (!_old) throw new Error('沒有這筆資料');

  const updates = {};

  if (name !== undefined && name !== null && name !== '') {
    const _name = vcheck.str(name);
    if (_old.name !== _name) updates.name = name;
  }

  if (brand_group !== undefined && brand_group !== null) {
    const _brand = vcheck.str(brand_group);
    if (_old.brand_group !== _brand) updates.brand_group = _brand;
  }

  let _c1 = _old.category1;
  let _c2 = _old.category2;
  let _c1f = [];
  const _cAll = await categoryAll(false);

  if (category1 !== undefined && category1 !== null) {
    _c1 = vcheck.str(category1);
    if (_c1 === '') throw new Error('請選擇大分類');
    _c1f = _cAll.find((f) => f.name === _c1);
    if (!_c1f) throw new Error('錯誤的大分類');
    if (_old.category1 !== _c1) updates.category1 = _c1;
  }
  if (category2 !== undefined && category2 !== null) {
    _c2 = vcheck.str(category2);
    if (_c2 === '') throw new Error('請選擇小分類');
    const _c2f = _c1f.children.find((f) => f.name === _c2);
    if (!_c2f) throw new Error('錯誤的小分類');
    if (_old.category2 !== _c2) updates.category2 = _c2;
  }

  if (address !== undefined && address !== null) {
    const _addr = vcheck.toSBC(address).split('臺').join('台').split(' ')
      .join('');
    if (_addr === '') throw new Error('請填寫地址');
    if (_old.address !== address) {
      const { city, district } = getCityDistrict(_addr);
      updates.address = _addr;
      updates.city = city;
      updates.district = district;
    }
  }

  if (phone !== undefined && phone !== null) {
    const _phone = vcheck.str(phone);
    if (_old.phone !== _phone) updates.phone = _phone;
  }

  let _lat = _old.loc.coordinates[1];
  let _lon = _old.loc.coordinates[0];
  if ((lat !== undefined && lat !== null) || (lon !== undefined && lon !== null)) {
    if (lat !== undefined && lat !== null) {
      _lat = vcheck.number(lat);
      if (Number.isNaN(_lat)) throw new Error('經緯度必須是數字');
      if (_lat < -90 || _lat > 90) throw new Error('緯度數值異常');
    }
    if (lon !== undefined && lon !== null) {
      _lon = vcheck.number(lon);
      if (Number.isNaN(_lon)) throw new Error('經緯度必須是數字');
      if (_lon < -180 || _lon > 180) throw new Error('經度數值異常');
    }
    updates.loc = { type: 'Point', coordinates: [_lon, _lat] };
  }

  if (Object.keys(updates).length === 0) return _old;

  const _new = await POIs.findOneAndUpdate({ poi_id: _poi_id }, updates, { new: true });

  return _new;
};

module.exports = call;
