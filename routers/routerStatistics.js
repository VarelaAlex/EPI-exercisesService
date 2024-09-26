const express = require('express');
const Feedback = require('../models/Feedback.model');
let usersServiceURL = require("../Globals");

const routerStatistics = express.Router();

routerStatistics.post("/", async (req, res) => {

    let { feedback } = req.body;
    let studentId = null;
    if (req.infoApiKey) {
        studentId = req.infoApiKey.id || null;
    }

    let student = null;
    try {
        student = await fetch(usersServiceURL + `/students/${studentId}`);
    } catch (error) {
    }

    let jsonData = await student.json();
    if (student.ok) {
        feedback.student = {};
        feedback.student.name = jsonData.name;
        feedback.student.lastName = jsonData.lastName;
        feedback.student.age = jsonData.age;
        feedback.student.classroom = jsonData.classroomId;
    } else {
        return res.status(404).json({ error: jsonData.error });
    }

    try {
        let feedbackRes = await Feedback.create(feedback);
        res.status(200).json(feedbackRes);
    } catch (e) {
        return res.status(500).json({ error: { type: "internalServerError", message: e.message } });
    }
});

module.exports = routerStatistics;