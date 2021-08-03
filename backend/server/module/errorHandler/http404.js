// 處理HTTP 404
module.exports = (req, res) => {
  res.status(404).end();
};
