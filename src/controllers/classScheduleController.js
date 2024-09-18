const logger = require('../config/logger.config');
const classScheduleModel = require('../models/classScheduleModel');
const courseModel = require('../models/courseModel');

const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const { isValidObjectId } = require('mongoose');
let { getCurrentIPAddress } = require('../uitls/utils');
let { port, adminSecretKey } = require('../config/config');


// CREATE CLASS SCHEDULE
const createClassSchedule = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: 'Key is required'
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        const {
            courseId,
            course_name,
            meeting_link,
            teacherId,
            techer_name,
            input_text,
            youtube_video_code,
            status
        } = req.body;

        let imgObj = null;
        if ("FileUpload" in req.body) {
            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");

            let classPdfFolder = path.join(__dirname, "..", "..", "class_pdf");

            if (!fs.existsSync(classPdfFolder)) {
                fs.mkdirSync(classPdfFolder);
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/class_pdf/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "class_pdf", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };
        };

        const classData = {
            courseId,
            course_name,
            meeting_link,
            teacherId,
            techer_name,
            input_text,
            pdf_upload_file: imgObj,
            youtube_video_code,
            status
        };

        let newSchedule = await classScheduleModel.create(classData);

        return res.status(201).send({
            status: true,
            message: "Class schedule created successfully",
            data: newSchedule
        });
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };

        logger.error(`Error in createClassSchedule API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL CLASS SCHEDULE
const getAllClassSchedule = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: 'Key is required'
            })
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        const allClassSchedules = await classScheduleModel.find({});
        return res.status(201).send({
            status: true,
            message: "Class schedule created successfully",
            data: allClassSchedules
        });
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };

        logger.error(`Error in getAllClassSchedule API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET CLASS SCHEDULE BY COURSE ID
const getSchedule = async (req, res) => {
    try {
        const { courseId, key } = req.params;

        if (!courseId || !key) {
            return res.status(400).send({ 
                status: false, 
                message: "CourseId and key are required" 
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid courseId"
            });
        };

        let classSchedule = await classScheduleModel.findById(courseId);

        if (!classSchedule) {
            return res.status(400).send({ 
                status: false, 
                message: "Class schedule not found" 
            });
        };

        return res.status(201).send({
            status: true,
            message: "Success",
            data: classSchedule
        });
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };

        logger.error(`Error in getSchedule API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// UPDATE CLASS SCHEDULE
const updateSchedule = async (req, res) => {
    try {
        const { courseId, key } = req.params;

        if (!courseId || !key) {
            return res.status(400).send({
                status: false, 
                message: "CourseId and key are required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid courseId"
            });
        };

        let s = await classScheduleModel.findById(courseId);

        if (!s) {
            return res.status(400).send({ 
                status: false, 
                message: "Class schedule not found" 
            });
        };

        const e = req.body;

        if ("course_name" in e) {
            s.course_name = e.course_name;
        }

        if ("meeting_link" in e) {
            s.meeting_link = e.meeting_link;
        };

        if ("techer_name" in e) {
            s.techer_name = e.techer_name;
        };

        if ("input_text" in e) {
            s.input_text = e.input_text;
        };

        if ("youtube_video_code" in e) {
            s.youtube_video_code = e.youtube_video_code
        };

        if ("status" in e) {
            s.status= e.status
        };

        if ("FileUpload" in req.body ) {

            let oldImgName = s.pdf_upload_file.fileName;

            if (oldImgName) {
                let oldImgPath = path.join(__dirname, "..", "..", "class_pdf", oldImgName);

                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            };

            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/class_pdf/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "class_pdf", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };

            s.pdf_upload_file = imgObj;
        }

        await s.save();
        return res.status(201).send({
            status: true,
            message: "Schedule updated successfully",
            data: s
        });
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };

        logger.error(`Error in updateSchedule API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// DELETE SCHEDULE
const deleteSchedule = async (req, res) => {
    try {
        const { courseId, key } = req.params;

        if (!courseId || !key) {
            return res.status(400).send({ 
                status: false, 
                message: "CourseId is required" 
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid courseId"
            });
        };

        let s = await classScheduleModel.findById(courseId);

        if (!s) {
            return res.status(400).send({ 
                status: false, 
                message: "Class schedule not found" 
            });
        };

        let pdf_file_name = s.pdf_upload_file.fileName;
        if (pdf_file_name) {
            let pdf_file_path = path.join(__dirname, "..", "..", "class_pdf", pdf_file_name);
            if (fs.existsSync(pdf_file_path)) {
                fs.unlinkSync(pdf_file_path);
            }
        };

        let deleteSchedule = await classScheduleModel.deleteOne({ courseId });

        if (!deleteSchedule) {
            return res.status(404).send({
                status: false,
                message: "Schedule not found or alrady deleted"
            })
        };

        return res.status(201).send({
            status: true,
            message: "Schedule deleted successfully",
        });
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };

        logger.error(`Error in deleteSchedule API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = {
    createClassSchedule,
    getAllClassSchedule,
    getSchedule,
    updateSchedule,
    deleteSchedule
};