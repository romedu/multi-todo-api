const mongoose = require("mongoose"),
	bcrypt = require("bcryptjs"),
	validator = require("../helpers/validator"),
	userSchema = new mongoose.Schema({
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			minlength: [4, "Only between 4 and 20 characters are allowed"],
			maxlength: [20, "Only between 4 and 20 characters are allowed"],
			validate: {
				validator: validator.alphanumOnly,
				message: "Only alphanumeric and space characters are allowed"
			}
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Only between 8 and 24 characters are allowed"],
			maxlength: [24, "Only between 8 and 24 characters are allowed"]
		}
	});

userSchema.pre("save", async function(next) {
	try {
		if (!this.isModified("password")) return next();
		this.password = await bcrypt.hash(this.password, 11);
		return next();
	} catch (error) {
		error.status = 500;
		return next(error);
	}
});

userSchema.methods.comparePassword = async function(passedPassword) {
	try {
		let compareResult = await bcrypt.compare(passedPassword, this.password);
		if (!compareResult) throw new Error("Incorrect Username/Password");
		return compareResult;
	} catch (error) {
		error.status = 404;
		return error;
	}
};

module.exports = mongoose.model("User", userSchema);
