const router = require("express").Router(),
	helpers = require("../helpers/todoList"),
	{ todos } = require("../middlewares");

router
	.route("/")
	.get(helpers.find)
	.post(todos.checkIfFolderOwner, helpers.create);

router
	.route("/:id")
	.all(todos.getCurrentList, todos.checkPermission)
	.get(helpers.findOne)
	.patch(todos.ownerOnly, todos.checkIfFolderOwner, helpers.update)
	.delete(todos.ownerPrivileges, helpers.delete);

router.get(
	"/:id/download",
	todos.getCurrentList,
	todos.checkPermission,
	helpers.downloadFile
);

module.exports = router;
