const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const courseSchema = new mongoose.Schema({
    categoryId: {
        type: ObjectId,
        ref: 'Category'
    },

    category_name: {
        type: String,
        default: ""
    },

    course_name: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    course_fee: {
        type: Number,
        default: 0
    },

    duration: {
        type: String,
        default: ""
    },

    start_date: {
        type: String,
        default: ""
    },

    end_date: {
        type: String,
        default: ""
    },

    class_time: {
        type: String,
        default: ""
    },

    course_image: {
        fileName: { type: String, default: "" },
        filePath: { type: String, default: "" }
    },

    course_seat_limit: {
        type: Number,
        default: 0
    },

    offer_in_amount: {
        type: Number,
        default: 0
    },

    course_type: {
        type: String,
        default: ""
    }
}, { timestamps: true});


module.exports = mongoose.model("Course", courseSchema);