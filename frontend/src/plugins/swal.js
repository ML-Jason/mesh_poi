/* eslint no-param-reassign: 0 */
import Swal from 'sweetalert2';
// import Swal from 'sweetalert2/dist/sweetalert2';
// import '~/assets/sweetalert2/sweetalert2.scss';
import '~/assets/stylus/sweetalert2.styl';

import Vue from 'vue';

/**
 * 將SweetAlert2寫成plugin
 *
 * 在instance裡可以使用this.$swal
 * 或是用Vue.swal
 *
 * sweetalert2:
 * https://sweetalert2.github.io/
 */

const mySwal = Swal.mixin({
  showCloseButton: true,
  // customClass: {
  //   container: 'mymodal-container',
  //   confirmButton: 'sk-btn sk-btn-redbrown myswal-btn',
  //   cancelButton: 'sk-btn sk-btn-gray myswal-btn',
  // },
  // buttonsStyling: false,
  allowOutsideClick: false,
});

const vueSwal = {
  ...mySwal,
  fire: (...arg) => {
    const p = new Promise((resolve) => { resolve(false); });

    // 如果已經有alert還在畫面上，就不跳新的alert
    if (mySwal.isVisible()) return p;

    return mySwal.fire(...arg);
  },
};

const swalPlugin = {};
swalPlugin.install = (vue) => {
  vue.prototype.$swal = vueSwal;
  vue.swal = vueSwal;
};

Vue.use(swalPlugin);

Vue.directive('clickOutside', {
  bind: (el, binding, vnode) => {
    el.clickOutsideEvent = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        vnode.context[binding.expression](e);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unbind: (el) => {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
});
