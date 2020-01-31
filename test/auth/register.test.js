const request = require("supertest"),
	app = require("../../src/app");

describe("Auth routes", () => {
	describe("Register route", () => {
		const baseUrl = "/api/auth/register";

		describe("Get request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app).get(baseUrl);
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

		describe("Post request", () => {
			const validTestUserData = {
				username: "testUsername",
				password: "testPassword"
			};

			describe("Sending valid data", () => {
				let response;

				beforeAll(async () => {
					response = await request(app)
						.post(baseUrl)
						.send(validTestUserData);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return an username property with the same value as the one passed", () => {
					const { body: responseBody } = response;
					expect(responseBody.username).toBe(validTestUserData.username);
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
					describe("Using a taken username", () => {
						it("should return a status of 409", async done => {
							const response = await request(app)
								.post(baseUrl)
								.send(validTestUserData);
							expect(response.status).toBe(409);
							done();
						});
					});

					describe("Not passing a string as username", () => {
						it("should return a status of 422", async done => {
							const testUserData = {
									...validTestUserData,
									username: 5
								},
								response = await request(app)
									.post(baseUrl)
									.send(testUserData);

							expect(response.status).toBe(422);
							done();
						});
					});

					describe("Passing an invalid string as username", () => {
						it("should return a status of 422", async done => {
							const testUserData = {
									...validTestUserData,
									username: "X"
								},
								response = await request(app)
									.post(baseUrl)
									.send(testUserData);

							expect(response.status).toBe(422);
							done();
						});
					});

					describe("Passing an invalid string as password", () => {
						it("should return a status of 422", async done => {
							const testUserData = {
									...validTestUserData,
									password: "X"
								},
								response = await request(app)
									.post(baseUrl)
									.send(testUserData);

							expect(response.status).toBe(422);
							done();
						});
					});
				});

				describe("Passing both inputs invalid", () => {
					const invalidTestUserData = {
						username: "",
						password: ""
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.send(invalidTestUserData);
					});

					it("should return a status of 422", () => {
						expect(response.status).toBe(422);
					});
				});
			});
		});
	});
});
