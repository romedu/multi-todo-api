const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities"),
	{ verifyBaseUrl } = require("../urls");

describe("Auth routes", () => {
	describe("Verify route", () => {
		describe("Get request", () => {
			describe("Authenticated request", () => {
				let userData;

				beforeAll(async () => {
					const testUserData = {
						username: "verifyTestUsername",
						password: "verifyTestPassword"
					};

					userData = await createTestUser(testUserData);
				});

				describe("Passing a valid auth token", () => {
					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(verifyBaseUrl)
							.set("Authorization", userData.token);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a simple user object", () => {
						const userObject = {
							username: expect.any(String),
							id: expect.any(String)
						};

						expect(response.body).toEqual(
							expect.objectContaining(userObject)
						);
					});
				});

				describe("Passing an invalid auth token", () => {
					let response;

					beforeAll(async () => {
						const invalidAuthToken = userData.token.substring(1);
						response = await request(app)
							.get(verifyBaseUrl)
							.set("Authorization", invalidAuthToken);
					});

					it("should return a status of 403", () => {
						expect(response.status).toBe(403);
					});
				});
			});

			describe("Unauthenticated request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).get(verifyBaseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});
		});

		describe("Post request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).post(verifyBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Put request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).put(verifyBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).patch(verifyBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Delete request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).delete(verifyBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
