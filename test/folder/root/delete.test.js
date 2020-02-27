const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl } = require("../../urls");

describe("DELETE /folder", () => {
	let userData, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
			username: "folderDeleteTestUser",
			password: "folderDeleteTestPw"
		};

		userData = await createTestUser(testUserCredentials);
		authorizationToken = userData.token;
	});

	describe("Authorized requests", () => {
		describe("Delete request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.delete(folderBaseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});

	describe("Unauthorized requests", () => {
		describe("Delete request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).delete(folderBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
