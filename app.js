let express = require('express');
let cors = require('cors');
let mongoose = require('mongoose');
let { routerExercises } = require('./routers/routerExercises');
let routerStatistics = require('./routers/routerStatistics');

require('dotenv').config();

const fs = require('fs');
const uri = process.env.MONGODB_URI || fs.readFileSync(process.env.MONGODB_URI_FILE, 'utf8').trim();
mongoose.connect(uri);

const port = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.json());

app.use("/exercises", routerExercises);
app.use("/statistics", routerStatistics);

app.listen(port, () => {
    console.log("Active server listening on port", port);
});
