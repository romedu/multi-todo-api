const router = require("express").Router({ mergeParams: true }),
   helpers = require("../helpers/todo"),
   { todos } = require("../middlewares"),
   { createTodoValidators, updateTodoValidators, confirmValidation } = require("../helpers/validator");

router.route("/")
   .get(helpers.find)
   .post(createTodoValidators, confirmValidation, todos.ownerOnly, helpers.create);

router.route("/:todoId")
   .get(helpers.findOne)
   .patch(updateTodoValidators, confirmValidation, todos.ownerOnly, todos.getCurrentTodo, helpers.update)
   .delete(todos.ownerPrivileges, todos.getCurrentTodo, helpers.delete);

module.exports = router;