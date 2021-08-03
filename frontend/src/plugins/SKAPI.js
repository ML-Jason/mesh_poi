/*
說明：
統一API的呼叫方式，擴充Axios，意在簡化request的呼叫寫法、以及統一回應格式。

# 簡化了cancel的方式，一個cancelID代表一個request，用同樣的cancelID就可以取消request。
# 不管是GET、POST或是form-data，都統一放在data參數裡。
# 如果是form-data，只要把變數都放在data裡，然後upload選項設為true，就會自動使用form-data將資料包起來。
# 可以預先設定access_token或是呼叫時額外帶入，SKAPI會依照 【帶入的=>預先設定的=>存在store裡的】 順序取得access_token使用
# axios的例外狀況已經被預先處理，所以不用再去額外判斷http異常的情況，所有的回應會被統一格式，如下：
# 回傳的格式統一為 { status:'OK', data: 'if any' } 或 { status:'ERROR', message:'message', code:'error code' }
# request被取消的話會回傳 { status:'CANCEL' }
# token驗證如果有問題的話會回傳 { status: 'UNAUTHORIZED', code: 'error code'}，code='E001004'表示錯誤的token，code='E001005'表示token過期
# token若是驗證有問題，會呼叫$store.dispatch('onAccessTokenError', code)，可以在store裡進行global的token處理
# 若是Server回應時在response header裡有token，並且與這次發出的token不同，則會呼叫$store.dispatch('onAccessTokenChange', new_token)

使用：
在vue instance裡

try {
  const result = this.$SKAPI.call({
    method = 'GET',
    url,
    responseType = 'json',
    data,
    access_token,
    cancelID,
    headers,
    upload = false,
  })
  if (result.status === 'ERROR') throw result;
} catch(e) {
  console.log(e);
}

設定access_token
this.$SKAPI.setAccessToken(access_token);

取消呼叫
this.$SKAPI.cancelCall(cancelID);
*/

import axios from 'axios';
import Vue from 'vue';

// 設定axios可以傳送cookie
// axios.defaults.withCredentials = true;

const SKAPI = {};

const _cancelSources = {};
let _accessToken = '';

// 設定access_token
SKAPI.setAccessToken = (token) => {
  _accessToken = token;
};

SKAPI.cancelCall = async (id) => {
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

SKAPI.call = async ({
  method = 'GET',
  url,
  responseType = 'json',
  data,
  access_token,
  cancelID,
  headers,
  upload = false,
  withCredentials = false,
}) => {
  let response = null;
  try {
    const opt = {
      url,
      method,
      responseType,
      headers: {},
    };
    if (headers) opt.headers = { ...headers };
    if (withCredentials) opt.withCredentials = true;

    // 把access_token放到header裡
    const token = access_token || _accessToken || SKAPI.$store.state.access_token || '';
    if (token) opt.headers.Authorization = `Bearer ${token}`;

    // 如果有指定cancelID，先把同ID的request取消，再加入新的cancelSoure
    if (cancelID) {
      await SKAPI.cancelCall(cancelID);
      const source = axios.CancelToken.source();
      opt.cancelToken = source.token;
      _cancelSources[cancelID.toString()] = source;
    }

    /**
     * 把資料依照method放到axios的參數裡
     */
    if (data) {
      if (upload) {
        const formData = new FormData();
        Object.keys(data).forEach((v) => {
          formData.append(v, data[v]);
        });
        opt.data = formData;
      } else if (method.toUpperCase() !== 'GET') {
        opt.data = data;
      } else opt.params = data;
    }

    const rs = await axios(opt);
    response = rs.data;

    // 比對response header裡的access_token是否有改變
    if (rs.headers.authorization && rs.headers.authorization.indexOf('Bearer ') === 0) {
      const new_token = rs.headers.authorization.replace('Bearer ', '');
      if (new_token !== token) {
        // SKAPI.setAccessToken(new_token);
        try {
          SKAPI.$store.dispatch('onAccessTokenChange', new_token);
        } catch (e) { /* */ }
      }
    }
  } catch (e) {
    if (e.toString() === 'Cancel') {
      // API呼叫被取消
      response = { status: 'CANCEL', message: 'Request has been cancelled' };
    } else {
      // 其它錯誤(Http 500、404... etc)
      let message = `API發生錯誤。<br>請稍後再試。 ${e.response ? e.response.status : 'Network Error'}`;
      let code = '500';
      let status = 'ERROR';
      if (e.response && e.response.data) {
        status = e.response.data.status || 'ERROR';
        message = `${e.response.data.message || 'API發生錯誤。<br>請稍後再試。'}`;
        code = e.response.data.code || '500';
      }
      response = {
        status,
        message,
        code,
      };
    }
  } finally {
    // 最後清掉此次呼叫的cancelSource
    removeCancelID(cancelID);
  }

  if (response.status === 'UNAUTHORIZED') {
    // 如果token過期或是無效(E001004=無效的Token，E001005=過期)
    try {
      SKAPI.$store.dispatch('onAccessTokenError', response.code);
    } catch (e) { /* */ }
  }

  return response;
};

export default function ({ store }) {
  const plugin = {};
  plugin.install = (vue) => {
    SKAPI.$store = store;
    vue.prototype.$SKAPI = SKAPI;
    vue.SKAPI = SKAPI;
  };

  Vue.use(plugin);
}
