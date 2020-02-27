const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl } = require("../../urls");

describe("DELETE /todoList", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listDeleteTestUser",
				password: "listDeleteTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Authorized requests", () => {
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
		describe("Delete request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).delete(todoListBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
