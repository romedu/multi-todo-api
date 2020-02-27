const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl } = require("../../urls");

describe("PATCH /folder", () => {
	let userData, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
			username: "folderPatchTestUser",
			password: "folderPatchTestPw"
		};

		userData = await createTestUser(testUserCredentials);
		authorizationToken = userData.token;
	});

	describe("Authorized requests", () => {
		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.patch(folderBaseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});

	describe("Unauthorized requests", () => {
		describe("Patch request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).patch(folderBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
