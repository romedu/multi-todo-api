const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl, createFolderIdUrl } = require("../../urls");

describe("POST /folder/:id", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "folderIdPostTestUser",
				password: "folderIdPostTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid folder id", () => {
		let testFolder, baseUrl;

		beforeAll(async () => {
			const testFolderData = {
					name: "folderIdPostName",
					description: "Test post folder description"
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
				describe("Post request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).post(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let intruderUserData;

				beforeAll(async () => {
					const intruderUserCredentials = {
						username: "folderIdPostTestUser2",
						password: "folderIdPostTestPw2"
					};

					intruderUserData = await createTestUser(intruderUserCredentials);
				});

				describe("Post request", () => {
					it("should return a status of 401", async done => {
						const { token: invalidAuthToken } = intruderUserData,
							response = await request(app)
								.post(baseUrl)
								.set("Authorization", invalidAuthToken);

						expect(response.status).toBe(401);
						done();
					});
				});
			});
		});

		describe("Authorized requests", () => {
			describe("Post request", () => {
				it("should return a status of 404", async done => {
					const response = await request(app)
						.post(baseUrl)
						.set("Authorization", authorizationToken);

					expect(response.status).toBe(404);
					done();
				});
			});
		});
	});

	describe("Requesting an invalid folder id", () => {
		const baseUrl = createFolderIdUrl("invalidID123");

		describe("Post request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.post(baseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
