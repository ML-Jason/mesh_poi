/**
 * 全聯
 *
 * 簡單，有一個網址會直接回傳所有的資料。
 *
 */

const axios = require('axios');
const vcheck = require('~server/module/vartool/vcheck');

const run = async () => {
  const url = 'http://www.pxmart.com.tw/px/store1?cityid=&cityzoneid=&cityroadid=&name_short=';
  const rs = await axios.get(url);

  const data = rs.data.map((v) => {
    const d = {
      name: vcheck.toSBC(v.name_short),
      address: vcheck.toSBC(v.address),
      lat: v.mapx,
      lon: v.mapy,
      phone: `${v.tel_zno}-${v.tel_no}`,
      brand_group: '全聯',
      category1: '綜合零售通路',
      category2: '超市',
    };

    // 地址有時會有像是 "(33064)桃園市桃園區三民路３段518號" 這樣的型態，所以要把前面()拿掉
    d.address = d.address.replace(/^\(\d+\)/, '');

    if (d.address.indexOf('?') >= 0) {
      if (d.name.indexOf('鳥松') === 0) {
        d.name = '鳥松本館';
        d.address = '高雄市鳥松區本館路207、209號';
      }
      if (d.name.indexOf('大園') === 0) {
        d.name = '大園菓林';
        d.address = '桃園市大園區菓林路69號';
      }
      // 中埔店的地址似乎完全錯誤
      if (d.name === '嘉義中埔') {
        d.name = '嘉義中埔';
        d.address = '嘉義縣中埔鄉中山路五段460號';
      }
    }
    return d;
  });

  return data;
};

module.exports = run;
