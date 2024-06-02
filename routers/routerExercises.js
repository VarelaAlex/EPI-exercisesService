const express = require('express');
const database = require("../database");
const { ObjectId } = require('mongodb');

const routerExercises = express.Router();
const COLLECTION_NAME = "exercises";

routerExercises.post("/", async (req, res) => {

    let exercise = req.body;

    await database.connect();

    let insertedId = null;
    try {

        insertedId = await database.createDocument(COLLECTION_NAME, exercise);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    } finally {
        await database.disconnect();
    }

    res.status(200).json({ insertedId });
});

routerExercises.get("/list", async (req, res) => {

    let category = req.query.category;

    await database.connect();

    let exercises = null;
    try {

        exercises = await database.readDocuments(COLLECTION_NAME, category ? { category: category } : {});
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    } finally {
        await database.disconnect();
    }

    res.status(200).json(exercises);
});

routerExercises.put("/:exerciseId", async (req, res) => {

    let exerciseId = req.params.exerciseId;
    let exercise = req.body;

    await database.connect();

    let updated = null;
    try {

        updated = await database.updateDocument(COLLECTION_NAME, { _id: new ObjectId(exerciseId) }, exercise);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    } finally {
        await database.disconnect();
    }

    res.status(200).json({ updated });
});

routerExercises.delete("/:exerciseId", async (req, res) => {

    let exerciseId = req.params.exerciseId;

    await database.connect();

    let deleted = null;
    try {

        deleted = await database.deleteDocument(COLLECTION_NAME, { _id: new ObjectId(exerciseId) });
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    } finally {
        await database.disconnect();
    }

    res.status(200).json({ deleted });
});

module.exports = routerExercises;