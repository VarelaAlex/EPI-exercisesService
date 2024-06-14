let mongoose = require('mongoose');

let CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    }
});

let Category = mongoose.model("Category", CategorySchema);

module.exports = Category;