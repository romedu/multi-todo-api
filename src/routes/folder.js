const router = require("express").Router(),
   helpers = require("../helpers/folder"),
   { folder } = require("../middlewares"),
   { createFolderValidators, updateFolderValidators, confirmValidation } = require("../helpers/validator");

router
   .route("/")
   .get(helpers.find)
   .post(createFolderValidators, confirmValidation, helpers.create);

router
   .route("/:id")
   .all(folder.getCurrentFolder, folder.checkPermission)
   .get(helpers.findOne)
   .patch(updateFolderValidators, confirmValidation, helpers.update)
   .delete(folder.ownerPrivileges, helpers.delete);

module.exports = router;
