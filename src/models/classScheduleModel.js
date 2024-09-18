const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const classScheduleSchema = new mongoose.Schema({
    courseId: {
        type: String,
        default: ""
    },

    course_name: {
        type: String,
        default: ""
    },

    meeting_link: {
        type: String,
        default: ""
    },

    teacherId: {
        type: String,
        default: ""
    },

    techer_name: {
        type: String,
        default: ""
    },

    input_text: {
        type: String,
        default: ""
    },

    pdf_upload_file: {
        fileName: { type: String, default: "" },
        filePath: { type: String, default: "" }
    },

    youtube_video_code: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: ""
    },
}, {timestamps: true});


module.exports = mongoose.model("Class_Schedule", classScheduleSchema);