const express = require('express');
const Exercise = require('../models/Exercise.model');

const routerExercises = express.Router();

let authenticateToken = async (req) => {
    let response = null;
    try {
        response = await fetch(process.env.USERS_SERVICE_URL + "/teachers/checkLogin", {
            method: "GET",
            headers: req.headers
        });
        return response;
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
};

routerExercises.post("/", async (req, res) => {
    let response = await authenticateToken(req);
    let jsonData = await response?.json();
    if (response?.ok) {
        try {
            let exerciseRes = await Exercise.create(req.body);
            res.status(200).json(exerciseRes);
        } catch (e) {
            return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
        }
    } else {
        return res.status(response.status).json({ error: jsonData.error });
    }
});

routerExercises.get("/list/:lang", async (req, res) => {

    let language = req.params.lang;

    try {
        let exercises = await Exercise.find({ language });
        res.status(200).json(exercises);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerExercises.post("/list/:lang", async (req, res) => {

    let { lang } = req.params;
    let { category, representation } = req.body;

    try {
        let query = { language: lang };

        if (category && representation) {
            query = {
                ...query,
                category: category.toUpperCase(),
                representation: representation.toUpperCase(),
            };
        }

        const exercises = await Exercise.find(query);
        return res.status(200).json(exercises);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerExercises.get("/teacher", async (req, res) => {

    let response = await authenticateToken(req);

    let jsonData = await response?.json();
    if (response?.ok) {
        let teacherId = jsonData.id;
        try {
            let exercises = await Exercise.find({ teacherId: { $exists: true, $eq: teacherId } });
            res.status(200).json(exercises);
        } catch (e) {
            return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
        }
    } else {
        return res.status(response.status).json({ error: jsonData.error });
    }
});

routerExercises.put("/:exerciseId", async (req, res) => {

    let response = await authenticateToken(req);
    let jsonData = await response?.json();
    if (response?.ok) {
        let exerciseId = req.params.exerciseId;
        let exercise = req.body;
        let updated;
        try {
            let exerciseResponse = await Exercise.findById(exerciseId);
            if (exerciseResponse.teacherId === jsonData.id) {
                updated = await Exercise.findByIdAndUpdate(exerciseId, exercise, { new: true });
            } else { res.status(401).json({ message: "This exercise is not yours" }); }
            if (!updated) {
                res.status(404).json({ message: "Exercise not found" });
            }
            else {
                res.status(200).json(updated);
            }
        } catch (e) {
            return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
        }
    } else {
        return res.status(response.status).json({ error: jsonData.error });
    }
});

routerExercises.delete("/:exerciseId", async (req, res) => {
    let response = await authenticateToken(req);
    let jsonData = await response?.json();
    if (response?.ok) {
        let exerciseId = req.params.exerciseId;
        let deleted;
        try {
            let exerciseResponse = await Exercise.findById(exerciseId);
            if (exerciseResponse.teacherId === jsonData.id) {
                deleted = await Exercise.findByIdAndDelete(exerciseId);
            } else { res.status(401).json({ message: "This exercise is not yours" }); }
            if (!deleted) {
                res.status(404).json({ message: "Exercise not found" });
            }
            else {
                res.status(200).json(deleted);
            }
        } catch (e) {
            return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
        }
    } else {
        return res.status(response.status).json({ error: jsonData.error });
    }
});

module.exports = routerExercises;