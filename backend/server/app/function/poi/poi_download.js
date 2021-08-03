const XLSX = require('xlsx');
const vcheck = require('~server/module/vartool/vcheck');
const poiList = require('~server/app/function/poi/poi_list');

const call = async ({
  city, district, category1, category2, brand_group, keyword,
}) => {
  const _select = 'poi_id,name,category1,category2,brand_group,address,phone,loc';
  const filter = {
    city,
    district,
    category1,
    category2,
    keyword,
    brand_group: vcheck.str(brand_group).split(',').filter((v) => v !== ''),
  };
  const _rs = await poiList({ ...filter, limit: 100000 }, _select.split(','));

  const wb = XLSX.utils.book_new();
  const ws_name = 'Sheet1';

  const _fields = 'poi_id,name,category1,category2,brand_group,address,phone,lat,lon,latlon'.split(',');
  const ws_data = [
    _fields,
  ];

  _rs.data.forEach((v) => {
    const _d = [];
    _fields.forEach((v2) => {
      if (v2 === 'lat' || v2 === 'lon' || v2 === 'latlon') {
        const _coords = (v.loc || {}).coordinates;
        if (v2 === 'lat') _d.push(_coords[1] || '');
        if (v2 === 'lon') _d.push(_coords[0] || '');
        if (v2 === 'latlon') _d.push(`${_coords[1]},${_coords[0]}`);
      } else {
        _d.push(v[v2] || '');
      }
    });
    ws_data.push(_d);
  });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* Add the worksheet to the workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  const buffer = XLSX.write(wb, {
    type: 'buffer', bookType: 'xlsx',
  });

  return buffer;
};

module.exports = call;
