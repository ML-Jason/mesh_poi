const twzip = require('~server/module/zipcode/tw');
const vcheck = require('~server/module/vartool/vcheck');

const call = (address) => {
  const _address = vcheck.toSBC(address).split('臺').join('台').split(' ')
    .join('');
  let city = '';
  let district = '';

  const foundCity = twzip.find((f) => {
    if (_address.indexOf(f.name) === 0) return true;
    return false;
  });
  if (!foundCity) {
    throw new Error('不完整的地址(需要正確的縣市名稱)');
  }

  const _str = _address.replace(foundCity.name, '');
  const foundDist = foundCity.dist.find((f) => {
    if (_str.indexOf(f.name) === 0) return true;
    return false;
  });
  if (!foundDist) {
    throw new Error('不完整的地址(需要正確的區域名稱)');
  }

  city = foundCity.name;
  district = foundDist.name;

  return { city, district, address: _address };
};

module.exports = call;
