const mongoose = require("mongoose");

mongoose.set("debug", true);
mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useCreateIndex: true
});
mongoose.promise = Promise;

exports.User = require("./user");
exports.Folder = require("./folder");
exports.TodoList = require("./todoList");
exports.Todo = require("./todo");

module.exports = exports;
