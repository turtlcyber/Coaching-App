const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const coursePurchaseSchema = new mongoose.Schema({
    
    courseId: {
        type: ObjectId,
        ref: "Course"
    },

    userId: {
        type: String,
        default: ""
    },

    amount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    }
}, {timestamps: true});

module.exports = mongoose.model("CoursePurchase", coursePurchaseSchema);