const categoryAll = require('~server/app/function/categories/category_all');
const qfields = require('../util/qfields');
const brandgroupAll = require('~server/app/function/categories/brandgroup_all');
const categoryStageAll = require('~server/app/function/categories/category_stage_all');
const brandgroupStageAll = require('~server/app/function/categories/brandgroup_stage_all');

const resolvers = {
  Query: {
    category_all: async (rootValue, args, context, info) => {
      try {
        const select0 = qfields(info);
        const select1 = qfields(info, 'children');
        const count = select0.includes('count') || select1.includes('count');

        return await categoryAll(count);
      } catch (e) {
        context.throw(e);
      }
      return null;
    },

    category_stage_all: async (rootValue, args, context, info) => {
      try {
        const select0 = qfields(info);
        const select1 = qfields(info, 'children');
        const count = select0.includes('count') || select1.includes('count');

        return await categoryStageAll(count);
      } catch (e) {
        context.throw(e);
      }
      return null;
    },

    brandgroup_all: async (rootValue, args, context) => {
      try {
        return await brandgroupAll(args);
      } catch (e) { context.throw(e); }
      return null;
    },

    brandgroup_stage_all: async (rootValue, args, context) => {
      try {
        return await brandgroupStageAll(args);
      } catch (e) { context.throw(e); }
      return null;
    },
  },
};

module.exports = resolvers;
