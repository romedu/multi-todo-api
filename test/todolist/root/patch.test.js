const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl } = require("../../urls");

describe("PATCH /todoList", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listPatchTestUser",
				password: "listPatchTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Authorized requests", () => {
		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.patch(todoListBaseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});

	describe("Unauthorized requests", () => {
		describe("Patch request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).patch(todoListBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
