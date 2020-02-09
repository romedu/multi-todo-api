const request = require("supertest"),
	app = require("../../src/app"),
	{ createTestUser } = require("../utilities");

describe("Todo routes", () => {
	describe("/todos/:id/todo/:todoId", () => {
		const todoObjectSchema = {
			_id: expect.any(String),
			description: expect.any(String),
			checked: expect.any(Boolean)
		};

		let rootUrl, testTodoList, authorizationToken;

		beforeAll(async () => {
			const todoListRouteUrl = "/api/todos",
				testUserCredentials = {
					username: "todoTestUsername2",
					password: "todoTestPassword2"
				},
				testTodoListData = {
					name: "todoListName3"
				},
				newTestUser = await createTestUser(testUserCredentials),
				newTodoListResponse = await request(app)
					.post(todoListRouteUrl)
					.set("Authorization", newTestUser.token)
					.send(testTodoListData);

			testTodoList = newTodoListResponse.body;
			rootUrl = `/api/todos/${testTodoList._id}/todo`;
			authorizationToken = newTestUser.token;
		});

		describe("Requesting a valid todo id", () => {
			let testTodo, baseUrl;

			beforeAll(async () => {
				const testTodoData = {
						description: "Test todo description"
					},
					newTodoResponse = await request(app)
						.post(rootUrl)
						.set("Authorization", authorizationToken)
						.send(testTodoData);

				testTodo = newTodoResponse.body;
				baseUrl = `${rootUrl}/${testTodo._id}`;
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
					let invalidAuthToken;

					beforeAll(async () => {
						const intruderUserCredentials = {
								username: "todoTestUsername3",
								password: "todoTestPassword3"
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

					it("should return a todo object", () => {
						expect(response.body).toEqual(
							expect.objectContaining(todoObjectSchema)
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
							description: "Updated description"
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

						it("should return the todo with the updated data", () => {
							expect(response.body).toMatchObject(updateData);
						});
					});

					describe("Sending invalid data", () => {
						const updateData = {
							description: ""
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

						it("should not return the todo with the updated data", () => {
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
						const todoQueryResponse = await request(app)
							.get(baseUrl)
							.set("Authorization", authorizationToken);

						expect(todoQueryResponse.status).toBe(404);
						done();
					});

					it("should remove the todo from the corresponding todoList", async done => {
						const correspondingTodoListUrl = `/api/todos/${testTodoList._id}`,
							{ body: newTodo } = response,
							{ body: todoListAfterRequest } = await request(app)
								.get(correspondingTodoListUrl)
								.set("Authorization", authorizationToken),
							isNewTodoRemoved = todoListAfterRequest.todos.every(
								todo => todo._id !== newTodo._id
							);

						expect(isNewTodoRemoved).toBeTruthy();
						done();
					});
				});
			});
		});

		describe("Requesting an invalid todo id", () => {
			let baseUrl;

			beforeAll(() => {
				baseUrl = `${rootUrl}/invalidID123`;
			});

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
