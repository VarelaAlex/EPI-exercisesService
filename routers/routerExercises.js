const express = require("express");
const Exercise = require("../models/Exercise.model");

const routerExercises = express.Router();

authenticateToken = async (req, _res) => {
	try {
		return await fetch(process.env.USERS_SERVICE_URL + "/teachers/checkLogin", {
			method: "GET",
			headers: req.headers
		});
	} catch (e) {
		throw new Error(e.message);
	}
};

routerExercises.post("/", async (req, res) => {

	let response = await authenticateToken(req, res);
	let jsonData = await response?.json();
	if ( response?.ok ) {
		try {
			req.body.teacherId = jsonData.user.id;
			let exerciseRes = await Exercise.create(req.body);
			return res.status(200).json(exerciseRes);
		}
		catch ( e ) {
			return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
		}
	} else {
		return res.status(response.status).json({ error: jsonData.error });
	}
});

routerExercises.get("/list/:lang", async (req, res) => {

	let language = req.params.lang;
    let closedOrder = req.query.closedOrder;

	try {

		let exercises
        if (closedOrder) {
            exercises = await Exercise.find({language}).sort({closedOrder:1});
        }
        else {
            exercises = await Exercise.find({language});
        }
		res.status(200).json(exercises);
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerExercises.post("/list/:lang", async (req, res) => {

	let { lang } = req.params;
	let { category, representation } = req.body;

	try {
		let query = { language: lang };

		if ( category && representation ) {
			query = {
				...query, category: category.toUpperCase(), representation: representation.toUpperCase()
			};
		}

		const exercises = await Exercise.find(query);
		return res.status(200).json(exercises);
	}
	catch ( e ) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerExercises.get("/next/:closedOrder", async (req, res) => {
    try {
        const { closedOrder } = req.params;

        if (!closedOrder) {
            return res.status(400).json({
                error: {
                    type: "badRequest",
                    message: "Both 'closedOrder' is required."
                }
            });
        }

        const query = {
			closedOrder: parseInt(closedOrder) + 1,
            language: "es"
        };

        const exercise = await Exercise.findOne(query);

        return res.status(200).json(exercise);
    }
    catch (e) {
        return res.status(500).json({
            error: {
                type: "internalServerError",
                message: e.message
            }
        });
    }
});

routerExercises.get("/teacher", async (req, res) => {
	let response = await authenticateToken(req, res);

	if (!response?.ok) {
		let jsonData = await response?.json();
		return res.status(response.status).json({ error: jsonData?.error });
	}

	let jsonData = await response?.json();
	let teacherId = jsonData.user.id;

	try {
		let exercises = await Exercise.find({ teacherId: { $exists: true, $eq: teacherId } });
		return res.status(200).json(exercises);
	} catch (e) {
		return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
	}
});

routerExercises.put("/:exerciseId", async (req, res) => {

	let response = await authenticateToken(req, res);
	let jsonData = await response?.json();
	if ( response?.ok ) {
		let exerciseId = req.params.exerciseId;
		let exercise = req.body;
		let updated;
		try {
			let exerciseResponse = await Exercise.findById(exerciseId);
			if ( !exerciseResponse ) {
				return res.status(404).json({ message: "Exercise not found" });
			}
			if ( exerciseResponse.teacherId === jsonData.user.id ) {
				updated = await Exercise.findByIdAndUpdate(exerciseId, exercise, { new: true });
				return res.status(200).json(updated);
			} else {
				return res.status(401).json({ message: "This exercise is not yours" });
			}
		}
		catch ( e ) {
			return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
		}
	} else {
		return res.status(response.status).json({ error: jsonData.error });
	}
});

routerExercises.delete("/:exerciseId", async (req, res) => {

	let response = await authenticateToken(req, res);
	let jsonData = await response?.json();
	if ( response?.ok ) {
		let exerciseId = req.params.exerciseId;
		let deleted;
		try {
			let exerciseResponse = await Exercise.findById(exerciseId);
			if ( !exerciseResponse ) {
				return res.status(404).json({ message: "Exercise not found" });
			}
			if ( parseInt(exerciseResponse.teacherId) === parseInt(jsonData.user.id) ) {
				deleted = await Exercise.findByIdAndDelete(exerciseId);
				return res.status(200).json(deleted);
			} else {
				return res.status(401).json({ message: "This exercise is not yours" });
			}
		}
		catch ( e ) {
			return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
		}
	} else {
		return res.status(response.status).json({ error: jsonData.error });
	}
});

module.exports = { routerExercises, authenticateToken };
