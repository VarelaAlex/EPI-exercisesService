const express = require('express');
const jwt = require("jsonwebtoken");
let cors = require('cors');
const routerExercises = require('./routers/routerExercises');

const port = 8082;
const app = express();

app.use(cors());

app.use(express.json());

app.use("/exercises", routerExercises);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});