const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoListIdUrl } = require("../../urls");

describe("POST /todoList", () => {
	const todolistObjectSchema = {
		_id: expect.any(String),
		name: expect.any(String),
		todos: expect.any(Array),
		creator: expect.any(String)
	};

	let userData, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listPostTestUser",
				password: "listPostTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		userData = newTestUser;
		authorizationToken = newTestUser.token;
	});

	describe("Authorized requests", () => {
		describe("Post request", () => {
			describe("Sending valid data", () => {
				const testTodoListData = {
					name: "testListName",
					image: ""
				};

				let response;

				beforeAll(async () => {
					response = await request(app)
						.post(todoListBaseUrl)
						.set("Authorization", authorizationToken)
						.send(testTodoListData);
				});

				it("should return a status of 201", () => {
					expect(response.status).toBe(201);
				});

				it("should return a todolist object", () => {
					expect(response.body).toEqual(expect.objectContaining(todolistObjectSchema));
				});

				it("should save the new todolist", async () => {
					const { body: newTodoList } = response,
						testTodoListQueryUrl = createTodoListIdUrl(newTodoList._id),
						newTodoListQueryResponse = await request(app)
							.get(testTodoListQueryUrl)
							.set("Authorization", authorizationToken);

					expect(newTodoListQueryResponse.status).toEqual(200);
				});

				it("should return a name property with the same value as the one passed", () => {
					expect(response.body.name).toBe(testTodoListData.name);
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
					const testTodoListData = {};
					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(todoListBaseUrl)
							.set("Authorization", authorizationToken)
							.send(testTodoListData);
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
						const testTodoListData = {
							name: "X"
						};

						let response;

						beforeAll(async () => {
							response = await request(app)
								.post(todoListBaseUrl)
								.set("Authorization", authorizationToken)
								.send(testTodoListData);
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
			});
		});
	});

	describe("Unauthorized requests", () => {
		describe("Post request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).post(todoListBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
