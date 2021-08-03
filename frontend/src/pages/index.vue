<template lang="pug">
.w-100(v-if="sky_id !== ''")
  .header.d-flex.justify-content-between.align-items-center.px-2
    .logo MESh+ POI
    .nav.justify-content-end.align-items-center
      .nav-item.px-2
        NuxtLink(to="/") POI列表
      .nav-item.px-2
        NuxtLink(to="/poistage") 待新增POI
      .nav-item.px-2
        NuxtLink(to="/poiunstage") 待刪除POI
      .nav-item.px-2
        NuxtLink(to="/batch") 批次建立
      .nav-item.px-2
        NuxtLink(to="/geocode") 批次轉換
      .nav-item.px-2
        NuxtLink(to="/errlog") 錯誤訊息
  .w-100.py-2.px-2
    nuxt-child
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';

export default {
  components: { },
  data: () => ({
    pois: [],
  }),
  computed: {
    ...mapState(['sky_id']),
    ...mapGetters([]),
  },
  watch: {},
  created() {},
  async mounted() {
    const me = await this.getMe();
    if (!me || !me.sky_id) {
      // this.$router.push('/login');
      let redirect_uri = 'http://localhost:3000/auth/callback';
      if (process.env.APP_ENV === 'production') { redirect_uri = 'https://poi.meshplus.com.tw/auth/callback'; }
      const client_id = '177f1f0f9075ZipXBBHW';
      window.location.href = `https://skyid.cc/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&methods=google`;
      return;
    }
    this.fetchCategories();
  },
  beforeDestroy() {},
  methods: {
    ...mapActions(['getMe']),
    ...mapActions('poi', ['fetchCategories']),
  },
};
</script>

<style lang="stylus" scoped>
.header
  background-color #666
  color #fff
  height 50px
  .logo
    font-size 1.4rem
    font-weight bold
  .nav-item
    a
      color #fff
</style>
