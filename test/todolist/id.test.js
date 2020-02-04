const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("TodoList routes", () => {
	describe("/todos/:id", () => {
		const rootUrl = "/api/todos",
			folderRootUrl = "/api/folder",
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
				testFolderData = {
					name: "listContainer"
				},
				newTestFolderResponse = await request(app)
					.post(folderRootUrl)
					.set("Authorization", newTestUser.token)
					.send(testFolderData),
				testTodoListData = {
					name: "todolistName",
					container: newTestFolderResponse.body._id
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
						describe("Not updating the container property", () => {
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

						describe("Updating the container property", () => {
							describe("Updating from one container to another", () => {
								const updateData = {
									container: null
								};

								let response;

								beforeAll(async () => {
									const testFolderData = {
											name: "listContainer2"
										},
										newTestFolderResponse = await request(app)
											.post(folderRootUrl)
											.set("Authorization", authorizationToken)
											.send(testFolderData);

									updateData.container =
										newTestFolderResponse.body._id;
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

								it("should remove the todoList from the old container's files", async done => {
									const oldFolderContainerQueryUrl = `/api/folder/${testTodoList.container}`,
										oldFolderResponse = await request(app)
											.get(oldFolderContainerQueryUrl)
											.set("Authorization", authorizationToken),
										isTodoListPulled = oldFolderResponse.body.files.every(
											todoList => todoList._id !== testTodoList._id
										);

									expect(isTodoListPulled).toBe(true);
									done();
								});

								it("should add the todoList to the new container's files", async done => {
									const newFolderContainerQueryUrl = `/api/folder/${updateData.container}`,
										newFolderResponse = await request(app)
											.get(newFolderContainerQueryUrl)
											.set("Authorization", authorizationToken),
										isTodoListAdded = newFolderResponse.body.files.some(
											todoList => todoList._id === testTodoList._id
										);

									expect(isTodoListAdded).toBe(true);
									done();
								});
							});

							describe("Updating from one container to none", () => {
								const updateData = {
									container: null
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

								it("should remove the todoList from the old container's files", async done => {
									const oldFolderContainerQueryUrl = `/api/folder/${testTodoList.container}`,
										oldFolderResponse = await request(app)
											.get(oldFolderContainerQueryUrl)
											.set("Authorization", authorizationToken),
										isTodoListPulled = oldFolderResponse.body.files.every(
											todoList => todoList._id !== testTodoList._id
										);

									expect(isTodoListPulled).toBe(true);
									done();
								});
							});

							describe("Updating from none to one container", () => {
								const updateData = {
									container: null
								};

								let response;

								beforeAll(async () => {
									const testFolderData = {
											name: "listContainer3"
										},
										newTestFolderResponse = await request(app)
											.post(folderRootUrl)
											.set("Authorization", authorizationToken)
											.send(testFolderData);

									updateData.container =
										newTestFolderResponse.body._id;
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

								it("should add the todoList to the new container's files", async done => {
									const newFolderContainerQueryUrl = `/api/folder/${updateData.container}`,
										newFolderResponse = await request(app)
											.get(newFolderContainerQueryUrl)
											.set("Authorization", authorizationToken),
										isTodoListAdded = newFolderResponse.body.files.some(
											todoList => todoList._id === testTodoList._id
										);

									expect(isTodoListAdded).toBe(true);
									done();
								});
							});
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

					it("should pull the todoList from it's containing folder files", async done => {
						const folderContainerQueryUrl = `/api/folder/${testTodoList.container}`,
							{ body: folderContainer } = await request(app)
								.get(folderContainerQueryUrl)
								.set("Authorization", authorizationToken),
							isTodoListPulled = folderContainer.files.every(
								todoList => todoList._id !== testTodoList._id
							);

						expect(isTodoListPulled).toBe(true);
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
