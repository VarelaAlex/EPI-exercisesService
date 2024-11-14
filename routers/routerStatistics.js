const express = require("express");
const Feedback = require("../models/Feedback.model");

const routerStatistics = express.Router();

routerStatistics.post("/", async (req, res) => {

	debugger
	let { feedback } = req.body;

	let response = null;
	try {
		response = await fetch(process.env.USERS_SERVICE_URL + "/students/currentStudent", {
			method: "GET", headers: req.headers
		});
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}

	try {
		let jsonData = await response.json();
		if ( response.ok ) {
			feedback.student = {
				studentId: jsonData.id, classroomId: jsonData.classroomId
			};
		} else {
			return res.status(404).json({ error: jsonData.error });
		}

		let feedbackRes = await Feedback.create(feedback);
		res.status(200).json(feedbackRes);
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerStatistics.get("/classroom/:classroomId", async (req, res) => {
	let classroomId = req.params.classroomId;

	try {
		let feedbacks = await Feedback.find({ "student.classroomId": classroomId });

		const networkTypeOrder = ["I-I", "I-II", "I-III"];
		const representationOrder = ["ICONIC", "MIXED", "SYMBOLIC"];

		feedbacks.sort((a, b) => {
			const networkTypeComparison = networkTypeOrder.indexOf(a.networkType)
			                              - networkTypeOrder.indexOf(b.networkType);
			if ( networkTypeComparison !== 0 ) {
				return networkTypeComparison;
			}

			return representationOrder.indexOf(a.representation) - representationOrder.indexOf(b.representation);
		});

		let stackedData = {};
		let representationCounts = {};

		const totalFeedbacks = feedbacks.length;

		feedbacks.forEach((feedback) => {
			const representation = feedback.representation;
			const networkType = feedback.networkType;

			if ( !stackedData[ representation ] ) {
				stackedData[ representation ] = {};
			}

			stackedData[ representation ][ networkType ] =
				(
					stackedData[ representation ][ networkType ] || 0
				) + 1;

			representationCounts[ representation ] =
				(
					representationCounts[ representation ] || 0
				) + 1;
		});

		for ( let representation in stackedData ) {
			let totalInRepresentation = representationCounts[ representation ];

			for ( let networkType in stackedData[ representation ] ) {
				let count = stackedData[ representation ][ networkType ];
				let percentage = (
					(
						count / totalInRepresentation
					) * 100
				).toFixed(2);
				stackedData[ representation ][ networkType ] = { count, percentage };
			}
		}

		let representationPercentages = {};
		for ( let representation in representationCounts ) {
			let count = representationCounts[ representation ];
			representationPercentages[ representation ] =
				(
					(
						count / totalFeedbacks
					) * 100
				).toFixed(2);
		}

		res.status(200).json({ stackedData, representationPercentages, totalFeedbacks });
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerStatistics.get("/student/:studentId", async (req, res) => {
	let studentId = req.params.studentId;

	try {
		let feedbacks = await Feedback.find({ "student.studentId": studentId });

		const totalFeedbacks = feedbacks.length;

		let iconicMixedErrors = {
			Lexical:   { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic:  { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};
		let symbolicErrors = { Lexical: 0, Syntactic: 0, Semantic: 0 };

		let totalIconicMixedErrors = 0;
		let totalSymbolicErrors = 0;

		feedbacks.forEach((feedback) => {
			const { representation } = feedback;

			if ( representation === "MIXED" || representation === "ICONIC" ) {
				["phase1", "phase2"].forEach((phase) => {
					if ( feedback[ phase ] ) {

						iconicMixedErrors.Lexical.incorrectOrder += feedback[ phase ].incorrectOrderLexical || 0;
						iconicMixedErrors.Lexical.incorrectPos += feedback[ phase ].incorrectPosLexical || 0;
						iconicMixedErrors.Lexical.outOfBounds += feedback[ phase ].outOfBoundsLexical || 0;

						iconicMixedErrors.Syntactic.incorrectOrder += feedback[ phase ].incorrectOrderSintactic || 0;
						iconicMixedErrors.Syntactic.incorrectPos += feedback[ phase ].incorrectPosSintactic || 0;
						iconicMixedErrors.Syntactic.outOfBounds += feedback[ phase ].outOfBoundsSintactic || 0;

						iconicMixedErrors.Semantic.incorrectOrder += feedback[ phase ].incorrectOrderSemantic || 0;
						iconicMixedErrors.Semantic.incorrectPos += feedback[ phase ].incorrectPosSemantic || 0;
						iconicMixedErrors.Semantic.outOfBounds += feedback[ phase ].outOfBoundsSemantic || 0;

						totalIconicMixedErrors += feedback[ phase ].incorrectOrderLexical || 0;
						totalIconicMixedErrors += feedback[ phase ].incorrectPosLexical || 0;
						totalIconicMixedErrors += feedback[ phase ].outOfBoundsLexical || 0;
						totalIconicMixedErrors += feedback[ phase ].incorrectOrderSintactic || 0;
						totalIconicMixedErrors += feedback[ phase ].incorrectPosSintactic || 0;
						totalIconicMixedErrors += feedback[ phase ].outOfBoundsSintactic || 0;
						totalIconicMixedErrors += feedback[ phase ].incorrectOrderSemantic || 0;
						totalIconicMixedErrors += feedback[ phase ].incorrectPosSemantic || 0;
						totalIconicMixedErrors += feedback[ phase ].outOfBoundsSemantic || 0;
					}
				});
			} else if ( representation === "SYMBOLIC" ) {

				["phase1", "phase2"].forEach((phase) => {
					if ( feedback[ phase ] ) {
						symbolicErrors.Lexical += feedback[ phase ].lexicalError || 0;
						symbolicErrors.Syntactic += feedback[ phase ].syntacticError || 0;
						symbolicErrors.Semantic += feedback[ phase ].semanticError || 0;

						totalSymbolicErrors += feedback[ phase ].lexicalError || 0;
						totalSymbolicErrors += feedback[ phase ].syntacticError || 0;
						totalSymbolicErrors += feedback[ phase ].semanticError || 0;
					}
				});
			}
		});

		for ( let errorType in iconicMixedErrors ) {
			for ( let error in iconicMixedErrors[ errorType ] ) {
				let count = iconicMixedErrors[ errorType ][ error ];
				iconicMixedErrors[ errorType ][ error ] = {
					count,
					percentage: totalIconicMixedErrors > 0 ? (
						(
							count / totalIconicMixedErrors
						) * 100
					).toFixed(2) : "0.00"
				};
			}
		}

		for ( let errorType in symbolicErrors ) {
			let count = symbolicErrors[ errorType ];
			symbolicErrors[ errorType ] = {
				count,
				percentage: totalSymbolicErrors > 0 ? (
					(
						count / totalSymbolicErrors
					) * 100
				).toFixed(2) : "0.00"
			};
		}

		const sumLexical = Object.values(iconicMixedErrors.Lexical).reduce((acc, value) => acc + value.count, 0);
		const sumSyntactic = Object.values(iconicMixedErrors.Syntactic).reduce((acc, value) => acc + value.count, 0);
		const sumSemantic = Object.values(iconicMixedErrors.Semantic).reduce((acc, value) => acc + value.count, 0);

		const iconicMixedErrorsTotal = sumLexical + sumSyntactic + sumSemantic;
		let percentageLexical = (
			(
				sumLexical / iconicMixedErrorsTotal
			) * 100
		).toFixed(2);
		let percentageSyntactic = (
			(
				sumSyntactic / iconicMixedErrorsTotal
			) * 100
		).toFixed(2);
		let percentageSemantic = (
			(
				sumSemantic / iconicMixedErrorsTotal
			) * 100
		).toFixed(2);

		const symbolicErrorsTotal = Object.values(symbolicErrors).reduce((acc, value) => acc + value.count, 0);

		res.status(200)
		   .json({
			         iconicMixedErrors,
			         symbolicErrors,
			         percentageLexical,
			         percentageSyntactic,
			         percentageSemantic,
			         totalFeedbacks,
			         iconicMixedErrorsTotal,
			         symbolicErrorsTotal
		         });
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

module.exports = routerStatistics;