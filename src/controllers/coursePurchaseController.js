const coursePurchaseModel = require('../models/coursePurchaseModel');
const userModel = require('../models/userModel');
const courseModel = require('../models/courseModel');
const logger = require('../config/logger.config');

const { adminSecretKey } = require('../config/config');


// PURCHASE A COURSE
const purchaseCourse = async (req, res) => {
    try {
        let { userId } = req.params;

        if (!userId) {
            return res.status(400).send({
                status: false,
                message: 'key is required'
            })
        };

        // if (key !== adminSecretKey) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'Not Authorized'
        //     });
        // };

        let { courseId, amount, status, notes } = req.body;

        // let user = await userModel.findById(userId);

        // if (!user) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'user not found'
        //     });
        // };

        let purchaseData = {
            courseId,
            amount, 
            status, 
            userId,
            notes
        };
        let newCouusePurchase = await coursePurchaseModel.create(purchaseData);
        return res.status(201).send({
            status: true,
            message: "Course purchased successfully",
            data: newCouusePurchase
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

        logger.error(`Error in purchaseCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET A PURCHASED COURSE BY ID
const getPurchasedCourse = async (req, res) => {
    try {
        const { key, purchaseId } = req.params;

        if (!key || !purchaseId) {
            return res.status(400).send({ 
                status: false, 
                message: "purchaseId and key is required"
            });
        };

        if (!isValidObjectId(purchaseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid purchaseId"
            });
        };

        let purchasedCourse = await coursePurchaseModel.findById(purchaseId);

        if (!purchasedCourse) {
            return res.status(400).send({
                status: false,
                message: "Purchased course not found"
            });
        };

        return res.status(201).send({
            status: true,
            message: "Success",
            data: purchasedCourse
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

        logger.error(`Error in getPurchasedCourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL PURCHASED COURSES BY A STUDENT
const getMyAllPurchasedCourses = async (req, res) => {
    try {
        const { key, userId } = req.params;

        if (!userId || !key) {
            return res.status(400).send({ 
                status: false, 
                message: "userId and key is required"
            });
        };


        if (key !== adminSecretKey) {
            return res.status(400).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        let allPurchasedCourses = await coursePurchaseModel.find({userId});

        return res.status(201).send({
            status: true,
            message: "Success",
            data: allPurchasedCourses
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

        logger.error(`Error in getAllPurchasedCourses API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL PURCHASED COURSES BY A STUDENT
const getAllPurchasedCourses = async (req, res) => {
    try {
        const { key } = req.params;

        if (!key) {
            return res.status(400).send({ 
                status: false, 
                message: "key is required"
            });
        };


        if (key !== adminSecretKey) {
            return res.status(400).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        let allPurchasedCourses = await coursePurchaseModel.find({});

        let purchaseArr = [];
        for (let purchase of allPurchasedCourses) {
            let user = await userModel.findOne({ userId: purchase.userId });
            let course = await courseModel.findOne({ _id: purchase.courseId });
            let purchaseObj = {
                purchaseDetails: purchase,
                user,
                course,
            };

            purchaseArr.push(purchaseObj);
        }

        return res.status(201).send({
            status: true,
            message: "Success",
            data: purchaseArr
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

        logger.error(`Error in getAllPurchasedCourses API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// GET ALL USER LIST THOSE PURCHASED A PARTICULAR COURSE
const getAllUsersOfACourse = async (req, res) => {
    try {
        const { courseId, key } = req.params;

        if (!courseId || !key) {
            return res.status(400).send({
                status: false,
                message: "All fields are required"
            });
        };

        let course = await courseModel.findById(courseId);

        if (!course) {
            return res.status(400).send({
                status: false,
                message: "Course Not Found"
            });
        };

        let allPurchasesOfACourse = await coursePurchaseModel.find({ courseId });

        let userArr = [];

        for (let ele of allPurchasesOfACourse) {
            let user = await userModel.findOne({ userId: ele.userId });
            userArr.push(user);
        };

        return res.status(201).send({
            status: true,
            message: "Success",
            course,
            users: userArr
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

        logger.error(`Error in getAllUsersOfACourse API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
}


// UPDATE A PURCHASED COURSE DETAILS
const updatePurchasedCourseDetails = async (req, res) => {
    try {
        const { purchaseId, key } = req.params;

        if (!purchaseId || !key) {
            return res.status(400).send({ 
                status: false, 
                message: "purchaseId and key is required"
            });
        };

        if (!isValidObjectId(purchaseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid purchaseId"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(400).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        let p = await coursePurchaseModel.findById(purchaseId);

        if (!p) {
            return res.status(400).send({
                status: false,
                message: "Purchased course not found"
            });
        };

        const e = req.body;

        if ("amount" in e) {
            p.amount = e.amount;
        };

        if ("status" in e) {
            p.status = e.status;
        };

        if ("notes" in e) {
            p.notes = e.notes;
        };

        await p.save();

        return res.status(201).send({
            status: true,
            message: "Details updated successfully",
            data: p
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

        logger.error(`Error in updatePurchasedCourseDetails API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
};


// DELETE PURCHASE DETAILS
const deletePurchaseDetails = async (req, res) => {
    try {
        const { purchaseId, key } = req.params;

        if (!purchaseId || !key) {
            return res.status(400).send({ 
                status: false, 
                message: "purchaseId and key is required"
            });
        };

        if (!isValidObjectId(purchaseId)) {
            return res.status(400).send({ 
                status: false, 
                message: "Invalid purchaseId"
            });
        };

        if (key !== adminSecretKey) {
            return res.status(400).send({
                status: false,
                message: 'Not Authorized'
            });
        };

        let deletePurchase = await coursePurchaseModel.deleteOne({ _id: purchaseId });

        if (!deletePurchase) {
            return res.status(400).send({ 
                status: false, 
                message: "Purchase details not found or already deleted"
            });
        };

        return res.status(201).send({
            status: true,
            message: "Purchase details deleted successfully",
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

        logger.error(`Error in deletePurchaseDetails API: ${error.message}`, { meta: metadata });
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = {
    purchaseCourse,
    getPurchasedCourse,
    getAllPurchasedCourses,
    getMyAllPurchasedCourses,
    getAllUsersOfACourse,
    updatePurchasedCourseDetails,
    deletePurchaseDetails
}