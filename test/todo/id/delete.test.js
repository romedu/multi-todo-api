const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl, createTodoIdUrl, createTodoListIdUrl } = require("../../urls");

describe("DELETE /todoList/:id/todo/:todoId", () => {
	let testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "todoIdDeleteTestUser",
				password: "todoIdDeleteTestPw"
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
		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid todo id", () => {
		let testTodo, baseUrl;

		beforeAll(async () => {
			const testTodoData = {
					description: "Test todo description"
				},
				todoBaseUrl = createTodoUrl(testTodoList._id),
				newTodoResponse = await request(app)
					.post(todoBaseUrl)
					.set("Authorization", authorizationToken)
					.send(testTodoData);

			testTodo = newTodoResponse.body;
			baseUrl = createTodoIdUrl(testTodoList._id, testTodo._id);
		});

		describe("Unauthorized requests", () => {
			describe("Not passing any auth token", () => {
				describe("Delete request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).delete(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let invalidAuthToken;

				beforeAll(async () => {
					const intruderUserCredentials = {
							username: "todoIdDeleteTestUser2",
							password: "todoIdDeleteTestPw2"
						},
						newIntruderTestUser = await createTestUser(intruderUserCredentials);

					invalidAuthToken = newIntruderTestUser.token;
				});

				describe("Delete request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app)
							.delete(baseUrl)
							.set("Authorization", invalidAuthToken);

						expect(response.status).toBe(401);
						done();
					});
				});
			});
		});

		describe("Authorized requests", () => {
			describe("Delete request", () => {
				let response;

				beforeAll(async () => {
					response = await request(app)
						.delete(baseUrl)
						.set("Authorization", authorizationToken);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return a success message", () => {
					expect(response.body.message).toBeDefined();
				});

				it("should remove the resource", async done => {
					const todoQueryResponse = await request(app)
						.get(baseUrl)
						.set("Authorization", authorizationToken);

					expect(todoQueryResponse.status).toBe(404);
					done();
				});

				it("should remove the todo from the corresponding todoList", async done => {
					const todoListQueryUrl = createTodoListIdUrl(testTodoList._id),
						{ body: newTodo } = response,
						{ body: todoListAfterRequest } = await request(app)
							.get(todoListQueryUrl)
							.set("Authorization", authorizationToken),
						isNewTodoRemoved = todoListAfterRequest.todos.every(todo => todo._id !== newTodo._id);

					expect(isNewTodoRemoved).toBeTruthy();
					done();
				});
			});
		});
	});

	describe("Requesting an invalid todo id", () => {
		let baseUrl;

		beforeAll(() => {
			baseUrl = createTodoIdUrl(testTodoList._id, "invalidID123");
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
});
