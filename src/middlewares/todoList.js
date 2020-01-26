const todosMiddlewares = require("./commonTodos"),
	{
		createTodoListValidators,
		updateTodoListValidators,
		confirmValidation
	} = require("../helpers/validator");

exports.postMiddlewares = [
	todosMiddlewares.checkIfFolderOwner,
	createTodoListValidators,
	confirmValidation
];

exports.idCommonMiddlewares = [
	todosMiddlewares.getCurrentList,
	todosMiddlewares.checkPermission
];

exports.idPatchMiddlewares = [
	todosMiddlewares.ownerOnly,
	todosMiddlewares.checkIfFolderOwner,
	updateTodoListValidators,
	confirmValidation
];

exports.idDeleteMiddlewares = [todosMiddlewares.ownerPrivileges];

exports.idDownloadGetMiddlewares = [
	todosMiddlewares.getCurrentList,
	todosMiddlewares.checkPermission
];

module.exports = exports;
