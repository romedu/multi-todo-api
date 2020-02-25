const request = require("supertest"),
	app = require("../../../src/app"),
	{ createTestUser } = require("../../utilities"),
	{ folderBaseUrl } = require("../../urls");

describe("GET /folder", () => {
	let userData, authorizationToken;

	beforeAll(async () => {
		const testUserCredentials = {
			username: "folderGetTestUser",
			password: "folderGetTestPw"
		};

		userData = await createTestUser(testUserCredentials);
		authorizationToken = userData.token;
	});

	describe("Authorized requests", () => {
		describe("Get request", () => {
			const paginatedFoldersSchema = {
				docs: expect.any(Array),
				total: expect.any(Number),
				limit: expect.any(Number)
			};

			describe("Passing a valid limit query param", () => {
				const queryParams = { limit: 10 };

				let response;

				beforeAll(async () => {
					response = await request(app)
						.get(folderBaseUrl)
						.query(queryParams)
						.set("Authorization", authorizationToken);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return a paginated folders object", () => {
					expect(response.body).toEqual(expect.objectContaining(paginatedFoldersSchema));
				});

				it("should return with a limit property with the same value as the one passed", () => {
					expect(response.body.limit).toBe(queryParams.limit);
				});
			});

			describe("Passing an invalid limit query param", () => {
				const queryParams = { limit: "invalid limit" };

				let response;

				beforeAll(async () => {
					response = await request(app)
						.get(folderBaseUrl)
						.query(queryParams)
						.set("Authorization", authorizationToken);
				});

				it("should return a status of 200", () => {
					expect(response.status).toBe(200);
				});

				it("should return a paginated folders object", () => {
					expect(response.body).toEqual(expect.objectContaining(paginatedFoldersSchema));
				});

				it("should return with a limit property equal to it's default value", () => {
					expect(response.body.limit).not.toBe(queryParams.limit);
				});
			});
		});
	});

	describe("Unauthorized requests", () => {
		describe("Get request", () => {
			it("should return a status of 401", async done => {
				const response = await request(app).get(folderBaseUrl);
				expect(response.status).toBe(401);
				done();
			});
		});
	});
});
