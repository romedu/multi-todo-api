const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities"),
	{ todoListBaseUrl, createTodoListIdUrl } = require("../urls");

describe("TodoList routes", () => {
	describe("/todoList", () => {
		const todolistObjectSchema = {
			_id: expect.any(String),
			name: expect.any(String),
			todos: expect.any(Array),
			creator: expect.any(String)
		};

		let userData, authorizationToken;

		beforeAll(async () => {
			const testUserCredentials = {
					username: "listTestUsername",
					password: "listTestPassword"
				},
				newTestUser = await createTestUser(testUserCredentials);

			userData = newTestUser;
			authorizationToken = newTestUser.token;
		});

		describe("Authorized requests", () => {
			describe("Get request", () => {
				const paginatedTodoListSchema = {
					docs: expect.any(Array),
					total: expect.any(Number),
					limit: expect.any(Number)
				};

				describe("Passing a valid limit query param", () => {
					const queryParams = { limit: 10 };

					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(todoListBaseUrl)
							.query(queryParams)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a paginated todoLsit object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(paginatedTodoListSchema)
						);
					});

					it("should return with a limit property with the same value as the one passed", () => {
						expect(response.body.limit).toBe(queryParams.limit);
					});
				});

				describe("Passing an invalid limit query param", () => {
					const queryParams = { limit: "invalid limit" };

					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(todoListBaseUrl)
							.query(queryParams)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a paginated todoLsit object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(paginatedTodoListSchema)
						);
					});

					it("should return with a limit property equal to it's default value", () => {
						expect(response.body.limit).not.toBe(queryParams.limit);
					});
				});
			});

			describe("Post request", () => {
				describe("Sending valid data", () => {
					const testTodoListData = {
						name: "testListName"
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(todoListBaseUrl)
							.set("Authorization", authorizationToken)
							.send(testTodoListData);
					});

					it("should return a status of 201", () => {
						expect(response.status).toBe(201);
					});

					it("should return a todolist object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(todolistObjectSchema)
						);
					});

					it("should save the new todolist", async () => {
						const { body: newTodoList } = response,
							testTodoListQueryUrl = createTodoListIdUrl(
								newTodoList._id
							),
							newTodoListQueryResponse = await request(app)
								.get(testTodoListQueryUrl)
								.set("Authorization", authorizationToken);

						expect(newTodoListQueryResponse.status).toEqual(200);
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
							response = await request(app)
								.post(todoListBaseUrl)
								.set("Authorization", authorizationToken)
								.send(testTodoListData);
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
								response = await request(app)
									.post(todoListBaseUrl)
									.set("Authorization", authorizationToken)
									.send(testTodoListData);
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
					const response = await request(app)
						.put(todoListBaseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Patch request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.patch(todoListBaseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Delete request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.delete(todoListBaseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});
		});

		describe("Unauthorized requests", () => {
			describe("Get request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).get(todoListBaseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});

			describe("Post request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).post(todoListBaseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});

			describe("Patch request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).patch(todoListBaseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});

			describe("Delete request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).delete(todoListBaseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});
		});
	});
});
