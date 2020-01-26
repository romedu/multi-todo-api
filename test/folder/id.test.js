const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("Folder routes", () => {
	describe("/folder/:id", () => {
		const folderObjectSchema = {
			_id: expect.any(String),
			name: expect.any(String),
			files: expect.any(Array),
			creator: expect.any(String)
		};

		let authorizationToken;

		beforeAll(async () => {
			const testUserCredentials = {
					username: "folderTestUsername2",
					password: "folderTestPassword2"
				},
				newTestUser = await createTestUser(testUserCredentials);

			authorizationToken = newTestUser.token;
		});

		describe("Requesting a valid folder id", () => {
			let testFolder, baseUrl;

			beforeAll(async () => {
				const rootUrl = "/api/folder",
					testFolderData = {
						name: "folderName",
						description: "Test folder description"
					},
					newFolderResponse = await request(app)
						.post(rootUrl)
						.set("Authorization", authorizationToken)
						.send(testFolderData);

				testFolder = newFolderResponse.body;
				baseUrl = `/api/folder/${testFolder._id}`;
			});

			describe("Unauthorized requests", () => {
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

				describe("Using a different user's auth token", () => {
					let intruderUserData;

					beforeAll(async () => {
						const intruderUserCredentials = {
							username: "folderTestUsername3",
							password: "folderTestPassword3"
						};

						intruderUserData = await createTestUser(
							intruderUserCredentials
						);
					});

					describe("Get request", () => {
						it("should return a status of 401", async done => {
							const { token: invalidAuthToken } = intruderUserData,
								response = await request(app)
									.get(baseUrl)
									.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Post request", () => {
						it("should return a status of 401", async done => {
							const { token: invalidAuthToken } = intruderUserData,
								response = await request(app)
									.post(baseUrl)
									.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Patch request", () => {
						it("should return a status of 401", async done => {
							const { token: invalidAuthToken } = intruderUserData,
								response = await request(app)
									.patch(baseUrl)
									.set("Authorization", invalidAuthToken);

							expect(response.status).toBe(401);
							done();
						});
					});

					describe("Delete request", () => {
						it("should return a status of 401", async done => {
							const { token: invalidAuthToken } = intruderUserData,
								response = await request(app)
									.delete(baseUrl)
									.set("Authorization", invalidAuthToken);

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

					it("should return a folder object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(folderObjectSchema)
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

						it("should return the folder with the updated data", () => {
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

						it("should not return the folder with the updated data", () => {
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
						const folderQueryResponse = await request(app)
							.get(baseUrl)
							.set("Authorization", authorizationToken);
						expect(folderQueryResponse.status).toBe(404);
						done();
					});
				});
			});
		});

		describe("Requesting an invalid folder id", () => {
			const baseUrl = "/api/folder/invalidID123";

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