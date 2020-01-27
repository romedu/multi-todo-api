const request = require("supertest"),
	app = require("../src/app"),
	{ createTestUser } = require("./utilities");

describe.skip("Services routes", () => {
	describe("/sendMail", () => {
		const baseUrl = "/api/services/sendMail";

		let authorizationToken;

		beforeAll(async () => {
			const newTestUserData = {
					username: "sendMailTestUsername",
					password: "sendMailTestPassword"
				},
				newTestUser = await createTestUser(newTestUserData);

			authorizationToken = newTestUser.token;
		});

		describe("Get request", () => {
			let response;

			beforeAll(async () => {
				response = await request(app)
					.get(baseUrl)
					.set("Authorization", authorizationToken);
			});

			it("should return a status of 404", () => {
				expect(response.status).toBe(404);
			});
		});

		describe("Post request", () => {
			describe("Authorized request", () => {
				describe("Passing valid inputs", () => {
					let response;

					beforeAll(async () => {
						const messageData = {
							message: "This is a vaid test message"
						};
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken)
							.send(messageData);
					});

					it("should return a status of 200", () => {
						expect(response.status).toBe(200);
					});

					it("should return a message property", () => {
						expect(response.body.message).toBeTruthy();
					});
				});

				describe("Passing invalid inputs", () => {
					let response;

					beforeAll(async () => {
						const invalidMessageData = { message: "" };
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken)
							.send(invalidMessageData);
					});

					it("should return a status of 422", () => {
						expect(response.status).toBe(422);
					});

					it("should return an errors property with at least one element", () => {
						const errors = response.body.errors || [];
						expect(errors.length).toBeGreaterThanOrEqual(1);
					});
				});

				describe("Passing no inputs", () => {
					let response;

					beforeAll(async () => {
						response = await request(app)
							.post(baseUrl)
							.set("Authorization", authorizationToken);
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

			describe("Unauthorized request", () => {
				let response;

				beforeAll(async () => {
					const messageData = { message: "This is a vaid test message" };
					response = await request(app)
						.post(baseUrl)
						.send(messageData);
				});

				it("should return a status of 401", () => {
					expect(response.status).toBe(401);
				});
			});
		});

		describe("Patch request", () => {
			let response;

			beforeAll(async () => {
				response = await request(app)
					.patch(baseUrl)
					.set("Authorization", authorizationToken);
			});

			it("should return a status of 404", () => {
				expect(response.status).toBe(404);
			});
		});

		describe("Delete request", () => {
			let response;

			beforeAll(async () => {
				response = await request(app)
					.delete(baseUrl)
					.set("Authorization", authorizationToken);
			});

			it("should return a status of 404", () => {
				expect(response.status).toBe(404);
			});
		});
	});
});
