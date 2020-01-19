const mongoose = require("mongoose"),
   { deleteAllFolders, deleteAllUsers } = require("./utilities");

afterAll(async () => {
   await deleteAllFolders();
   await deleteAllUsers();
   await mongoose.connection.close();
});