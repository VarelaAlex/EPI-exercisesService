const express = require('express');
const Exercise = require('../models/Exercise.model');

const routerExercises = express.Router();

routerExercises.post("/", async (req, res) => {

    let exercise = req.body;
    if (req.infoApiKey) {
        exercise.teacherId = req.infoApiKey.id || null;
    }
    try {
        let exerciseRes = await Exercise.create(exercise);
        res.status(200).json(exerciseRes);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
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

    let teacherId = req.infoApiKey.id;
    try {
        let exercises = await Exercise.find({ teacherId });
        res.status(200).json(exercises);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerExercises.put("/:exerciseId", async (req, res) => {

    let exerciseId = req.params.exerciseId;
    let exercise = req.body;

    try {
        let updated = await Exercise.findByIdAndUpdate({ exerciseId, exercise });
        !deleted ? res.status(404).json({ message: "Exercise not found" }) : res.status(200).json(updated);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerExercises.delete("/:exerciseId", async (req, res) => {

    let exerciseId = req.params.exerciseId;
    try {
        let deleted = await Exercise.findByIdAndDelete({ exerciseId });
        !deleted ? res.status(404).json({ message: "Exercise not found" }) : res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

module.exports = routerExercises;