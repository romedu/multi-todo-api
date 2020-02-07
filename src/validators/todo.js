const { check } = require("express-validator");

exports.createTodoValidators = [
	check("description", "Description is required").exists({
		checkFalsy: true,
		checkNull: true
	}),
	check("description", "Description must be a string").isString(),
	check("checked", "Checked must be a boolean")
		.isBoolean()
		.optional()
];

exports.updateTodoValidators = [
	check("description", "Description must be a string")
		.isString()
		.optional(),
	check("checked", "Checked must be a boolean")
		.isBoolean()
		.optional()
];

module.exports = exports;
