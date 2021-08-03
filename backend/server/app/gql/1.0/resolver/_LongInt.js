const { GraphQLScalarType } = require('graphql');

const resolvers = {
  LongInt: new GraphQLScalarType({
    name: 'LongInt',
    description: 'Long Int Scalar',

    // value sent to the client
    serialize(value) {
      const v = Number(value);
      if (Number.isNaN(v)) return null;
      return v;
    },

    // value from client (variable)
    parseValue(value) {
      const v = Number(value);
      if (Number.isNaN(v)) return null;
      return v;
    },

    // value from client (inline argument)
    parseLiteral(ast) {
      const v = Number(ast.value);
      if (Number.isNaN(v)) return null;
      return v;
    },
  }),
};

module.exports = resolvers;
