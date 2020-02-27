const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ todoListBaseUrl, createTodoListIdDownloadUrl } = require("../../urls");

describe("PATCH /todoList/:id/download", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "listIdDLPatchTestUser",
				password: "listIdDLPatchTestPw"
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

		describe("Unauthorized requests", () => {
			describe("Patch request", () => {
				it("should return a status of 401", async done => {
					const response = await request(app).patch(baseUrl);

					expect(response.status).toBe(401);
					done();
				});
			});
		});
	});

	describe("Requesting an invalid todolist id", () => {
		const baseUrl = createTodoListIdDownloadUrl("invalidID123");

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
