/**
 * @apiDefine AuthBearerHeader
 * @apiHeader {String} Authorization
 * 以`"Bearer "+access_token`的格式將access_token帶入header裡
 * @apiHeaderExample {json} Request-Header-Example:
 * {
 *  "Authorization":"Bearer XXXXXXXXXXXXX"
 * }
 */

/**
 * @apiDefine APIError
 * @apiError {String} status 處理狀況，一般為'ERROR'
 * @apiError {String} code 錯誤代碼
 * @apiError {String} message 錯誤訊息
 * @apiErrorExample {json} Error-Response:
 * {
 *  "status":"ERROR", "code":"錯誤碼", "message":"錯誤訊息"
 * }
 */
