/**
 * Ford
 *
 * 所有分店資訊透過一個網址就可讀取。
 */

const axios = require('axios');

const run = async () => {
  const url = 'https://spatial.virtualearth.net/REST/v1/data/1652026ff3b247cd9d1f4cc12b9a080b/FordEuropeDealers_Transition/Dealer?spatialFilter=bbox(21.97764632965293,119.77111815009266,25.397589047402814,122.00134275946766)&$select=*&$filter=Brand%20Eq%20%27Ford%27&$top=100&$inlinecount=allpages&$format=json&key=Al1EdZ_aW5T6XNlr-BJxCw1l4KaA0tmXFI_eTl1RITyYptWUS0qit_MprtcG7w2F&Jsonp=processDealerResults';

  const rs = await axios.get(url);

  let rsStr = rs.data.replace('processDealerResults(', '');
  rsStr = rsStr.substr(0, rsStr.length - 1);
  const rsData = JSON.parse(rsStr);

  const finaldata = rsData.d.results.map((v) => {
    const address = v.AddressLine1.split(' ').join('');
    const name = v.DealerName;
    const phone = v.PrimaryPhone;
    const lat = v.Latitude;
    const lon = v.Longitude;
    const d = {
      name,
      address,
      phone,
      lat,
      lon,
      brand_group: 'FORD',
      category1: '專業零售通路',
      category2: '汽車展示中心',
    };

    return d;
  });

  return finaldata;
};

module.exports = run;
