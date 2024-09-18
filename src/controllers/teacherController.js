const teacherModel = require('../models/teacherModel');


const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const { isValidObjectId } = require('mongoose');
let { getCurrentIPAddress } = require('../uitls/utils');
let { port, adminSecretKey } = require('../config/config');
const logger = require('../config/logger.config');


// ADD TEACHER
const addTeacher = async (req, res) => {
    try {

        let { key } = req.params;

        if (!key) {
            return res.status(400).send({
                status: false,
                message: "key is required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not authorized"
            });
        };

        let { name, description } = req.body;
        
        let imgObj = null;
        if ("FileUpload" in req.body) {
            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");

            let teacherImgFolder = path.join(__dirname, "..", "..", "uploads");

            if (!fs.existsSync(teacherImgFolder)) {
                fs.mkdirSync(teacherImgFolder);
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/uploads/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "uploads", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };
        }

        let teacherData = {
            name,
            description,
            profilePic: imgObj
        };

        let newTeacher = await teacherModel.create(teacherData);

        return res.status(201).send({
            status: true,
            message: "Teacher added successfully",
            data: newTeacher
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

        logger.error(`Error in addTeacher API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL TEACHERS
const getAllTeachers = async (req, res) => {
    try {
        let { key } = req.params;

        if (!key) {
            return res.status(400).send({
                status: false,
                message: "key is required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not authorized"
            });
        };

        let allTeachers = await teacherModel.find({});
        return res.status(200).send({
            status: true,
            message: "Success",
            data: allTeachers
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

        logger.error(`Error in getAllTeachers API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET TEACHER BY TEACHER ID
const getTeacherById = async (req, res) => {
    try {
        let { key } = req.params;

        if (!key) {
            return res.status(400).send({
                status: false,
                message: "key is required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not authorized"
            });
        };
        
        const { teacherId } = req.params;
        if (!teacherId) {
            return res.status(400).send({
                status: false,
                message: "TeacherId is required"
            });
        };

        if (!isValidObjectId(teacherId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid teacherId"
            });
        };

        let teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(400).send({ 
                status: false, 
                message: "Teacher not found"
            });
        };

        return res.status(201).send({
            status: true,
            message: "Success",
            data: teacher
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

        logger.error(`Error in getTeacherById API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// UPDATE TEACHER BY TEACHER ID
const updateTeacher = async (req, res) => {
    try {
        let { key } = req.params;

        if (!key) {
            return res.status(400).send({
                status: false,
                message: "key is required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not authorized"
            });
        };

        const { teacherId } = req.params;
        if (!teacherId) {
            return res.status(400).send({
                status: false,
                message: "TeacherId is required"
            });
        };

        if (!isValidObjectId(teacherId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid teacherId"
            });
        };

        let t = await teacherModel.findById(teacherId);

        if (!t) {
            return res.status(400).send({ 
                status: false, 
                message: "Teacher not found"
            });
        };

        let e = req.body;

        if ("name" in e) {
            t.name = e.name;
        };

        if ("description" in e) {
            t.description = e.description;
        };

        if ( "FileUpload" in e ) {
            let oldImgName = t.profilePic.fileName;

            if (oldImgName) {
                let oldImgPath = path.join(__dirname, "..", "..", "uploads", oldImgName);

                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            };

            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");

            let teacherImgFolder = path.join(__dirname, "..", "..", "uploads");

            if (!fs.existsSync(teacherImgFolder)) {
                fs.mkdirSync(teacherImgFolder);
            };

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/uploads/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "uploads", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };

            t.profilePic = imgObj;
        };

        await t.save();

        return res.status(201).send({
            status: true,
            message: "Teacher data updated successfully",
            data: t
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

        logger.error(`Error in updateTeacher API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// DELETE TEACHER BY TEACHER ID
const deleteTeacher = async (req, res) => {
    try {
        let { key } = req.params;

        if (!key) {
            return res.status(400).send({
                status: false,
                message: "key is required"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not authorized"
            });
        };
        
        const { teacherId } = req.params;
        if (!teacherId) {
            return res.status(400).send({
                status: false,
                message: "TeacherId is required"
            });
        };

        if (!isValidObjectId(teacherId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid teacherId"
            });
        };

        let t = await teacherModel.findById(teacherId);

        if (!t) {
            return res.status(400).send({ 
                status: false, 
                message: "Teacher not found"
            });
        };

        let oldImgName = t.profilePic.fileName;
        let oldImgPath = path.join(__dirname, "..", "..", "uploads", oldImgName);

        if (fs.existsSync(oldImgPath)) {
            fs.unlinkSync(oldImgPath);
        };

        await teacherModel.deleteOne({_id: teacherId});

        return res.status(201).send({
            status: true,
            message: "Teacher deleted successfully",
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

        logger.error(`Error in deleteTeacherById API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


module.exports = {
    addTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};