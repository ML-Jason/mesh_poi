const call = (str) => str.replace(/^(\(|\s|\d|\))+/gm, '');

module.exports = call;
