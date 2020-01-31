const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("Auth routes", () => {
	describe("Verify route", () => {
		const baseUrl = "/api/auth/verify";

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
							.get(baseUrl)
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
							.get(baseUrl)
							.set("Authorization", invalidAuthToken);
					});

					it("should return a status of 403", () => {
						expect(response.status).toBe(403);
					});
				});
			});

			describe("Unauthenticated request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).get(baseUrl);
					expect(response.status).toBe(401);
					done();
				});
			});
		});

		describe("Post request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).post(baseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Put request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).put(baseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).patch(baseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Delete request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).delete(baseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
