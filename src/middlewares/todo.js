const { Todo } = require("../models"),
	{ errorHandler } = require("../helpers/error"),
	todosMiddlewares = require("./commonTodos"),
	{
		createTodoValidators,
		updateTodoValidators,
		confirmValidation
	} = require("../validators");

const getCurrentTodo = async (req, res, next) => {
	try {
		const foundTodo = await Todo.findById(req.params.todoId);

		if (!foundTodo) throw errorHandler(404, "Not Found");
		req.locals.currentTodo = foundTodo;
		next();
	} catch (error) {
		return next(error);
	}
};

exports.commonMiddlewares = [
	todosMiddlewares.getCurrentList,
	todosMiddlewares.checkPermission
];

exports.postMiddlewares = [createTodoValidators, confirmValidation];

exports.idGetMiddlewares = [getCurrentTodo];

exports.idPatchMiddlewares = [
	updateTodoValidators,
	confirmValidation,
	getCurrentTodo
];

exports.idDeleteMiddlewares = [getCurrentTodo];

module.exports = exports;
