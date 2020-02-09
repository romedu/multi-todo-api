const createResourceUrl = (baseUrl, suffix) => `${baseUrl}/${suffix}`;

exports.loginBaseUrl = "/api/auth/login";
exports.registerBaseUrl = "/api/auth/register";
exports.verifyBaseUrl = "/api/auth/verify";
exports.sendMailUrl = "/api/services/sendMail";
exports.folderBaseUrl = "/api/folder";
exports.todoListBaseUrl = "/api/todoList";

exports.createFolderIdUrl = folderId =>
	createResourceUrl(this.folderBaseUrl, folderId);

exports.createTodoListIdUrl = todoListId =>
	createResourceUrl(this.todoListBaseUrl, todoListId);

exports.createTodoListIdDownloadUrl = todoListId => {
	const todoListIdUrl = this.createTodoListIdUrl(todoListId);
	return createResourceUrl(todoListIdUrl, "download");
};

exports.createTodoUrl = todoListId => {
	const todoListIdUrl = this.createTodoListIdUrl(todoListId);
	return createResourceUrl(todoListIdUrl, "todo");
};

exports.createTodoIdUrl = (todoListId, todoId) => {
	const todoUrl = this.createTodoUrl(todoListId);
	return createResourceUrl(todoUrl, todoId);
};

module.exports = exports;
