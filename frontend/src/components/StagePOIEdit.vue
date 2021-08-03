<template lang="pug">
.card.px-2.py-2
  .h4 POI資訊
  .form-row
    .form-group.col-4.px-1.my-0
      label 大分類
      select.form-control.form-control-sm(v-model="category1" :disabled="edited_poi.stage_status !== 'stage'")
        option(value="") 請選擇
        option(v-for="itm in categories" :value="itm.name") {{itm.name}} ({{itm.count}})
    .form-group.col-4.px-1.my-0
      label 小分類
      select.form-control.form-control-sm(v-model="category2" :disabled="edited_poi.stage_status !== 'stage'")
        option(value="") 請選擇
        option(v-for="itm in categories2" :value="itm.name") {{itm.name}} ({{itm.count}})
    .form-group.col-4.px-1.my-0
      .form-group
        label 品牌
        //- input.form-control.form-control-sm(type="text" v-model="brand_group")
        TypeAhead(:list="brand_groups" :parser="(itm)=>{return itm.name;}" @onInput="(e)=>{brand_group=e;}" :value="brand_group" :disabled="edited_poi.stage_status !== 'stage'")
  .form-group
    label 名稱
    input.form-control.form-control-sm(type="text" v-model.trim="name" :disabled="edited_poi.stage_status !== 'stage'")
  .form-group
    label 電話
    input.form-control.form-control-sm(type="text" v-model.trim="phone" :disabled="edited_poi.stage_status !== 'stage'")
  .form-group
    label 地址
    button.btn.btn-outline-info.btn-sm.ml-2(@click="onAddrToLatlngClick") 轉換經緯度
    input.form-control.form-control-sm(type="text" v-model.trim="address" :disabled="edited_poi.stage_status !== 'stage'")
    .text-muted.small
      |如果修改地址但不知道經緯度，可以刪除經緯度的數值，由系統自動抓取。
      br
      |前提是：新的地址是正確的! 否則最好自己指定經緯度。
  .form-row
    .col-6
      .form-group
        label Lat
        input.form-control.form-control-sm(type="text" v-model="lat" :disabled="edited_poi.stage_status !== 'stage'")
    .col-6
      .form-group
        Label Lng
        input.form-control.form-control-sm(type="text" v-model="lon" :disabled="edited_poi.stage_status !== 'stage'")
  .form-row(v-if="edited_poi.stage_status==='unstage'")
    .col-6
      button.btn.btn-danger.btn-sm.btn-block(type="button" :disabled="submitting" @click="onDeleteClick" ) 確定把這個點位移除
    .col-6
      button.btn.btn-secondary.btn-sm.btn-block(type="button" :disabled="submitting" @click="onUnStageDeleteClick" ) 跳過
  .form-row(v-if="edited_poi.stage_status==='stage'")
    .col-6
      button.btn.btn-success.btn-sm.btn-block(type="button" :disabled="submitting" @click="onSubmit")
        .fa-spin.fas.fa-circle-notch.mr-1(v-if="submitting")
        |確定新增點位
    .col-6
      button.btn.btn-secondary.btn-sm.btn-block(type="button" :disabled="submitting" @click="onStageDeleteClick")
        |跳過
</template>

<script>
import {
  mapGetters, mapState, mapMutations, mapActions,
} from 'vuex';
// import { Loader } from '@googlemaps/js-api-loader';
import TypeAhead from './TypeAhead.vue';
import vcheck from '~/utils/vartool/vcheck';

