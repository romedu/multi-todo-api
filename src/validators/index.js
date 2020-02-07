const { validationResult } = require("express-validator"),
	userValidators = require("./user"),
	folderValidators = require("./folder"),
	todoListValidators = require("./todoList"),
	todoValidators = require("./todo"),
	servicesValidators = require("./services");

const alphanumOnly = data => /^[a-z\d\-_\s]+$/i.test(data);

const confirmValidation = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const errorsArray = errors.array(),
			errorMessages = errorsArray.map(error => error.msg);

		return res.status(422).json({ errors: errorMessages });
	}

	return next();
};

module.exports = {
	alphanumOnly,
	confirmValidation,
	...userValidators,
	...folderValidators,
	...todoListValidators,
	...todoValidators,
	...servicesValidators
};
