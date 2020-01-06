const router = require("express").Router(),
   helpers = require("../helpers/auth"),
   { checkIfToken } = require("../middlewares"),
   { userValidators, confirmValidation } = require("../helpers/validator");

router.post("/register", userValidators, confirmValidation, helpers.register);
router.post("/login", helpers.login);
router.get("/verify", checkIfToken, helpers.verifyToken);

module.exports = router;
