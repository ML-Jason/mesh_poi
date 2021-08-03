// 設定會依環境ENV而改變的 變數、sensitive data等等
const config = {
  PORT: process.env.PORT || 8080,
  IP: process.env.IP || '0.0.0.0',

  // 要啟動的db connection資訊
  DATABASE: {
    MONGO: {
      uri: 'mongodb+srv://<user>:<pwd>@cluster0-qopo7.gcp.mongodb.net/demo?retryWrites=true&w=majority',
      options: {
        // 如果是第一次建立索引，請不要使用secondaryPreferred，comment掉這一行
        readPreference: 'secondaryPreferred',
      },
    },
    MYSQL: {
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
      database: 'dbname',

      dateStrings: true,
      timezone: '+08:00',
    },
  },

  JWT_SECRET: '',
  COOKIE_SECRET: '',

  SMTP: {
    service: 'Gmail',
    auth: {
      user: '',
      pass: '',
    },
  },
};

module.exports = config;
