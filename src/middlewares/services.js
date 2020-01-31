const {
	sendMailValidators,
	confirmValidation
} = require("../helpers/validator");

exports.sendMailMiddlewares = [sendMailValidators, confirmValidation];

module.exports = exports;
