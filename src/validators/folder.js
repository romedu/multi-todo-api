const { check } = require("express-validator");

const commonFolderValidators = [
	check("name", "Name must contain between 2 and 25 characters").isLength({
		min: 2,
		max: 25
	}),
	check(
		"name",
		"Name must only contain only alphanumeric characters"
	).isAlphanumeric(),
	check("description", "Description must be a string")
		.isString()
		.optional(),
	check(
		"description",
		"Description must contain a maximum of 100 characters"
	).isLength({ max: 100 }),
	check("image", "Image must be a string")
		.isString()
		.optional()
];

exports.createFolderValidators = [
	check("name", "Name is required").exists({
		checkFalsy: true,
		checkNull: true
	}),
	check("name", "Name must be a string").isString(),
	...commonFolderValidators
];

exports.updateFolderValidators = [
	check("name", "Name must be a string")
		.isString()
		.optional(),
	...commonFolderValidators
];

module.exports = exports;
