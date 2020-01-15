const request = require("supertest"),
   app = require("../../src/app");

exports.createTestUser = async testUserData => {
   const registerRouteUrl = "/api/auth/register",
      { body: newUserData } = await request(app).post(registerRouteUrl).send(testUserData);

   return newUserData;
};

module.exports = exports;