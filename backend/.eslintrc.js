const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: ['airbnb-base'],
  settings: {
    // 使用alias
    'import/resolver': {
      alias: {
        map: [
          ['~root', path.resolve(__dirname, './')],
          ['~server', path.resolve(__dirname, './server')],
        ],
      },
    },
  },
  plugins: [],
  rules: {
    // 會與MongoDB的_id衝突，關掉
    'no-underscore-dangle': 0,
    // max-len很煩，雖然取消，但還是盡量遵守比較好
    'max-len': 0,
    // 有時真的無法都用camelcase，關掉
    camelcase: 0,
  },
  globals: {},
};
