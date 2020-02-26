const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl, todoListBaseUrl, createFolderIdUrl, createTodoListIdUrl } = require("../../urls");

describe("DELETE /folder/:id", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "folderIdDeleteTestUser",
				password: "folderIdDeleteTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid folder id", () => {
		let testFolder, baseUrl;

		beforeAll(async () => {
			const testFolderData = {
					name: "folderIdDeleteName",
					description: "Test delete folder description"
				},
				newFolderResponse = await request(app)
					.post(folderBaseUrl)
					.set("Authorization", authorizationToken)
					.send(testFolderData);

			testFolder = newFolderResponse.body;
			baseUrl = createFolderIdUrl(testFolder._id);
		});

		describe("Unauthorized requests", () => {
			describe("Not passing any auth token", () => {
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
						username: "folderIdDeleteTestUser2",
						password: "folderIdDeleteTestPw2"
					};

					intruderUserData = await createTestUser(intruderUserCredentials);
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
			describe("Delete request", () => {
				describe("Passing the keep query param as true", () => {
					let response, testTodoListId;

					beforeAll(async () => {
						const testTodoListData = {
								name: "testFolderIdDeleteList",
								container: testFolder._id
							},
							testTodoList = await request(app)
								.post(todoListBaseUrl)
								.set("Authorization", authorizationToken)
								.send(testTodoListData);

						testTodoListId = testTodoList.body._id;
						response = await request(app)
							.delete(baseUrl)
							.query({ keep: true })
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

					it("should keep the todoLists contained in the folder", async done => {
						const testListQueryUrl = createTodoListIdUrl(testTodoListId);
						testListQueryResponse = await request(app)
							.get(testListQueryUrl)
							.set("Authorization", authorizationToken);

						expect(testListQueryResponse.status).toBe(200);
						done();
					});
				});

				describe("Not passing the keep query param", () => {
					let response, testTodoListId;

					beforeAll(async () => {
						const testFolderData = {
								name: "folderIdDeleteName2"
							},
							testFolderResponse = await request(app)
								.post(folderBaseUrl)
								.set("Authorization", authorizationToken)
								.send(testFolderData),
							testTodoListData = {
								name: "testFolderIdDeleteList2",
								container: testFolderResponse.body._id
							},
							testTodoList = await request(app)
								.post(todoListBaseUrl)
								.set("Authorization", authorizationToken)
								.send(testTodoListData),
							deleteTestKeepFolderIdUrl = createFolderIdUrl(testFolderResponse.body._id);

						testTodoListId = testTodoList.body._id;
						response = await request(app)
							.delete(deleteTestKeepFolderIdUrl)
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

					it("should remove the todoLists contained in the folder", async done => {
						const testTodoListQueryUrl = createTodoListIdUrl(testTodoListId),
							testListQueryResponse = await request(app)
								.post(testTodoListQueryUrl)
								.set("Authorization", authorizationToken);

						expect(testListQueryResponse.status).toBe(404);
						done();
					});
				});
			});
		});
	});

	describe("Requesting an invalid folder id", () => {
		const baseUrl = createFolderIdUrl("invalidID123");

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
