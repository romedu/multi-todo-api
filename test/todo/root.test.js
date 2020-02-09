const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities"),
	{ todoListBaseUrl, createTodoUrl, createTodoListIdUrl } = require("../urls");

describe("Todo routes", () => {
	describe("/todos/:id/todo", () => {
		const todoObjectSchema = {
			_id: expect.any(String),
			description: expect.any(String),
			checked: expect.any(Boolean)
		};

		let baseUrl, testTodoList, authorizationToken;

		beforeAll(async () => {
			const testUserCredentials = {
					username: "todoTestUsername",
					password: "todoTestPassword"
				},
				testTodoListData = {
					name: "todoListName3"
				},
				newTestUser = await createTestUser(testUserCredentials),
				newTodoListResponse = await request(app)
					.post(todoListBaseUrl)
					.set("Authorization", newTestUser.token)
					.send(testTodoListData);

			testTodoList = newTodoListResponse.body;
			baseUrl = createTodoUrl(testTodoList._id);
			authorizationToken = newTestUser.token;
		});

		describe("Authorized requests", () => {
			describe("Get request", () => {
				let response;

				beforeAll(async () => {
					response = await request(app)
						.get(baseUrl)
						.set("Authorization", authorizationToken);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return an array of todos", () => {
					const { body: todos } = response;
					expect(todos).toBeInstanceOf(Array);
				});
			});

			describe("Post request", () => {
				describe("Sending valid data", () => {
					const testTodoData = {
						description: "Test todo description",
						checked: true
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken)
							.send(testTodoData);
					});

					it("should return a status of 201", () => {
						expect(response.status).toBe(201);
					});

					it("should return a todo object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(todoObjectSchema)
						);
					});

					it("should save the new todo", async () => {
						const { body: newTodo } = response,
							{ body: todosAfterRequest } = await request(app)
								.get(baseUrl)
								.set("Authorization", authorizationToken),
							isNewTodoSaved = todosAfterRequest.some(
								todo => todo.id === newTodo.id
							);

						expect(isNewTodoSaved).toBeTruthy();
					});

					it("should add the new todo to the corresponding todoList", async () => {
						const todoListQueryUrl = createTodoListIdUrl(
								testTodoList._id
							),
							{ body: newTodo } = response,
							{ body: todoListAfterRequest } = await request(app)
								.get(todoListQueryUrl)
								.set("Authorization", authorizationToken),
							isNewTodoSaved = todoListAfterRequest.todos.some(
								todo => todo.id === newTodo.id
							);

						expect(isNewTodoSaved).toBeTruthy();
					});

					it("should return a description property with the same value as the one passed", () => {
						expect(response.body.description).toBe(
							testTodoData.description
						);
					});

					it("should return a checked property with the same value as the one passed", () => {
						expect(response.body.checked).toBe(testTodoData.checked);
					});

					it("should not return an errors property", () => {
						expect(response.body.errors).toBeUndefined();
					});
				});

				describe("Sending invalid data", () => {
					const testTodoData = {};
					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken)
							.send(testTodoData);
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

			describe("Put request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.put(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Patch request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.patch(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Delete request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.delete(baseUrl)
						.set("Authorization", authorizationToken);

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
