const router = require("express").Router({ mergeParams: true }),
	helpers = require("../helpers/todo"),
	{ todoMiddlewares } = require("../middlewares");

router
	.route("/")
	.all(...todoMiddlewares.commonMiddlewares)
	.get(helpers.find)
	.post(...todoMiddlewares.postMiddlewares, helpers.create);

router
	.route("/:todoId")
	.all(...todoMiddlewares.commonMiddlewares)
	.get(todoMiddlewares.idGetMiddlewares, helpers.findOne)
	.patch(...todoMiddlewares.idPatchMiddlewares, helpers.update)
	.delete(...todoMiddlewares.idDeleteMiddlewares, helpers.delete);

module.exports = router;
