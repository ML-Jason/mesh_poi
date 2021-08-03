<template lang="pug">
.card.px-2.py-2
  .h5.card-title
    |點位列表
    button.btn.btn-info.btn-sm.ml-2(@click="donwloadClick") 下載EXCEL
  .small
    |總數 {{poi_totalCount || 0}}
    span.ml-2(v-if="poi_totalCount > 300") (筆數過多，只顯示200筆資料，請縮小範圍重新搜尋)
  .scroll-container.scrollbar-thin
    .poi(v-for="poi, index in poi_list || []" :class="poi.poi_id===edited_poi.poi_id?'selected':''" @click="onPOISelected(poi)")
      .poi-index {{index+1}}
      div
        .poi-name
          .badge.badge-success.mr-1 {{poi.brand_group}}
          div {{poi.name}}
          .badge.badge-primary.ml-2 {{poi.category1}} - {{poi.category2}}
        .poi-address {{poi.address}} ({{poi.lat}},{{poi.lon}})
  //- .form-row
  //-   .col-12
</template>

<script>
import {
  mapGetters, mapState, mapMutations, mapActions,
} from 'vuex';
// import TwZip from '~/utils/zipcode/tw';

export default {
  props: {
    // selected_poi_id: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      city: '',
    };
  },
  computed: {
    ...mapState('poi', ['poi_list', 'poi_totalCount', 'poi_list_loading', 'edited_poi', 'searchFilter']),
    ...mapGetters([]),
  },
  watch: {
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    ...mapMutations('poi', ['setEditPOI']),
    ...mapActions('poi', ['fetchPOIList']),

    onPOISelected(poi) {
      this.setEditPOI(poi);
    },

    donwloadClick() {
      const filter = {
        city: this.searchFilter.city || '',
        district: this.searchFilter.district || '',
        category1: this.searchFilter.category1 || '',
        category2: this.searchFilter.category2 || '',
        keyword: this.searchFilter.keyword || '',
        // brand_group: this.searchFilter.selected_brand_groups,
        brand_group: (this.searchFilter.brand_group || []).join(','),
      };
      let _q = '';
      Object.keys(filter).forEach((v) => {
        _q = `${_q}&${v}=${filter[v]}`;
      });
      window.open(`/api/1.0/poi_download?${_q}`, '_blank');
    },
  },
};
</script>

<style lang="stylus" scoped>
.scroll-container
  overflow-x auto
  overflow-y auto
  height 265px
  padding .25rem
  // height 100%
  border 1px solid #ccc
  border-radius 6px

.poi
  display flex
  border-bottom 1px solid #ccc
  padding .2rem 0
  cursor pointer
  &.selected
  &:hover
    background-color #c6def1
  .poi-index
    min-width 20px
    padding 0 .3rem
    font-size .8rem
  .poi-address
    font-size .8rem
  .poi-name
    font-weight bold
    display flex
    align-items center

</style>
