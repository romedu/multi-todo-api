const mongoose = require("mongoose"),
   { deleteAllFolders, deleteAllUsers, deleteAllTodoLists } = require("./utilities");

module.exports = async () => {
   await deleteAllTodoLists();
   await deleteAllFolders();
   await deleteAllUsers();
   await mongoose.connection.close();
};