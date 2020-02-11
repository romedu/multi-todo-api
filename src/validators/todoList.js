const { check } = require("express-validator");

exports.createTodoListValidators = [
	check("name", "Name is required").exists({
		checkFalsy: true,
		checkNull: true
	}),
	check("name", "Name must be a string").isString(),
	check("name", "Name must contain between 2 and 25 characters").isLength({
		min: 2,
		max: 25
	}),
	check(
		"name",
		"Name must only contain only alphanumeric characters"
	).isAlphanumeric(),
	check("image", "Image must be a string")
		.isString()
		.optional({checkFalsy: true})
];

exports.updateTodoListValidators = [
	check("name", "Name must be a string")
		.isString()
		.optional(),
	check("name", "Name must contain between 2 and 25 characters")
		.isLength({
			min: 2,
			max: 25
		})
		.optional(),
	check("name", "Name must only contain only alphanumeric characters")
		.isAlphanumeric()
		.optional(),
	check("image", "Image must be a string")
		.isString()
		.optional({checkFalsy: true})
];

module.exports = exports;
