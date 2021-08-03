const { ApolloServer } = require('apollo-server-express');
/* eslint-disable */
const { mergeResolvers, mergeTypeDefs } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');
/* eslint-enable */
const path = require('path');
const SKError = require('~server/module/errorHandler/SKError');
const authUser = require('./directive/authUser');
const authSysAdmin = require('./directive/authSysAdmin');
const authSu = require('./directive/authSu');
const jwtAutoRefresh = require('~server/app/middleware/jwtAutoRefresh');
const jwtCheckDB = require('~server/app/middleware/jwtCheckDB');
const apiUser = require('~server/app/middleware/apiUser');
const config = require('~server/config');

const apply = (app) => {
  // 合併typedef與resolver
  const typesArray = loadFilesSync(path.join(__dirname, 'typedef'), { recursive: true });
  const typeDefs = mergeTypeDefs(typesArray);
  const resolversArray = loadFilesSync(path.join(__dirname, 'resolver'), { recursive: true });
  const resolvers = mergeResolvers(resolversArray);

  const apolloOption = {
    typeDefs,
    resolvers,

    // tracing: true,
    // cacheControl: { // 加這個tracing才會有效
    //   defaultMaxAge: 30 * 1000,
    //   calculateHttpHeaders: false,
    //   stripFormattedExtensions: false,
    // },

    // debug: false, // 關閉詳細的stack
    debug: process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'development',

    // __schema及playground是否可以使用(預設為true)
    // 若 NODE_ENV=production 則自動為 fasle，如果要強制打開就設為true
    // introspection: true,
    // playground: true,
    introspection: !!(process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'development'),
    playground: !!(process.env.APP_ENV === 'stage' || process.env.APP_ENV === 'development'),

    // 加入directives
    schemaDirectives: {
      authUser,
      authSysAdmin,
      authSu,
    },

    context: async ({ req, res }) => {
      const __context = {
        dataloaders: {},
        req,
        res,
        // 統一處理錯誤的方式
        // resolver可以呼叫context.throw拋出錯誤
        // 把這個方式獨立出來的原因是為了要讓錯誤訊息可以方便的使用多國語言
        // 因為只有這裡可以接觸到res，取得使用者的語系
        throw: (e) => {
          let newError = e;
          if (e instanceof Error) {
            if (e instanceof SKError) {
              newError = e.toLang(res.locals.__lang || 'zh');
            }
          } else {
            newError = new Error(e);
          }
          throw newError;
        },
      };
      return __context;
    },

    /*
    把errors裡的錯誤統一格式：
    {
      message: 'message',
      path: '第一個path',
      code: '如果是SKError，回傳錯誤碼'
    }
    */
    formatError: (err) => {
      if (process.env.APP_ENV !== 'production') {
        console.log(err);
        // console.log(err.extensions);
      }
      const res = { message: err.message, path: (err.path || [])[0] };
      if (err.extensions.exception && err.extensions.exception.code) {
        res.code = err.extensions.exception.code;
      }
      return res;
    },

    /*
    把相同path簡化成一條 (path原本是array，不過為了簡化，使用formatError只取出第一層的path)
    並將對應的data資料設成null
    */
    formatResponse: (response /* , context */) => {
      if (response.errors && response.errors.length > 0) {
        const errors = [];
        const { data } = response;
        response.errors.forEach((v) => {
          data[v.path] = null;
          const found = errors.find((f) => f.path === v.path);
          if (!found) errors.push(v);
        });
        return {
          data,
          errors,
        };
      }
      return response;
    },

    plugins: [
      {
        requestDidStart() {
          return {
            // 判斷同一個request是否超過3個operation
            didResolveOperation(context) {
              const operationNumber = (context.operation.selectionSet.selections || []).length;
              if (operationNumber > 3) throw new Error('Maximum operation number is 3.');
            },
          };
        },
      },
    ],
  };

  const apollo = new ApolloServer(apolloOption);

  // 套用cors
  // const cors = skCors(['http://localhost:8080']);
  // app.options('/gql/v1.0', cors);
  // app.use('/gql/v1.0', cors);

  // const limiter1 = skRateLimit({ windowMs: 1000 * 60, max: 50 });
  // app.use('/gql/v1.0', limiter1);
  app.use('/gql/1.0', jwtAutoRefresh({
    cookieName: '__MPOI',
    secret: config.JWT_SECRET,
    cookieOptions: { signed: true, httpOnly: true, secure: true },
  }), jwtCheckDB, apiUser);

  apollo.applyMiddleware({
    app,
    path: '/gql/1.0',
  });
};

module.exports = apply;
