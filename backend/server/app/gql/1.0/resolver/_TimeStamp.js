const { GraphQLScalarType } = require('graphql');

const resolvers = {
  TimeStamp: new GraphQLScalarType({
    name: 'TimeStamp',
    description: 'Custom Date scalar type',

    // value sent to the client
    serialize(value) {
      try {
        const d = value.getTime();
        return d;
      } catch (e) {
        const rv = Number(value);
        if (Number.isNaN(rv)) return 0;
        return rv;
      }
      // const d = new Date(value);
      // return d.getTime();
    },

    // value from client (variable)
    parseValue(value) {
      // console.log('parseValue');
      // console.log(value);
      const v = Number(value);
      if (Number.isNaN(v)) return null;
      return v;
    },

    // value from client (inline argument)
    parseLiteral(ast) {
      // console.log('parseLiteral');
      // console.log(ast);
      const v = Number(ast.value);
      if (Number.isNaN(v)) return null;
      return v;
    },
  }),
};

module.exports = resolvers;
