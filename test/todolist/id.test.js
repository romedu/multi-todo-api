const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("TodoList routes", () => {
	describe("/todos/:id", () => {
		const rootUrl = "/api/todos",
			todolistObjectSchema = {
				_id: expect.any(String),
				name: expect.any(String),
				todos: expect.any(Array),
				creator: expect.any(String)
			};

		let authorizationToken, testTodoList, baseUrl;

		beforeAll(async () => {
			const testUserCredentials = {
					username: "listTestUsername2",
					password: "listTestPassword2"
				},
				newTestUser = await createTestUser(testUserCredentials),
				testTodoListData = {
					name: "todolistName"
				},
				newTodoListResponse = await request(app)
					.post(rootUrl)
					.set("Authorization", newTestUser.token)
					.send(testTodoListData);

			authorizationToken = newTestUser.token;
			testTodoList = newTodoListResponse.body;
			baseUrl = `${rootUrl}/${testTodoList._id}`;
		});

		describe("Requesting a valid todolist id", () => {
			describe("Unauthorized requests", () => {
				describe("Using a different user's auth token", () => {
					let invalidAuthToken;

					beforeAll(async () => {
						const intruderUserCredentials = {
								username: "listTestUsername3",
								password: "listTestPassword3"
							},
							newIntruderTestUser = await createTestUser(
								intruderUserCredentials
							);

						invalidAuthToken = newIntruderTestUser.token;
					});

					describe("Get request", () => {
						it("should return a status of 401", async done => {
							const response = await request(app)
								.get(baseUrl)
								.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Post request", () => {
						it("should return a status of 401", async done => {
							const response = await request(app)
								.post(baseUrl)
								.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Patch request", () => {
						it("should return a status of 401", async done => {
							const response = await request(app)
								.patch(baseUrl)
								.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Delete request", () => {
						it("should return a status of 401", async done => {
							const response = await request(app)
								.delete(baseUrl)
								.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});
				});

				describe("Not passing any auth token", () => {
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

			describe("Authorized requests", () => {
				describe("Get request", () => {
					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(baseUrl)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a todolist object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(todolistObjectSchema)
						);
					});
				});

				describe("Post request", () => {
					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 404", () => {
						expect(response.status).toBe(404);
					});
				});

				describe("Patch request", () => {
					describe("Sending valid data", () => {
						const updateData = {
							name: "updatedName"
						};

						let response;

						beforeAll(async () => {
							response = await request(app)
								.patch(baseUrl)
								.set("Authorization", authorizationToken)
								.send(updateData);
						});

						it("should return a status of 200", () => {
							expect(response.status).toBe(200);
						});

						it("should return the todolist with the updated data", () => {
							expect(response.body).toMatchObject(updateData);
						});
					});

					describe("Sending invalid data", () => {
						const updateData = {
							name: "X"
						};

						let response;

						beforeAll(async () => {
							response = await request(app)
								.patch(baseUrl)
								.set("Authorization", authorizationToken)
								.send(updateData);
						});

						it("should return a status of 422", () => {
							expect(response.status).toBe(422);
						});

						it("should return an errors property with at least one element", () => {
							const errors = response.body.errors || [];
							expect(errors.length).toBeGreaterThanOrEqual(1);
						});

						it("should not return the todolist with the updated data", () => {
							expect(response.body).not.toMatchObject(updateData);
						});
					});
				});

				describe("Delete request", () => {
					let response;

					beforeAll(async () => {
						response = await request(app)
							.delete(baseUrl)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a success message", () => {
						expect(response.body.message).toBeDefined();
					});

					it("should remove the resource", async done => {
						const todolistQueryResponse = await request(app)
							.get(baseUrl)
							.set("Authorization", authorizationToken);
						expect(todolistQueryResponse.status).toBe(404);
						done();
					});
				});
			});
		});

		describe("Requesting an invalid todolist id", () => {
			const baseUrl = `${rootUrl}/invalidID123`;

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
