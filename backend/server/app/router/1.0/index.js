const express = require('express');

const router = express.Router();

// router.use('/api/1.0', require('./proxy'));
router.use('/api/1.0', require('./poi'));
router.use(require('./auth'));

module.exports = (app) => { app.use(router); };
