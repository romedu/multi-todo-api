const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoUrl } = require("../../urls");

describe("DELETE /todos/:id/todo", () => {
	let baseUrl, testTodoList, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "TodoDeleteTestUser",
				password: "TodoDeleteTestPw"
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
		describe("Delete request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).delete(baseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
