const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("TodoList routes", () => {
	const rootUrl = "/api/todos";

	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listTestUsername4",
				password: "listTestPassword4"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("/todos/:id/download", () => {
		describe("Requesting a valid todolist id", () => {
			let baseUrl;

			beforeAll(async () => {
				const testTodoListData = {
						name: "todolistName"
					},
					newTodoListResponse = await request(app)
						.post(rootUrl)
						.set("Authorization", authorizationToken)
						.send(testTodoListData);

				baseUrl = `${rootUrl}/${newTodoListResponse.body._id}/download`;
			});

			describe("Authorized requests", () => {
				describe("Get request", () => {
					it("should return a status of 200", async done => {
						const response = await request(app)
							.get(baseUrl)
							.set("Authorization", authorizationToken);

						expect(response.status).toBe(200);
						done();
					});
				});

				describe("Post request", () => {
					it("should return a status of 404", async done => {
						const response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken);

						expect(response.status).toBe(404);
						done();
					});
				});

				describe("Patch request", () => {
					it("should return a status of 404", async done => {
						const response = await request(app)
							.patch(baseUrl)
							.set("Authorization", authorizationToken);

						expect(response.status).toBe(404);
						done();
					});
				});

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
				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).get(baseUrl);

						expect(response.status).toBe(401);
						done();
					});
				});

				describe("Post request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).post(baseUrl);

						expect(response.status).toBe(401);
						done();
					});
				});

				describe("Patch request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).patch(baseUrl);

						expect(response.status).toBe(401);
						done();
					});
				});

				describe("Delete request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).delete(baseUrl);

						expect(response.status).toBe(401);
						done();
					});
				});
			});
		});

		describe("Requesting an invalid todolist id", () => {
			const baseUrl = `${rootUrl}/invalidID123/download`;

			describe("Get request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.get(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Post request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.post(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

			describe("Patch request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.patch(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});

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
	});
});
