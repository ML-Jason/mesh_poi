class SKEvent extends Error {
  constructor(type, data) {
    super(type);

    this.type = type;
    this.data = data;

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = SKEvent;
