const router = require("express").Router(),
      helpers = require("../helpers/services");

router.post("/sendMail", helpers.sendMail);

module.exports = router;