const express = require('express');
const router = express.Router();

const { 
    purchaseCourse,
    getPurchasedCourse,
    getAllPurchasedCourses,
    updatePurchasedCourseDetails,
    deletePurchaseDetails,
    getMyAllPurchasedCourses,
    getAllUsersOfACourse
} = require('../../controllers/coursePurchaseController');

// ADD COURSE PURCHASE DETAILS
router.post("/api/v1/addPurchaseDetails/:userId", purchaseCourse);

// GET COURSE PURCHASE DETAILS BY ID
router.get("/api/v1/getPurchasedDetails/:key/:purchaseId", getPurchasedCourse);

// GET MY ALL COURSE PURCHASE DETAILS
router.get("/api/v1/getMyAllPurchasedDetails/:key/:userId", getMyAllPurchasedCourses);

// GET ALL COURSE PURCHASE DETAILS
router.get("/api/v1/getAllPurchasedDetails/:key", getAllPurchasedCourses);

// UPDATE COURSE PURCHASE DETAILS BY PURCHASE ID
router.put("/api/v1/updatePurchasedDetails/:key/:purchaseId", updatePurchasedCourseDetails);

// DELETE COURSE PURCHASE DETAILS BY PURCHASE ID
router.delete("/api/v1/deletePurchaseDetails/:key/:purchaseId", deletePurchaseDetails);

// GET ALL USER LIST THOSE PURCHASED A PARTICULAR COURSE
router.get("/api/v1/getAllUsersOfACourse/:key/:courseId", getAllUsersOfACourse);


module.exports = router;