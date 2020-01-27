const router = require("express").Router(),
	helpers = require("../helpers/services"),
	{ servicesMiddlewares } = require("../middlewares");

router.post(
	"/sendMail",
	servicesMiddlewares.sendMailMiddlewares,
	helpers.sendMail
);

module.exports = router;
