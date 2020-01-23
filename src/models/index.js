const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "test") mongoose.set("debug", true);
mongoose.connect(process.env.DB, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false
});
mongoose.promise = Promise;

exports.User = require("./user");
exports.Folder = require("./folder");
exports.TodoList = require("./todoList");
exports.Todo = require("./todo");

module.exports = exports;
