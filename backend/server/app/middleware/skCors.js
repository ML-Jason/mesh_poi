const cors = require('cors');

/**
* 說明:
* 簡化cors的寫法。
*
* 使用:
* cors(whitelist):Middleware
*
* - 參數:
*   - whitelist: Array，允許列在whiteList裡的origin可以進行cors，如果要允許全部，把whitelist設為true或是不帶值就可以
*
* @example
* const allowLocalHost = cors(['http://localhost:8080']);
* router.options('/api', allowLocalHost);
* router.use('/api', allowLocalHost);
*
* @param {(String[]|true)=} whitelist 列在whiteList裡的origin可以進行cors，如果要允許全部，把whitelist設為true或是不帶值就可以
* @returns {Function} middleware function
*/
const apply = (whitelist) => {
  let corsOption = null;
  if (whitelist === true || whitelist === undefined) {
    corsOption = { credentials: true, origin: true };
  } else {
    const list = Array.isArray(whitelist) ? whitelist : [];
    corsOption = (req, callback) => {
      const origin = req.headers.origin || req.headers.Origin;
      const iswhite = list.includes(origin);

      const opt = {
        credentials: true,
        origin: iswhite,
      };
      callback(null, opt);
    };
  }

  return cors(corsOption);
};

module.exports = apply;
