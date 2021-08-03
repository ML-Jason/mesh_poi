/* eslint class-methods-use-this: 0, func-names: 0 */
const { SchemaDirectiveVisitor } = require('apollo-server-express');

// 限制可以一次發起的query數量
class queryNumber extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve } = field;
    const { limit } = this.args;
    field.resolve = async function (...args) {
      const info = args[3];
      // 取得目前是第幾個query，如果超過limit，就丟Error
      const index = info.operation.selectionSet.selections.findIndex((f) => f.name.value === info.path.key);
      if (index >= limit) {
        args[2].throw(new Error('Too many queries'));
      }

      const result = resolve.apply(this, args);
      return result;
    };
  }
}

module.exports = queryNumber;
