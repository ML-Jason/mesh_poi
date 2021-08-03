const stream = require('stream');
const poiDownload = require('~server/app/function/poi/poi_download');

const controller = async (req, res, next) => {
  try {
    if (res.locals.__jwtError) throw res.locals.__jwtError;

    const buffer = await poiDownload(req.query);

    res.set('Content-disposition', 'attachment; filename=sites.xlsx');
    res.set('Content-Type', 'text/plain');

    const readStream = new stream.PassThrough();
    readStream.end(buffer);
    readStream.pipe(res);
  } catch (e) {
    next(e);
  }
};

module.exports = controller;
