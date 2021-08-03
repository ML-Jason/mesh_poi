const mysql = require('mysql');

let pool;

const __public = {};
module.exports = __public;

__public.createConnect = (options) => {
  pool = mysql.createPool(options);
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', '========== MySQL.createConnect() ==========');

  pool.on('connection', () => {
    console.log('\x1b[1m\x1b[32m%s\x1b[0m', '========== MySQL connected ==========');
  });
  // pool.on('release', (connection) => {
  // // log.trace('Connection %d released', connection.threadId);
  // });
};

__public.getConnection = () => new Promise((resolve, reject) => {
  pool.getConnection((err, con) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(con);
  });
});

__public.query = (q, values = []) => new Promise((resolve, reject) => {
  __public.getConnection()
    .then((conn) => {
      conn.query(q, values, (err, response, fields) => {
        conn.release();
        if (err) {
          reject(err);
          return;
        }
        resolve({
          response, fields,
        });
      });
    })
    .catch((e) => { reject(e); });
});

__public.prepare = (sql, inserts) => mysql.format(sql, inserts);

__public.disconnect = () => new Promise((resolve, reject) => {
  try {
    pool.end(() => {
      console.log('\x1b[1m\x1b[34m%s\x1b[0m', '========== MySQL Pool ended ==========');
      resolve();
    });
  } catch (e) {
    console.log('\x1b[1m\x1b[34m%s\x1b[0m', '========== MySQL Pool end Error ==========');
    console.log('\x1b[1m\x1b[34m%s\x1b[0m', e);
    reject(e);
  }
});
