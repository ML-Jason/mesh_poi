<template lang="pug">
.w-100
  .rounded.bg-primary.text-white.mb-2.p-2
    | POI列表
  .form-row
    .col-6
      SearchConsole
    .col-6
      POIList
    .col-6.mt-2
      Map
    .col-6.mt-2
      POIEdit
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';

import SearchConsole from '~/components/SearchConsole.vue';
import POIList from '~/components/POIList.vue';
import Map from '~/components/Map.vue';
import POIEdit from '~/components/POIEdit.vue';

export default {
  components: {
    SearchConsole, POIList, Map, POIEdit,
  },
  data: () => ({
    // selected_poi_id: '',
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
    ...mapActions([]),
  },
};
</script>

<style lang="stylus" scoped>
</style>
