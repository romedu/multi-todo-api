const { checkIfToken } = require("./common"),
	{ userValidators, confirmValidation } = require("../validators");

exports.registerMiddlewares = [userValidators, confirmValidation];
exports.loginMiddlewares = [userValidators, confirmValidation];
exports.verifyMiddlewares = [checkIfToken];

module.exports = exports;
