const express = require('express');
const Category = require('../models/Category.model');

const routerCategories = express.Router();

routerCategories.post("/", async (req, res) => {

    let category = req.body;
    if (req.infoApiKey) {
        category.teacherId = req.infoApiKey.id;
    }

    try {
        let categoryRes = await Category.create(category);
        res.status(200).json(categoryRes);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerCategories.get("/", async (_req, res) => {

    try {
        let categories = await Category.find();
        res.status(200).json(categories);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});
/*
routerCategories.get("/teacher", async (req, res) => {

    let teacherId = req.infoApiKey.id;

    try {
        let categories = await Category.find({ 'teacherId': teacherId });
        res.status(200).json(categories);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});
*/
routerCategories.put("/:categoryId", async (req, res) => {

    let categoryId = req.params.categoryId;
    let category = req.body;

    try {
        let updated = await Category.findByIdAndUpdate({ categoryId, category });
        !deleted ? res.status(404).json({ message: "Category not found" }) : res.status(200).json(updated);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

routerCategories.delete("/:categoryId", async (req, res) => {

    let categoryId = req.params.categoryId;

    try {
        let deleted = await Category.findByIdAndDelete({ categoryId });
        !deleted ? res.status(404).json({ message: "Category not found" }) : res.status(200).json({ message: "Category deleted successfully" });
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

module.exports = routerCategories;