const router = require("express").Router(),
	helpers = require("../helpers/folder"),
	{ folderMiddlewares } = require("../middlewares");

router
	.route("/")
	.get(helpers.find)
	.post(folderMiddlewares.postMiddlewares, helpers.create);

router
	.route("/:id")
	.all(folderMiddlewares.idCommonMiddlewares)
	.get(helpers.findOne)
	.patch(folderMiddlewares.idPatchMiddlewares, helpers.update)
	.delete(helpers.delete);

module.exports = router;
