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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://hytex-front-production.up.railway.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

app.use("/exercises", routerExercises);
app.use("/statistics", routerStatistics);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});