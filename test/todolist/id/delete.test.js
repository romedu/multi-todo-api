const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	urls = require("../../urls");

describe("DELETE /todoList/:id", () => {
	let authorizationToken, testTodoList, baseUrl;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listIdDeleteTestUser",
				password: "listIdDeleteTestPw"
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
							username: "listIdDeleteTestUser2",
							password: "listIdDeleteTestPw2"
						},
						newIntruderTestUser = await createTestUser(intruderUserCredentials);

					invalidAuthToken = newIntruderTestUser.token;
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
			describe("Delete request", () => {
				let response, testTodoId;

				beforeAll(async () => {
					const testTodoData = {
							description: "Test todo description"
						},
						todoBaseUrl = urls.createTodoUrl(testTodoList._id),
						testTodoResponse = await request(app)
							.post(todoBaseUrl)
							.set("Authorization", authorizationToken)
							.send(testTodoData);

					testTodoId = testTodoResponse.body._id;
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

				it("should remove the todoList", async done => {
					const todolistQueryResponse = await request(app)
						.get(baseUrl)
						.set("Authorization", authorizationToken);

					expect(todolistQueryResponse.status).toBe(404);
					done();
				});

				it("should pull the todoList from it's containing folder files", async done => {
					const folderContainerQueryUrl = urls.createFolderIdUrl(testTodoList.container),
						{ body: folderContainer } = await request(app)
							.get(folderContainerQueryUrl)
							.set("Authorization", authorizationToken),
						isTodoListPulled = folderContainer.files.every(
							todoList => todoList._id !== testTodoList._id
						);

					expect(isTodoListPulled).toBe(true);
					done();
				});

				it("should remove it's corresponding todos", async done => {
					const testTodoQueryUrl = urls.createTodoIdUrl(testTodoList._id, testTodoId),
						testTodoQueryReponse = await request(app)
							.get(testTodoQueryUrl)
							.set("Authorization", authorizationToken);

					expect(testTodoQueryReponse.status).toBe(404);
					done();
				});
			});
		});
	});

	describe("Requesting an invalid todolist id", () => {
		const baseUrl = urls.createTodoListIdUrl("invalidID123");

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
