/* eslint class-methods-use-this: 0, func-names: 0, no-param-reassign:0 */
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const SKError = require('~server/module/errorHandler/SKError');

class authenticatedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve } = field;
    field.resolve = async function (...args) {
      const context = args[2];

      // 檢查有沒有 __jwtError
      if (context.res.locals.__jwtError) context.throw(context.res.locals.__jwtError);
      const _role = context.res.locals.__jwtPayload.role;
      if (_role !== 'su') context.throw(new SKError('E001001'));

      // 確定 token被正確解析後才進入 Resolve Function
      const result = resolve.apply(this, args);
      return result;
    };
  }
}

module.exports = authenticatedDirective;
