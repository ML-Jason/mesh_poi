const qfields = require('../util/qfields');

const resolvers = {
  Query: {
    me: async (rootValue, args, context, info) => {
      try {
        const sky_id = (context.res.locals.__jwtPayload || {}).i;
        const _email = (context.res.locals.__jwtPayload || {}).email;

        return {
          sky_id, email: _email,
        };
      } catch (e) {
        context.throw(e);
      }
      return null;
    },
  },
};

module.exports = resolvers;
