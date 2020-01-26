const { checkIfToken } = require("./common"),
	{ userValidators, confirmValidation } = require("../helpers/validator");

exports.registerMiddlewares = [userValidators, confirmValidation];
exports.verifyMiddlewares = [checkIfToken];

module.exports = exports;
