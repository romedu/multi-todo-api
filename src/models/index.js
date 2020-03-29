const mongoose = require("mongoose"),
	dbConnectionOptions = {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	},
	connectionErrorHandler = error => {
		console.log("Database connection Error");
		process.exit(0);
	};

if (process.env.NODE_ENV !== "test") mongoose.set("debug", true);
mongoose.connect(process.env.DB, dbConnectionOptions).catch(connectionErrorHandler);
mongoose.promise = Promise;

exports.User = require("./user");
exports.Folder = require("./folder");
exports.TodoList = require("./todoList");
exports.Todo = require("./todo");

module.exports = exports;
