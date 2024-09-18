const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },

    profilePic: {
        fileName: { type: String, default: "" },
        filePath: { type: String, default: "" }
    },

    description: {
        type: String,
        default: "",
    }
}, {timestamps: true});


module.exports = mongoose.model("Teacher", teacherSchema);