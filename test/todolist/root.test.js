const request = require("supertest"),
   app = require("../../src/app"),
   { createTestUser } = require("../utilities");

describe("TodoList routes", () => {
   describe("/todos", () => {
      const baseUrl = "/api/todos",
         todolistObjectSchema = {
            _id: expect.any(String),
            name: expect.any(String),
            todos: expect.any(Array),
            creator: expect.any(String)
         };

      let userData;

      beforeAll(async () => {
         const testUserCredentials = {
            username: "listTestUsername",
            password: "listTestPassword"
         };

         userData = await createTestUser(testUserCredentials);
      });

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

            it("should return an array of todolists", () => {
               const { body: todolists } = response;
               expect(todolists).toBeInstanceOf(Array);
            })
         });

         describe("Post request", () => {
            describe("Sending valid data", () => {
               const testTodoListData = {
                  name: "testListName"
               };

               let response;

               beforeAll(async () => {
                  const { token: authorizationToken } = userData;
                  response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testTodoListData);
               });

               it("should return a status of 201", () => {
                  expect(response.status).toBe(201);
               });

               it("should return a todolist object", () => {
                  expect(response.body).toEqual(expect.objectContaining(todolistObjectSchema));
               });

               it("should save the new todolist", async () => {
                  const { token: authorizationToken } = userData,
                     { body: newTodoList } = response,
                     { body: todolistListAfterRequest } = await request(app).get(baseUrl).set("Authorization", authorizationToken),
                     isNewTodoListSaved = todolistListAfterRequest.some(todolist => todolist.id === newTodoList.id);

                  expect(isNewTodoListSaved).toBeTruthy();
               });

               it("should return a name property with the same value as the one passed", () => {
                  expect(response.body.name).toBe(testTodoListData.name);
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
                  const testTodoListData = {};
                  let response;

                  beforeAll(async () => {
                     const { token: authorizationToken } = userData;
                     response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testTodoListData);
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
                     const testTodoListData = {
                        name: "X"
                     };

                     let response;

                     beforeAll(async () => {
                        const { token: authorizationToken } = userData;
                        response = await request(app).post(baseUrl).set("Authorization", authorizationToken).send(testTodoListData);
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
});