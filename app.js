let express = require('express');
let cors = require('cors');
let mongoose = require('mongoose');
let routerExercises = require('./routers/routerExercises');
let routerStatistics = require('./routers/routerStatistics');
let usersServiceURL = require("./Globals");
//const https = require('https');
//const fs = require('fs');
require('dotenv').config()

/*
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: process.env.PASSPHRASE
};
*/

// TODO: Remove credentials from here
mongoose.connect(process.env.MONGODB_URI);

const port = process.env.PORT;
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
app.use("/statistics", routerStatistics);
/*
https.createServer(options, app).listen(port, () => {
    console.log("Active server listening on port", port);
});
*/
app.listen(port, () => {
    console.log("Active server listening on port", port);
});