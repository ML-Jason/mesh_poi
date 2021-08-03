const nodemailer = require('nodemailer');

const fn = {};
module.exports = fn;

// 宣告發信物件
let transporter;

// transporter.verify((error) => {
//   if (error) {
//     log.error('SMTP verify error:');
//     log.error(error);
//   } else {
//     log.info('SMTP Ready');
//   }
// });

fn.init = (option) => {
  transporter = nodemailer.createTransport(option);
};

fn.send = ({
  to, from = '', cc = '', bcc = '', subject, text = '', html = '',
}, callback) => {
  const prmis = new Promise((resolve, reject) => {
    const options = {
      // 寄件者，Gmail不允許改這個...
      // from: 'Service from @medialand.tw <service@medialand.tw>',
      from,
      to,
      cc,
      // 密件副本
      bcc,
      subject,
      text,
      // 嵌入html的內文
      html,
      // 附件檔案
      // attachments: [ {
      //     filename: 'text01.txt',
      //     content: '聯候家上去工的調她者壓工，我笑它外有現，血有到同，民由快的重觀在保導然安作但。護見中城備長結現給都看面家銷先然非會生東一無中；內他的下來最書的從人聲觀說的用去生我，生節他活古視心放十壓心急我我們朋吃，毒素一要溫市歷很爾的房用聽調就層樹院少了紀苦客查標地主務所轉，職計急印形。團著先參那害沒造下至算活現興質美是為使！色社影；得良灣......克卻人過朋天點招？不族落過空出著樣家男，去細大如心發有出離問歡馬找事'
      // }, {
      //     filename: 'unnamed.jpg',
      //     path: '/Users/Weiju/Pictures/unnamed.jpg'
      // }]
    };

    // 發送信件方法
    transporter.sendMail(options, (err, info) => {
      if (err) {
        // log.error(err);
        reject(err);
      } else {
        // log.trace(`訊息發送: ${info.response}`);
        resolve(info);
      }
      if (callback) callback(err, info);
    });
  });
  return prmis;
};
