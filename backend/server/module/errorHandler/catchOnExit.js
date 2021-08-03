/* eslint no-console:0 */
/*
說明
處理UncaughtExecption，錯誤發生時會拋出事件，外層可以接收這個事件並處理該處理的程序(例如:中斷資料庫)
此模組會在錯誤發生後，等待資料庫斷線，然後結束主程序，或是三秒後直接結束主程序。
*/

const skevent = require('~server/module/skevent');

// 監聽index發出的PROCESS_EXIT事件，就可以中斷主程序
const onEndProcess = () => {
  setTimeout(() => { process.exit(1); }, 100);
};
skevent.on(skevent.types.PROCESS_EXIT, onEndProcess);

const exitHandler = (type, err) => {
  console.log('\x1b[1m\x1b[31m%s\x1b[0m', `======== catchOnExit: ${type} ========`);
  if (type !== 'exit') {
    // 發出PROCESS_BEFORE_EXIT事件，讓其他程序可以處理系統結束前要處理的事情，例如:切斷資料庫
    const e = new skevent.SKEvent(skevent.types.PROCESS_BEFORE_EXIT, err);
    skevent.fire(e);

    if (type === 'uncaughtException' || type === 'unhandledRejection') {
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '===== /module/errorHandler/catchOnExit =====');
      console.log('\x1b[1m\x1b[31m');
      console.log(err);
      console.log('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', '=======================================');
    }

    // 不管怎樣，三秒後一定要exit (預防監聽程式沒有呼叫callback)
    setTimeout(() => { process.exit(1); }, 3000);
  }
};

/*
監聽異常事件
*/
process.on('SIGINT', exitHandler.bind(null, 'SIGINT', null));
process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM', null));
process.on('exit', exitHandler.bind(null, 'exit', null));
process.on('uncaughtException', (e) => {
  exitHandler('uncaughtException', e);
});
process.on('unhandledRejection', (e) => {
  // 針對promise裡的uncaughtException
  exitHandler('unhandledRejection', e);
});
