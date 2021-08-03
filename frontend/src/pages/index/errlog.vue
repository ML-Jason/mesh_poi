<template lang="pug">
.w-100
  .h4 錯誤訊息
  hr
  .form-row.mt-2
    .col-12
      table.table.table-bordered.table-hover.table-sm
        thead
          tr
            th
            th Title
            th Message
            th Date
            th
        tbody
          tr(v-for="row, index in errlist")
            td {{index+1}}
            td {{row.title}}
            td.small {{row.message}}
            td {{row.created_at}}
            td
              button.btn.btn-danger.btn-sm(type="button" @click="onDeleteClick(row.errlog_id)") 刪除
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import dayjs from 'dayjs';
import vcheck from '~/utils/vartool/vcheck';

export default {
  components: { },
  data: () => ({
    page: 1,
    pageSize: 5000,
    errCount: 0,
    errlist: [],
  }),
  computed: {
    ...mapState([]),
    ...mapGetters([]),
  },
  watch: {
  },
  created() {},
  mounted() {
    this.fetchLogs();
  },
  beforeDestroy() {},
  methods: {
    ...mapActions([]),
    async fetchLogs() {
      try {
        const query = `query errlogs {
        errlog_list(limit:${this.pageSize},offset:${(this.page - 1) * this.pageSize}) {
          totalCount
          data {
            errlog_id
            title
            message
            created_at
          }
        }
      }`;
        const rs = await this.$SKGQL.call({
          query,
        });
        if (rs.errors && rs.errors.length > 0) {
          throw rs.errors[0].message;
        }

        this.errCount = rs.data.errlog_list.totalCount;
        this.errlist = rs.data.errlog_list.data.map((v) => {
          const _d = { ...v };
          _d.created_at = dayjs(_d.created_at).format('YYYY-MM-DD HH:mm');
          return _d;
        });
      } catch (e) {
        this.$swal.fire('', e.toString(), 'error');
      }
    },

    async onDeleteClick(errlog_id) {
      const alert = await this.$swal.fire({
        title: '刪除此Log?',
        html: '刪掉就真的是刪掉了喔!!',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: '取消',
        confirmButtonText: '刪除',
      });
      if (!alert.value) return;
      try {
        const query = `mutation log_delete {
          errlog_delete(errlog_id:"${errlog_id}")
        }`;
        const rs = await this.$SKGQL.call({ query });
        if (rs.errors && rs.errors.length > 0) {
          throw rs.errors[0].message;
        }
        this.fetchLogs();
      } catch (e) {
        this.$swal.fire('', e.message, 'error');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
</style>
