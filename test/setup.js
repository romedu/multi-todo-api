const mongoose = require("mongoose"),
   { deleteAllFolders, deleteAllUsers, deleteAllTodoLists } = require("./utilities");

afterAll(async () => {
   await deleteAllTodoLists();
   await deleteAllFolders();
   await deleteAllUsers();
   await mongoose.connection.close();
});