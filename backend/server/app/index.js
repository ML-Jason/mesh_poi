/* eslint global-require:0 */
const express = require('express');
const path = require('path');
const http404 = require('~server/module/errorHandler/http404');
const http500 = require('~server/module/errorHandler/http500');
const errorMiddleware = require('~server/module/errorHandler/errorMiddleware');
const langMiddleware = require('./middleware/lang');
const cron = require('./cron');

module.exports = (app) => {
  if (process.env.APP_ENV !== 'production') {
    app.get('/robots.txt', (req, res) => {
      res.sendFile(path.join(__dirname, '../robots_txt/robots_dev.txt'));
    });
  }
  /*
  指定static files目錄，可直接指向某個路徑，如：
  app.use(express.static(path.join(__dirname, '../public')));

  若是要指定某個route，也可以：
  app.use('/css', express.static(path.join(__dirname, '../../static/css')));
  */
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use(langMiddleware.detect);

  // 套用GraphQL
  require('./gql/1.0')(app);
  // 套用router
  require('./router/1.0')(app);

  app.get('/', (req, res) => {
    res.send('');
  });

  // 套用http404處理controller
  app.use(http404);
  // 在500之前加入自行定義的錯誤處理middleware
  app.use(errorMiddleware);
  app.use(http500);

  cron.run();
};

// require('./function/brandgroup/brandmap_create');
// require('./fix/create_categories')();
