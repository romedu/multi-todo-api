const router = require("express").Router(),
	helpers = require("../helpers/todoList"),
	{ todoListMiddlewares } = require("../middlewares");

router
	.route("/")
	.get(helpers.find)
	.post(...todoListMiddlewares.postMiddlewares, helpers.create);

router
	.route("/:id")
	.all(...todoListMiddlewares.idCommonMiddlewares)
	.get(helpers.findOne)
	.patch(...todoListMiddlewares.idPatchMiddlewares, helpers.update)
	.delete(helpers.delete);

router.get(
	"/:id/download",
	...todoListMiddlewares.idDownloadGetMiddlewares,
	helpers.downloadFile
);

module.exports = router;
