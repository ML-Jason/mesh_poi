const skylensCategoriesUpdate = require('~server/app/function/skylens/poi_categories_update');

const call = async (req, res, next) => {
  try {
    if (res.locals.__jwtError) throw res.locals.__jwtError;

    const rs = await skylensCategoriesUpdate();

    res.json(rs);
  } catch (e) {
    next(e);
  }
};

module.exports = call;
