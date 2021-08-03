const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const datesBetween = (start_date, end_date) => {
  let sd = dayjs(start_date);
  const ed = dayjs(end_date);

  const dates = [];
  while (sd.isSameOrBefore(ed)) {
    dates.push(sd.format('YYYY-MM-DD'));
    sd = sd.add(1, 'day');
  }

  return dates;
};

// datesBetween('2020-07-30', '2020-08-10');

module.exports = {
  datesBetween,
};
