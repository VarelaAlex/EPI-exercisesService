let mongoose = require('mongoose');

let FeedbackSchema = mongoose.Schema({
    title: {
        type: String,
    },
    level: {
        type: String,
    },
    date: {
        type: Date
    },
    phase1: {
        elapsedTime: {
            type: Number,
        },
        elementOutOfBounds: {
            type: Number,
        },
        incorrectPos: {
            type: Number,
        },
        incorrectPosStop: {
            type: Number,
        },
        incorrectOrder: {
            type: Number,
        },
        incorrectOrderStop: {
            type: Number,
        },
        spellingError: {
            type: Number
        }
    },
    phase2: {
        elapsedTime: {
            type: Number,
        },
        elementOutOfBounds: {
            type: Number,
        },
        incorrectPos: {
            type: Number,
        },
        incorrectPosStop: {
            type: Number,
        },
        incorrectOrder: {
            type: Number,
        },
        incorrectOrderStop: {
            type: Number,
        },
        spellingError: {
            type: Number
        }
    },
    student: {
        name: {
            type: String,
        },
        age: {
            type: Number,
        },
        lastName: {
            type: String,
        },
        classroom: {
            type: Number,
        }
    }
});
let Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = Feedback;