const request = require("supertest");
const express = require("express");
const routerStatistics = require("../../routers/routerStatistics");
const Feedback = require("../../models/Feedback.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/statistics", routerStatistics);
describe("Statistics Router", () => {

	let studentToken;
	let feedback0;
	let feedback1;

	beforeAll(async () => {
		studentToken = jwt.sign({ id: "3", role: "student" }, process.env.SECRET, { expiresIn: "15m" });
	});

	beforeEach(async () => {
		await mongoose.connect(process.env.MONGODB_URI);
	});

	afterEach(async () => {
		await mongoose.connection.close();
	});

	afterAll(async () => {
		await mongoose.connect(process.env.MONGODB_URI);
		await Feedback.findByIdAndDelete(feedback0);
		await Feedback.findByIdAndDelete(feedback1);
		await mongoose.connection.close();
	});

	describe("POST /statistics", () => {
		it("should create a feedback entry successfully", async () => {
			const feedbacks = [
				{
					title:     "TEST", networkType: "I-I", date: Date.now(), representation: "ICONIC", phase1: {
						incorrectOrderLexical:   1,
						incorrectPosLexical:     2,
						outOfBoundsLexical:      1,
						incorrectOrderSintactic: 1,
						incorrectPosSintactic:   1,
						outOfBoundsSintactic:    1,
						incorrectOrderSemantic:  1,
						incorrectPosSemantic:    1,
						outOfBoundsSemantic:     1
					}, phase2: {
						incorrectOrderLexical:   1,
						incorrectPosLexical:     1,
						outOfBoundsLexical:      1,
						incorrectOrderSintactic: 1,
						incorrectPosSintactic:   1,
						outOfBoundsSintactic:    1,
						incorrectOrderSemantic:  1,
						incorrectPosSemantic:    1,
						outOfBoundsSemantic:     1
					}
				}, {
					title:          "TEST",
					networkType:    "I-II",
					date:           Date.now(),
					representation: "SYMBOLIC",
					phase1:         { lexicalError: 1, syntacticError: 1, semanticError: 1 },
					phase2:         { lexicalError: 1, syntacticError: 1, semanticError: 1 }
				}
			];

			const res0 = await request(app)
				.post("/statistics")
				.set({
					     Authorization: `Bearer ${ studentToken }`, "Content-Type": "application/json"
				     })
				.send({ feedback: feedbacks[ 0 ] });

			expect(res0.statusCode).toEqual(200);
			expect(res0.body).toHaveProperty("representation", feedbacks[ 0 ].representation);
			expect(res0.body).toHaveProperty("networkType", feedbacks[ 0 ].networkType);

			const res1 = await request(app)
				.post("/statistics")
				.set({
					     Authorization: `Bearer ${ studentToken }`, "Content-Type": "application/json"
				     })
				.send({ feedback: feedbacks[ 1 ] });
			expect(res1.statusCode).toEqual(200);
			expect(res1.body).toHaveProperty("representation", feedbacks[ 1 ].representation);
			expect(res1.body).toHaveProperty("networkType", feedbacks[ 1 ].networkType);

			feedback0 = res0.body._id;
			feedback1 = res1.body._id;
		});
	});

	describe("GET /statistics/classroom/:classroomId", () => {
		it("should return statistics for a classroom with correct calculations", async () => {

			const res = await request(app)
				.get(`/statistics/classroom/2`);

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty("stackedData");
			expect(res.body).toHaveProperty("representationPercentages");
			expect(res.body).toHaveProperty("totalFeedbacks");

			const { stackedData, representationPercentages, totalFeedbacks } = res.body;

			expect(totalFeedbacks).toBe(2);
			expect(stackedData).toEqual({
				                            ICONIC:      {
					                            "I-I": { count: 1, percentage: "100.00" }
				                            }, SYMBOLIC: {
					"I-II": { count: 1, percentage: "100.00" }
				}
			                            });
			expect(representationPercentages).toEqual({
				                                          ICONIC: "50.00", SYMBOLIC: "50.00"
			                                          });
		});
	});

	describe("GET /statistics/student/:studentId", () => {
		it("should return statistics for a student with correct calculations", async () => {

			const res = await request(app)
				.get(`/statistics/student/3`);

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty("iconicMixedErrors");
			expect(res.body).toHaveProperty("symbolicErrors");
			expect(res.body).toHaveProperty("percentageLexical");
			expect(res.body).toHaveProperty("percentageSyntactic");
			expect(res.body).toHaveProperty("percentageSemantic");
			expect(res.body).toHaveProperty("totalFeedbacks");
			expect(res.body).toHaveProperty("iconicMixedErrorsTotal");
			expect(res.body).toHaveProperty("symbolicErrorsTotal");

			const {
				      iconicMixedErrors,
				      symbolicErrors,
				      percentageLexical,
				      percentageSyntactic,
				      percentageSemantic,
				      totalFeedbacks,
				      iconicMixedErrorsTotal,
				      symbolicErrorsTotal
			      } = res.body;

			expect(totalFeedbacks).toBe(2);
			expect(iconicMixedErrors).toEqual({
				                                  Lexical:      {
					                                  incorrectOrder: { count: 2, percentage: "10.53" },
					                                  incorrectPos:   { count: 3, percentage: "15.79" },
					                                  outOfBounds:    { count: 2, percentage: "10.53" }
				                                  }, Syntactic: {
					incorrectOrder: { count: 2, percentage: "10.53" },
					incorrectPos:   { count: 2, percentage: "10.53" },
					outOfBounds:    { count: 2, percentage: "10.53" }
				}, Semantic:                                    {
					incorrectOrder: { count: 2, percentage: "10.53" },
					incorrectPos:   { count: 2, percentage: "10.53" },
					outOfBounds:    { count: 2, percentage: "10.53" }
				}
			                                  });
			expect(symbolicErrors).toEqual({
				                               Lexical:   { count: 2, percentage: "33.33" },
				                               Syntactic: { count: 2, percentage: "33.33" },
				                               Semantic:  { count: 2, percentage: "33.33" }
			                               });
			expect(percentageLexical).toBe("36.84");
			expect(percentageSyntactic).toBe("31.58");
			expect(percentageSemantic).toBe("31.58");
			expect(iconicMixedErrorsTotal).toBe(19);
			expect(symbolicErrorsTotal).toBe(6);
		});
	});
});