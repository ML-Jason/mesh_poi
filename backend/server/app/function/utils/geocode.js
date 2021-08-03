const axios = require('axios');

const APIKEY = 'AIzaSyDFNjeGBtbW-BdLKMb78cUR4F_OtUl0tlg';

const cache = [];

const findCache = (address) => {
  if (address === '') return {};
  const found = cache.find((v) => v.address === address);
  if (found) return found;
  return {};
};

const pushCache = ({ address, lat, lon }) => {
  cache.push({ address, lat, lon });
  while (cache.length > 1000) {
    cache.shift();
  }
};

const call = async (address) => {
  const _cache = findCache(address);
  if (_cache.lat && _cache.lon) return _cache;

  try {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const rs = await axios({
      url,
      params: {
        address,
        key: APIKEY,
        region: 'tw',
        language: 'zh-TW',
      },
    });

    console.log(`goecode - ${address}`);
    const loc = {};
    if (rs.data.status === 'OK') {
      rs.data.results.forEach((v) => {
      // console.log(v.formatted_address);
      // console.log(v.geometry.location);
      // console.log(v.geometry.location_type);
      // console.log(v.types);
        if (v.geometry.location_type === 'ROOFTOP') {
          loc.lat = v.geometry.location.lat;
          loc.lon = v.geometry.location.lng;
          loc.address = v.formatted_address.replace(/^\d*/, '');

          pushCache(loc);
        }
      });
    }

    return loc;
  } catch (e) {
    return {};
  }
};

module.exports = call;
