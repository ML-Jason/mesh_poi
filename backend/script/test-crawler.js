/*
Usage:

npm run test-crawler <crawler> [options]

  crawler: 爬蟲的路徑
  options
    output: 把資料輸出為 <project>/test-crawler-output.csv

Example:

npm run test-crawler server/app/function/crawler/market/dondondonki.js --output

*/

const path = require('path');
const fs = require('fs');

const configOutput = process.env.npm_config_output;

const callerPath = process.argv[2];

function output(data) {
  const keys = Object.keys(data[0]);
  const cols = [keys].concat(data.map((d) => keys.map((key) => `"${d[key]}"`)));
  const dataToWrite = cols.map((col) => col.join(',')).join('\n');
  fs.writeFileSync(path.resolve('./test-crawler-output.csv'), dataToWrite, 'utf8');
}

async function run() {
  // eslint-disable-next-line
  const caller = require(path.resolve(callerPath));
  const data = await caller();

  if (data && data.length > 0 && configOutput) output(data);
}

if (callerPath) {
  run();
} else {
  console.log('Please input CALLER first');
}
