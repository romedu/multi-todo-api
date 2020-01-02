const request = require("supertest"),
   mongoose = require("mongoose"),
   app = require("../src/app");

describe("Folder routes", () => {
   const baseUrl = "/api/folder";

   afterAll(() => {
      mongoose.connection.close();
   });

   describe("Unauthorized requests", () => {
      describe("Get request", () => {
         it("should return a status of 401", async done => {
            const response = await request(app).get(baseUrl);
            expect(response.status).toBe(401);
            done();
         });
      });
   });
});