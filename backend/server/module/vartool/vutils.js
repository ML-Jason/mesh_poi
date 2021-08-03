const crypto = require('crypto');
const vcheck = require('./vcheck');

const fn = {};

/**
 * 產生亂數字串，產生的字元預設為[a-zA-Z0-9]。
 *
 * @param {Number} [length=10] - 產生的字串長度，預設為10
 * @param {String} [addchars] - 除了預設的字元以外，還要加入的字元組
 * @returns {String} result string
*/
fn.randomStr = (length = 10, addchars = '') => {
  let allowstr = '';
  for (let i = 0; i < 26; i += 1) {
    allowstr += String.fromCharCode(97 + i);
    allowstr += String.fromCharCode(65 + i);
  }
  allowstr += `0123456789${addchars}`;
  let id = '';
  while (id.length < length) {
    const ra = Math.floor(Math.random() * allowstr.length);
    id += allowstr.substr(ra, 1);
  }
  return id;
};

/**
 * 依照timestamp加上亂數產生ID，長度最少為15。
 *
 * @param {Number} [length=15] - 產生的字串長度，預設為15，不可低於15
 * @returns {String} result string
*/
fn.newID = (length = 15) => {
  const chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ';
  const timestamp = new Date().getTime();
  let nextVal = timestamp;
  let str = '';
  while (nextVal > 0) {
    const _val = Math.floor(nextVal / 62);
    const res = nextVal % 62;
    nextVal = _val;
    str = chars.substr(res, 1) + str;
  }
  let len = length < 10 ? 10 : length;
  len -= str.length;
  const rand = fn.randomStr(len);
  return `${str}${rand}`;
};
// fn.newID = (length = 15) => {
//   let len = length < 15 ? 15 : length;
//   const timestamp = new Date().getTime().toString(36);
//   len -= timestamp.length;
//   const rand = fn.randomStr(len);
//   return `${timestamp}${rand}`;
// };

/**
 * 依照傳入字串產生可驗證ID，驗證碼會加在原始字串後，共三碼。
 *
 * 要驗證該ID是否正確，使用verifyVaID進行驗證。
 *
 * @param {String} originid - 原始字串
 * @returns {String} result string
*/
fn.newVaID = (originid) => {
  let sum = 0;
  for (let i = 0; i < originid.length; i += 1) {
    sum += originid.charCodeAt(i);
  }
  sum += sum % 10;
  let ext = sum.toString(36).substr(0, 3);
  while (ext.length < 3) { ext = `0${ext}`; }
  return `${originid}${ext}`;
};

/**
 * 驗證是否由newVaID所產生的ID。
 *
 * @param {String} vaid - 輸入字串
 * @returns {Boolean} result
*/
fn.verifyVaID = (vaid) => {
  const pre = vaid.substr(0, vaid.length - 3);

  const regen = fn.newVaID(pre);
  return vaid === regen;
};

/**
 * 對字串進行MD5加密。
 *
 * @param {String} str - 輸入字串
 * @returns {String} result
*/
fn.md5 = (str) => {
  const newstr = vcheck.str(str);
  if (newstr === '') return '';
  const md5 = crypto.createHash('md5');
  return md5.update(newstr).digest('hex');
};

/**
 * 將敏感資料中間的字元用replace取代，replace預設為'*'。
 *
 * @param {String} str - 輸入字串
 * @param {String} [replace=*] - 要取代的字串
 * @returns {String} result
*/
fn.hashName = (str, replace = '*') => {
  const ostr = vcheck.str(str);
  if (ostr === '') return '';
  if (ostr.length <= 2) return `${ostr.substr(0, 1)}${replace}`;
  const cut = Math.floor(ostr.length / 3);
  let bstr = ostr.substr(0, cut);
  const estr = ostr.substr(ostr.length - cut);
  while (bstr.length + estr.length < ostr.length) {
    bstr += replace;
  }
  bstr += estr;
  return bstr;
};

/**
 * 將email@之後的字元用replace取代，replace預設為'*'。
 *
 * @param {String} str - 輸入字串
 * @param {String} [replace=*] - 要取代的字串
 * @returns {String} result
*/
fn.hashEmail = (email, replace = '*') => {
  const str = vcheck.str(email);
  if (!vcheck.email(str)) return '';
  const sarray = str.split('@');
  const cut = Math.ceil(sarray[0].length / 3);
  let out = sarray[0].substr(0, (sarray[0].length - cut));
  for (let i = 0; i < cut; i += 1) {
    out += replace;
  }
  out += '@';
  out += fn.hashName(sarray[1], replace);
  return out;
};

/**
 * 產生一個具有unique值的array。
 * 傳入多個array，並指定keyfield(非必要)，回傳一個keyfield為unique的array，如果沒有指定keyfield，直接比對陣列值。
 * 回傳的array會是原array的deep copy，並不影響原本的array。
 *
 * @example
 * const a1 = [1, 2, 3];
 * const a2 = [1, 3, 5];
 * const result = vutils.arrayDistinct([a1, a2]);
 * console.log(result); //[1, 2, 3, 5]
 *
 * @param {Object[]} arrays - 要合併的多個array
 * @param {String} [keyfield] - 如果array裡是Object，指定要distinct的field name
 * @returns {Object[]} result array
 */
fn.arrayDistinct = (arrays = [], keyfield) => {
  const obj = {};
  const result = [];
  arrays.forEach((ar) => {
    const arCopy = vcheck.array(ar) || [];
    arCopy.forEach((v) => {
      let keyvalue = v;
      if (keyfield) keyvalue = v[keyfield];
      if (keyvalue && !obj[keyvalue]) {
        obj[keyvalue] = true;
        result.push(v);
      }
    });
  });

  return result;
};

module.exports = fn;
