const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl } = require("../../urls");

describe("PATCH /todos/:id/todo", () => {
	let baseUrl, testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "TodoPatchTestUser",
				password: "TodoPatchTestPw"
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

	describe("Unauthorized requests", () => {
		describe("Patch request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).patch(baseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
