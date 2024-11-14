const request = require("supertest");
const express = require("express");
const routerStatistics = require("../../routers/routerStatistics");
const Feedback = require("../../models/Feedback.model");

const app = express();
app.use(express.json());
app.use("/statistics", routerStatistics);

jest.mock("../../models/Feedback.model");

describe("Use Case CUEstAula: Consulta de las Estadísticas de un Aula", () => {
	it("should return statistics for a classroom with correct calculations", async () => {
		const classroomId = "classroomId123";
		const feedbacks = [
			{ representation: "ICONIC", networkType: "I-I", student: { classroomId } },
			{ representation: "MIXED", networkType: "I-II", student: { classroomId } },
			{ representation: "SYMBOLIC", networkType: "I-III", student: { classroomId } },
			{ representation: "ICONIC", networkType: "I-I", student: { classroomId } }
		];

		Feedback.find.mockResolvedValue(feedbacks);

		const res = await request(app)
			.get(`/statistics/classroom/${ classroomId }`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("stackedData");
		expect(res.body).toHaveProperty("representationPercentages");
		expect(res.body).toHaveProperty("totalFeedbacks");

		const { stackedData, representationPercentages, totalFeedbacks } = res.body;

		expect(totalFeedbacks).toBe(4);
		expect(stackedData).toEqual({
			                            ICONIC:   {
				                            "I-I": { count: 2, percentage: "100.00" }
			                            }, MIXED: {
				"I-II": { count: 1, percentage: "100.00" }
			}, SYMBOLIC:                          {
				"I-III": { count: 1, percentage: "100.00" }
			}
		                            });
		expect(representationPercentages).toEqual({
			                                          ICONIC: "50.00", MIXED: "25.00", SYMBOLIC: "25.00"
		                                          });
	});

	it("should return 500 if Feedback.find fails", async () => {
		Feedback.find.mockRejectedValue(new Error("Database error"));

		const res = await request(app)
			.get("/statistics/classroom/classroomId123");

		expect(res.statusCode).toEqual(500);
		expect(res.body.error).toHaveProperty("type", "internalServerError");
	});
});

describe("Use Case CUEstAlum: Consulta de las Estadísticas de un Alumno", () => {
	it("should return statistics for a student with correct calculations", async () => {
		const studentId = "studentId123";
		const feedbacks = [
			{
				representation: "ICONIC", student: { studentId }, phase1: {
					incorrectOrderLexical:   1,
					incorrectPosLexical:     2,
					outOfBoundsLexical:      1,
					incorrectOrderSintactic: 1,
					incorrectPosSintactic:   1,
					outOfBoundsSintactic:    1,
					incorrectOrderSemantic:  1,
					incorrectPosSemantic:    1,
					outOfBoundsSemantic:     1
				}, phase2:      {
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
				representation: "SYMBOLIC",
				student:        { studentId },
				phase1:         { lexicalError: 1, syntacticError: 1, semanticError: 1 },
				phase2:         { lexicalError: 1, syntacticError: 1, semanticError: 1 }
			}
		];

		Feedback.find.mockResolvedValue(feedbacks);

		const res = await request(app)
			.get(`/statistics/student/${ studentId }`);

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

	it("should return 500 if Feedback.find fails", async () => {
		Feedback.find.mockRejectedValue(new Error("Database error"));

		const res = await request(app)
			.get("/statistics/student/studentId123");

		expect(res.statusCode).toEqual(500);
		expect(res.body.error).toHaveProperty("type", "internalServerError");
	});
});