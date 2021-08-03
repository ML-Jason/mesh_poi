// 設定會依環境ENV而改變的 變數、sensitive data等等
const config = {
  PORT: process.env.PORT || 8080,
  IP: process.env.IP || '0.0.0.0',

  SKYLENS_SECRET: '166be188c22egdEryEh9',

  API_USER: [
    { user: 'skylens', password: 'vo6fleKFQB', role: 'sys_admin' },
    { user: 'hinet', password: 'vo6YyBuFQB', role: 'sys_admin' },
  ],
  // 要啟動的db connection資訊
  DATABASE: {
    MONGO: {
      uri: 'mongodb+srv://mlroot:noQyefleKRQE54EO@cluster0-sfkg8.gcp.mongodb.net/meshplus_poi?retryWrites=true&w=majority',
      // options: { readPreference: 'secondaryPreferred' },
    },
  },

  JWT_SECRET: 'dev',
  LANGS: ['zh-TW', 'zh', 'en', 'ja'],
  COOKIE_SECRET: 'poi_dev',

  SMTP: {
    service: 'Gmail',
    auth: {
      user: 'jason@medialand.tw',
      pass: '76change12',
    },
  },

  SERVICE_EMAIL: 'service@skylab.cc',
};

module.exports = config;
