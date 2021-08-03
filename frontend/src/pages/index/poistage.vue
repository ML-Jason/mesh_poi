<template lang="pug">
.w-100
  //- .h4 批次轉換經緯度
  //- .small.text-mute 上傳的EXCEL裡，至少要有一個欄位名稱為地址或是address。請不要合併儲存格。
  .rounded.bg-success.text-white.mb-2.p-2
    | 待新增POI
  .form-row
    .col-6
      StageSearchConsole
    .col-6
      POIList
  .form-row
    //- .col-6
    //-   .card.px-2.py-2
    //-     .h5.card-title 待新增
    //-     .small
    //-       |總數 {{stagePOI.length}}
    //-       //- span.ml-2(v-if="poi_totalCount > 200") (筆數過多，只顯示200筆資料，請縮小範圍重新搜尋)
    //-     .scroll-container.scrollbar-thin
    //-       .poi(v-for="poi, index in stagePOI" :class="edited_poi.poi_id===poi.poi_id?'selected':''" @click="onPOISelected(poi)")
    //-         .poi-index {{index+1}}
    //-         div
    //-           .poi-name
    //-             .badge.badge-success.mr-1 {{poi.brand_group}}
    //-             div {{poi.name}}
    //-             .badge.badge-primary.ml-2 {{poi.category1}} - {{poi.category2}}
    //-           .poi-address {{poi.address}} ({{poi.lat}},{{poi.lon}})
    //- .col-6
    //-   .card.px-2.py-2
    //-     .h5.card-title 待刪除
    //-     .small
    //-       |總數 {{unstagePOI.length}}
    //-       //- span.ml-2(v-if="poi_totalCount > 200") (筆數過多，只顯示200筆資料，請縮小範圍重新搜尋)
    //-     .scroll-container.scrollbar-thin
    //-       .poi(v-for="poi, index in unstagePOI" :class="edited_poi.poi_id===poi.poi_id?'selected':''" @click="onPOISelected(poi)")
    //-         .poi-index {{index+1}}
    //-         div
    //-           .poi-name
    //-             .badge.badge-success.mr-1 {{poi.brand_group}}
    //-             div {{poi.name}}
    //-             .badge.badge-primary.ml-2 {{poi.category1}} - {{poi.category2}}
    //-           .poi-address {{poi.address}} ({{poi.lat}},{{poi.lon}})
    .w-100.mt-2
    .col-6
      Map
    .col-6
      StagePOIEdit
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import Map from '~/components/Map.vue';
import StagePOIEdit from '~/components/StagePOIEdit.vue';
import StageSearchConsole from '~/components/StageSearchConsole.vue';
import POIList from '~/components/POIList.vue';

export default {
  components: {
    Map, StagePOIEdit, StageSearchConsole, POIList,
  },
  data: () => ({
    stagePOI: [],
    unstagePOI: [],
  }),
  computed: {
    ...mapState('poi', ['edited_poi', 'poi_list']),
    ...mapGetters([]),
  },
  watch: {
    poi_list(val) {
      // this.getPOIData();
      this.stagePOI = val.filter((f) => f.stage_status === 'stage');
      this.unstagePOI = val.filter((f) => f.stage_status === 'unstage');
    },
  },
  created() {},
  mounted() {
    // this.getPOIData();
  },
  beforeDestroy() {},
  methods: {
    ...mapMutations('poi', ['setEditPOI', 'setPOIList']),
    ...mapActions([]),

    onPOISelected(poi) {
      console.log('onPOISelected');
      this.setEditPOI(poi);
    },

    async getPOIData() {
      try {
        const query = `query poidata($limit:Int) {
          stage_poi_list(limit:$limit) {
            totalCount
            data {
              poi_id
              name
              brand_group
              category1
              category2
              address
              phone
              lat
              lon
            }
          }
          unstage_poi_list(limit:$limit) {
            totalCount
            data {
              poi_id
              name
              brand_group
              category1
              category2
              address
              phone
              lat
              lon
            }
          }
        }`;
        const rs = await this.$SKGQL.call({
          query,
          variables: {
            limit: 10000,
          },
        });
        if (rs.errors && rs.errors.length > 0) throw new Error(rs.errors[0].message);

        this.stagePOI = rs.data.stage_poi_list.data.map((v) => ({ ...v, stage_status: 'stage' }));
        this.unstagePOI = rs.data.unstage_poi_list.data.map((v) => ({ ...v, stage_status: 'unstage' }));

        this.setPOIList({ data: [...this.stagePOI, ...this.unstagePOI] });
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
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
