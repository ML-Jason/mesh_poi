import { Loader } from '@googlemaps/js-api-loader';

export default async ({ /* route, */ store }) => {
  const loader = new Loader({ apiKey: process.env.MAP_API_KEY });
  await loader.load();
  store.commit('geocoder/setGeocoder', new google.maps.Geocoder());
};
