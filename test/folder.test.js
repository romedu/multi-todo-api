const request = require("supertest"),
   mongoose = require("mongoose"),
   app = require("../src/app"),
   { createTestUser } = require("./utilities");

describe("Folder routes", () => {
   const folderObjectSchema = {
      _id: expect.any(String),
      name: expect.any(String),
      files: expect.any(Array),
      creator: expect.any(String)
   };

   let userData;

   beforeAll(async () => {
      const testUserCredentials = {
         username: "newTestUsername",
         password: "testPassword"
      };

      userData = await createTestUser(testUserCredentials);
   });

   afterAll(() => {
      mongoose.connection.close();
   });

   describe("/folder", () => {
      const baseUrl = "/api/folder";

      describe("Authorized requests", () => {
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
                  expect(response.body).toEqual(expect.objectContaining(folderObjectSchema));
               });

               it("should save the new folder", async () => {
                  const { token: authorizationToken } = userData,
                     { body: newFolder } = response,
                     { body: folderListAfterRequest } = await request(app).get(baseUrl).set("Authorization", authorizationToken),
                     isNewFolderSaved = folderListAfterRequest.some(folder => folder.id === newFolder.id);

                  expect(isNewFolderSaved).toBeTruthy();
               });

               it("should return a name property with the same value as the one passed", () => {
                  expect(response.body.name).toBe(testFolderData.name);
               });

               it("should return a description property with the same value as the one passed", () => {
                  expect(response.body.description).toBe(testFolderData.description);
               });

               it("should return a files property as an empty array", () => {
                  expect(response.body.files).toEqual([]);
               });

               it("should return a creator property with the same value as the current user id", () => {
                  expect(response.body.creator).toBe(userData.id);
               });

               it("should not return an errors property", () => {
                  expect(response.body.errors).toBeUndefined();
               });
            });

            describe("Sending invalid data", () => {
               describe("Passing none of the inputs", () => {
                  const testFolderData = {};
                  let response;

                  beforeAll(async () => {
                     const { token: authorizationToken } = userData;
                     response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testFolderData);
                  });

                  it("should return a status of 422", () => {
                     expect(response.status).toBe(422);
                  });

                  it("should return an errors property with at least one element", () => {
                     const errors = response.body.errors || [];
                     expect(errors.length).toBeGreaterThanOrEqual(1);
                  });
               });

               describe("Sending one of the inputs invalid", () => {
                  describe("Passing the name input invalid", () => {
                     const testFolderData = {
                        name: "X"
                     };

                     let response;

                     beforeAll(async () => {
                        const { token: authorizationToken } = userData;
                        response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testFolderData);
                     });

                     it("should return a status of 422", () => {
                        expect(response.status).toBe(422);
                     });

                     it("should return an errors property with at least one element", () => {
                        const errors = response.body.errors || [];
                        expect(errors.length).toBeGreaterThanOrEqual(1);
                     });
                  });

                  describe("Passing the description input invalid", () => {
                     const testFolderData = {
                        name: "folderName",
                        description: "123456789123456789123456789123456789456123456789456"
                     };

                     let response;

                     beforeAll(async () => {
                        const { token: authorizationToken } = userData;
                        response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testFolderData);
                     });

                     it("should return a status of 422", () => {
                        expect(response.status).toBe(422);
                     });

                     it("should return an errors property with at least one element", () => {
                        const errors = response.body.errors || [];
                        expect(errors.length).toBeGreaterThanOrEqual(1);
                     });
                  });
               });

               describe("Sending both of the inputs invalid", () => {
                  const testFolderData = {
                     name: "X",
                     description: "123456789123456789123456789123456789456123456789456"
                  };

                  let response;

                  beforeAll(async () => {
                     const { token: authorizationToken } = userData;
                     response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testFolderData);
                  });

                  it("should return a status of 422", () => {
                     expect(response.status).toBe(422);
                  });

                  it("should return an errors property with at least two elements", () => {
                     const errors = response.body.errors || [];
                     expect(errors.length).toBeGreaterThanOrEqual(2);
                  });
               });
            });
         });

         describe("Put request", () => {
            it("should return a status of 404", async done => {
               const { token: authorizationToken } = userData,
                  response = await request(app).put(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });

         describe("Patch request", () => {
            it("should return a status of 404", async done => {
               const { token: authorizationToken } = userData,
                  response = await request(app).patch(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });

         describe("Delete request", () => {
            it("should return a status of 404", async done => {
               const { token: authorizationToken } = userData,
                  response = await request(app).delete(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
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

         describe("Patch request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).patch(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });

         describe("Delete request", () => {
            it("should return a status of 401", async done => {
               const response = await request(app).delete(baseUrl);
               expect(response.status).toBe(401);
               done();
            });
         });
      });
   });

   describe("/folder/:id", () => {
      describe("Requesting a valid folder id", () => {
         let authorizationToken,
            testFolder,
            baseUrl;

         beforeAll(async () => {
            const rootUrl = "/api/folder",
               testFolderData = {
                  name: "folderName",
                  description: "Test folder description"
               },
               newFolderResponse = await request(app).post(rootUrl).set("Authorization", userData.token).send(testFolderData);

            authorizationToken = userData.token;
            testFolder = newFolderResponse.body;
            baseUrl = `/api/folder/${testFolder._id}`;
         });

         describe("Unauthorized requests", () => {
            describe("Not passing any auth token", () => {
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

               describe("Patch request", () => {
                  it("should return a status of 401", async done => {
                     const response = await request(app).patch(baseUrl);
                     expect(response.status).toBe(401);
                     done();
                  });
               });

               describe("Delete request", () => {
                  it("should return a status of 401", async done => {
                     const response = await request(app).delete(baseUrl);
                     expect(response.status).toBe(401);
                     done();
                  });
               });
            });

            describe("Using a different user's auth token", () => {
               let intruderUserData;

               beforeAll(async () => {
                  const intruderUserCredentials = {
                     username: "intruderUsername",
                     password: "intruderPassword"
                  };

                  intruderUserData = await createTestUser(intruderUserCredentials);
               });

               describe("Get request", () => {
                  it("should return a status of 401", async done => {
                     const { token: invalidAuthToken } = intruderUserData,
                        response = await request(app).get(baseUrl).set("Authorization", invalidAuthToken);

                     expect(response.status).toBe(401);
                     done();
                  });
               });

               describe("Post request", () => {
                  it("should return a status of 401", async done => {
                     const { token: invalidAuthToken } = intruderUserData,
                        response = await request(app).post(baseUrl).set("Authorization", invalidAuthToken);

                     expect(response.status).toBe(401);
                     done();
                  });
               });

               describe("Patch request", () => {
                  it("should return a status of 401", async done => {
                     const { token: invalidAuthToken } = intruderUserData,
                        response = await request(app).patch(baseUrl).set("Authorization", invalidAuthToken);

                     expect(response.status).toBe(401);
                     done();
                  });
               });

               describe("Delete request", () => {
                  it("should return a status of 401", async done => {
                     const { token: invalidAuthToken } = intruderUserData,
                        response = await request(app).delete(baseUrl).set("Authorization", invalidAuthToken);

                     expect(response.status).toBe(401);
                     done();
                  });
               });
            });
         });

         describe("Authorized requests", () => {
            describe("Get request", () => {
               let response;

               beforeAll(async () => {
                  response = await request(app).get(baseUrl).set("Authorization", authorizationToken);
               })

               it("should return a status of 200", () => {
                  expect(response.status).toBe(200);
               });

               it("should return a folder object", () => {
                  expect(response.body).toEqual(expect.objectContaining(folderObjectSchema));
               });
            });

            describe("Post request", () => {
               let response;

               beforeAll(async () => {
                  response = await request(app).post(baseUrl).set("Authorization", authorizationToken);
               })

               it("should return a status of 404", () => {
                  expect(response.status).toBe(404);
               });
            });

            describe("Patch request", () => {
               describe("Sending valid data", () => {
                  const updateData = {
                     name: "updatedName"
                  };

                  let response;

                  beforeAll(async () => {
                     response = await request(app).patch(baseUrl).set("Authorization", authorizationToken).send(updateData);
                  });

                  it("should return a status of 200", () => {
                     expect(response.status).toBe(200);
                  });

                  it("should return the folder with the updated data", () => {
                     expect(response.body).toMatchObject(updateData);
                  });
               });

               describe("Sending invalid data", () => {
                  const updateData = {
                     name: "X"
                  };

                  let response;

                  beforeAll(async () => {
                     response = await request(app).patch(baseUrl).set("Authorization", authorizationToken).send(updateData);
                  })

                  it("should return a status of 422", () => {
                     expect(response.status).toBe(422);
                  });

                  it("should return an errors property with at least one element", () => {
                     const errors = response.body.errors || [];
                     expect(errors.length).toBeGreaterThanOrEqual(1);
                  });

                  it("should not return the folder with the updated data", () => {
                     expect(response.body).not.toMatchObject(updateData);
                  });
               });
            });

            describe("Delete request", () => {
               let response;

               beforeAll(async () => {
                  response = await request(app).delete(baseUrl).set("Authorization", authorizationToken);
               });

               it("should return a status of 200", () => {
                  expect(response.status).toBe(200);
               });

               it("should return a success message", () => {
                  expect(response.body.message).toBeDefined();
               });

               it("should remove the resource", async done => {
                  const folderQueryResponse = await request(app).get(baseUrl).set("Authorization", authorizationToken);
                  expect(folderQueryResponse.status).toBe(404);
                  done();
               });
            });
         });
      });

      describe("Requesting an invalid folder id", () => {
         const baseUrl = "/api/folder/invalidID123";

         let authorizationToken;

         beforeAll(() => {
            authorizationToken = userData.token;
         })

         describe("Get request", () => {
            it("should return a status of 404", async done => {
               const response = await request(app).get(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });

         describe("Post request", () => {
            it("should return a status of 404", async done => {
               const response = await request(app).post(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });

         describe("Patch request", () => {
            it("should return a status of 404", async done => {
               const response = await request(app).patch(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });

         describe("Delete request", () => {
            it("should return a status of 404", async done => {
               const response = await request(app).delete(baseUrl).set("Authorization", authorizationToken);

               expect(response.status).toBe(404);
               done();
            });
         });
      });
   });
});