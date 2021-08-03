const qfields = require('../util/qfields');
const poiList = require('~server/app/function/poi/poi_list');
const poiByIds = require('~server/app/function/poi/poi_by_ids');
const poiCreate = require('~server/app/function/poi/poi_create');
const poiUpdate = require('~server/app/function/poi/poi_update');
const poiDelete = require('~server/app/function/poi/poi_delete');
const stagePOIList = require('~server/app/function/poi/stage_poi_list');
const unstagePOIList = require('~server/app/function/poi/unstage_poi_list');
const poiStage = require('~server/app/function/poi/poi_stage');
const poiUnStage = require('~server/app/function/poi/poi_unstage');
const poiStageDelete = require('~server/app/function/poi/poi_stage_delete');
const poiUnStageDelete = require('~server/app/function/poi/poi_unstage_delete');
const poiBatchCreate = require('~server/app/function/poi/poi_batch_create');
const geocode = require('~server/app/function/utils/geocode');

const resolvers = {
  Query: {
    poi_list: async (rootValue, args, context, info) => {
      try {
        const select = qfields(info, 'data');

        const rs = await poiList({
          offset: args.offset, limit: args.limit, ...args.filter,
        }, select);

        return rs;
      } catch (e) {
        context.throw(e);
      }
      return null;
    },

    poi_by_ids: async (rootValue, args, context, info) => {
      try {
        const select = qfields(info);

        const rs = await poiByIds({ poi_ids: args.poi_ids }, select);

        return rs;
      } catch (e) {
        context.throw(e);
      }
      return [];
    },

    stage_poi_list: async (rootValue, args, context, info) => {
      try {
        const select = qfields(info, 'data');
        return await stagePOIList({
          offset: args.offset, limit: args.limit, ...args.filter,
        }, select);
      } catch (e) { context.throw(e); }
      return null;
    },

    unstage_poi_list: async (rootValue, args, context, info) => {
      try {
        const select = qfields(info, 'data');
        return await unstagePOIList({
          offset: args.offset, limit: args.limit, ...args.filter,
        }, select);
      } catch (e) { context.throw(e); }
      return null;
    },

    geocode: async (rootValue, args, context, info) => {
      try {
        // const select = qfields(info, 'data');
        // return await unstagePOIList({
        //   offset: args.offset, limit: args.limit, ...args.filter,
        // }, select);
        const rs = await geocode(args.address);
        console.log(rs);
        return rs;
      } catch (e) { context.throw(e); }
      return null;
    },
  },

  POI: {
    lat: (parent) => {
      const _cor = (parent.loc || {}).coordinates || [];
      return _cor[1];
    },
    lon: (parent) => {
      const _cor = (parent.loc || {}).coordinates || [];
      return _cor[0];
    },
  },

  Mutation: {
    poi_create: async (rootValue, args, context) => {
      try {
        return await poiCreate(args.poi, context.res);
      } catch (e) { context.throw(e); }
      return null;
    },

    poi_update: async (rootValue, args, context) => {
      try {
        return await poiUpdate(args.poi, context.res);
      } catch (e) { context.throw(e); }
      return null;
    },

    poi_delete: async (rootValue, args, context) => {
      try {
        await poiDelete(args.poi_id, context.res);
      } catch (e) { context.throw(e); }
      return 'OK';
    },

    poi_stage: async (rootValue, args, context) => {
      try {
        return await poiStage(args.poi, context.res);
      } catch (e) { context.throw(e); }
      return null;
    },

    poi_stage_delete: async (rootValue, args, context) => {
      try {
        return await poiStageDelete(args.poi_id, context.res);
      } catch (e) { context.throw(e); }
      return 'OK';
    },

    poi_unstage: async (rootValue, args, context) => {
      try {
        await poiUnStage(args.poi_id, context.res);
      } catch (e) { context.throw(e); }
      return 'OK';
    },

    poi_unstage_delete: async (rootValue, args, context) => {
      try {
        return await poiUnStageDelete(args.poi_id, context.res);
      } catch (e) { context.throw(e); }
      return 'OK';
    },

    poi_batch_create: async (rootValue, args, context) => {
      try {
        return await poiBatchCreate(args.pois, context.res);
      } catch (e) { context.throw(e); }
      return [];
    },
  },
};

module.exports = resolvers;
