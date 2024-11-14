const request = require("supertest");
const express = require("express");
const { routerExercises, authenticateToken } = require("../../routers/routerExercises");
const Exercise = require("../../models/Exercise.model");

const app = express();
app.use(express.json());
app.use("/exercises", routerExercises);

jest.mock("../../models/Exercise.model");

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("authenticateToken", () => {
	it("should return 200 for valid headers", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });

		const req = { headers: { Authorization: "Bearer validToken" } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const response = await authenticateToken(req, res);
		expect(response.ok).toBe(true);
	});

	it("should return 500 for invalid headers", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Invalid token"));
		const req = { headers: { Authorization: "Bearer invalidToken" } };
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		await authenticateToken(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
	});
});

describe("POST /exercises", () => {
	it("should create exercise when body is valid and authentication is successful", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		const exerciseData = { title: "Test Exercise" };
		const createdExercise = { ...exerciseData, teacherId: "teacherId123" };

		Exercise.create.mockResolvedValueOnce(createdExercise);
		const response = await request(app).post("/exercises/").send(exerciseData);
		expect(response.status).toBe(200);
		expect(response.body).toEqual(createdExercise);
	});

	it("should return 401 when authentication fails", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:     false,
			                                status: 401,
			                                json:   async () => (
				                                { error: "Unauthorized" }
			                                )
		                                });

		const response = await request(app).post("/exercises/").send({ title: "Test Exercise" });
		expect(response.status).toBe(401);
	});

	it("should return 500 for invalid body with successful authentication", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });

		Exercise.create.mockRejectedValueOnce(new Error("Invalid data"));
		const response = await request(app).post("/exercises/").send({});
		expect(response.status).toBe(500);
	});
});

describe("GET /exercises/list/:lang", () => {
	it("should return exercises for valid language", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app).get("/exercises/list/en");
		expect(response.status).toBe(200);
	});

	it("should return 500 for invalid language", async () => {
		Exercise.find.mockRejectedValueOnce(new Error("Invalid language"));
		const response = await request(app).get("/exercises/list/invalidLang");
		expect(response.status).toBe(500);
	});
});

describe("POST /exercises/list/:lang", () => {
	it("should return exercises for valid language, category, and representation", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app)
			.post("/exercises/list/en")
			.send({ category: "Family", representation: "Iconic" });
		expect(response.status).toBe(200);
	});

	it("should return 500 for invalid language", async () => {
		Exercise.find.mockRejectedValueOnce(new Error("Invalid language"));
		const response = await request(app)
			.post("/exercises/list/invalidLang")
			.send({ category: "Family", representation: "Iconic" });
		expect(response.status).toBe(500);
	});

	it("should return exercises when category is invalid but language is valid", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app)
			.post("/exercises/list/en")
			.send({ category: "Invalid", representation: "Iconic" });
		expect(response.status).toBe(200);
	});

	it("should return exercises when category is missing", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app).post("/exercises/list/en").send({ representation: "Iconic" });
		expect(response.status).toBe(200);
	});

	it("should return exercises when representation is invalid", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app)
			.post("/exercises/list/en")
			.send({ category: "Family", representation: "Invalid" });
		expect(response.status).toBe(200);
	});

	it("should return exercises when representation is missing", async () => {
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1" }]);
		const response = await request(app).post("/exercises/list/en").send({ category: "Family" });
		expect(response.status).toBe(200);
	});
});

describe("GET /exercises/teacher", () => {
	it("should return exercises for authenticated teacher", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		Exercise.find.mockResolvedValueOnce([{ title: "Exercise 1", teacherId: "teacherId123" }]);
		const response = await request(app).get("/exercises/teacher");
		expect(response.status).toBe(200);
	});

	it("should return 401 if authentication fails", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:     false,
			                                status: 401,
			                                json:   async () => (
				                                { error: "Unauthorized" }
			                                )
		                                });
		const response = await request(app).get("/exercises/teacher");
		expect(response.status).toBe(401);
	});
});

describe("PUT /exercises/:exerciseId", () => {
	it("should update exercise if authenticated and authorized", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		const exercise = { title: "Updated Exercise", teacherId: "teacherId123" };
		Exercise.findById.mockResolvedValueOnce(exercise);
		Exercise.findByIdAndUpdate.mockResolvedValueOnce(exercise);
		const response = await request(app).put("/exercises/123").send(exercise);
		expect(response.status).toBe(200);
	});

	it("should return 404 if exercise not found", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		Exercise.findById.mockResolvedValueOnce(null);
		const response = await request(app).put("/exercises/invalidId").send({ title: "Updated Exercise" });
		expect(response.status).toBe(404);
	});

	it("should return 500 for invalid exercise body with successful authentication", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		Exercise.findById.mockResolvedValueOnce({ teacherId: "teacherId123" });
		Exercise.findByIdAndUpdate.mockRejectedValueOnce(new Error("Invalid data"));
		const response = await request(app).put("/exercises/123").send({ invalid: "data" });
		expect(response.status).toBe(500);
	});

	it("should return 401 if authentication fails", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:     false,
			                                status: 401,
			                                json:   async () => (
				                                { error: "Unauthorized" }
			                                )
		                                });
		const response = await request(app).put("/exercises/123").send({ title: "Updated Exercise" });
		expect(response.status).toBe(401);
	});
});

describe("DELETE /exercises/:exerciseId", () => {
	it("should delete exercise if authenticated and authorized", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		const exercise = { title: "Exercise to delete", teacherId: "teacherId123" };
		Exercise.findById.mockResolvedValueOnce(exercise);
		Exercise.findByIdAndDelete.mockResolvedValueOnce(exercise);
		const response = await request(app).delete("/exercises/123");
		expect(response.status).toBe(200);
	});

	it("should return 404 if exercise not found", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherId123" } }
			                                )
		                                });
		Exercise.findById.mockResolvedValueOnce(null);
		const response = await request(app).delete("/exercises/invalidId");
		expect(response.status).toBe(404);
	});

	it("should return 401 if user is unauthorized", async () => {
		mockFetch.mockResolvedValueOnce({
			                                ok:   true,
			                                json: async () => (
				                                { user: { id: "teacherIdOther" } }
			                                )
		                                });
		const exercise = { title: "Exercise to delete", teacherId: "teacherId123" };
		Exercise.findById.mockResolvedValueOnce(exercise);
		const response = await request(app).delete("/exercises/123");
		expect(response.status).toBe(401);
	});
});