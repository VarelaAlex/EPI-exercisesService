let mongoose = require('mongoose');

let ExerciseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required"],
        uppercase: true
    },
    category: {
        type: String,
        required: [true, "category is required"]
    },
    mainImage: {
        type: String,
        required: [true, "mainImage is required"]
    },
    definitionImage: {
        type: String
    },
    definitionText: {
        type: String,
        uppercase: true
    },
    ampliationImages: {
        type: [String],
        default: undefined
    },
    ampliationText: {
        type: [String],
        uppercase: true,
        default: undefined
    },
    definitionPictogram: {
        type: String,
        required: [true, "definitionPictogram is required"]
    },
    ampliationPictogram: {
        type: String,
        required: [true, "ampliationPictogram is required"]
    },
    networkType: {
        type: String,
        required: [true, "networkType is required"],
        uppercase: true
    },
    representation: {
        type: String,
        required: [true, "representation is required"],
        uppercase: true
    },
    language: {
        type: String,
        required: [true, "language is required"],
        lowercase: true
    },
    teacherId: {
        type: String
    }
});

let Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = Exercise;