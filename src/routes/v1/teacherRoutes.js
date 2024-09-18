const express = require('express');
const router = express.Router();

const { 
    addTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,

} = require('../../controllers/teacherController');

// ADD COURSE PURCHASE DETAILS
router.post("/api/v1/addTeacher/:key", addTeacher);

// GET COURSE PURCHASE DETAILS BY ID
router.get("/api/v1/getTeacher/:key/:teacherId", getTeacherById);

// GET ALL COURSE PURCHASE DETAILS
router.get("/api/v1/getAllTeachers/:key", getAllTeachers);

// UPDATE COURSE PURCHASE DETAILS BY PURCHASE ID
router.put("/api/v1/updateTeacher/:key/:teacherId", updateTeacher);

// DELETE COURSE PURCHASE DETAILS BY PURCHASE ID
router.delete("/api/v1/deletTeacher/:key/:teacherId", deleteTeacher);


module.exports = router;