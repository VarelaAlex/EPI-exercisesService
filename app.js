const express = require('express');
const jwt = require("jsonwebtoken");
let cors = require('cors');
const routerExercises = require('./routers/routerExercises');
let usersServiceURL = require("./Globals");

const port = 8082;
const app = express();

app.use(cors());

app.use(express.json());

app.use(["/exercises"], async (req, res, next) => {

    const excludePathPattern = /^\/list\/[^\/]+$/;

    if (excludePathPattern.test(req.path)) {
        return next();
    }
    
    let apiKey = req.query.apiKey;
    try {
        let response = await fetch(usersServiceURL + `/checkApiKey?apiKey=${apiKey}`, {
            method: "GET"
        });
        let jsonData = await response.json();
        if (response.ok) {
            req.infoApiKey = jsonData.infoApiKey;
        } else {
            return res.status(401).json({ error: response.error });
        }
    } catch {
        return res.status(401).json({ error: "internal.server.error" });
    }
    next();
});

app.use("/exercises", routerExercises);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});