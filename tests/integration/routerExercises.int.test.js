const request = require("supertest");
const express = require("express");
const { routerExercises } = require("../../routers/routerExercises");
const jwt = require("jsonwebtoken");
let mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/exercises", routerExercises);

describe("Exercises Router", () => {

	let teacherToken;
	let exerciseId;

	beforeAll(async () => {
		teacherToken = jwt.sign({ id: "1", role: "teacher" }, process.env.SECRET, { expiresIn: "15m" });
	});

	beforeEach(async () => {
		await mongoose.connect(process.env.MONGODB_URI);
	});

	afterEach(async () => {
		await mongoose.connection.close();
	});

	describe("POST /exercises", () => {
		it("should create exercise when body is valid and authentication is successful", async () => {
			const exerciseData = {
				title:               "Test",
				language:            "Test",
				category:            "Test",
				networkType:         "Test",
				representation:      "Test",
				mainImage:           "Test",
				definitionText:      "Test",
				definitionImage:     "Test",
				definitionPictogram: "Test",
				ampliationPictogram: "Test"
			};

			const response = await request(app)
				.post("/exercises/")
				.set({
					     Authorization: `Bearer ${ teacherToken }`, "Content-Type": "application/json"
				     })
				.send(exerciseData);
			expect(response.status).toBe(200);
			expect(response.body.teacherId).toEqual("1");
			exerciseId = response.body._id;
		});
	});

	describe("GET /exercises/list/:lang", () => {
		it("should return exercises for valid language", async () => {
			const response = await request(app).get("/exercises/list/es");
			expect(response.status).toBe(200);
		});
	});

	describe("POST /exercises/list/:lang", () => {
		it("should return exercises for valid language, category, and representation", async () => {
			const response = await request(app)
				.post("/exercises/list/es")
				.send({ category: "Family", representation: "Iconic" });
			expect(response.status).toBe(200);
		});
	});

	describe("GET /exercises/teacher", () => {
		it("should return exercises for authenticated teacher", async () => {
			const response = await request(app)
				.get("/exercises/teacher")
				.set("Authorization", `Bearer ${ teacherToken }`);
			expect(response.status).toBe(200);
		});
	});

	describe("PUT /exercises/:exerciseId", () => {
		it("should update exercise if authenticated and authorized", async () => {
			const exercise = { title: "Updated"};
			const response = await request(app)
				.put(`/exercises/${ exerciseId }`)
				.set({
					     Authorization: `Bearer ${ teacherToken }`, "Content-Type": "application/json"
				     }).send(exercise);
			expect(response.status).toBe(200);
		});

		it("should return 404 if exercise not found", async () => {
			const response = await request(app)
				.put(`/exercises/${ new mongoose.Types.ObjectId() }`)
				.set({
					     Authorization: `Bearer ${ teacherToken }`, "Content-Type": "application/json"
				     })
				.send({ title: "Updated Exercise" });
			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /exercises/:exerciseId", () => {
		it("should delete exercise if authenticated and authorized", async () => {
			const response = await request(app)
				.delete(`/exercises/${ exerciseId }`)
				.set("Authorization", `Bearer ${ teacherToken }`);
			expect(response.status).toBe(200);
		});

		it("should return 404 if exercise not found", async () => {
			const response = await request(app)
				.delete(`/exercises/${ new mongoose.Types.ObjectId() }`)
				.set("Authorization", `Bearer ${ teacherToken }`);
			expect(response.status).toBe(404);
		});
	});
});