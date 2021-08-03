/* eslint no-param-reassign:0 */
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const createErrorLog = require('~server/app/function/errorlog/create_errorlog');
const crawler = require('~server/app/function/crawler');
const updateToSkylens = require('~server/app/function/skylens/update_to_skylens');

// crawler();

// const readPOIFile = require('~server/app/function/read_poi_file');
// const readWebFile = require('~server/app/function/read_web_file');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

const crons = [
  {
    name: 'crawler',
    last_check_date: '',
    check_time: '03:00',
    fn: crawler,
  },
  {
    name: 'updateToSkylens',
    last_check_date: '',
    check_time: '00:30',
    fn: updateToSkylens,
  },
];

const checkingCrons = () => {
  const _now_date = dayjs.tz().format('YYYY-MM-DD');

  crons.forEach((cron) => {
    if (cron.last_check_date === _now_date) return;
    const _cdayjs = dayjs.tz(`${_now_date} ${cron.check_time}`, 'YYYY-MM-DD HH:mm', 'Asia/Taipei');
    const _mindiff = dayjs.tz().diff(_cdayjs, 'minute', true);
    if (_mindiff > 0 && _mindiff <= 30) {
      try {
        console.log(`run ${cron.name}`);
        cron.fn();
      } catch (e) {
        createErrorLog({ title: `cronjob ${cron.name} ERROR`, message: e.toString() });
      }
      cron.last_check_date = _now_date;
    }
  });
};

const run = () => {
  console.log(`System date: ${dayjs.tz().format('YYYY-MM-DD HH:mm')}`);

  checkingCrons();
  setInterval(() => {
    checkingCrons();
  }, 1000 * 60 * 15); // 每15分鐘跑一次cron
};

module.exports = { run };
