const router = require("express").Router(),
	helpers = require("../helpers/auth"),
	{ authMiddlewares } = require("../middlewares");

router.post("/login", helpers.login);

router.post("/register", authMiddlewares.registerMiddlewares, helpers.register);

router.get("/verify", authMiddlewares.verifyMiddlewares, helpers.verifyToken);

module.exports = router;
