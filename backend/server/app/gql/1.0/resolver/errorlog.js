const qfields = require('../util/qfields');
const ErrLogs = require('~server/app/model/error_logs');
const deleteErrlog = require('~server/app/function/errorlog/errorlog_delete');

const resolvers = {
  Query: {
    errlog_list: async (rootValue, args, context, info) => {
      try {
        const select = qfields(info, 'data', { errlog_id: '_id' });
        const rs = await ErrLogs.paginate({
          select,
          offset: args.offset,
          limit: args.limit,
        });

        const data = rs.data.map((v) => ({ ...v, errlog_id: v._id.toString() }));
        return {
          totalCount: rs.totalCount,
          data,
        };
      } catch (e) {
        context.throw(e);
      }
      return null;
    },
  },

  Mutation: {
    errlog_delete: async (rootValue, args, context) => {
      try {
        await deleteErrlog(args.errlog_id);
      } catch (e) {
        context.throw(e);
      }
      return 'OK';
    },
  },
};

module.exports = resolvers;
