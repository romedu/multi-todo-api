const jwt = require("jsonwebtoken"),
	{ User } = require("../models"),
	{ errorHandler } = require("./error");

exports.register = async (req, res, next) => {
	try {
		const newUser = await User.create(req.body),
			signedUserData = signUser(newUser);

		return res.status(200).json(signedUserData);
	} catch (error) {
		if (error.code === 11000)
			error = errorHandler(409, "Username is not available");
		return next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body,
			user = await User.findOne({ username }),
			isPasswordMatch = user && await user.comparePassword(password);

		if (isPasswordMatch) {
			const signedUserData = signUser(user);
			return res.status(200).json(signedUserData);
		}

		throw errorHandler(401, "Incorrect Username/Password");
	} catch (error) {
		return next(error);
	}
};

// MiddleWare should check if the token is valid
exports.verifyToken = (req, res) => {
	const { user } = req.locals;
	return res.status(200).json(user);
};

const signUser = user => {
	const { username, id } = user,
		{ SECRET, ALGORITHM } = process.env,
		token = jwt.sign({ username, id }, SECRET, {
			expiresIn: "1h",
			algorithm: ALGORITHM
		}),
		userData = {
			username,
			token,
			id,
			tokenExp: Date.now() + 3600 * 1000
		};

	return userData;
};
