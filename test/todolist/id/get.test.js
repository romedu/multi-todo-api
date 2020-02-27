const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	urls = require("../../urls");

describe("GET /todoList/:id", () => {
	const todolistObjectSchema = {
		_id: expect.any(String),
		name: expect.any(String),
		todos: expect.any(Array),
		creator: expect.any(String)
	};

	let authorizationToken, testTodoList, baseUrl;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listIdGetTestUser",
				password: "listIdGetTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials),
			testFolderData = {
				name: "listTestContainer"
			},
			newTestFolderResponse = await request(app)
				.post(urls.folderBaseUrl)
				.set("Authorization", newTestUser.token)
				.send(testFolderData),
			testTodoListData = {
				name: "todolistName",
				container: newTestFolderResponse.body._id
			},
			newTodoListResponse = await request(app)
				.post(urls.todoListBaseUrl)
				.set("Authorization", newTestUser.token)
				.send(testTodoListData);

		authorizationToken = newTestUser.token;
		testTodoList = newTodoListResponse.body;
		baseUrl = urls.createTodoListIdUrl(testTodoList._id);
	});

	describe("Requesting a valid todolist id", () => {
		describe("Unauthorized requests", () => {
			describe("Using a different user's auth token", () => {
				let invalidAuthToken;

				beforeAll(async () => {
					const intruderUserCredentials = {
							username: "listIdGetTestUser2",
							password: "listIdGetTestPw2"
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

			describe("Not passing any auth token", () => {
				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).get(baseUrl);
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

				it("should return a todolist object", () => {
					expect(response.body).toEqual(expect.objectContaining(todolistObjectSchema));
				});
			});
		});
	});

	describe("Requesting an invalid todolist id", () => {
		const baseUrl = urls.createTodoListIdUrl("invalidID123");

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
