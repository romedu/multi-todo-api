const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl, createTodoIdUrl } = require("../../urls");

describe("PATCH /todoList/:id/todo/:todoId", () => {
	let testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "todoIdPatchTestUser",
				password: "todoIdPatchTestPw"
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
				describe("Patch request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).patch(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let invalidAuthToken;

				beforeAll(async () => {
					const intruderUserCredentials = {
							username: "todoIdPatchTestUser2",
							password: "todoIdPatchTestPw2"
						},
						newIntruderTestUser = await createTestUser(intruderUserCredentials);

					invalidAuthToken = newIntruderTestUser.token;
				});

				describe("Patch request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app)
							.patch(baseUrl)
							.set("Authorization", invalidAuthToken);

						expect(response.status).toBe(401);
						done();
					});
				});
			});
		});

		describe("Authorized requests", () => {
			describe("Patch request", () => {
				describe("Sending valid data", () => {
					const updateData = {
						description: "Updated description"
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.patch(baseUrl)
							.set("Authorization", authorizationToken)
							.send(updateData);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return the todo with the updated data", () => {
						expect(response.body).toMatchObject(updateData);
					});
				});

				describe("Sending invalid data", () => {
					const updateData = {
						description: ""
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.patch(baseUrl)
							.set("Authorization", authorizationToken)
							.send(updateData);
					});

					it("should return a status of 422", () => {
						expect(response.status).toBe(422);
					});

					it("should return an errors property with at least one element", () => {
						const errors = response.body.errors || [];
						expect(errors.length).toBeGreaterThanOrEqual(1);
					});

					it("should not return the todo with the updated data", () => {
						expect(response.body).not.toMatchObject(updateData);
					});
				});
			});
		});
	});

	describe("Requesting an invalid todo id", () => {
		let baseUrl;

		beforeAll(() => {
			baseUrl = createTodoIdUrl(testTodoList._id, "invalidID123");
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
	});
});
