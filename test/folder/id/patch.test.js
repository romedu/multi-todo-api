const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl, createFolderIdUrl } = require("../../urls");

describe("PATCH /folder/:id", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "folderIdPatchTestUser",
				password: "folderIdPatchTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid folder id", () => {
		let testFolder, baseUrl;

		beforeAll(async () => {
			const testFolderData = {
					name: "folderIdPatchName",
					description: "Test patch folder description"
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
				describe("Patch request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).patch(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let intruderUserData;

				beforeAll(async () => {
					const intruderUserCredentials = {
						username: "folderIdPatchTestUser2",
						password: "folderIdPatchTestPw2"
					};

					intruderUserData = await createTestUser(intruderUserCredentials);
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
			});
		});

		describe("Authorized requests", () => {
			describe("Patch request", () => {
				describe("Sending valid data", () => {
					const updateData = {
						name: "folderIdPatchName2"
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
		});
	});

	describe("Requesting an invalid folder id", () => {
		const baseUrl = createFolderIdUrl("invalidID123");

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
