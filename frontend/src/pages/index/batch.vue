<template lang="pug">
.w-100
  .h4 批次建立POI
  .small.text-mute
    |上傳的EXCEL裡，至少要有name、address。請不要合併儲存格。
    br
    |建立成功的POI會出現在【POI異動】裡，需要前往【POI異動】單元再次確認後才會出現在正式的POI列表裡。
  button.btn.btn-outline-secondary.btn-sm.mt-1(type="button" @click="samleDownload") 下載sample excel
  hr
  .form-row.mt-2
    .col-12
      input.form-control-file.form-control-sm.d-none(type="file" @change="onFileChange" ref="fileupload" v-if="allowupload")
      button.btn.btn-primary.btn-sm(type="button" @click="uploadBtnClick") 上傳檔案
      button.btn.btn-outline-info.btn-sm.ml-1(type="button" v-if="uploading || sheetData.length === 0" disabled) 開始建立POI
      button.btn.btn-info.btn-sm.ml-1(type="button" @click="onSubmit" v-else) 開始建立POI
    .form-group.col-4.px-1.my-0
      label 大分類
      select.form-control.form-control-sm(v-model="category1")
        option(value="") 請選擇
        option(v-for="itm in categories" :value="itm.name") {{itm.name}} ({{itm.count}})
    .form-group.col-4.px-1.my-0
      label 小分類
      select.form-control.form-control-sm(v-model="category2")
        option(value="") 請選擇
        option(v-for="itm in categories2" :value="itm.name") {{itm.name}} ({{itm.count}})
    .form-group.col-4.px-1.my-0
      .form-group
        label 品牌
        //- input.form-control.form-control-sm(type="text" v-model="brand_group")
        TypeAhead(:list="brand_groups" :parser="(itm)=>{return itm.name;}" @onInput="(e)=>{brand_group=e;}" :value="brand_group")
    .col-12.mt-2
      table.table.table-bordered.table-hover.table-sm
        thead
          tr
            th
            th name
            th address
            th phone
            th lat
            th lon
            th 狀態
        tbody
          tr(v-for="row, index in sheetData" :class="row.error!==''?'error':''")
            td {{index+1}}
            td {{row.name}}
            td {{row.address}}
            td {{row.phone}}
            td {{row.lat}}
            td {{row.lon}}
            td
              div(v-if="row.status!== 'error'") {{row.status}}
              div(v-if="row.error !== ''") {{row.error}}
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import XLSX from 'xlsx';
import vcheck from '~/utils/vartool/vcheck';
import TypeAhead from '~/components/TypeAhead.vue';

export default {
  components: { TypeAhead },
  data: () => ({
    sheetData: [],
    sheetFields: [],
    file: null,
    uploading: false,
    brand_group: '',

    category1: '',
    category2: '',
    categories2: [],
    brand_groups: [],

    allowupload: true,
  }),
  computed: {
    ...mapState('poi', ['categories']),
    ...mapGetters([]),
  },
  watch: {
    category1() {
      this.onCategory1Change();
    },
    category2() {
      this.onCategory2Change();
    },
  },
  created() {},
  mounted() {
    this.fetchCategories();
  },
  beforeDestroy() {},
  methods: {
    ...mapActions('poi', ['fetchCategories']),

    onFileChange({ target }) {
      this.sheetData = [];
      [this.file] = target.files;
      if (!this.file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.readXLSX(e.target.result);

        this.allowupload = false;
        setTimeout(() => {
          this.allowupload = true;
        }, 200);
      };
      reader.readAsArrayBuffer(this.file);
    },
    uploadBtnClick() {
      this.$refs.fileupload.click();
    },

    readXLSX(buffer) {
      const bufferdata = new Uint8Array(buffer);
      const workbook = XLSX.read(bufferdata, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      const _sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

      this.sheetFields = Object.keys(_sheet[0]);
      this.sheetFields.push('lat');
      this.sheetFields.push('lon');

      const _sdata = _sheet.map((v) => {
        const _d = {
          name: vcheck.str(v.name),
          brand_group: vcheck.str(v.brand_group),
          address: vcheck.str(v.address),
          phone: vcheck.str(v.phone),
          lat: vcheck.number(v.lat) || '',
          lon: vcheck.number(v.lon) || '',
          status: 'ready',
          error: '',
        };
        if (!_d.name) {
          _d.status = 'error';
          _d.error = '缺少name';
        }
        if (!_d.address) {
          _d.status = 'error';
          if (_d.error !== '') _d.error += ',';
          _d.error += '缺少address';
        }
        return _d;
      });

      this.sheetData = _sdata;
    },

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

    async onSubmit() {
      this.uploading = true;
      try {
        this.sheetData.forEach((v) => {
          if (v.status === 'error') throw new Error('有不完整欄位的資料，請重新上傳');
        });
        if (this.category1 === '') throw new Error('請選擇大分類');
        if (this.category2 === '') throw new Error('請選擇小分類');

        const pois = this.sheetData.map((v) => {
          const _d = {
            name: v.name,
            address: v.address,
            phone: v.phone,
            category1: this.category1,
            category2: this.category2,
            brand_group: this.brand_group,
          };
          if (vcheck.number(v.lat)) _d.lat = v.lat;
          if (vcheck.number(v.lon)) _d.lon = v.lon;
          return _d;
        });

        const gql = `mutation batch($pois:[POIInput]) {
          poi_batch_create(pois:$pois) {
            status
            message
          }
        }`;
        const rs = await this.$SKGQL.call({
          query: gql,
          variables: { pois },
        });
        if (rs.errors.length > 0) throw new Error(rs.errors[0].message);

        const rsdata = rs.data.poi_batch_create;
        for (let i = 0; i < this.sheetData.length; i += 1) {
          this.sheetData[i].status = rsdata[i].status.toLowerCase();
          if (this.sheetData[i].status !== 'ok') this.sheetData[i].error = rsdata[i].message;
        }
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
      this.uploading = false;
    },

    samleDownload() {
      window.open('/sample/batch_sample.xlsx');
    },
  },
};
</script>

<style lang="stylus" scoped>
.error
  color #ff0000
</style>
