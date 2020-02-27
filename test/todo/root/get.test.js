const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl } = require("../../urls");

describe("GET /todos/:id/todo", () => {
	let baseUrl, testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "TodoGetTestUser",
				password: "TodoGetTestPw"
			},
			testTodoListData = {
				name: "todoListName"
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
	});

	describe("Unauthorized requests", () => {
		describe("Get request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).get(baseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
