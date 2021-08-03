const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

let _GCS;
let _bucket;
let _bucketname;

/**
 * 初始化gcs。
 *
 * @param {String} projectId - GCP projectID
 * @param {String} keyFilename - 憑證檔的路徑，如果有憑證檔，projectId為非必要
 * @param {String} bucketName - 要存取的GCS bucket名稱
 */
const init = ({
  projectId, keyFilename, bucketname,
}) => {
  _GCS = new Storage({
    projectId,
    keyFilename,
  });

  _bucketname = bucketname;
  _bucket = _GCS.bucket(bucketname);
};

/**
 * 刪除某個檔。
 *
 * 回傳null。
 *
 * @param {String} filepath - 檔案在GCS的路徑
 */
const deleteFile = async (filepath) => {
  if (!_bucketname || !_bucket) throw new Error('GCS not initial yet.');
  if (!filepath) return;
  let _path = filepath;
  if (_path.indexOf('https://storage.googleapis.com/') === 0) _path = _path.replace('https://storage.googleapis.com/', '');
  if (_path.indexOf(`${_bucketname}/`) === 0) _path = _path.replace(`${_bucketname}/`, '');

  await _bucket.file(_path).delete();
};

/**
 * 從Buffer直接上傳。
 *
 * 回傳檔案網址。
 *
 * @param {Binary} buffer - buffer
 * @param {String} destination - GCS的路徑(包含檔名)
 */
const uploadFromBuffer = (buffer, destination) => new Promise((resolve, reject) => {
  if (!_bucketname || !_bucket) throw new Error('GCS not initial yet.');
  const ws = _bucket
    .file(destination)
    .createWriteStream();
  ws.on('error', (err) => {
    reject(err);
  });
  ws.on('finish', () => {
    _bucket.file(destination).makePublic();
    resolve(`https://storage.googleapis.com/${_bucketname}/${destination}`);
  });
  ws.end(buffer);
});

/**
 * 從url上傳，系統會從url抓取檔案下來並上傳的GCP。
 *
 * 回傳檔案網址。
 *
 * @param {Binary} url - url
 * @param {String} destination - GCS的路徑(包含檔名)
 */
const uploadFromUrl = async (url, destination) => {
  if (!_bucketname || !_bucket) throw new Error('GCS not initial yet.');
  const rs = await axios({
    url,
    responseType: 'arraybuffer',
  });
  const fileurl = await uploadFromBuffer(rs.data, destination);
  return fileurl;
};

/**
 * 從檔案上傳。
 *
 * 回傳檔案網址。
 *
 * @param {Binary} filepath - filepath
 * @param {String} destination - GCS的路徑(包含檔名)
 */
const uploadFromFile = async (filepath, destination) => {
  if (!_bucketname || !_bucket) throw new Error('GCS not initial yet.');
  const bf = fs.readFileSync(filepath);
  const fileurl = await uploadFromBuffer(bf, destination);
  return fileurl;
};

module.exports = {
  init,
  uploadFromUrl,
  uploadFromBuffer,
  uploadFromFile,
  deleteFile,
};
