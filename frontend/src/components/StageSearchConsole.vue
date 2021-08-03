<template lang="pug">
.card.px-2.py-2
  .h5.card-title 點位篩選
  //- .container-fluid
  .form-row
    .col-6
      .form-row
        .form-group.col-12.px-1
          label 關鍵字
          input.form-control.form-control-sm(type="text" v-model="keyword")
        .form-group.col-6.px-1
          label 大分類
          select.form-control.form-control-sm(v-model="category1")
            option(value="") 請選擇
            option(v-for="itm in categories_stage" :value="itm.name") {{itm.name}} ({{itm.count}})
        .form-group.col-6.px-1
          label 小分類
          select.form-control.form-control-sm(v-model="category2")
            option(value="") 請選擇
            option(v-for="itm in categories2" :value="itm.name") {{itm.name}} ({{itm.count}})
        .form-group.col-6.px-1
          label 縣市
          select.form-control.form-control-sm(v-model="city")
            option(value="") 請選擇
            option(v-for="itm in cities" :value="itm") {{itm}}
        .form-group.col-6.px-1
          label 鄉鎮區域
          select.form-control.form-control-sm(v-model="district")
            option(value="") 請選擇
            option(v-for="itm in districts" :value="itm") {{itm}}
    .col-6
      .form-group.col-12.px-1
        label 品牌
        .scroll-container.scrollbar-thin
          .brand.d-flex.justify-content-between.align-items-center.py-1(v-for="itm in brand_groups")
            div {{itm.name}} ({{itm.count}})
            button.btn.btn-info.btn-sm(type="button" @click="selectBrand(itm.name)" v-if="!brandSelected(itm.name)") 選擇
            button.btn.btn-danger.btn-sm(type="button" @click="unselectBrand(itm.name)" v-if="brandSelected(itm.name)") 取消
    .form-group.col-12.px-1.text-center
      button.btn.btn-primary.btn-sm(type="button" @click="doSearch" :disabled="poi_list_loading")
        i.fas.fa-circle-notch.fa-spin.mr-2(v-if="poi_list_loading")
        span 搜尋
      button.btn.btn-secondary.btn-sm.ml-2(type="button" @click="resetSearch")
        span 清除條件
</template>

<script>
import {
  mapGetters, mapState, mapMutations, mapActions,
} from 'vuex';
import TwZip from '~/utils/zipcode/tw';

export default {
  props: {
  },
  data() {
    return {
      city: '',
      district: '',
      cities: [],
      districts: [],
      category1: '',
      category2: '',
      categories2: [],
      keyword: '',
      brand_groups: [],
      selected_brand_groups: [],
    };
  },
  computed: {
    ...mapState('poi', ['categories_stage', 'poi_list_loading']),
    ...mapGetters([]),
  },
  watch: {
    categories_stage() {
      this.onCategory1Change();
    },
    category1() {
      this.onCategory1Change();
    },
    category2() {
      this.onCategory2Change();
    },
    city(val) {
      const found = TwZip.find((f) => f.name === val);
      if (!found) {
        this.districts = [];
        this.district = '';
        return;
      }
      this.district = '';
      this.districts = found.dist.map((v) => v.name);
    },
  },
  created() {
  },
  mounted() {
    this.fetchCategoriesStage();
    this.setPOIList([]);
    this.cities = TwZip.map((v) => v.name);
  },
  beforeDestroy() {
  },
  methods: {
    ...mapMutations('poi', ['setPOIList', 'setSearchFilter']),
    ...mapActions('poi', ['fetchCategoriesStage', 'fetchPOIStageList']),

    async fetchBrandGroup() {
      const query = `query getPOIStageBrandGroup {
        brandgroup_stage_all(category1:"${this.category1}", category2:"${this.category2}") {
          name
          count
        }
      }`;
      const rs = await this.$SKGQL.call({
        query,
      });
      this.brand_groups = rs.data.brandgroup_stage_all;
      this.selected_brand_groups = this.selected_brand_groups.filter((v) => {
        const _f = this.brand_groups.find((f) => f.name === v);
        if (_f) return true;
        return false;
      });
    },
    onCategory1Change() {
      const found = this.categories_stage.find((f) => f.name === this.category1);
      if (found) {
        this.categories2 = found.children || [];
        this.fetchBrandGroup();
        const _f2 = this.categories2.find((f) => f.name === this.category2);
        if (!_f2) this.category2 = '';
        return;
      }
      this.brand_groups = [];
      this.categories2 = [];
    },
    async onCategory2Change() {
      this.fetchBrandGroup();
    },
    doSearch() {
      const filter = {
        city: this.city,
        district: this.district,
        category1: this.category1,
        category2: this.category2,
        keyword: this.keyword,
        brand_group: this.selected_brand_groups,
      };
      const param = {
        offset: 0,
        limit: 200,
        filter,
      };
      this.setSearchFilter(filter);
      this.fetchPOIStageList(param);
    },
    resetSearch() {
      this.city = '';
      this.district = '';
      this.category1 = '';
      this.category2 = '';
      this.keyword = '';
      this.brand_groups = [];
      this.selected_brand_groups = [];
    },

    selectBrand(name) {
      if (this.selected_brand_groups.includes(name)) return;
      this.selected_brand_groups.push(name);
    },
    unselectBrand(name) {
      this.selected_brand_groups = this.selected_brand_groups.filter((f) => f !== name);
    },
    brandSelected(name) {
      return this.selected_brand_groups.includes(name);
    },
  },
};
</script>

<style lang="stylus" scoped>
.scroll-container
  overflow-x auto
  overflow-y auto
  height 190px
  padding .25rem
  // height 100%
  border 1px solid #ccc
  border-radius 6px

.brand
  border-bottom 1px solid #ccc

.tag
  border-radius .25rem
  font-size .875rem
  background-color #0DB1C3
  padding .25rem .5rem
  color #fff
  margin .125rem 0
  cursor pointer
  &.active
    background-color #107687
</style>
