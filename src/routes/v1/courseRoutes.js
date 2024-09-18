const express = require('express');
const router = express.Router();

const { 
    addCourse,
    getAllCourses,
    updateCourse,
    deleteCourse,
    getCourseById,
    getAllClassesOfMyCourse
} = require('../../controllers/courseController');

// ADD COURSE
router.post("/api/v1/addCourse/:key", addCourse);

// GET COURSE BY ID
router.get("/api/v1/getCourse/:key/:courseId", getCourseById);

// GET ALL COURSES
router.get("/api/v1/getAllCourses/:key", getAllCourses);

// UPDATE COURSE BY COURSE ID
router.put("/api/v1/updateCourse/:key/:courseId", updateCourse);

// DELETE COURSE BY COURSE ID
router.delete("/api/v1/deleteCourse/:key/:courseId", deleteCourse);

// GET MY PURCHASED COURSE'S ALL CLASS SCHEDULE
router.get("/api/v1/getAllClassesOfMyCourse/:userId/:courseId", getAllClassesOfMyCourse);


module.exports = router;