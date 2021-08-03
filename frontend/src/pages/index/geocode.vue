<template lang="pug">
.w-100
  .h4 批次轉換經緯度
  .small.text-mute 上傳的EXCEL裡，至少要有一個欄位名稱為地址或是address。請不要合併儲存格。
  button.btn.btn-outline-secondary.btn-sm.mt-1(type="button" @click="samleDownload") 下載sample excel
  hr
  .form-row
    .col-12
      input.form-control-file.form-control-sm.d-none(type="file" @change="onFileChange" ref="fileupload")
      button.btn.btn-primary.btn-sm(type="button" @click="uploadBtnClick") 上傳檔案
      button.btn.btn-info.btn-sm.ml-1(type="button" @click="onSubmit" :disabled="geocoding || sheetData.length === 0") 開始轉換
      button.btn.btn-outline-secondary.btn-sm.ml-1(type="button" @click="download" :disabled="file === null") 下載Excel
    .col-12
      table.table.table-bordered.table-hover.table-sm(v-if="sheetData.length > 0")
        thead
          tr
            th
            th(v-for="field in sheetFields") {{field}}
            th 狀態
        tbody
          tr(v-for="row, index in sheetData")
            td {{index+1}}
            td(v-for="field in sheetFields") {{row[field]}}
            td
              div {{row.status}}
              div(v-if="row.error !== ''") {{row.error}}
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';

import XLSX from 'xlsx';
import async from 'async';

export default {
  components: { },
  data: () => ({
    sheetData: [],
    sheetFields: [],
    geocoder: null,
    file: null,

    geocoding: false,
  }),
  computed: {
    ...mapState([]),
    ...mapGetters([]),
  },
  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    ...mapActions('geocoder', ['geocode']),

    onFileChange({ target }) {
      this.sheetData = [];
      [this.file] = target.files;
      if (!this.file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.readXLSX(e.target.result);
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

      this.sheetData = _sheet.map((v) => {
        const _d = {
          status: 'ready',
          error: '',
        };
        this.sheetFields.forEach((v2) => {
          _d[v2] = v[v2] || '';
          if (v2 === 'address' || v2 === '地址') {
            _d[v2] = _d[v2].split('臺').join('台');
          }
        });
        return _d;
      });
    },

    onSubmit() {
      this.geocoding = true;
      async.eachOfLimit(this.sheetData, 1, async (data, index, cb) => {
        try {
          const _address = data.address || data['地址'];
          // const rs = await this.geocode(_address);

          // this.sheetData[index].status = 'complete';
          // this.sheetData[index].lat = rs.lat;
          // this.sheetData[index].lon = rs.lon;
          const query = `query geocode {
            geocode(address:"${_address}") {
              address
              lat
              lon
            }
          }`;
          const rs = await this.$SKGQL.call({ query });
          if (rs.errors && rs.errors.length > 0) {
            throw rs.errors[0].message;
          }
          if (!rs.data.geocode.lat || !rs.data.geocode.lon) {
            throw new Error('無法轉換(地址不夠精確)');
          }
          this.sheetData[index].status = 'complete';
          this.sheetData[index].lat = rs.data.geocode.lat;
          this.sheetData[index].lon = rs.data.geocode.lon;
        } catch (e) {
          this.sheetData[index].status = 'error';
          this.sheetData[index].error = e.message;
        }
        setTimeout(() => {
          cb();
        }, 200);
      }, (err) => {
        this.geocoding = false;
        if (err) {
          this.$swal.fire('', err.message, 'error');
          return;
        }
        this.$swal.fire('', '轉換完成', 'success');
      });
    },

    download() {
      const data = [{
        name: 'Sheet1',
        fields: this.sheetFields,
        data: this.sheetData,
      }];
      const wb = XLSX.utils.book_new();
      for (let i = 0; i < data.length; i += 1) {
        const ws_name = data[i].name;
        const list = data[i].data;
        const _fields = data[i].fields;
        const ws_data = [
          _fields,
        ];
        list.forEach((v) => {
          const dw = [];
          _fields.forEach((f) => {
            dw.push(v[f] || '');
          });
          ws_data.push(dw);
        });
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        /* Add the worksheet to the workbook */
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
      }

      XLSX.writeFile(wb, 'donwload.xlsx');
    },

    samleDownload() {
      window.open('/sample/geo_sample.xlsx');
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
