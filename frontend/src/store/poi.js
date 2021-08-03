/* eslint no-shadow:0 */
/* eslint no-param-reassign: 0 */
import Vue from 'vue';

export const state = () => ({
  categories: [],
  categories_stage: [],
  poi_list: [],
  poi_totalCount: 0,
  poi_list_loading: false,

  edited_poi: {
    poi_id: '',
    name: '',
    category1: '',
    category2: '',
    brand_group: '',
    address: '',
    phone: '',
    lat: undefined,
    lon: undefined,
    stage_status: '',
  },

  searchFilter: {},
});

export const getters = {
  // getToken: state => state.token,
};

export const mutations = {
  // testMutation: (state, val) => {},
  setCategories: (state, val) => {
    state.categories = val;
  },
  setCategoriesStage: (state, val) => {
    console.log('set categories_stage ');
    console.log(val);
    state.categories_stage = val;
  },
  setPOIList: (state, val) => {
    state.poi_totalCount = (val || {}).totalCount || 0;
    state.poi_list = (val || {}).data || [];
  },
  setPOIListLoading: (state, val) => {
    state.poi_list_loading = val;
  },

  setEditPOI: (state, poi) => {
    // const _f = state.poi_list.find((f) => f.poi_id === poi.poi_id);
    if (!poi) {
      state.edited_poi = {
        poi_id: '',
        name: '',
        category1: '',
        category2: '',
        brand_group: '',
        address: '',
        phone: '',
        lat: undefined,
        lon: undefined,
        stage_status: '',
      };
      return;
    }
    state.edited_poi = { ...poi };
  },

  setPOI: (state, poi) => {
    const _d = [...state.poi_list];
    const _f = _d.find((f) => f.poi_id === poi.poi_id);
    if (_f) {
      _f.name = poi.name;
      _f.category1 = poi.category1;
      _f.category2 = poi.category2;
      _f.brand_group = poi.brand_group;
      _f.address = poi.address;
      _f.phone = poi.phone;
      _f.lat = poi.lat;
      _f.lon = poi.lon;
    }
    state.poi_list = _d;
  },
  pushPOI: (state, poi) => {
    state.poi_list.push(poi);
  },
  removePOI: (state, poi_id) => {
    state.poi_list = state.poi_list.filter((f) => f.poi_id !== poi_id);
  },

  setSearchFilter: (state, filter) => {
    state.searchFilter = filter;
  },
};

export const actions = {
  // async testAction({ state, commit, dispatch, rootState }) {},

  async fetchCategories({ commit }) {
    const query = `query getPOICategories {
      category_all {
        name
        count
        children {
          name
          count
        }
      }
    }`;
    const rs = await Vue.SKGQL.call({
      query,
    });

    // this.poi_categories = rs.data.POICategories;
    commit('setCategories', rs.data.category_all);
  },

  async fetchCategoriesStage({ commit }) {
    const query = `query getPOICategoriesStage {
      category_stage_all {
        name
        count
        children {
          name
          count
        }
      }
    }`;
    const rs = await Vue.SKGQL.call({
      query,
    });

    // this.poi_categories = rs.data.POICategories;
    commit('setCategoriesStage', rs.data.category_stage_all);
  },

  async fetchPOIList({ commit }, params = {}) {
    commit('setPOIListLoading', true);
    const query = `query poiGet($offset:Int,$limit:Int,$filter:POIListFilter) {
      poi_list(offset:$offset,limit:$limit,filter:$filter) {
        totalCount
        data{
          poi_id
          brand_group
          name
          category1
          category2
          city
          district
          address
          phone
          lat
          lon
          created_at
        }
      }
    }`;
    // const variables = {
    //   groups: params.groups || [],
    // };
    const rs = await Vue.SKGQL.call({
      query,
      variables: params,
    });
    const _list = (rs.data || {}).poi_list;

    commit('setPOIListLoading', false);
    commit('setPOIList', _list);
  },

  async fetchPOIStageList({ commit }, params = {}) {
    commit('setPOIListLoading', true);
    const query = `query poiStageGet($offset:Int,$limit:Int,$filter:POIListFilter) {
      stage_poi_list(offset:$offset,limit:$limit,filter:$filter) {
        totalCount
        data{
          poi_id
          brand_group
          name
          category1
          category2
          city
          district
          address
          phone
          lat
          lon
          created_at
        }
      }
    }`;
    // const variables = {
    //   groups: params.groups || [],
    // };
    const rs = await Vue.SKGQL.call({
      query,
      variables: params,
    });
    const _list = (rs.data || {}).stage_poi_list || { totalCount: 0, data: [] };
    _list.data = _list.data
      .map((v) => ({ ...v, stage_status: 'stage' }));

    commit('setPOIListLoading', false);
    commit('setPOIList', _list);
  },
};