export default {
  components: { TypeAhead },
  props: {
    // selected_poi_id: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      submitting: false,

      category1: '',
      category2: '',
      categories2: [],
      brand_groups: [],
      brand_group: '',
      name: '',
      address: '',
      phone: '',
      lat: '',
      lon: '',
    };
  },
  computed: {
    ...mapState('poi', ['categories', 'edited_poi', 'poi_list']),
    ...mapGetters([]),
  },
  watch: {
    category1(val) {
      this.onCategory1Change();
      if (this.edited_poi.category1 !== val) this.onEdit();
    },
    category2(val) {
      this.onCategory2Change();
      if (this.edited_poi.category2 !== val) this.onEdit();
    },
    lat(val) {
      if (this.edited_poi.lat !== val) this.onEdit();
    },
    lon(val) {
      if (this.edited_poi.lon !== val) this.onEdit();
    },
    name(val) {
      if (this.edited_poi.name !== val) this.onEdit();
    },
    address(val) {
      if (this.edited_poi.address !== val) this.onEdit();
    },
    brand_group(val) {
      if (this.edited_poi.brand_group !== val) this.onEdit();
    },
    edited_poi() {
      this.onPOISelected();
    },
  },
  created() {},
  mounted() {
    this.setEditPOI(null);
  },
  beforeDestroy() {},
  methods: {
    ...mapMutations('poi', ['setEditPOI', 'removePOI']),
    ...mapActions('geocoder', ['geocode']),

    async fetchBrandGroup() {
      const query = `query getPOIBrandGroup {
        brandgroup_all(category1:"${this.category1}", category2:"${this.category2}") {
          name
          count
        }
      }`;
      const rs = await this.$SKGQL.call({
        query,
      });
      this.brand_groups = rs.data.brandgroup_all;
    },
    onCategory1Change() {
      const found = this.categories.find((f) => f.name === this.category1);
      if (!found) {
        this.categories2 = [];
        this.category2 = '';
        this.brand_groups = [];
        return;
      }
      this.fetchBrandGroup();
      this.categories2 = found.children || [];
      const _c2 = this.categories2.find((f) => f.name === this.category2);
      if (!_c2) this.category2 = '';
    },
    async onCategory2Change() {
      this.fetchBrandGroup();
    },

    onPOISelected() {
      const _poi = this.edited_poi;
      this.name = _poi.name;
      this.address = _poi.address;
      this.category1 = _poi.category1;
      this.category2 = _poi.category2;
      // this.lat = vcheck.number(_poi.lat) || '';
      // this.lon = vcheck.number(_poi.lon) || '';
      this.lat = _poi.lat;
      this.lon = _poi.lon;
      this.brand_group = _poi.brand_group || '';
      this.phone = _poi.phone;
    },

    onEdit() {
      const _poi = { ...this.edited_poi };
      // const _lat = vcheck.number(this.lat) || '';
      // const _lon = vcheck.number(this.lon) || '';
      _poi.lat = this.lat;
      _poi.lon = this.lon;
      _poi.name = this.name;
      _poi.category1 = this.category1;
      _poi.category2 = this.category2;
      _poi.address = this.address;
      _poi.brand_group = this.brand_group;

      this.setEditPOI(_poi);
    },

    async onAddrToLatlngClick() {
      if (this.address === '') return;
      try {
        const rs = await this.geocode(this.address);
        this.lat = rs.lat;
        this.lon = rs.lon;
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
    },

    async doCreate() {
      try {
        const _lat = vcheck.number(this.lat);
        const _lon = vcheck.number(this.lon);
        this.submitting = true;

        const query = `mutation create($poi:POIInput) {
          poi_stage(poi:$poi) {
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
          }
        }`;
        const poi = {
          poi_id: this.edited_poi.poi_id,
          name: this.name,
          brand_group: this.brand_group,
          category1: this.category1,
          category2: this.category2,
          address: this.address,
          phone: this.phone,
          lat: _lat,
          lon: _lon,
        };
        const rs = await this.$SKGQL.call({
          query,
          variables: { poi },
        });
        this.submitting = false;

        if (rs.errors.length > 0) throw new Error(rs.errors[0].message);

        this.removePOI(this.edited_poi.poi_id);
        this.setEditPOI(null);
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
    },

    async onSubmit() {
      try {
        if (!this.category1) throw new Error('類別為必要欄位');
        if (!this.category2) throw new Error('類別為必要欄位');
        if (!this.name) throw new Error('名稱為必要欄位');
        if (!this.address) throw new Error('地址為必要欄位');
        const _lat = vcheck.number(this.lat);
        const _lon = vcheck.number(this.lon);

        if (Number.isNaN(_lat) || Number.isNaN(_lon)) throw new Error('經緯度必須要是數字');
        if (_lat < -90 || _lat > 90) throw new Error('緯度範圍錯誤');
        if (_lon < -180 || _lon > 180) throw new Error('經度範圍錯誤');

        await this.doCreate();
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
    },

    async onDeleteClick() {
      const alert = await this.$swal.fire({
        title: '刪除此POI?',
        html: '刪掉就真的是刪掉了喔!!',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '刪除',
      });
      if (!alert.value) return;
      try {
        this.submitting = true;
        const query = `mutation del($poi_id:String) {
          poi_unstage(poi_id:$poi_id)
        }`;
        const rs = await this.$SKGQL.call({
          query,
          variables: { poi_id: this.edited_poi.poi_id },
        });
        if (rs.errors.length > 0) throw new Error(rs.errors[0].message);
        this.removePOI(this.edited_poi.poi_id);
        this.setEditPOI(null);
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      } finally {
        this.submitting = false;
      }
    },

    async onStageDeleteClick() {
      const alert = await this.$swal.fire({
        title: '跳過此POI?',
        html: '這將暫時將POI從異動列表中移除',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '刪除',
      });
      if (!alert.value) return;
      try {
        this.submitting = true;
        const query = `mutation del($poi_id:String) {
          poi_stage_delete(poi_id:$poi_id)
        }`;
        const rs = await this.$SKGQL.call({
          query,
          variables: { poi_id: this.edited_poi.poi_id },
        });
        if (rs.errors.length > 0) throw new Error(rs.errors[0].message);
        this.removePOI(this.edited_poi.poi_id);
        this.setEditPOI(null);
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      } finally {
        this.submitting = false;
      }
    },

    async onUnStageDeleteClick() {
      const alert = await this.$swal.fire({
        title: '跳過此POI?',
        html: '這將暫時將POI從異動列表中移除',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '刪除',
      });
      if (!alert.value) return;
      try {
        this.submitting = true;
        const query = `mutation del($poi_id:String) {
          poi_unstage_delete(poi_id:$poi_id)
        }`;
        const rs = await this.$SKGQL.call({
          query,
          variables: { poi_id: this.edited_poi.poi_id },
        });
        if (rs.errors.length > 0) throw new Error(rs.errors[0].message);
        this.removePOI(this.edited_poi.poi_id);
        this.setEditPOI(null);
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      } finally {
        this.submitting = false;
      }
    },

    onClear() {
      this.setEditPOI(null);
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
