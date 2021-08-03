<template lang="pug">
.typeahead
  input.form-control.form-control-sm(type="text"
    :placeholder="placeholder"
    v-model.trim="inputText"
    @focus="showTypeAhead"
    @blur="hideTypeAhead"
    @keyup.down.stop.prevent="moveCursor(1)"
    @keyup.up.stop.prevent="moveCursor(-1)"
    @keyup.enter="onEnter"
    ref="input_text"
    :disabled="disabled")
  .typeahead-container(v-if="filtered.length > 0")
    .typeahead-item(v-for="itm, index in filtered"
      v-if="index < max"
      :class="index === cursor?'active':''"
      @click="select(itm)")
      .typeahead-result(v-for="rs in itm.segments")
        .typeahead-key(v-if="rs === inputText") {{rs}}
        .typeahead-plain(v-else) {{rs}}
</template>
<script>
export default {
  props: {
    /** Text input value */
    value: {
      type: String,
      default: '',
    },
    /** Text input placeholder */
    placeholder: {
      type: String,
      default: '',
    },
    /** 候選的陣列，輸入框改變時會從候選陣列裡尋找比對符合的項目 */
    list: {
      type: Array,
      default: () => [],
    },
    /** 如果list不是string array的話，parser可以提供轉換function */
    parser: {
      type: Function,
      default: (str) => str,
    },
    /** 最多一次顯示幾筆候選 */
    max: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    inputText: '',
    filtered: [],
    cursor: 0,
    hideTimer: 0,
    focus: false,
  }),
  computed: {},
  watch: {
    value() {
      this.inputText = this.value;
    },
    inputText(v) {
      /** 輸入框改變時觸發 */
      this.$emit('onInput', v);
      if (this.focus) this.showTypeAhead();
      this.cursor = -1;
    },
  },
  created() {},
  mounted() {
    this.inputText = this.value;
  },
  beforeDestroy() {},
  methods: {
    showTypeAhead() {
      clearTimeout(this.hideTimer);
      this.focus = true;
      if (this.inputText === '') {
        // this.filtered = [];
        this.filtered = this.list.map((v) => {
          const v2 = {
            name: this.parser(v).toString(),
            segments: [this.parser(v).toString()],
          };
          return v2;
        });
        this.cursor = -1;
        return;
      }
      // const qreg = new RegExp(this.inputText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      // this.filtered = this.list.filter((v) => qreg.test(this.parser(v)));
      this.filtered = this.list
        .filter((v) => this.parser(v).toString().indexOf(this.inputText.toString()) >= 0)
        .map((v) => {
          const v2 = { name: this.parser(v).toString() };
          let compares = v2.name;
          v2.segments = [];
          while (compares.indexOf(this.inputText) >= 0) {
            const res = compares.substr(0, compares.indexOf(this.inputText));
            if (res !== '') v2.segments.push(res);
            v2.segments.push(this.inputText);
            compares = compares.substr(compares.indexOf(this.inputText) + this.inputText.length);
          }
          if (compares !== '') v2.segments.push(compares);
          return v2;
        });
      if (this.filtered.length === 1) {
        // if (this.parser(this.filtered[0]) === this.inputText) this.filtered = [];
        if (this.filtered[0].name === this.inputText.toString()) this.filtered = [];
      }
    },
    moveCursor(step) {
      this.cursor += step;
      if (this.cursor < -1) this.cursor = -1;
      if (this.cursor >= this.filtered.length) this.cursor = this.filtered.length - 1;
      if (this.cursor >= this.max) this.cursor = this.max - 1;
    },
    hideTypeAhead() {
      this.focus = false;
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        this.filtered = [];
      }, 200);
    },
    onEnter() {
      if (this.filtered.length === 0 || this.cursor < 0) {
        /** 輸入框按下Enter時觸發，同時回傳目前輸入框的文字 */
        this.$emit('onEnter', this.inputText);
        return;
      }
      if (this.cursor >= 0 && this.cursor < this.filtered.length) {
        this.select(this.filtered[this.cursor]);
      }
    },
    select(sel) {
      // const val = this.parser(sel);
      this.inputText = sel.name;
      this.$refs.input_text.focus();
    },
  },
};
</script>
<style scoped lang="stylus">
.typeahead
  position relative
  z-index 50
.typeahead-container
  position absolute
  border 1px solid #DDDDDD
  background-color #fff
  width 100%
  .typeahead-item
    padding .5rem
    border-top 1px solid #eeeeee
    cursor pointer
    &:hover
    &.active
      background-color #eeeeee
    .typeahead-result
      display inline-block
      white-space pre
      .typeahead-key
        display inline-block
        font-weight 600
      .typeahead-plain
        display inline-block
</style>
