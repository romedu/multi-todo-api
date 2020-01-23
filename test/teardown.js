const mongoose = require("mongoose"),
   testUtils = require("./utilities");

module.exports = async () => {
   await testUtils.deleteAllTodos();
   await testUtils.deleteAllTodoLists();
   await testUtils.deleteAllFolders();
   await testUtils.deleteAllUsers();
   await mongoose.connection.close();
};