const request = require("supertest"),
   app = require("../src/app"),
   { createTestUser } = require("./utilities");

describe("TodoList routes", () => {
   const rootUrl = "/api/todos",
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

   describe("/todos", () => {
      const baseUrl = rootUrl;

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

   describe("/todos/:id", () => {
      let authorizationToken,
         testTodoList,
         baseUrl;

      beforeAll(async () => {
         const testTodoListData = {
            name: "todolistName"
         },
            newTodoListResponse = await request(app).post(rootUrl).set("Authorization", userData.token).send(testTodoListData);

         authorizationToken = userData.token;
         testTodoList = newTodoListResponse.body;
         baseUrl = `${rootUrl}/${testTodoList._id}`;
      });

      describe("Requesting a valid todolist id", () => {
         describe("Unauthorized requests", () => {
            describe("Using a different user's auth token", () => {
               let intruderUserData;

               beforeAll(async () => {
                  const intruderUserCredentials = {
                     username: "listTestUsername2",
                     password: "listTestPassword2"
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


         });

         describe("Authorized requests", () => {
            describe("Get request", () => {
               let response;

               beforeAll(async () => {
                  response = await request(app).get(baseUrl).set("Authorization", authorizationToken);
               });

               it("should return a status of 200", () => {
                  expect(response.status).toBe(200);
               });

               it("should return a todolist object", () => {
                  expect(response.body).toEqual(expect.objectContaining(todolistObjectSchema));
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

                  it("should return the todolist with the updated data", () => {
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

                  it("should not return the todolist with the updated data", () => {
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
                  const todolistQueryResponse = await request(app).get(baseUrl).set("Authorization", authorizationToken);
                  expect(todolistQueryResponse.status).toBe(404);
                  done();
               });
            });
         });
      });

      describe("Requesting an invalid todolist id", () => {
         const baseUrl = `${rootUrl}/invalidID123`;

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

   describe("/todos/:id/download", () => {
      describe("Requesting a valid todolist id", () => {
         let authorizationToken,
            baseUrl;

         beforeAll(async () => {
            const testTodoListData = {
               name: "todolistName"
            },
               newTodoListResponse = await request(app).post(rootUrl).set("Authorization", userData.token).send(testTodoListData);

            authorizationToken = userData.token;
            baseUrl = `${rootUrl}/${newTodoListResponse.body._id}/download`;
         });

         describe("Authorized requests", () => {
            describe("Get request", () => {
               it("should return a status of 200", async done => {
                  const response = await request(app).get(baseUrl).set("Authorization", authorizationToken);

                  expect(response.status).toBe(200);
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

      describe("Requesting an invalid todolist id", () => {
         const baseUrl = `${rootUrl}/invalidID123/download`;

         let authorizationToken;

         beforeAll(() => {
            authorizationToken = userData.token;
         });

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