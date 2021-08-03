/* eslint import/no-dynamic-require: 0 */
const { APP_ENV } = process.env;

const config = require(`./config_${APP_ENV}.js`);

module.exports = config;
