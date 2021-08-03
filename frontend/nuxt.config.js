const path = require('path');
const fs = require('fs');

const babelrc = JSON.parse(fs.readFileSync(path.resolve('.babelrc'), 'utf-8'));
// const config = require('./server/config');

const options = {
  // 不要再問是否要參加資料收集
  telemetry: false,
  /* Vue所在的目錄 */
  srcDir: 'src/',

  generate: {
    dir: '../backend/server/dist',
  },
  /* Headers of the page */
  head: {
    title: 'MESh+ - POI',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // { hid: 'description', name: 'description', content: 'SkyLabel' },
    ],
    link: [
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css', defer: true },
      { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' },
      // { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/pretty-checkbox@3.0/dist/pretty-checkbox.min.css' },
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { rel: 'icon', type: 'image/png', href: '/sk.png' },
    ],
    script: [
      // { src: 'https://dcp.meshplus.com.tw/v1/meshpxl.min.js', async: true },
    ],
  },
  /* 是否暫存 (預設是15min) */
  cache: false,

  /* 是否要SSR，預設是universal(有)，現在改用ssr:true */
  // mode: 'spa',
  ssr: false,
  target: 'static',

  // 是否要禁止preload (看不出來有差別)
  // resourceHints: false,

  /* 所有router都會用到的middleware */
  router: {
    // middleware: ['checkLoginState'],
  },
  /* Customize the progress bar color */
  // loading: { color: '#3B8070' },

  /* 引用全局的css */
  css: [
    'assets/stylus/app.styl',
  ],
  modules: [
    // '@nuxtjs/pwa',
    '@nuxtjs/proxy',
  ],

  /* Build configuration */
  build: {
    babel: {
      plugins: babelrc.plugins,
      env: babelrc.env,
      // Nuxt目前還是使用core-js 2的版本，有時會跟一些已經使用core-js 3的版本衝突，所以需要指定core-js版本為3
      // presets({ isServer }) {
      //   return [
      //     [
      //       require.resolve('@nuxt/babel-preset-app'),
      //       {
      //         buildTarget: isServer ? 'server' : 'client',
      //         corejs: { version: 3 },
      //       },
      //     ],
      //   ];
      // },
    },
    extractCSS: true,
    // analyze: true,
  },

  // pwa: {
  //   manifest: {
  //     name: 'SkyLabel stage',
  //     icons: [
  //       {
  //         src: '/sk256.png',
  //         sizes: '256x256',
  //         type: 'image/png',
  //       },
  //     ],
  //     start_url: '/?utm_source=pwa',
  //     display: 'standalone',
  //   },

  //   workbox: {
  //     dev: process.env.APP_ENV === 'production' ? 'false' : 'true',
  //     debug: process.env.APP_ENV === 'production' ? 'false' : 'true',
  //     importScripts: [
  //       '/j_sw.js',
  //     ],
  //     offline: false,
  //     // cacheAssets: false,
  //   },
  // },

  // pageTransition: {
  //   name: 'router-fade',
  //   mode: '',
  // },

  /* 在root app啟動前，執行plugins裡的東西 */
  plugins: [
    { src: '~/plugins/init', mode: 'client' },
    // { src: '~/plugins/component', mode: 'client' },
    { src: '~/plugins/swal', mode: 'client' },
    // { src: '~/plugins/SKAPI', mode: 'client' },
    { src: '~/plugins/SKGQL', mode: 'client' },
    // { src: '~/plugins/dcp', mode: 'client' },
    // { src: '~/plugins/sworker.js', ssr: false, mode: 'client' },
    // { src: '~/plugins/i18n' },
  ],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ENV: process.env.APP_ENV || 'development',
    // SKYID_CLIENT_ID: config.SKYID_CLIENT_ID,
    // SITE_HOST: config.SITE_HOST,
    // MAP_API_KEY: 'AIzaSyDFNjeGBtbW-BdLKMb78cUR4F_OtUl0tlg',
    MAP_API_KEY: 'AIzaSyA4Z5rNaNJHI-IX71VcspFlzUHrZ5SlNp4',
  },
};

if (process.env.NODE_ENV === 'development') {
  options.proxy = [
    'http://localhost:8080/gql/1.0',
    'http://localhost:8080/auth/callback',
  ];
}

module.exports = options;
