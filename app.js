let express = require('express');
let cors = require('cors');
let mongoose = require('mongoose');
let routerExercises = require('./routers/routerExercises');
let routerStatistics = require('./routers/routerStatistics');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const port = process.env.PORT;
const app = express();

app.use(cors({
    origin: 'https://hytex-front-production.up.railway.app',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.use("/exercises", routerExercises);
app.use("/statistics", routerStatistics);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});