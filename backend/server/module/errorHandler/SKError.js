const errorCodes = require('~server/module/errorHandler/errorCodes');

class SKError extends Error {
  constructor(code, texts = []) {
    super(code);

    this.code = code;
    this.texts = (Array.isArray(texts) ? texts : [texts]);

    const errobj = errorCodes.get(code);
    this.httpStatus = errobj.http;
    this.message = errorCodes.toMessage(errobj, texts);

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  toLang(lang = 'zh') {
    const msg = errorCodes.codeMessage(this.code, this.texts, lang);
    this.message = msg;
    return this;
  }
}

module.exports = SKError;
