const request = require("supertest"),
   mongoose = require("mongoose"),
   app = require("../src/app"),
   { createTestUser } = require("./utilities");

describe("Folder routes", () => {
   const baseUrl = "/api/folder";

   afterAll(() => {
      mongoose.connection.close();
   });

   describe("/folder", () => {
      describe("Authorized requests", () => {
         let userData;

         beforeAll(async () => {
            userData = await createTestUser();
         });

         describe("Get request", () => {
            let response;

            beforeAll(async () => {
               const { token: authorizationToken } = userData;
               response = await request(app).get(baseUrl).set("Authorization", authorizationToken);
            });

            it("should return a status of 200", () => {
               expect(response.status).toBe(200);
            });

            it("should return an array of folders", () => {
               const { body: folders } = response;
               expect(folders).toBeInstanceOf(Array);
            })
         });

         describe("Post request", () => {
            describe("Sending valid data", () => {
               const testFolderData = {
                  name: "testFolderName",
                  description: "Test folder description"
               };

               let response;

               beforeAll(async () => {
                  const { token: authorizationToken } = userData;
                  response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testFolderData);
               });

               it("should return a status of 201", () => {
                  expect(response.status).toBe(201);
               });

               it("should return a folder object", () => {
                  const folderObject = {
                     id: expect.any(String),
                     name: expect.any(String),
                     files: expect.any(Array),
                     creator: expect.any(String)
                  };

                  expect(response.body).toEqual(expect.objectContaining(folderObject));
               });

               it("should save the new folder", async () => {
                  const { token: authorizationToken } = userData,
                     { body: newFolder } = response,
                     { body: folderListAfterRequest } = await request(app).get(baseUrl).set("Authorization", authorizationToken),
                     isNewFolderSaved = folderListAfterRequest.some(folder => folder.id === newFolder.id);

                  expect(isNewFolderSaved).toBeTruthy();
               });
            });
         });
      });

      describe("Unauthorized requests", () => {
         describe("Get request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).get(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });

         describe("Post request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).post(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });

         describe("Get request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).patch(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });

         describe("Get request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).delete(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });
      });
   });
});