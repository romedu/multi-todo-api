const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("Folder routes", () => {
	describe("/folder", () => {
		const baseUrl = "/api/folder",
			folderObjectSchema = {
				_id: expect.any(String),
				name: expect.any(String),
				files: expect.any(Array),
				creator: expect.any(String)
			};

		let userData, authorizationToken;

		beforeAll(async () => {
			const testUserCredentials = {
				username: "folderTestUsername",
				password: "folderTestPassword"
			};

			userData = await createTestUser(testUserCredentials);
			authorizationToken = userData.token;
		});

		describe("Authorized requests", () => {
			describe("Get request", () => {
				const paginatedFoldersSchema = {
					docs: expect.any(Array),
					total: expect.any(Number),
					limit: expect.any(Number)
				};

				describe("Passing a valid limit query param", () => {
					const queryParams = { limit: 10 };

					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(baseUrl)
							.query(queryParams)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a paginated folders object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(paginatedFoldersSchema)
						);
					});

					it("should return with a limit property with the same value as the one passed", () => {
						expect(response.body.limit).toBe(queryParams.limit);
					});
				});

				describe("Passing an invalid limit query param", () => {
					const queryParams = { limit: "invalid limit" };

					let response;

					beforeAll(async () => {
						response = await request(app)
							.get(baseUrl)
							.query(queryParams)
							.set("Authorization", authorizationToken);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a paginated folders object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(paginatedFoldersSchema)
						);
					});

					it("should return with a limit property equal to it's default value", () => {
						expect(response.body.limit).not.toBe(queryParams.limit);
					});
				});
			});

			describe("Post request", () => {
				describe("Sending valid data", () => {
					const testFolderData = {
						name: "testFolderName",
						description: "Test folder description"
					};

					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken)
							.send(testFolderData);
					});

					it("should return a status of 201", () => {
						expect(response.status).toBe(201);
					});

					it("should return a folder object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(folderObjectSchema)
						);
					});

					it("should save the new folder", async () => {
						const { body: newFolder } = response,
							findFolderUrl = `${baseUrl}/${newFolder._id}`,
							newFolderQueryResponse = await request(app)
								.get(findFolderUrl)
								.set("Authorization", authorizationToken);

						expect(newFolderQueryResponse.status).toEqual(200);
					});

					it("should return a name property with the same value as the one passed", () => {
						expect(response.body.name).toBe(testFolderData.name);
					});

					it("should return a description property with the same value as the one passed", () => {
						expect(response.body.description).toBe(
							testFolderData.description
						);
					});

					it("should return a files property as an empty array", () => {
						expect(response.body.files).toEqual([]);
					});

					it("should return a creator property with the same value as the current user id", () => {
						expect(response.body.creator).toBe(userData.id);
					});

					it("should not return an errors property", () => {
						expect(response.body.errors).toBeUndefined();
					});
				});

				describe("Sending invalid data", () => {
					describe("Passing none of the inputs", () => {
						const testFolderData = {};
						let response;

						beforeAll(async () => {
							response = await request(app)
								.post(baseUrl)
								.set("Authorization", authorizationToken)
								.send(testFolderData);
						});

						it("should return a status of 422", () => {
							expect(response.status).toBe(422);
						});

						it("should return an errors property with at least one element", () => {
							const errors = response.body.errors || [];
							expect(errors.length).toBeGreaterThanOrEqual(1);
						});
					});

					describe("Sending one of the inputs invalid", () => {
						describe("Passing the name input invalid", () => {
							const testFolderData = {
								name: "X"
							};

							let response;

							beforeAll(async () => {
								response = await request(app)
									.post(baseUrl)
									.set("Authorization", authorizationToken)
									.send(testFolderData);
							});

							it("should return a status of 422", () => {
								expect(response.status).toBe(422);
							});

							it("should return an errors property with at least one element", () => {
								const errors = response.body.errors || [];
								expect(errors.length).toBeGreaterThanOrEqual(1);
							});
						});

						describe("Passing the description input invalid", () => {
							const testFolderData = {
								name: "folderName",
								description:
									"123456789123456789123456789123456789456123456789456123456789123456789123456789123456789456123456789456"
							};

							let response;

							beforeAll(async () => {
								response = await request(app)
									.post(baseUrl)
									.set("Authorization", authorizationToken)
									.send(testFolderData);
							});

							it("should return a status of 422", () => {
								expect(response.status).toBe(422);
							});

							it("should return an errors property with at least one element", () => {
								const errors = response.body.errors || [];
								expect(errors.length).toBeGreaterThanOrEqual(1);
							});
						});
					});

					describe("Sending both of the inputs invalid", () => {
						const testFolderData = {
							name: "X",
							description:
								"123456789123456789123456789123456789456123456789456123456789123456789123456789123456789456123456789456"
						};

						let response;

						beforeAll(async () => {
							response = await request(app)
								.post(baseUrl)
								.set("Authorization", authorizationToken)
								.send(testFolderData);
						});

						it("should return a status of 422", () => {
							expect(response.status).toBe(422);
						});

						it("should return an errors property with at least two elements", () => {
							const errors = response.body.errors || [];
							expect(errors.length).toBeGreaterThanOrEqual(2);
						});
					});
				});
			});

			describe("Put request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.put(baseUrl)
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
});
