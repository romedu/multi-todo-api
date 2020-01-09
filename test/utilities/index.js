const request = require("supertest"),
   mongoose = require("mongoose"),
   app = require("../src/app");

exports.createTestUser = async () => {
   const testUserData = {
      username: "newTestUsername",
      password: "testPassword"
   },
      { body: newUserData } = await request(app).post(baseUrl).send(testUserData);

   return newUserData;
};

module.exports = exports;