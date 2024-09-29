const express = require('express');
const Feedback = require('../models/Feedback.model');

const routerStatistics = express.Router();

routerStatistics.post("/", async (req, res) => {

    let { feedback } = req.body;

    let response = null;
    try {
        response = await fetch(process.env.USERS_SERVICE_URL + "/students/checkLogin", {
            method: "GET",
            headers: req.headers
        });
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }

    try {
        let jsonData = await response.json();
        if (response.ok) {
            feedback.student = {
                name: jsonData.name,
                lastName: jsonData.lastName,
                age: jsonData.age,
                classroom: jsonData.classroomId
            };
        } else {
            return res.status(404).json({ error: jsonData.error });
        }

        let feedbackRes = await Feedback.create(feedback);
        res.status(200).json(feedbackRes);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

module.exports = routerStatistics;