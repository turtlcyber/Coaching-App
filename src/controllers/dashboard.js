const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const coursePurchaseModel = require("../models/coursePurchaseModel");
const bannerImageModel = require("../models/bannerImageModel");
const courseModel = require("../models/courseModel");
const { getCurrentIPAddress } = require("../uitls/utils");

const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { port, adminSecretKey } = require("../config/config");
const { isValidObjectId } = require("mongoose");
const logger = require('../config/logger.config');

// DASHBOARD API
const getDashboard = async (req, res) => {
    try {
        const { key, userId } = req.params;
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

        // let categories = await categoryModel.find({});

        let myAllPurchasedCourses = null;
        if (userId) {
            myAllPurchasedCourses = await coursePurchaseModel.find({ userId }).populate("courseId");
        }

        let allCourses = await courseModel.find({});

        let bannerObj = await bannerImageModel.findOne({});

        let bannerImages;
        if (bannerObj) {
            bannerImages = bannerObj.bannerImages ? bannerObj.bannerImages : null;
        };

        return res.status(200).send({
            status: true,
            message: "Success",
            bannerImages: bannerImages ? bannerImages : [],
            myAllPurchasedCourses,
            allCourses
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
        logger.error(`Error in getDashboard API: ${error.message}`, { meta: metadata });
        return res.status(400).send({ status: false, message: error.message });
    }
};


// GET ADMIN DASHBOARD
const getAdminDashboard = async (req, res) => {
    try {
        let allPurchase = await coursePurchaseModel.find({});

        let sale = 0;
        for (let ele of allPurchase) {
            sale += ele.amount;
        };

        let bannerObj = await bannerImageModel.findOne({})

        let bannerImages;
        if (bannerObj) {
            bannerImages = bannerObj.bannerImages ? bannerObj.bannerImages : null;
        };

        let courses = await courseModel.find({}).countDocuments();
        let user = await userModel.find({}).countDocuments();

        let report = {
            sale,
            courses,
            user
        };

        return res.status(200).send({
            status: true,
            message: "Success",
            bannerImages: bannerImages ? bannerImages : [],
            report
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
        logger.error(`Error in getAdminDashboard API: ${error.message}`, { meta: metadata });
        return res.status(400).send({ status: false, message: error.message });
    }
};

// UPDATE BANNER IMAGES
const updateBannerImages = async (req, res) => {
    try {
        let { key } = req.params;
        if (!key) {
            return res.status(400).send({ status: false, message: "Bad Request!!!" });
        };

        if (key !== adminSecretKey) {
            return res.status(403).send({ status: false, message: "NOT AUTHORIZED!!!" });
        };

        let bannerObj = await bannerImageModel.findOne({});

        if (!bannerObj) {
            bannerObj = await bannerImageModel.create({bannerImages: []});
        };

        let { ImageModel } = req.body;

        let parsedData = JSON.parse(ImageModel);

        let bannerImage = req.files.bannerImage;

        if (!bannerImage) {
            return res.status(400).send({ status: false, message: "No banner image uploaded" });
        }

        let index = parsedData.index; //{"isNewPick":false,"index":1,"img_id":"64ffebc1f3bfc5d77220193b","imageName":"1694493633669-432139964.jpg"}
        let img_id = parsedData.img_id ? parsedData.img_id : "";
        let imageName = parsedData.imageName;
        let isNewPick = parsedData.isNewPick;

        let currentIpAddress = getCurrentIPAddress();
        let imgRelativePath = "/bannerImages/";
        let imgUniqName = uuid.v4() + "." + bannerImage.name.split(".").pop();
        let imgFullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
        let imgSavingPath = path.join(__dirname, "..", "..", "bannerImages", imgUniqName);

        if (!isNewPick) {
            let oldImage = bannerObj.bannerImages[index].imageName;
            let oldImgPath = path.join(__dirname, "..", "..", "bannerImages", oldImage);

            fs.unlinkSync(oldImgPath);

            bannerImage.mv(imgSavingPath, (err) => {
                if (err) throw err;
            });

            let updatedBannerObj = {
                imageName: imgUniqName,
                imagePath: imgFullUrl,
            };

            bannerObj.bannerImages[index] = updatedBannerObj;

            await bannerObj.save();

            let bannerImages = bannerObj.bannerImages;

            return res.status(200).send({
                status: true,
                message: "Banner updated successfully",
                data: bannerImages,
            });
        } else {
            bannerImage.mv(imgSavingPath, (err) => {
                if (err) throw err;
            });

            let newBannerObj = {
                imageName: imgUniqName,
                imagePath: imgFullUrl,
            };

            bannerObj.bannerImages.push(newBannerObj);

            await bannerObj.save();

            let bannerImages = bannerObj.bannerImages;

            return res.status(200).send({
                status: true,
                message: "Banner added successfully",
                data: bannerImages,
            });
        }
    } catch (error) {
        let metadata = {
            stack: error.stack,
            details: error.details || "No additional details provided",
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        };
        logger.error(`Error in updateBannerImages API: ${error.message}`, { meta: metadata });
        return res.status(400).send({ status: false, message: error.message });
    }
};

// DELETE BANNER IMAGE BY ID
const deleteBannerImage = async (req, res) => {
    try {
        let { imageId, key } = req.params;
        if (!imageId || !key) {
            return res.status(400).send({ status: false, message: "All fields are required" });
        }

        if (key !== adminSecretKey) {
            return res.status(403).send({ status: false, message: "NOT AUTHORIZED!!!" });
        }

        let bannerObj = await bannerImageModel.findOne();

        if (!bannerObj) {
            return res.status(400).send({ status: false, message: "Not Found!!!" });
        }

        if (bannerObj.bannerImages.length) {
            for (let i = 0; i < bannerObj.bannerImages.length; i++) {
                if (imageId === bannerObj.bannerImages[i]._id.toString()) {

                    let imgName = bannerObj.bannerImages[i].imageName;
                    let imgPath = path.join(__dirname, "..", "..", "bannerImages", imgName);

                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                    };
                    
                    let arr = bannerObj.bannerImages;
                    arr.splice(i, 1);
                    bannerObj.bannerImages = arr;

                    await bannerObj.save();
                }
            }
        }

        let bannerImages = bannerObj.bannerImages;

        return res.status(200).send({
            status: true,
            message: "Banner deleted successfully",
            data: bannerImages,
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
        logger.error(`Error in deleteBannerImage API: ${error.message}`, { meta: metadata });
        return res.status(400).send({ status: false, message: error.message });
    }
};

module.exports = {
    getDashboard,
    getAdminDashboard,
    updateBannerImages,
    deleteBannerImage,
};
