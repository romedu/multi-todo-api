const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities"),
	{ loginBaseUrl } = require("../urls");

describe("Auth routes", () => {
	describe("Login route", () => {
		describe("Get request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).get(loginBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Put request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).put(loginBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).patch(loginBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Delete request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).delete(loginBaseUrl);
				expect(response.status).toBe(404);
				done();
			});
		});

		describe("Post request", () => {
			const testUserData = {
				username: "loginTestUsername",
				password: "loginTestPassword"
			};

			beforeAll(async () => {
				await createTestUser(testUserData);
			});

			describe("Sending valid data", () => {
				let response;

				beforeAll(async () => {
					response = await request(app)
						.post(loginBaseUrl)
						.send(testUserData);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return an username property with the same value as the one passed", () => {
					const { body: responseBody } = response;
					expect(responseBody.username).toBe(testUserData.username);
				});

				it("should return an user object", () => {
					const userObject = {
						username: expect.any(String),
						token: expect.any(String),
						id: expect.any(String),
						tokenExp: expect.any(Number)
					};

					expect(response.body).toEqual(
						expect.objectContaining(userObject)
					);
				});
			});

			describe("Sending invalid data", () => {
				describe("Sending one of the inputs invalid", () => {
               describe("Passing a non-existent username", () => {
                  let response;

                  beforeAll(async () => {
							const invalidUserData = {
								...testUserData,
								username: "inexistentUsername"
							};

							response = await request(app)
								.post(loginBaseUrl)
								.send(invalidUserData);
                  });
                  
                  it("should return a status of 401", () => {
							expect(response.status).toBe(401);
						});
               });

               describe("Passing an incorrect password", () => {
                  let response;

                  beforeAll(async () => {
							const invalidUserData = {
								...testUserData,
								password: "incorrectPassword"
							};

							response = await request(app)
								.post(loginBaseUrl)
								.send(invalidUserData);
                  });
                  
                  it("should return a status of 401", () => {
							expect(response.status).toBe(401);
						});
               });

					describe("Passing an invalid username", () => {
						let response;

						beforeAll(async () => {
							const invalidUserData = {
								...testUserData,
								username: "Invalid Username"
							};

							response = await request(app)
								.post(loginBaseUrl)
								.send(invalidUserData);
						});

						it("should return a status of 422", () => {
							expect(response.status).toBe(422);
						});
					});

					describe("Passing an invalid password", () => {
						let response;

						beforeAll(async () => {
							const invalidUserData = {
								...testUserData,
								password: "Invalid Password, way too long"
							};

							response = await request(app)
								.post(loginBaseUrl)
								.send(invalidUserData);
						});

						it("should return a status of 422", () => {
							expect(response.status).toBe(422);
						});
					});
				});

				describe("Passing both inputs invalid", () => {
					const invalidUserData = {
						username: "Invalid Username",
						password: "Invalid Password, way too long"
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(loginBaseUrl)
							.send(invalidUserData);
					});

					it("should return a status of 422", () => {
						expect(response.status).toBe(422);
					});
				});
			});
		});
	});
});
