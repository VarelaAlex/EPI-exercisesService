let express = require('express');
let cors = require('cors');
let mongoose = require('mongoose');
let routerExercises = require('./routers/routerExercises');
let routerCategories = require('./routers/routerCategories');
let usersServiceURL = require("./Globals");

mongoose.connect("mongodb+srv://uo271288:9Lh189zrKidsgWeR@hytex.ttqdwlm.mongodb.net/HYTEX?retryWrites=true&w=majority&appName=HYTEX");

const port = 8082;
const app = express();

app.use(cors());

app.use(express.json());

app.use(["/"], async (req, res, next) => {

    if (req.path.includes("/list")) {
        return next();
    }

    if (req.method === 'GET' && !req.path.includes("/teacher")) {
        return next();
    }

    if (req.path.includes("categories")) {
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
app.use("/categories", routerCategories);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});