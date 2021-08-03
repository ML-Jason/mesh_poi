const express = require('express');
const authCallback = require('~server/app/controller/1.0/auth/auth_callback');

const router = express.Router();

router.get('/auth/callback', authCallback);

module.exports = router;
