const { Todo, TodoList } = require("../models"),
	{ errorHandler } = require("./error");

//Owner && Admins Only
exports.find = async (req, res, next) => {
	try {
		const todos = await Todo.find({ container: req.params.id });
		if (!todos) throw errorHandler(404, "Not Found");
		return res.status(200).json(todos);
	} catch (error) {
		return next(error);
	}
};

//Owner && Admins Only for non admin creators
exports.create = async (req, res, next) => {
	try {
		const { currentList } = req.locals,
			newTodo = await Todo.create(req.body);

		currentList.todos.push(newTodo.id);
		newTodo.container = currentList.id;
		await currentList.save();
		await newTodo.save();
		return res.status(201).json(newTodo);
	} catch (error) {
		return next(error);
	}
};

//Owner && Admins Only
exports.findOne = async (req, res, next) => {
	try {
		const todo = await Todo.findOne({ _id: req.params.todoId });
		if (!todo) throw errorHandler(404, "Not Found");
		return res.status(200).json(todo);
	} catch (error) {
		return next(error);
	}
};

//Owner && Admins Only for non admin creators
exports.update = async (req, res, next) => {
	try {
		const { todoId } = req.params,
			options = {
				runValidators: true,
				new: true
			},
			{ container, ...updateData } = req.body,
			updatedTodo = await Todo.findByIdAndUpdate(
				todoId,
				updateData,
				options
			);

		if (!updatedTodo) throw errorHandler(404, "Not Found");
		return res.status(200).json(updatedTodo);
	} catch (error) {
		return next(error);
	}
};

//Owner && Admins Only for non admin creators
exports.delete = async (req, res, next) => {
	try {
		const { todoId } = req.params,
			{ currentList } = req.locals;

		await Todo.deleteOne({ _id: todoId });
		currentList.todos.pull(todoId);
		await currentList.save();
		return res.status(200).json({ message: "Todo Deleted Successfully" });
	} catch (error) {
		return next(error);
	}
};

module.exports = exports;
