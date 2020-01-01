const jwt = require("jsonwebtoken"),
	serialize = require("serialize-javascript"),
	{ errorHandler } = require("../helpers/error");

exports.folder = require("./folder");
exports.todos = require("./todos");

exports.checkIfToken = (req, res, next) => {
	const token = req.get("Authorization");
	if (!token) {
		let error = errorHandler(403, "You need a valid token to proceed!");
		return next(error);
	}
	return jwt.verify(token, process.env.SECRET, (error, decoded) => {
		if (error) {
			error.status = 403;
			return next(error);
		}

		req.locals = { user: decoded };
		return next();
	});
};

exports.serializeBody = (req, res, next) => {
	const { body } = req;

	for (let [property, value] of Object.entries(body)) {
		body[property] = value ? JSON.parse(serialize(value)) : null;
	}

	next();
};

module.exports = exports;
