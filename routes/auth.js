const router = require("express").Router(),
	helpers = require("../helpers/auth"),
	{ checkIfToken } = require("../middlewares");

router.post("/register", helpers.register);
router.post("/login", helpers.login);
router.get("/verify", checkIfToken, helpers.verifyToken);

module.exports = router;
