const { Todo } = require("../models"),
	{ errorHandler } = require("./error");

exports.find = async (req, res, next) => {
	try {
		const todos = await Todo.find({ container: req.params.id });

		if (!todos) throw errorHandler(404, "Not Found");
		return res.status(200).json(todos);
	} catch (error) {
		return next(error);
	}
};

exports.create = async (req, res, next) => {
	try {
		const { currentList } = req.locals,
			newTodoData = {
				...req.body,
				container: currentList.id
			},
			newTodo = await Todo.create(newTodoData);

		currentList.todos.push(newTodo.id);
		await currentList.save();
		return res.status(201).json(newTodo);
	} catch (error) {
		return next(error);
	}
};

exports.findOne = async (req, res, next) => {
	try {
		const { currentTodo } = req.locals;

		await currentTodo.populate("container").execPopulate();
		return res.status(200).json(currentTodo);
	} catch (error) {
		return next(error);
	}
};

exports.update = async (req, res, next) => {
	try {
		const { currentTodo } = req.locals,
			{ container, ...updateData } = req.body,
			updateOptions = {
				omitUndefined: true,
				runValidators: true
			},
			updatedTodo = {
				currentTodo,
				...updateData
			};

		await currentTodo.updateOne(updateData, updateOptions);
		return res.status(200).json(updatedTodo);
	} catch (error) {
		return next(error);
	}
};

exports.delete = async (req, res, next) => {
	try {
		const { todoId } = req.params,
			{ currentList, currentTodo } = req.locals;

		await currentTodo.delete();
		currentList.todos.pull(todoId);
		await currentList.save();
		return res.status(200).json({ message: "Todo Deleted Successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
