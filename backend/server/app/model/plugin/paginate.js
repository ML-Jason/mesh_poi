const plugin = (schema, options) => {
  schema.statics.paginate = async function paginate({
    find = {}, select = '-__v', sort = '-_id', offset = 0, limit = 10, onlyCounts = false,
  } = {
    find: {}, select: '-__v', sort: '-_id', offset: 0, limit: 10, onlyCounts: false,
  }) {
    const Model = this;

    // 取得totalcount
    const count = await Model
      .countDocuments(find).exec();

    if (onlyCounts) {
      return { totalCount: count };
    }

    // 取得分頁資料
    const rs = await Model
      .find(find)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .select(select)
      .lean()
      .exec();

    return {
      totalCount: count,
      data: rs,
    };
  };
};

module.exports = plugin;
