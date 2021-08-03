const plugin = (schema, options) => {
  schema.statics.cursor = async function cursor({
    find = {}, select = '', sort = '-_id', first = 0, after = '', last = 0, before = '',
  }) {
    const Model = this;

    let firstNum = (first === undefined || first === null) ? 0 : first;
    if (Number.isNaN(Number(firstNum))) firstNum = 0;
    let lastNum = (last === undefined || last === null) ? 0 : last;
    if (Number.isNaN(Number(lastNum))) lastNum = 0;
    // 如果first及last都是0，就預設first 10
    if (firstNum <= 0 && lastNum <= 0) firstNum = 10;

    let limitNum = firstNum + 1;
    const condition = { ...find };

    if (lastNum > 0 && firstNum === 0) {
      if (!before) lastNum = 0;
      else limitNum = lastNum + 1;
    }

    let cursorID = '';
    if (firstNum > 0 && after) cursorID = after;
    if (lastNum > 0 && before) cursorID = before;
    const sorts = sort.split(' ');
    if (cursorID) {
      const selects = sorts.map((v) => v.replace('-', '')).join(' ');
      const crs = await Model.findOne({ _id: cursorID }).select(selects).lean().exec();
      sorts.forEach((v) => {
        const fd = v.replace('-', '');
        if (v.indexOf('-') === 0) {
          if (fd === '_id') {
            condition[fd] = { $lt: crs[fd] };
          } else { condition[fd] = { $lte: crs[fd] }; }
        } else if (fd === '_id') {
          condition[fd] = { $gt: crs[fd] };
        } else { condition[fd] = { $gte: crs[fd] }; }
      });
    }

    const edges = [];
    const pageInfo = {};

    const rs = await Model.find(condition).sort(sort).select(select).limit(limitNum)
      .lean()
      .exec();

    if (rs.length >= limitNum) {
      rs.pop();
      pageInfo.hasNextPage = true;
    } else {
      pageInfo.hasNextPage = false;
    }

    if (lastNum > 0) {
      rs.reverse();
    }

    rs.forEach((v, index) => {
      edges.push({
        node: v,
        cursor: v._id.toString(),
      });

      if (firstNum > 0 && index === first - 1 && pageInfo.hasNextPage) {
        pageInfo.endCursor = v._id.toString();
      }
      if (lastNum > 0 && index === 0 && pageInfo.hasNextPage) {
        pageInfo.endCursor = v._id.toString();
      }
    });

    return { edges, pageInfo };
  };
};

module.exports = plugin;
