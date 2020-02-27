const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl, createFolderIdUrl } = require("../../urls");

describe("GET /folder/:id", () => {
	let authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
				username: "folderIdGetTestUser",
				password: "folderIdGetTestPw"
			},
			newTestUser = await createTestUser(testUserCredentials);

		authorizationToken = newTestUser.token;
	});

	describe("Requesting a valid folder id", () => {
		let testFolder, baseUrl;

		beforeAll(async () => {
			const testFolderData = {
					name: "folderIdGetName"
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
				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const response = await request(app).get(baseUrl);
						expect(response.status).toBe(401);
						done();
					});
				});
			});

			describe("Using a different user's auth token", () => {
				let intruderUserData;

				beforeAll(async () => {
					const intruderUserCredentials = {
						username: "folderIdGetTestUser2",
						password: "folderIdGetTestPw2"
					};

					intruderUserData = await createTestUser(intruderUserCredentials);
				});

				describe("Get request", () => {
					it("should return a status of 401", async done => {
						const { token: invalidAuthToken } = intruderUserData,
							response = await request(app)
								.get(baseUrl)
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

				it("should return a folder object", () => {
					const folderObjectSchema = {
						_id: expect.any(String),
						name: expect.any(String),
						files: expect.any(Array),
						creator: expect.any(String)
					};

					expect(response.body).toEqual(expect.objectContaining(folderObjectSchema));
				});
			});
		});
	});

	describe("Requesting an invalid folder id", () => {
		const baseUrl = createFolderIdUrl("invalidID123");

		describe("Get request", () => {
			it("should return a status of 404", async done => {
				const response = await request(app)
					.get(baseUrl)
					.set("Authorization", authorizationToken);

				expect(response.status).toBe(404);
				done();
			});
		});
	});
});
