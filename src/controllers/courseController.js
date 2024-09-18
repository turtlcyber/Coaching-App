const courseModel = require("../models/courseModel");
const classScheduleModel = require('../models/classScheduleModel');
const coursePurchaseModel = require('../models/coursePurchaseModel');
const userModel = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const logger = require("../config/logger.config");
const { isValidObjectId } = require("mongoose");
let { getCurrentIPAddress } = require("../uitls/utils");
let { port, adminSecretKey } = require("../config/config");

// ADD COURSE
const addCourse = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: "Key is required",
            });
        }

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not Authorized",
            });
        }

        const { categoryId, category_name, course_name, description, course_fee, duration, start_date, end_date, class_time, course_seat_limit, offer_in_amount, course_type } = req.body;

        let imgObj = null;
        if ("FileUpload" in req.body) {
            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");
            // let { course_image } = req.files;

            let courseImgFolder = path.join(__dirname, "..", "..", "courseImages");

            if (!fs.existsSync(courseImgFolder)) {
                fs.mkdirSync(courseImgFolder);
            }

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/courseImages/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "courseImages", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);
            // course_image.mv(imgSavingPath, (err) => {
            //     if (err) throw err;
            // });

            imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };
        }

        let courseData = {
            categoryId,
            category_name,
            course_name,
            description,
            course_fee,
            duration,
            start_date,
            end_date,
            class_time,
            course_seat_limit,
            offer_in_amount,
            course_type,
            course_image: imgObj,
        };

        let newCourse = await courseModel.create(courseData);
        return res.status(201).send({
            status: true,
            message: "Course created successfully",
            data: newCourse,
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

        logger.error(`Error in addCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL COURSES
const getAllCourses = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: "Key is required",
            });
        }

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not Authorized",
            });
        }

        let allCourses = await courseModel.find({});

        return res.status(201).send({
            status: true,
            message: "Success",
            data: allCourses,
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

        logger.error(`Error in getAllCourses API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET A COURSE BY COURSE ID
const getCourseById = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: "Key is required",
            });
        }

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not Authorized",
            });
        }

        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).send({
                status: false,
                message: "CourseId is required",
            });
        }

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid courseId",
            });
        }

        let c = await courseModel.findById(courseId);

        if (!c) {
            return res.status(400).send({
                status: false,
                message: "Course not found",
            });
        }

        return res.status(201).send({
            status: true,
            message: "Success",
            data: c,
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

        logger.error(`Error in getCourseById API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE COURSE BY COURSE ID
const updateCourse = async (req, res) => {
    try {
        const { key, courseId } = req.params;
        if (!key) {
            return res.status(400).send({
                status: false,
                message: "Key is required",
            });
        }

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not Authorized",
            });
        }

        if (!courseId) {
            return res.status(400).send({
                status: false,
                message: "CourseId is required",
            });
        }

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid courseId",
            });
        }

        let c = await courseModel.findById(courseId);

        if (!c) {
            return res.status(400).send({
                status: false,
                message: "Course not found",
            });
        }

        let e = req.body;

        if ("category_name" in e) {
            c.category_name = e.category_name;
        }

        if ("course_name" in e) {
            c.course_name = e.course_name;
        }

        if ("description" in e) {
            c.description = e.description;
        }

        if ("course_fee" in e) {
            c.course_fee = e.course_fee;
        }

        if ("duration" in e) {
            c.duration = e.duration;
        }

        if ("start_date" in e) {
            c.start_date = e.start_date;
        }

        if ("end_date" in e) {
            c.end_date = e.end_date;
        }

        if ("class_time" in e) {
            c.class_time = e.class_time;
        }

        if ("course_seat_limit" in e) {
            c.course_seat_limit = e.course_seat_limit;
        }

        if ("offer_in_amount" in e) {
            c.offer_in_amount = e.offer_in_amount;
        }

        if ("course_type" in e) {
            c.course_type = e.course_type;
        }

        if ("FileUpload" in req.body) {
            let oldImgName = c.course_image.fileName;
            if (oldImgName) {
                let oldImgPath = path.join(__dirname, "..", "..", "courseImages", oldImgName);

                if (fs.existsSync(oldImgPath)) {
                    fs.unlinkSync(oldImgPath);
                }
            }

            let { File_Extension, File_Path, File_data, File_name } = req.body.FileUpload;

            let decodedData = Buffer.from(File_data, "base64");

            let currentIpAddress = getCurrentIPAddress();
            let imgRelativePath = "/courseImages/";
            let imgUniqName = uuid.v4() + File_Extension;
            let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
            let imgSavingPath = path.join(__dirname, "..", "..", "courseImages", imgUniqName);

            fs.writeFileSync(imgSavingPath, decodedData);

            let imgObj = {
                fileName: imgUniqName,
                filePath: imgFullUrl,
            };

            c.course_image = imgObj;
        }

        await c.save();

        return res.status(200).send({
            status: true,
            message: "Course updated successfully",
            data: c,
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

        logger.error(`Error in updateCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL CLASSES OF A COURSE
const getAllClassesOfMyCourse = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        if (!userId || !courseId ) {
            return res.status(400).send({
                status: false,
                message: "All fields are required",
            });
        };

        let user = await userModel.findOne({ userId });

        if (!user) {
            return res.status(400).send({
                status: false,
                message: "User not found",
            });
        };

        let course = await courseModel.findById(courseId);

        if (!course) {
            return res.status(400).send({
                status: false,
                message: "Course not found",
            });
        };

        let myPurchasedCourse = await coursePurchaseModel.findOne({ userId, courseId });

        let myPurchasedCourseClasses = await classScheduleModel.find({ courseId: myPurchasedCourse.courseId });

        return res.status(200).send({
            status: true,
            message: "success",
            data: myPurchasedCourseClasses,
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

        logger.error(`Error in updateCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
}

// DELETE COURSE BY COURSE ID
const deleteCourse = async (req, res) => {
    try {
        const { courseId, key } = req.params;

        if (!courseId || !key) {
            return res.status(400).send({
                status: false,
                message: "CourseId and key are required",
            });
        }

        if (key !== adminSecretKey) {
            return res.status(401).send({
                status: false,
                message: "Not Authorized",
            });
        }

        if (!isValidObjectId(courseId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid courseId",
            });
        }

        let c = await courseModel.findById(courseId);

        if (!c) {
            return res.status(400).send({
                status: false,
                message: "Course not found",
            });
        }

        let oldImgName = c.course_image.fileName;
        if (oldImgName) {
            let oldImgPath = path.join(__dirname, "..", "..", "courseImages", oldImgName);

            if (fs.existsSync(oldImgPath)) {
                fs.unlinkSync(oldImgPath);
            }
        }

        await courseModel.deleteOne({ _id: courseId });

        return res.status(200).send({
            status: true,
            message: 'Course deleted successfully'
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

        logger.error(`Error in deleteCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getAllClassesOfMyCourse
};
