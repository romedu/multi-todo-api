const todosMiddlewares = require("./commonTodos"),
	{
		createTodoListValidators,
		updateTodoListValidators,
		confirmValidation
	} = require("../helpers/validator");

exports.postMiddlewares = [
	todosMiddlewares.getListNewFolder,
	todosMiddlewares.checkIfFolderOwner,
	createTodoListValidators,
	confirmValidation
];

exports.idCommonMiddlewares = [
	todosMiddlewares.getCurrentList,
	todosMiddlewares.checkPermission
];

exports.idPatchMiddlewares = [
	todosMiddlewares.getListNewFolder,
	todosMiddlewares.checkIfFolderOwner,
	updateTodoListValidators,
	confirmValidation
];

exports.idDownloadGetMiddlewares = [
	todosMiddlewares.getCurrentList,
	todosMiddlewares.checkPermission
];

module.exports = exports;
