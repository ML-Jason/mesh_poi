const express = require('express');
const poiListAll = require('~server/app/controller/1.0/poi/poi_list_all');
const poiDownload = require('~server/app/controller/1.0/poi/poi_download');
const skylensCategoriesUpdate = require('~server/app/controller/1.0/poi/skylens_categories_update');
const skylensPoiAllUpdate = require('~server/app/controller/1.0/poi/skylens_poi_all_update');
const jwtAutoRefresh = require('~server/app/middleware/jwtAutoRefresh');
const jwtCheckDB = require('~server/app/middleware/jwtCheckDB');
const apiUser = require('~server/app/middleware/apiUser');
const config = require('~server/config');

const router = express.Router();

router.use(jwtAutoRefresh({
  cookieName: '__MPOI',
  secret: config.JWT_SECRET,
  cookieOptions: { signed: true, httpOnly: true, secure: true },
}), jwtCheckDB, apiUser);

router.get('/poi_list', poiListAll);
router.get('/poi_download', poiDownload);
router.get('/skylens/categories_update', skylensCategoriesUpdate);
router.get('/skylens/poi_all_update', skylensPoiAllUpdate);

module.exports = router;
