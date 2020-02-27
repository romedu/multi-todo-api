const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl, createTodoIdUrl } = require("../../urls");

describe("GET /todoList/:id/todo/:todoId", () => {
	const todoObjectSchema = {
		_id: expect.any(String),
		description: expect.any(String),
		checked: expect.any(Boolean)
	};

	let testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "todoIdGetTestUser",
				password: "todoIdGetTestPw"
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
				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).get(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let invalidAuthToken;

				beforeAll(async () => {
					const intruderUserCredentials = {
							username: "todoIdGetTestUser2",
							password: "todoIdGetTestPw2"
						},
						newIntruderTestUser = await createTestUser(intruderUserCredentials);

					invalidAuthToken = newIntruderTestUser.token;
				});

				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app)
							.get(baseUrl)
							.set("Authorization", invalidAuthToken);

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
					response = await request(app)
						.get(baseUrl)
						.set("Authorization", authorizationToken);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return a todo object", () => {
					expect(response.body).toEqual(expect.objectContaining(todoObjectSchema));
				});
			});
		});
	});

	describe("Requesting an invalid todo id", () => {
		let baseUrl;

		beforeAll(() => {
			baseUrl = createTodoIdUrl(testTodoList._id, "invalidID123");
		});

		describe("Get request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.get(baseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
