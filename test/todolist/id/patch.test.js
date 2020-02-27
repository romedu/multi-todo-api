const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	urls = require("../../urls");

describe("PATCH /todoList/:id", () => {
	let authorizationToken, testTodoList, baseUrl;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listIdPatchTestUser",
				password: "listIdPatchTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials),
			testFolderData = {
				name: "listTestContainer"
			},
			newTestFolderResponse = await request(app)
				.post(urls.folderBaseUrl)
				.set("Authorization", newTestUser.token)
				.send(testFolderData),
			testTodoListData = {
				name: "todolistName",
				container: newTestFolderResponse.body._id
			},
			newTodoListResponse = await request(app)
				.post(urls.todoListBaseUrl)
				.set("Authorization", newTestUser.token)
				.send(testTodoListData);

		authorizationToken = newTestUser.token;
		testTodoList = newTodoListResponse.body;
		baseUrl = urls.createTodoListIdUrl(testTodoList._id);
	});

	describe("Requesting a valid todolist id", () => {
		describe("Unauthorized requests", () => {
			describe("Using a different user's auth token", () => {
				let invalidAuthToken;

				beforeAll(async () => {
					const intruderUserCredentials = {
							username: "listIdPatchTestUser2",
							password: "listIdPatchTestPw2"
						},
						newIntruderTestUser = await createTestUser(intruderUserCredentials);

					invalidAuthToken = newIntruderTestUser.token;
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
			});

			describe("Not passing any auth token", () => {
				describe("Patch request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).patch(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});
		});

		describe("Authorized requests", () => {
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
										.post(urls.folderBaseUrl)
										.set("Authorization", authorizationToken)
										.send(testFolderData);

								updateData.container = newTestFolderResponse.body._id;
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
								const oldFolderContainerQueryUrl = urls.createFolderIdUrl(testTodoList.container),
									oldFolderQueryResponse = await request(app)
										.get(oldFolderContainerQueryUrl)
										.set("Authorization", authorizationToken),
									isTodoListPulled = oldFolderQueryResponse.body.files.every(
										todoList => todoList._id !== testTodoList._id
									);

								expect(isTodoListPulled).toBe(true);
								done();
							});

							it("should add the todoList to the new container's files", async done => {
								const newFolderContainerQueryUrl = urls.createFolderIdUrl(updateData.container),
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
								const oldFolderContainerQueryUrl = urls.createFolderIdUrl(testTodoList.container),
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
										.post(urls.folderBaseUrl)
										.set("Authorization", authorizationToken)
										.send(testFolderData);

								updateData.container = newTestFolderResponse.body._id;
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
								const newFolderContainerQueryUrl = urls.createFolderIdUrl(updateData.container),
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
		});
	});

	describe("Requesting an invalid todolist id", () => {
		const baseUrl = urls.createTodoListIdUrl("invalidID123");

		describe("Patch request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.patch(baseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
