const express = require("express");
const Feedback = require("../models/Feedback.model");

const routerStatistics = express.Router();

routerStatistics.post("/", async (req, res) => {

	let { feedback } = req.body;

	let response = null;
	try {
		response = await fetch(process.env.USERS_SERVICE_URL + "/students/currentStudent", {
			method: "GET", headers: req.headers
		});
	}
	catch ( e ) {
		console.log("content: "+response);
		console.log(response);
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
		console.log("content: "+response);
                console.log(response);
		console.log(await response.json());
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerStatistics.get("/classroom/:classroomId", async (req, res) => {

	let classroomId = req.params.classroomId;
	const networkTypeOrder = ["I-I", "I-II", "I-III"];
	const representationOrder = ["ICONIC", "MIXED", "SYMBOLIC"];

	let feedbacks = null;

	try {
		feedbacks = await Feedback.find({ "student.classroomId": classroomId });
	} catch ( e ){
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}

	// Initialize grouped data with counts for both network types and representations
	let groupedData = networkTypeOrder.reduce((acc, type) => {
		acc[type] = {
			count: 0, // Count of feedbacks for this network type
			representationCounts: representationOrder.reduce((repAcc, rep) => {
				repAcc[rep] = 0; // Initialize representation counts to 0
				return repAcc;
			}, {}),
			feedbacks: [] // Array to store feedbacks for sorting
		};
		return acc;
	}, {});

	// Group, count, and prepare for sorting
	feedbacks.forEach((feedback) => {
		if (groupedData[feedback.networkType]) {
			const group = groupedData[feedback.networkType];
			group.count++; // Increment count for the network type
			if (group.representationCounts[feedback.representation] !== undefined) {
				group.representationCounts[feedback.representation]++; // Increment representation count
			}
			group.feedbacks.push(feedback); // Add feedback to the group
		}
	});

	// Sort feedbacks within each group by representation order
	networkTypeOrder.forEach((type) => {
		groupedData[type].feedbacks.sort((a, b) => {
			return (
				representationOrder.indexOf(a.representation) -
				representationOrder.indexOf(b.representation)
			);
		});
	});

	let totalFeedbacks = feedbacks.length;

	res.status(200).json({ groupedData, totalFeedbacks });
});

routerStatistics.get("/student/:studentId", async (req, res) => {
	let studentId = req.params.studentId;

	try {
		let feedbacks = await Feedback.find({ "student.studentId": studentId });

		const totalFeedbacks = feedbacks.length;

		let iconicErrors = {
			Lexical:   { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic:  { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};

		let mixedErrors = {
			Lexical:   { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Syntactic: { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 },
			Semantic:  { incorrectOrder: 0, incorrectPos: 0, outOfBounds: 0 }
		};
		let symbolicErrors = { Lexical: 0, Syntactic: 0, Semantic: 0 };

		let totalIconicErrors = 0;
		let totalMixedErrors = 0;
		let totalSymbolicErrors = 0;

		feedbacks.forEach((feedback) => {
			const { representation } = feedback;

			if ( representation === "ICONIC" ) {
				["phase1", "phase2"].forEach((phase) => {
					if ( feedback[ phase ] ) {

						iconicErrors.Lexical.incorrectOrder += feedback[ phase ].incorrectOrderLexical || 0;
						iconicErrors.Lexical.incorrectPos += feedback[ phase ].incorrectPosLexical || 0;
						iconicErrors.Lexical.outOfBounds += feedback[ phase ].outOfBoundsLexical || 0;

						iconicErrors.Syntactic.incorrectOrder += feedback[ phase ].incorrectOrderSintactic || 0;
						iconicErrors.Syntactic.incorrectPos += feedback[ phase ].incorrectPosSintactic || 0;
						iconicErrors.Syntactic.outOfBounds += feedback[ phase ].outOfBoundsSintactic || 0;

						iconicErrors.Semantic.incorrectOrder += feedback[ phase ].incorrectOrderSemantic || 0;
						iconicErrors.Semantic.incorrectPos += feedback[ phase ].incorrectPosSemantic || 0;
						iconicErrors.Semantic.outOfBounds += feedback[ phase ].outOfBoundsSemantic || 0;

						totalIconicErrors += feedback[ phase ].incorrectOrderLexical || 0;
						totalIconicErrors += feedback[ phase ].incorrectPosLexical || 0;
						totalIconicErrors += feedback[ phase ].outOfBoundsLexical || 0;
						totalIconicErrors += feedback[ phase ].incorrectOrderSintactic || 0;
						totalIconicErrors += feedback[ phase ].incorrectPosSintactic || 0;
						totalIconicErrors += feedback[ phase ].outOfBoundsSintactic || 0;
						totalIconicErrors += feedback[ phase ].incorrectOrderSemantic || 0;
						totalIconicErrors += feedback[ phase ].incorrectPosSemantic || 0;
						totalIconicErrors += feedback[ phase ].outOfBoundsSemantic || 0;
					}
				});
			} else if ( representation === "MIXED" ) {
				["phase1", "phase2"].forEach((phase) => {
					if ( feedback[ phase ] ) {

						mixedErrors.Lexical.incorrectOrder += feedback[ phase ].incorrectOrderLexical || 0;
						mixedErrors.Lexical.incorrectPos += feedback[ phase ].incorrectPosLexical || 0;
						mixedErrors.Lexical.outOfBounds += feedback[ phase ].outOfBoundsLexical || 0;

						mixedErrors.Syntactic.incorrectOrder += feedback[ phase ].incorrectOrderSintactic || 0;
						mixedErrors.Syntactic.incorrectPos += feedback[ phase ].incorrectPosSintactic || 0;
						mixedErrors.Syntactic.outOfBounds += feedback[ phase ].outOfBoundsSintactic || 0;

						mixedErrors.Semantic.incorrectOrder += feedback[ phase ].incorrectOrderSemantic || 0;
						mixedErrors.Semantic.incorrectPos += feedback[ phase ].incorrectPosSemantic || 0;
						mixedErrors.Semantic.outOfBounds += feedback[ phase ].outOfBoundsSemantic || 0;

						totalMixedErrors += feedback[ phase ].incorrectOrderLexical || 0;
						totalMixedErrors += feedback[ phase ].incorrectPosLexical || 0;
						totalMixedErrors += feedback[ phase ].outOfBoundsLexical || 0;
						totalMixedErrors += feedback[ phase ].incorrectOrderSintactic || 0;
						totalMixedErrors += feedback[ phase ].incorrectPosSintactic || 0;
						totalMixedErrors += feedback[ phase ].outOfBoundsSintactic || 0;
						totalMixedErrors += feedback[ phase ].incorrectOrderSemantic || 0;
						totalMixedErrors += feedback[ phase ].incorrectPosSemantic || 0;
						totalMixedErrors += feedback[ phase ].outOfBoundsSemantic || 0;
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

		for ( let errorType in iconicErrors ) {
			for ( let error in iconicErrors[ errorType ] ) {
				let count = iconicErrors[ errorType ][ error ];
				iconicErrors[ errorType ][ error ] = {
					count,
					percentage: totalIconicErrors > 0 ? (
						(
							count / totalIconicErrors
						) * 100
					).toFixed(2) : "0.00"
				};
			}
		}

		for ( let errorType in mixedErrors ) {
			for ( let error in mixedErrors[ errorType ] ) {
				let count = mixedErrors[ errorType ][ error ];
				mixedErrors[ errorType ][ error ] = {
					count,
					percentage: totalMixedErrors > 0 ? (
						(
							count / totalMixedErrors
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

		const sumLexicalIconic = Object.values(iconicErrors.Lexical).reduce((acc, value) => acc + value.count, 0);
		const sumSyntacticIconic = Object.values(iconicErrors.Syntactic).reduce((acc, value) => acc + value.count, 0);
		const sumSemanticIconic = Object.values(iconicErrors.Semantic).reduce((acc, value) => acc + value.count, 0);

		const sumLexicalMixed = Object.values(mixedErrors.Lexical).reduce((acc, value) => acc + value.count, 0);
		const sumSyntacticMixed = Object.values(mixedErrors.Syntactic).reduce((acc, value) => acc + value.count, 0);
		const sumSemanticMixed = Object.values(mixedErrors.Semantic).reduce((acc, value) => acc + value.count, 0);

		const iconicErrorsTotal = sumLexicalIconic + sumSyntacticIconic + sumSemanticIconic;
		const mixedErrorsTotal = sumLexicalMixed + sumSyntacticMixed + sumSemanticMixed;

		let percentageLexicalIconic = (
			(
				sumLexicalIconic / iconicErrorsTotal
			) * 100
		).toFixed(2);

		let percentageSyntacticIconic = (
			(
				sumSyntacticIconic / iconicErrorsTotal
			) * 100
		).toFixed(2);

		let percentageSemanticIconic = (
			(
				sumSemanticIconic / iconicErrorsTotal
			) * 100
		).toFixed(2);

		let percentageLexicalMixed = (
			(
				sumLexicalMixed / mixedErrorsTotal
			) * 100
		).toFixed(2);

		let percentageSyntacticMixed = (
			(
				sumSyntacticMixed / mixedErrorsTotal
			) * 100
		).toFixed(2);

		let percentageSemanticMixed = (
			(
				sumSemanticMixed / mixedErrorsTotal
			) * 100
		).toFixed(2);

		const symbolicErrorsTotal = Object.values(symbolicErrors).reduce((acc, value) => acc + value.count, 0);

		res.status(200)
			.json({
				iconicErrors,
				mixedErrors,
				symbolicErrors,
				percentageLexicalIconic,
				percentageSyntacticIconic,
				percentageSemanticIconic,
				percentageLexicalMixed,
				percentageSyntacticMixed,
				percentageSemanticMixed,
				totalFeedbacks,
				iconicErrorsTotal,
				mixedErrorsTotal,
				symbolicErrorsTotal
			});
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

module.exports = routerStatistics;
