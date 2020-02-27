const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoListIdDownloadUrl } = require("../../urls");

describe("DELETE /todoList/:id/download", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listIdDLDeleteTestUser",
				password: "listIdDLDeleteTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid todolist id", () => {
		let baseUrl;

		beforeAll(async () => {
			const testTodoListData = {
					name: "todolistName"
				},
				newTodoListResponse = await request(app)
					.post(todoListBaseUrl)
					.set("Authorization", authorizationToken)
					.send(testTodoListData);

			baseUrl = createTodoListIdDownloadUrl(newTodoListResponse.body._id);
		});

		describe("Authorized requests", () => {
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
		const baseUrl = createTodoListIdDownloadUrl("invalidID123");

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
