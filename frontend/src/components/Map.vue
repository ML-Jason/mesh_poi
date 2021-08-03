<template lang="pug">
.card.px-2.py-2
  .h4 地圖
  #gmap
</template>

<script>
import {
  mapGetters, mapState, mapMutations, mapActions,
} from 'vuex';
import vcheck from '~/utils/vartool/vcheck';

export default {
  props: {
    // selected_poi_id: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      map: null,
      infoWindow: null,

      poi_data: [],

      act_poi: {},
    };
  },
  computed: {
    ...mapState('poi', ['poi_list', 'poi_list_loading', 'edited_poi']),
    ...mapGetters([]),
  },
  watch: {
    poi_list() {
      this.onPOIListChanged();
    },
    edited_poi() {
      this.onSelectPOI();
    },
  },
  created() {
  },
  mounted() {
    this.initMap();
    this.onPOIListChanged();
  },
  beforeDestroy() {
  },
  methods: {
    ...mapMutations('poi', ['setEditPOI']),
    ...mapActions([]),

    async initMap() {
      // const loader = new Loader({ apiKey: process.env.MAP_API_KEY, libraries: ['drawing'] });
      this.map = new google.maps.Map(document.getElementById('gmap'), {
        center: { lat: 23.812508427694866, lng: 120.95325785189463 },
        zoom: 8,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
      });

      this.infoWindow = new google.maps.InfoWindow({});
    },

    onPOIListChanged() {
      console.log('onPOIListChanged');
      this.poi_data.forEach((v) => {
        try {
          if (v.marker) v.marker.setMap(null);
          if (v.circleMarker) v.circleMarker.setMap(null);
        } catch (e) { /* */ }
      });

      this.poi_data = this.poi_list.map((v) => {
        const d = { ...v };
        const latlng = { lat: v.lat, lng: v.lon };
        if (vcheck.number(v.lat) && vcheck.number(v.lon)) {
          const marker = new google.maps.Marker({
            position: latlng,
            map: this.map,
            // title: v.name,
            icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
          });
          marker.addListener('click', () => {
            this.onMarkerClick(d);
          });
          d.marker = marker;

          const circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: this.map,
            center: latlng,
            radius: 50,
          });
          d.circleMarker = circle;

          // if (this.edited_poi_data.poi_id && this.edited_poi_data.poi_id === v.poi_id) {
          //   d.marker.setMap(null);
          //   d.circleMarker.setMap(null);
          // }
          if (d.poi_id === this.edited_poi.poi_id) {
            marker.setMap(null);
            circle.setMap(null);
          }
        }

        return d;
      });
    },
    updateInfoWindowContent(poi) {
      let _content = `<div>
        <div><strong>${poi.name}</strong></div>
        <div>${poi.address}</div>
        <div class="badge badge-success">${poi.brand_group}</div>
        <div class="badge badge-primary">${poi.category1} - ${poi.category2}</div>
        <br/>`;
      // if (this.isSelected(poi)) {
      //   _content += `<button class="btn btn-danger btn-sm mt-1" onclick="removePOI('${poi.poi_id}')">移除</button>`;
      // } else {
      //   _content += `<button class="btn btn-info btn-sm mt-1" onclick="addPOI('${poi.poi_id}')">加入</button>`;
      // }
      _content += '</div>';
      this.infoWindow.setContent(_content);
    },
    onMarkerClick(poi) {
      const _f = this.poi_list.find((f) => f.poi_id === poi.poi_id);
      if (!_f) return;
      this.setEditPOI(_f);
    },
    onSelectPOI() {
      // console.log('onSelectPOI');
      // console.log(this.edited_poi);
      // 把原本該加或該移掉的marker進行處理
      this.poi_data.forEach((v) => {
        if (v.poi_id !== this.edited_poi.poi_id) {
          if (v.marker) v.marker.setMap(this.map);
          if (v.circleMarker) v.circleMarker.setMap(this.map);
        } else {
          if (v.marker) v.marker.setMap(null);
          if (v.circleMarker) v.circleMarker.setMap(null);
        }
      });

      // 如果edited_poi跟現在的act_poi不一樣，就移掉act_poi
      if (this.edited_poi.poi_id !== this.act_poi.poi_id) {
        try {
          if (this.act_poi.marker) {
            this.act_poi.marker.setMap(null);
            this.act_poi.circleMarker.setMap(null);
          }
        } catch (e) { /** */ }
      }
      // if (this.edited_poi.poi_id === '') {
      //   this.act_poi = {};
      //   return;
      // }

      const latlng = { lat: vcheck.number(this.edited_poi.lat), lng: vcheck.number(this.edited_poi.lon) };

      // 如果edited_poi跟act_poi是同一個，就更換內容就好
      if (this.act_poi.poi_id === this.edited_poi.poi_id) {
        if (!Number.isNaN(latlng.lat) && !Number.isNaN(latlng.lng)) {
          if (this.act_poi.marker) {
            this.act_poi.marker.setPosition(latlng);
          } else {
            const marker = new google.maps.Marker({
              position: latlng,
              map: this.map,
              icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
              draggable: true,
            });
            marker.addListener('dragend', (e) => {
              this.onMarkerDragend(e);
            });
            this.act_poi.marker = marker;
          }
          if (this.act_poi.circleMarker) {
            this.act_poi.circleMarker.setCenter(latlng);
          } else {
            const circle = new google.maps.Circle({
              strokeColor: '#00FF00',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: '#00FF00',
              fillOpacity: 0.35,
              map: this.map,
              center: latlng,
              radius: 50,
            });
            this.act_poi.circleMarker = circle;
          }
        }
        this.updateInfoWindowContent(this.edited_poi);
        return;
      }

      this.act_poi = { poi_id: this.edited_poi.poi_id };

      if (Number.isNaN(latlng.lat) || Number.isNaN(latlng.lng)) return;

      const marker = new google.maps.Marker({
        position: latlng,
        map: this.map,
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
        draggable: true,
      });
      marker.addListener('dragend', (e) => {
        this.onMarkerDragend(e);
      });
      this.act_poi.marker = marker;
      const circle = new google.maps.Circle({
        strokeColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: this.map,
        center: latlng,
        radius: 50,
      });
      this.act_poi.circleMarker = circle;

      this.updateInfoWindowContent(this.edited_poi);
      this.infoWindow.open(this.map, marker);
    },
    onMarkerDragend(e) {
      const lat = e.latLng.lat();
      const lon = e.latLng.lng();

      const _poi = { ...this.edited_poi };
      _poi.lat = lat;
      _poi.lon = lon;
      // console.log(_poi);
      this.setEditPOI(_poi);
    },
  },
};
</script>

<style lang="stylus" scoped>
#gmap
  width 100%
  height 500px
</style>
