const request = require("supertest"),
   app = require("../../src/app"),
   { User, Folder } = require("../../src/models/index");

exports.createTestUser = async testUserData => {
   const registerRouteUrl = "/api/auth/register",
      { body: newUserData } = await request(app).post(registerRouteUrl).send(testUserData);

   return newUserData;
};

exports.deleteAllUsers = async () => {
   await User.deleteMany({});
}

exports.deleteAllFolders = async () => {
   await Folder.deleteMany({});
}

module.exports = exports;