const nextPath = (info, path) => {
  // console.log(info);
  const mynode = info.selectionSet.selections.find((f) => f.name.value === path);
  return mynode;
};

const findFields = (info, paths) => {
  const ps = [...paths];
  let node = { ...info };
  let i = 0;
  while (ps.length > 0 && i < 10) {
    node = nextPath(node, ps[0]);
    ps.splice(0, 1);
    i += 1;
  }

  const fields = [];
  node.selectionSet.selections.forEach((v2) => {
    fields.push(v2.name.value);
  });

  return fields;
};

/**
說明
從gql裡解析要從資料庫裡取得的資料欄位名稱

使用
qfield(info, path, alias):String

參數
info: 在resolver裡得到的info
path: String或Array，指定要往下層查找的階層，可以往下去尋找fields(通常適用於回傳的結果跟query在不同層級的情況，例如cursor)
alias: Object，gql query裡的名稱對映到DB的名稱 {account_name: 'name'}即表示gql裡是account_name，但是在DB裡叫做name

回傳
以空白分隔的欄位名稱

範例
const qfields = require('./util/qfields');
const resolvers = {
  Query: {
    accounts: async (rootValue, args, context, info) => {
      const fields = qfields(info, '', { account_name: 'name' });
      console.log(field);
    },
  },
};
*/
const qfields = (info, path = '', alias = {}) => {
  try {
    let searchPath = [];
    if (path) {
      if (Array.isArray(path)) {
        searchPath = path;
      } else {
        searchPath = [path];
      }
    }

    const fields = findFields(info.fieldNodes[0], searchPath);

    // 將尋找的fields取代成資料庫裡真的field name
    const aliasFields = fields.map((v) => {
      if (alias[v]) return alias[v];
      return v;
    });
    return aliasFields;
  } catch (e) {
    return [];
  }
};

module.exports = qfields;
