const { check } = require("express-validator");

exports.sendMailValidators = [
	check("message", "Message is required").exists({
		checkFalsy: true,
		checkNull: true
	}),
	check("message", "Message must be a string").isString()
];

module.exports = exports;
