/* eslint no-shadow:0 */
/* eslint no-param-reassign: 0 */
// import { Loader } from '@googlemaps/js-api-loader';

// let geocoder;

// const initGeoAPI = async () => {
//   // const loader = new Loader({ apiKey: process.env.MAP_API_KEY });
//   // await loader.load();
//   geocoder = new google.maps.Geocoder();
// };
// initGeoAPI();

export const state = () => ({
  cache: [],
  geocoder: null,
});

export const getters = {
  // getToken: state => state.token,
};

export const mutations = {
  // testMutation: (state, val) => {},
  pushCache: (state, val) => {
    state.cache.push(val);
  },
  setGeocoder: (state, val) => {
    state.geocoder = val;
  },
};

export const actions = {
  // async testAction({ state, commit, dispatch, rootState }) {},

  geocode({ state, commit }, address) {
    return new Promise((resolve, reject) => {
      if (!address) {
        reject(new Error('無效的地址'));
        return;
      }
      const _cache = state.cache.find((f) => f.address === address);
      if (_cache) {
        console.log('use cache');
        resolve({ lat: _cache.lat, lon: _cache.lon });
        return;
      }
      state.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          let _lat;
          let _lon;
          results.forEach((v) => {
            if (v.geometry.location_type === 'ROOFTOP') {
              _lat = v.geometry.location.lat();
              _lon = v.geometry.location.lng();
            }
            // try {
            //   _lat = v.geometry.location.lat();
            //   _lon = v.geometry.location.lng();
            // } catch (e) { /** */ }
          });
          if (!_lat || !_lon) {
            reject(new Error('無法轉換經緯度(地址不夠精確)'));
            return;
          }
          commit('pushCache', { address, lat: _lat, lon: _lon });
          resolve({ lat: _lat, lon: _lon });
        } else {
          reject(new Error(status));
        }
      });
    });
  },
};
