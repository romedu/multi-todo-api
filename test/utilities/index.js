const request = require("supertest"),
   app = require("../../src/app"),
   dbModels = require("../../src/models");

exports.createTestUser = async testUserData => {
   const registerRouteUrl = "/api/auth/register",
      { body: newUserData } = await request(app).post(registerRouteUrl).send(testUserData);

   return newUserData;
};

exports.deleteAllUsers = async () => {
   await dbModels.User.deleteMany({}).exec();
}

exports.deleteAllFolders = async () => {
   await dbModels.Folder.deleteMany({}).exec();
}

exports.deleteAllTodoLists = async () => {
   await dbModels.TodoList.deleteMany({}).exec();
}

module.exports = exports;