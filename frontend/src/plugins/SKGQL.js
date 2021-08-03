/*
說明：
統一GQL的呼叫方式，使用Axios來擴充，因為Axios比較靈活也方便cancel，主要是簡化request的呼叫寫法、以及統一回應格式。

# 簡化了cancel的方式，一個cancelID代表一個request，用同樣的cancelID就可以取消request。
# 可以預先設定access_token或是呼叫時額外帶入，SKGQK會依照 【帶入的=>預先設定的=>存在store裡的】 順序取得access_token使用
# 可以預先設定GQL的路徑，SKGQL會依照 【帶入的=>預先設定的】 順序取得url使用
# axios的例外狀況已經被預先處理，所以不用再去額外判斷http異常的情況，所有的回應會被統一格式，如下：
# 呼叫正常的情況(http 200)，回傳的格式與一般的GQL格式相同，為 { data: {}, errors:[] } 的格式
# 即使沒有errors的情況，SKGQL仍然會回傳一個長度為零的Array給errors，前端可以直接用errors的長度判斷是否有錯誤發生
# 如果某個query或mutation出現token驗證問題，會在errors有一筆 { type:'UNAUTHORIZED', code:'error code', path:'query name' } 的錯誤
# code='E001004'表示錯誤的token，code='E001005'表示token過期
# token若是驗證有問題，會呼叫$store.dispatch('onAccessTokenError', code)，可以在store裡進行global的token處理
# 若是Server回應時在response header裡有token，並且與這次發出的token不同，則會呼叫$store.dispatch('onAccessTokenChange', new_token)
# 若是非正常情況的回應(http > 300)，回傳格式會變成單數錯誤： { status:'ERROR', message:'message', code:'error code' }
# request被取消的話會回傳 { status:'CANCEL' }

使用：
在vue instance裡

try {
  const result = this.$SKGQL.call({
    url,
    query,
    variables,
    cancelID,
    access_token,
    headers,
  })
  if (result.status === 'ERROR') throw result;
  console.log(result.data);
  if (result.errors.length > 0) {
    console.log(result.errors);
  }
} catch(e) {
  console.log(e);
}

設定url
this.$SKGQL.setURL(url);

設定access_token
this.$SKGQL.setAccessToken(access_token);

取消呼叫
this.$SKGQL.cancelCall(cancelID);
*/

import axios from 'axios';
import Vue from 'vue';
// import jsonwebtoken from 'jsonwebtoken';

// 設定axios可以傳送cookie
// axios.defaults.withCredentials = true;

const SKGQL = {};
const _cancelSources = {};
let _accessToken = '';
let _url = '/gql/1.0';

// const clientToken = () => {
//   const token = jsonwebtoken.sign({}, 'secret2', { expiresIn: 10 });
//   return token;
// };

// 設定access_token
SKGQL.setAccessToken = (token) => {
  _accessToken = token;
};

// 設定GraphQL的url
SKGQL.setURL = (url) => {
  _url = url;
};

SKGQL.cancelCall = async (id) => {
  if (!id) return;
  const c_id = id.toString();
  try {
    if (_cancelSources[c_id]) _cancelSources[c_id].cancel();
  } finally {
    delete _cancelSources[c_id];
  }
};

const removeCancelID = (id) => {
  if (!id) return;
  const c_id = id.toString();
  delete _cancelSources[c_id];
};

SKGQL.call = async ({
  url, query, variables, cancelID, access_token, headers, withCredentials = false,
}) => {
  let response = null;
  try {
    // 去掉多餘的空白
    const qstr = query.replace(/  +/g, ' ');
    // 如果沒有指定url，就用預設的_url
    const uri = url || _url;

    const opt = {
      url: uri,
      method: 'post',
      data: {
        query: qstr,
        variables,
      },
      headers: {},
    };
    if (headers) opt.headers = { ...headers };
    if (withCredentials) opt.withCredentials = true;

    // 把access_token放到header裡
    const token = access_token || _accessToken || SKGQL.$store.state.access_token || '';
    if (token) opt.headers.Authorization = `Bearer ${token}`;

    // opt.headers.ClientToken = clientToken();

    // 如果有指定cancelID，先把同ID的request取消，再加入新的cancelSoure
    if (cancelID) {
      await SKGQL.cancelCall(cancelID);
      const source = axios.CancelToken.source();
      opt.cancelToken = source.token;
      _cancelSources[cancelID.toString()] = source;
    }

    const rs = await axios(opt);
    response = rs.data;
    if (!response.errors) response.errors = [];

    // 比對response header裡的access_token是否有改變
    if (rs.headers.authorization && rs.headers.authorization.indexOf('Bearer ') === 0) {
      const new_token = rs.headers.authorization.replace('Bearer ', '');
      if (new_token !== token) {
        try {
          SKGQL.$store.dispatch('onAccessTokenChange', new_token);
        } catch (e) { /* */ }
      }
    }
  } catch (e) {
    /*
    在這邊的情況都是非正常回應，所以理論上不會有GQL多個錯誤的情況，
    所以拋出的錯誤使用單數，也比較好判斷
    */
    if (e.toString() === 'Cancel') {
      // API呼叫被取消
      response = {
        status: 'CANCEL',
        message: 'Request has been cancelled',
        code: 'CANCEL',
      };
    } else if (e.response && e.response.data && e.response.data.errors) {
      // GraphQL的處理錯誤 (理論上不應該會有，但還是判斷一下)
      response = { errors: e.response.data.errors };
    } else if (e.response && e.response.data && e.response.data.status && e.response.data.message) {
      // 在進入GQL resolver之前就被server阻擋的錯誤
      response = {
        status: e.response.data.status || 'ERROR',
        message: e.response.data.message,
        code: e.response.data.code || '500',
      };
    } else {
      // 其它不明錯誤
      response = {
        status: 'ERROR',
        message: e.toString(),
        code: e.response ? e.response.status : '500',
      };
    }
  } finally {
    // 最後清掉此次呼叫的cancelSource
    removeCancelID(cancelID);
  }

  if (response.errors && response.errors.length > 0) {
    // 如果token過期或是無效(E001004=無效的Token，E001005=過期)
    // 標示type，方便前端過濾錯誤(如果要將登入驗證統一交由某個function處理的話)
    let unauthenticatedCode = '';
    for (let i = 0; i < response.errors.length; i += 1) {
      const err = response.errors[i];
      if (err.code === 'E001004' || err.code === 'E001005') {
        err.type = 'UNAUTHORIZED';
        unauthenticatedCode = err.code;
      }
    }
    if (unauthenticatedCode) {
      try {
        SKGQL.$store.dispatch('onAccessTokenError', unauthenticatedCode);
      } catch (e) { /* */ }
    }
  }

  return response;
};

export default ({ store }) => {
  const gqlPlugin = {};
  gqlPlugin.install = (vue) => {
    SKGQL.$store = store;
    vue.prototype.$SKGQL = SKGQL;
    vue.SKGQL = SKGQL;
  };

  Vue.use(gqlPlugin);
};
