const { sendMailValidators, confirmValidation } = require("../validators");

exports.sendMailMiddlewares = [sendMailValidators, confirmValidation];

module.exports = exports;
