/* eslint no-shadow:0 */
/* eslint no-param-reassign: 0 */
import Vue from 'vue';
// import EventEmitter from 'events';

// console.log(DateTime.local().zoneName);

export const state = () => ({
  sky_id: '',
  _listeners: {},
});

export const getters = {
  // getLoginInfo(state) {
  //   return state._loginInfo;
  // },
};

export const mutations = {
  // setLoginInfo: (state, val) => {
  //   state._loginInfo = { ...state._loginInfo, ...val };
  // },
  setSkyId: (state, val) => {
    state.sky_id = val;
  },

  dispatchEvent: (state, val) => {
    // state._listeners.dispatchEvent(new Event(val.type), val.data);
    if (!state._listeners[val.type]) return;
    state._listeners[val.type].forEach((v) => {
      try {
        v(val);
      } catch (e) { /* */ }
    });
  },
  onEvent: (state, val) => {
    if (!state._listeners[val.type]) state._listeners[val.type] = [];
    state._listeners[val.type].push(val.callback);
  },
  offEvent: (state, val) => {
    if (!state._listeners[val.type]) return;
    state._listeners[val.type] = state._listeners[val.type].filter((f) => f !== val.callback);
  },
};

export const actions = {
  onAccessTokenError: (_, code) => {
    console.log(`onAccessTokenError: ${code}`);
  },
  // onAccessTokenChange: (_, newToken) => {
  //   console.log(`onAccessTokenChange: ${newToken}`);
  // },
  async getMe({ commit }) {
    const query = `query getMe {
      me {
        sky_id
        email
      }
    }`;
    const rs = await Vue.SKGQL.call({
      query,
    });

    // this.poi_categories = rs.data.POICategories;
    // commit('setCategories', rs.data.category_all);
    commit('setSkyId', (rs.data.me || {}).sky_id || '');
    return rs.data.me;
  },
};
