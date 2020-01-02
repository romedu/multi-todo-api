const router  = require("express").Router({mergeParams: true}),
      helpers = require("../helpers/todo"),
      {todos} = require("../middlewares");

router.route("/")
   .get(helpers.find)
   .post(todos.ownerOnly, helpers.create);

router.route("/:todoId")
   .get(helpers.findOne)
   .patch(todos.ownerOnly, helpers.update)
   .delete(todos.ownerPrivileges, helpers.delete);

module.exports = router;